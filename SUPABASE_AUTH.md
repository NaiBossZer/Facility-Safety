# Supabase Auth สำหรับบุคลากร

ระบบ Login ของแอปเปลี่ยนจาก PIN/localStorage เป็น Supabase Auth แล้ว

## ขั้นตอนเปิดใช้งาน

1. ตั้งค่า `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`
2. เปิด Email หรือ SSO Provider ใน Supabase Authentication
3. รัน migration `003_supabase_auth_profiles.sql`
4. สร้าง User ใน Authentication > Users
5. ใส่ `full_name`, `position`, `department`, `role` ใน User Metadata หรือผูกกับ `personnel.auth_user_id`
6. ตั้งค่า Redirect URL ของทุกเว็บไซต์ที่ใช้ Auth ให้ตรงกับโดเมนจริง

ห้ามนำ Service Role Key ไปไว้ใน Vite environment หรือ Client-side code

## การเชื่อมจาก Portal หลัก

Portal และแอปนี้ต้องใช้ Supabase Project เดียวกันและใช้ Auth domain เดียวกัน หากอยู่คนละโดเมน ให้ Portal ลิงก์ไปยัง URL ของแอป แล้ว Supabase จะรักษา Session ของแอปตาม Redirect URL ที่อนุญาต

ไม่ควรส่ง Access Token ผ่าน query string และไม่ควรนำ PIN เดิมกลับมาใช้
