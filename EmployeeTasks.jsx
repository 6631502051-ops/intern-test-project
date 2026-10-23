import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeTasks() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getTasks(token);
        if (active) setTasks(data.tasks);
      } catch (e) {
        if (active) setError('โหลด task ไม่สำเร็จ');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [token]);

  const visible = tasks.filter(
    (t) => t.assigned_to === user.id && (filter === 'All' || t.status === filter)
  );

  const markDone = async (task) => {
    if (task.status === 'Done') return;
    const previous = tasks;
    setTasks((current) => current.map((item) => (
      item.id === task.id ? { ...item, status: 'Done' } : item
    )));
    try {
      const data = await api.updateStatus(token, task.id, 'Done');
      setTasks((current) => current.map((item) => item.id === task.id ? data.task : item));
    } catch (e) {
      setTasks(previous);
      setError('อัปเดตไม่สำเร็จ');
    }
  };

  return (
    <div className="page">
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option>All</option>
        <option>To Do</option>
        <option>Done</option>
      </select>
      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="error">{error}</p>}
      <ul>
        {visible.map((t) => (
          <li key={t.id}>
            {t.title} — {t.status}
            {t.status !== 'Done' && <button onClick={() => markDone(t)}>เปลี่ยนเป็น Done</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
