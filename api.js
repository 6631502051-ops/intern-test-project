import { initialTasks, users } from './data';

let tasks = initialTasks.map((task) => ({ ...task }));
const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async login(username, password) {
    await wait();
    const user = users.find((item) => item.username === username && item.password === password);
    if (!user) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    const { password: ignored, ...safeUser } = user;
    return { user: safeUser, token: `mock-token-${user.id}` };
  },

  async getTasks() {
    await wait();
    return tasks.map((task) => ({ ...task }));
  },

  async createTask(title, assignedTo) {
    await wait();
    if (!title.trim() || !assignedTo) throw new Error('กรุณากรอกข้อมูลให้ครบ');
    const task = { id: Date.now(), title: title.trim(), assignedTo: Number(assignedTo), status: 'To Do' };
    tasks = [...tasks, task];
    return { ...task };
  },

  async updateTaskStatus(id, status) {
    await wait();
    const task = tasks.find((item) => item.id === id);
    if (!task) throw new Error('ไม่พบ task');
    if (!['To Do', 'Done'].includes(status) || task.status === status) {
      throw new Error('เปลี่ยนสถานะไม่ได้');
    }
    task.status = status;
    return { ...task };
  },
};
