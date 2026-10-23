# Project Access Control

โปรเจกต์นี้ตอบโจทย์แบบทดสอบคัดเลือกนักศึกษาฝึกงาน ส่วนที่ 1–4

## Tech stack

- React 18 + Vite: เหมาะกับหน้าที่มี state การ login, route guard และรายการ task ที่ต้องอัปเดตทันที
- React Router: แยก URL และ guard ตาม role ได้ชัดเจน โดยไม่ต้องเขียน history API เอง
- JavaScript: ขอบเขต mock app เล็กพอให้เห็น logic authorization ได้ตรงไปตรงมา
- CSS ธรรมดา: ลด dependency และโฟกัสที่ behavior ที่โจทย์ให้คะแนน

## วิธีรันส่วนที่ 3 ด้วย Docker (แนะนำ)

ต้องติดตั้ง Docker Desktop ก่อน จากนั้นรันที่ root ของโปรเจกต์:

```bash
docker compose up --build
```

เปิด [http://localhost:8080](http://localhost:8080)

หยุด container:

```bash
docker compose down
```

คำสั่ง build image โดยตรง:

```bash
docker build -t project-access-control .
docker run --rm -p 8080:80 project-access-control
```

Docker ใช้ multi-stage build: stage แรกติดตั้ง dependency และ build Vite ส่วน stage สุดท้ายเสิร์ฟไฟล์ static ด้วย Nginx พร้อม SPA fallback สำหรับ React Router

## วิธีรันส่วนที่ 3 ด้วย Node.js

```bash
cd section-3
npm install
npm run dev
```

เปิด `http://localhost:5173`

บัญชีทดสอบ:

| Username | Password | Role |
|---|---|---|
| admin | admin123 | Admin |
| alice | alice123 | Employee |
| bob | bob123 | Employee |

ข้อมูล task ถูกเก็บใน memory ของ browser และจะ reset เมื่อ reload หน้าเว็บ

สิทธิ์การเปลี่ยนสถานะ:

- Admin เปลี่ยนได้ทั้ง `To Do → Done` และ `Done → To Do`
- Employee เปลี่ยนได้เฉพาะ task ของตนเองจาก `To Do → Done`

## สรุป Database Schema

ไฟล์ [section-2/schema.sql](section-2/schema.sql) ออกแบบสำหรับ PostgreSQL โดยแยกข้อมูลหลักเป็น 4 ตาราง:

| ตาราง | หน้าที่ | ความสัมพันธ์สำคัญ |
|---|---|---|
| `users` | เก็บบัญชีผู้ใช้ ชื่อที่แสดง และ role | `username` ไม่ซ้ำ และ `role` รับเฉพาะ `admin` หรือ `employee` |
| `projects` | เก็บข้อมูลโครงการและผู้สร้าง | `created_by` อ้างอิง `users.id` |
| `tasks` | เก็บงาน ชื่อโครงการ ผู้รับผิดชอบ และสถานะ | `project_id` อ้างอิง `projects.id`, `assigned_to` และ `created_by` อ้างอิง `users.id` |
| `audit_log` | เก็บประวัติการเปลี่ยนสถานะ task | `task_id` และ `user_id` อ้างอิงตารางที่เกี่ยวข้อง |

ข้อกำหนดข้อมูลที่สำคัญ:

- ทุกตารางใช้ `BIGSERIAL` เป็น primary key
- Foreign key ใช้ `ON DELETE CASCADE` กับ task เมื่อ project ถูกลบ และใช้ `ON DELETE RESTRICT` กับผู้ใช้เพื่อป้องกันการลบ user ที่ยังมีข้อมูลอ้างอิง
- `tasks.status` รับเฉพาะ `To Do` และ `Done` โดยค่าเริ่มต้นคือ `To Do`
- ชื่อ task ห้ามเป็นค่าว่างด้วย `tasks_title_not_blank`
- ทุกการเปลี่ยนสถานะควรเพิ่มรายการใหม่ใน `audit_log` ภายใน transaction เดียวกัน

Indexes:

- `idx_tasks_assigned_status (assigned_to, status)` รองรับหน้า Employee ที่ค้นหา task ของผู้ใช้และกรองตามสถานะ
- `idx_tasks_project (project_id)` รองรับการแสดง task ทั้งหมดของ project
- `idx_audit_log_task_created (task_id, created_at DESC)` รองรับการดูประวัติของ task โดยเรียงรายการล่าสุดก่อน

## โครงสร้าง

- `section-1/`: flowchart และ decision log
- `section-2/`: schema สำหรับ PostgreSQL และคำอธิบาย index
- `section-3/`: source ของเว็บแอป
- `section-4/`: โค้ดที่แก้และตาราง debugging/code review
- `Dockerfile`, `docker-compose.yml`, `docker/nginx.conf`: ไฟล์สำหรับ build และรันด้วย Docker

## ตรวจสอบ

```bash
npm run build
```

ตรวจสอบ Docker:

```bash
docker compose config
docker compose build
```
