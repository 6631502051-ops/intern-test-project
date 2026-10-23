const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const ALLOWED_STATUSES = ['To Do', 'Done'];
const PAGE_SIZE = 20;

router.get('/api/tasks', authenticate, async (req, res) => {
  const { projectId, page = 1 } = req.query;
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return res.status(400).json({ message: 'page must be a positive integer' });
  }
  const offset = (pageNumber - 1) * PAGE_SIZE;
  const conditions = [];
  const params = [];
  if (projectId) {
    params.push(projectId);
    conditions.push(`project_id = $${params.length}`);
  }
  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  params.push(PAGE_SIZE, offset);

  try {
    const result = await db.query(
      `SELECT * FROM tasks${where} ORDER BY id LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return res.json({ tasks: result.rows });
  } catch (err) {
    console.error('GET /api/tasks failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  let client;
  try {
    client = await db.connect();
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [req.params.id]);
    const task = result.rows[0];
    if (!task) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.user.role !== 'admin') {
      if (task.assigned_to !== req.user.id || task.status !== 'To Do' || status !== 'Done') {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: 'Not allowed' });
      }
    }
    const updated = await client.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    await client.query(
      'INSERT INTO audit_log (task_id, user_id, action) VALUES ($1, $2, $3)',
      [req.params.id, req.user.id, `status:${status}`]
    );
    await client.query('COMMIT');
    return res.status(200).json({ task: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PATCH /api/tasks/:id/status failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

router.delete('/api/tasks/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    return res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/tasks/:id failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
