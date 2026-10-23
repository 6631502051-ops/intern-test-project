# Decision log

## D1: จะเก็บข้อมูลผู้ใช้ที่ login ไว้ตรงไหน
- ทางเลือกที่คิดไว้: (A) React Context (B) Redux (C) ส่ง props ผ่านทุกหน้า
- เลือก: A
- เพราะ: มีข้อมูล auth ชุดเดียวและเปลี่ยนตอน login/logout จึงใช้ Context ได้โดยไม่เพิ่ม dependency state management
- ข้อเสียของ A ที่ยอมรับ: ถ้ามี global state จำนวนมาก component ที่อ่าน context จะ render ใหม่พร้อมกัน

## D2: จะทำ route guard อย่างไร
- ทางเลือกที่คิดไว้: (A) ตรวจสิทธิ์ในแต่ละหน้า (B) wrapper `RequireRole` (C) ให้ทุก route เปิดแล้วซ่อน UI
- เลือก: B
- เพราะ: บังคับสิทธิ์ที่ขอบเขต route ก่อน render และรวมพฤติกรรม redirect/message ไว้จุดเดียว
- ข้อเสียของ B ที่ยอมรับ: ต้องกำหนด route ให้ถูกกับ role และต้องดูแล fallback route เพิ่ม

## D3: ออกแบบตาราง tasks อย่างไร
- ทางเลือกที่คิดไว้: (A) เก็บชื่อผู้รับผิดชอบซ้ำใน tasks (B) ใช้ `assigned_to` เป็น FK ไป users (C) เก็บ JSON
- เลือก: B
- เพราะ: ป้องกันผู้รับผิดชอบที่ไม่มีอยู่จริงและ query task ของ employee ได้ด้วย index
- ข้อเสียของ B ที่ยอมรับ: การอ่านชื่อผู้รับผิดชอบต้อง JOIN และการลบ user ต้องกำหนด policy เพิ่ม

## D4: mock API จะอัปเดตข้อมูลอย่างไร
- ทางเลือกที่คิดไว้: (A) ให้หน้าแก้ array เอง (B) ให้ mock API เป็นเจ้าของ mutation (C) ใช้ state library
- เลือก: B
- เพราะ: จำลอง boundary แบบ backend และรวม authorization/error ให้ behavior ใกล้ระบบจริง
- ข้อเสียของ B ที่ยอมรับ: ต้องรอ Promise แม้จะเป็นข้อมูลใน memory และต้องออกแบบ API เพิ่ม

## D5: การเปลี่ยนสถานะของ employee จะ optimistic หรือรอ server
- ทางเลือกที่คิดไว้: (A) เปลี่ยน UI ทันที (B) รอผล API ก่อน commit state (C) optimistic พร้อม rollback
- เลือก: C
- เพราะ: UI ตอบสนองเร็ว แต่ยังคืนค่าเดิมได้เมื่อ API ล้มเหลว
- ข้อเสียของ C ที่ยอมรับ: ต้องเก็บ previous state และระวังการกดซ้ำระหว่าง request

AI ช่วยตรวจความครบถ้วนของ requirement และเสนอทางเลือกโครงสร้างเอกสาร
การตัดสินใจเรื่อง authorization, data flow และการตรวจสอบผลลัพธ์ยังอธิบายและปรับให้เข้ากับโจทย์ด้วยตนเอง
