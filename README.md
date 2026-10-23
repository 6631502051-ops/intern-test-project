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
