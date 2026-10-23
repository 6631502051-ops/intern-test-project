# Bugs

| # | ไฟล์:บรรทัด | ประเภท | ความรุนแรง | ปัญหา (เกิดอะไร เมื่อไหร่) | วิธีแก้ | วิธีพิสูจน์ |
|---:|---|---|---|---|---|---|
| 1 | `routes/tasks.js:77` | security | critical | DELETE ไม่เรียก `authenticate` และปล่อย request ที่ไม่มี `req.user` ลบ task ได้ | ใส่ `authenticate` และตรวจ role ให้เป็น admin | ทำ DELETE โดยไม่มี token -> เดิมลบได้หรือพังแบบไม่ชัดเจน -> ที่ถูกต้องคือ 401 |
| 2 | `routes/tasks.js:40-75` | async | critical | ไม่ await audit insert และตอบสำเร็จก่อน audit สำเร็จ ทำให้ transaction/ข้อผิดพลาดไม่ถูกควบคุม | ใช้ transaction client และ await ทุก query ก่อนตอบ | ทำให้ INSERT audit ล้มเหลว -> เดิมอาจได้ 200 -> ที่ถูกต้องคือ rollback และ 500 |
| 3 | `routes/tasks.js:48-53` | security | high | ไม่ตรวจว่า employee เป็นเจ้าของ task และอาจแก้สถานะ task ของคนอื่น | ตรวจ `assigned_to`, สถานะเดิม และ target status | employee แก้ task ของ bob -> เดิมได้ 200 -> ที่ถูกต้องคือ 403 |
| 4 | `routes/tasks.js:35` | validation | high | ไม่จำกัดค่า status ทำให้สถานะนอกชุดที่อนุญาตถูกบันทึก | ตรวจด้วย `ALLOWED_STATUSES` | ส่ง `{"status":"Blocked"}` -> เดิมอาจได้ 200 -> ที่ถูกต้องคือ 400 |
| 5 | `routes/tasks.js:11-15` | validation | medium | page จาก query เป็น string/ค่าติดลบ ทำให้ offset ผิด | แปลงและตรวจ positive integer | GET `?page=-1` -> เดิม query ผิด -> ที่ถูกต้องคือ 400 |
| 6 | `EmployeeTasks.jsx:10-16` | async | high | effect ไม่ใส่ `token` dependency และไม่จัดการ rejected promise | ใช้ async loader และ dependency `[token]` | เปลี่ยน token หลัง mount -> เดิมใช้ token เก่า -> ที่ถูกต้องคือโหลดด้วย token ใหม่ |
| 7 | `EmployeeTasks.jsx:18-22` | async | high | interval ไม่ถูก clear ทำให้ polling ทำงานต่อหลังออกจากหน้า | return cleanup ที่เรียก `clearInterval` | เข้า/ออกหน้าซ้ำแล้วรอ 10 วินาที -> เดิมมี request หลายชุด -> ที่ถูกต้องคือไม่มี request จากหน้าที่ออกแล้ว |
| 8 | `EmployeeTasks.jsx:27-29` | logic | high | แก้ object ใน state โดยตรงและ `setTasks(tasks)` ใช้ reference เดิม ทำให้ React ไม่ re-render | ใช้ functional immutable update | กด Done แถวแรก -> เดิมข้อความอาจไม่เปลี่ยนทันที -> ที่ถูกต้องคือเปลี่ยนทันที |
| 9 | `EmployeeTasks.jsx:32-35` | async | high | ถ้า API ล้มเหลว UI ยังแสดง Done ต่อไป | เก็บ previous state และ rollback เมื่อ catch | ให้ PATCH ตอบ 500 -> เดิมยังเห็น Done -> ที่ถูกต้องคือกลับเป็น To Do และแสดง error |
| 10 | `EmployeeTasks.jsx:10-22` | UI | medium | ไม่มี loading/error ตอน polling และ initial error ไม่ถูกแสดง | ใช้ try/catch/finally และ state loading/error | ปิด API ตอนเปิดหน้า -> เดิมเกิด unhandled rejection -> ที่ถูกต้องคือข้อความ error |
| 11 | `EmployeeTasks.jsx:38` | UI | low | ใช้ array index เป็น key ทำให้ reconciliation ไม่เสถียรเมื่อรายการเปลี่ยน | ใช้ `t.id` เป็น key | เปลี่ยน/จัดเรียงรายการ -> เดิม DOM อาจผูกกับ task ผิด -> ที่ถูกต้องคือผูกด้วย id |

## จุดที่สงสัย

- `api.getTasks` คืน task ทั้งหมดตามโจทย์ที่ระบุไว้ จึงกรอง `assigned_to` ในหน้าได้ แม้ระบบจริงอาจกรองที่ server เพื่อความลับของข้อมูล
- การ optimistic update ในไฟล์ที่แก้ยังคงใช้ได้ เพราะมี rollback เมื่อ API reject และแทนค่าด้วย task ที่ server คืนเมื่อสำเร็จ
