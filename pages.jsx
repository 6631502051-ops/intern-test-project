import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockApi } from './api';
import { useAuth } from './AuthContext';

function Layout({ children }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <main className="shell">
      <header>
        <div><strong>Project Access Control</strong><small>{auth.user.name} ({auth.user.role})</small></div>
        <button onClick={() => { auth.logout(); navigate('/login'); }}>ออกจากระบบ</button>
      </header>
      {location.state?.message && <p className="notice">{location.state.message}</p>}
      {children}
    </main>
  );
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const { user } = await auth.login(username, password);
      navigate(user.role === 'admin' ? '/admin' : '/employee', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };
  return (
    <main className="login">
      <form onSubmit={submit}>
        <h1>เข้าสู่ระบบ</h1>
        <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
        <p className="hint">ทดลอง: admin/admin123, alice/alice123, bob/bob123</p>
      </form>
    </main>
  );
}

function TaskList({ tasks, users, onStatusChange, savingId, allowReverse }) {
  return <ul className="tasks">{tasks.map((task) => {
    const assignee = users.find((user) => user.id === task.assignedTo);
    return <li key={task.id}><span>{task.title}<small>{assignee?.name} · {task.status}</small></span>
      {onStatusChange && (task.status === 'To Do' || allowReverse) && <button disabled={savingId === task.id} onClick={() => onStatusChange(task)}>
        {savingId === task.id ? 'กำลังบันทึก...' : task.status === 'To Do' ? 'เปลี่ยนเป็น Done' : 'เปลี่ยนเป็น To Do'}
      </button>}
    </li>;
  })}</ul>;
}

export function AdminPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([mockApi.getTasks(), Promise.resolve()]).then(([data]) => {
      setTasks(data); setEmployees([{ id: 2, name: 'Alice' }, { id: 3, name: 'Bob' }]);
    }).catch(() => setError('โหลดข้อมูลไม่สำเร็จ')).finally(() => setLoading(false));
  }, []);
  const create = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try { const task = await mockApi.createTask(title, assignedTo); setTasks((current) => [...current, task]); setTitle(''); setAssignedTo(''); }
    catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const toggleStatus = async (task) => {
    const nextStatus = task.status === 'To Do' ? 'Done' : 'To Do';
    setSavingId(task.id);
    setError('');
    try {
      const updated = await mockApi.updateTaskStatus(task.id, nextStatus);
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };
  return <Layout><section className="content"><h1>Admin dashboard</h1>
    <form className="new-task" onSubmit={create}><h2>สร้าง Task</h2>
      <input aria-label="ชื่อ task" placeholder="ชื่อ task" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select aria-label="ผู้รับผิดชอบ" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}><option value="">เลือกผู้รับผิดชอบ</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
      <button disabled={saving}>{saving ? 'กำลังบันทึก...' : 'สร้าง Task'}</button>
    </form>
    {error && <p className="error">{error}</p>}{loading ? <p>กำลังโหลด...</p> : <TaskList tasks={tasks} users={employees} onStatusChange={toggleStatus} savingId={savingId} allowReverse />}
  </section></Layout>;
}

export function EmployeePage() {
  const auth = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { mockApi.getTasks().then(setTasks).catch(() => setError('โหลดข้อมูลไม่สำเร็จ')).finally(() => setLoading(false)); }, []);
  const markDone = async (task) => {
    setSavingId(task.id);
    setError('');
    try {
      const updated = await mockApi.updateTaskStatus(task.id, 'Done');
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };
  const ownTasks = tasks.filter((task) => task.assignedTo === auth.user.id);
  return <Layout><section className="content"><h1>My tasks</h1>{error && <p className="error">{error}</p>}{loading ? <p>กำลังโหลด...</p> : <TaskList tasks={ownTasks} users={[auth.user]} onStatusChange={markDone} savingId={savingId} />}</section></Layout>;
}

export function RedirectNotice() {
  const location = useLocation();
  return <p className="notice">{location.state?.message || 'กำลังเปลี่ยนหน้า...'}</p>;
}
