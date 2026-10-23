# System flowchart

```mermaid
flowchart TD
  Start([เริ่ม]) --> Login[กรอก username/password]
  Login --> Auth{ข้อมูลถูกต้องหรือไม่}
  Auth -- ไม่ใช่ --> LoginError[แสดง login error] --> Login
  Auth -- ใช่ --> Role{role คืออะไร}
  Role -- Admin --> AdminHome[/admin]
  Role -- Employee --> EmployeeHome[/employee]
  AdminHome --> AdminRoute{Employee เข้า /admin หรือไม่}
  AdminRoute -- ใช่ --> EmployeeHome
  AdminRoute -- ไม่ใช่ --> AdminTasks[เห็นทุก task / สร้าง task / เปลี่ยนสถานะใดก็ได้]
  EmployeeHome --> EmployeeRoute{Admin เข้า /employee หรือไม่}
  EmployeeRoute -- ใช่ --> AdminHome
  EmployeeRoute -- ไม่ใช่ --> OwnTasks[เห็นเฉพาะ task ของตน]
  OwnTasks --> Change{กดเปลี่ยนสถานะหรือไม่}
  Change -- ไม่ใช่ --> Logout
  Change -- ใช่ --> OwnAndTodo{เป็น task ของตนและสถานะ To Do หรือไม่}
  OwnAndTodo -- ไม่ใช่ --> Denied[แสดงข้อความไม่มีสิทธิ์] --> OwnTasks
  OwnAndTodo -- ใช่ --> Done[เปลี่ยนเป็น Done] --> OwnTasks
  AdminTasks --> Logout{กด Logout หรือไม่}
  Logout -- ไม่ใช่ --> AdminTasks
  Logout -- ใช่ --> LoginPage[ล้าง session และกลับหน้า Login]
```
