export const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'System Admin', role: 'admin' },
  { id: 2, username: 'alice', password: 'alice123', name: 'Alice', role: 'employee' },
  { id: 3, username: 'bob', password: 'bob123', name: 'Bob', role: 'employee' },
];

export const initialTasks = [
  { id: 1, title: 'เตรียม project brief', assignedTo: 2, status: 'To Do' },
  { id: 2, title: 'ออกแบบหน้า login', assignedTo: 2, status: 'Done' },
  { id: 3, title: 'วางโครง database', assignedTo: 3, status: 'To Do' },
  { id: 4, title: 'เขียน API contract', assignedTo: 3, status: 'To Do' },
  { id: 5, title: 'ตรวจ acceptance criteria', assignedTo: 2, status: 'To Do' },
];
