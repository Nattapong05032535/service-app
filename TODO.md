# 📋 Service App — TODO List (วิเคราะห์สิ่งที่ขาด)

> วิเคราะห์เมื่อ: 2026-02-11  
> Branch: `natee/dev`

---

## 🔴 Critical (ต้องทำก่อน)

### 1. Auth Middleware — ไม่มี Authentication Guard กลาง
- **ปัญหา:** ทุกหน้าต้อง check `getSession()` เองทีละหน้า → ถ้าลืมใส่จะเป็นช่องโหว่
- **แนวทาง:** สร้าง `middleware.ts` ที่ root `/src` เพื่อ protect routes อัตโนมัติ (ยกเว้น `/login`, `/register`)
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 2. Zod Input Validation — ไม่มี Input Validation เลย
- **ปัญหา:** ทุก Server Action ใช้ `formData.get("field") as string` โดยตรง ไม่มี validation
- **ความเสี่ยง:** SQL injection (โดยเฉพาะ `findServiceByOrderCase` ที่ส่ง string ตรงลง Airtable formula), ข้อมูลผิดรูปแบบ, XSS
- **แนวทาง:** สร้าง Zod schemas สำหรับทุก input form
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 3. Exposed Secrets — Credentials อยู่ใน Code
- **ปัญหา:** `drizzle.config.ts` hardcode password (`Password123!`) ลงใน code ตรงๆ
- **แนวทาง:** ย้าย hardcoded credentials ไปใช้ env variables ทั้งหมด
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 4. Delete Functions — CRUD ไม่ครบ
- **ปัญหา:** ไม่มี `deleteCompany`, `deleteProduct`, `deleteWarranty`, `deleteService` เลย
- **แนวทาง:** เพิ่ม delete ทั้งใน `provider.ts`, server actions, และ UI (พร้อม confirm dialog)
- **สถานะ:** ⬜ ยังไม่ได้ทำ

---

## 🟠 High (สำคัญมาก)

### 5. Update Product / Update Warranty — ขาด Update Functions
- **ปัญหา:** มีแค่ `updateCompany` และ `updateService` — ไม่มี `updateProduct` และ `updateWarranty`
- **แนวทาง:** เพิ่ม update functions + UI (edit dialog/form)
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 6. ~~Dashboard ไม่ใช่ Dashboard จริง~~
- **ปัญหา:** `dashboard/page.tsx` เนื้อหาซ้ำกับ `customers/page.tsx` เกือบ 100% ไม่มี statistics, charts
- **แนวทาง:** สร้าง Dashboard จริงที่มี: จำนวนลูกค้า, สินค้า, warranty ใกล้หมด, service pending, charts
- **สถานะ:** ✅ เสร็จแล้ว (2026-02-11) — Summary cards + Warranty/Service stats + Recent services table

### 7. Error Handling — ไม่มี User-Facing Feedback
- **ปัญหา:** Server Actions throw errors แต่ไม่มี toast/notification system
- **แนวทาง:** เพิ่ม toast notification (success/error) + return error messages จาก server actions
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 8. Mobile Navigation — ไม่มี Responsive Menu
- **ปัญหา:** Navbar links ใช้ `hidden md:flex` → mobile มองไม่เห็น navigation เลย
- **แนวทาง:** เพิ่ม hamburger menu สำหรับ mobile
- **สถานะ:** ⬜ ยังไม่ได้ทำ

---

## 🟡 Medium (ควรทำ)

### 9. Refactor provider.ts — ไฟล์ใหญ่เกินไป (1,028 บรรทัด)
- **ปัญหา:** ฝ่าฝืนกฎ max 300-400 lines per file
- **แนวทาง:** แยกเป็น modules: `companyProvider.ts`, `productProvider.ts`, `serviceProvider.ts`, `warrantyProvider.ts`
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 10. Session Encryption — Session ไม่ปลอดภัย
- **ปัญหา:** ใช้ plain JSON cookie เก็บ session (ไม่มี sign/encrypt) → ปลอมตัวเป็น user อื่นได้
- **แนวทาง:** ใช้ JWT signed token หรือ encrypted session
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 11. ~~RBAC — ไม่มี Role-Based Access Control~~
- **ปัญหา:** User schema มีแค่ `username`, `password`, `email` — ไม่มี `role`
- **แนวทาง:** เพิ่ม `role` field ใน users table + permission check logic
- **สถานะ:** ✅ เสร็จแล้ว (2026-02-11) — Option A: role field ใน Users + Permission config ใน code

### 12. Customers Pagination — ไม่มี Pagination
- **ปัญหา:** Customers page ตัดแค่ 10 ตัวแรก (`slice(0, 10)`) — ไม่มีปุ่ม next page
- **แนวทาง:** เพิ่ม pagination เหมือน Products page
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 13. Debug console.log — เยอะมากใน Production Code
- **ปัญหา:** `provider.ts` มี `console.log("=== DEBUG: ...")` กระจายทั่ว
- **แนวทาง:** ลบออก หรือใช้ proper logger (Pino/Winston)
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 14. Landing Page — ไม่ทำงาน
- **ปัญหา:** `app/page.tsx` มี `redirect("/customers")` ที่ line 8 ทำให้ code ข้างล่างเป็น dead code
- **แนวทาง:** clean up หรือทำ landing page ให้ใช้ได้จริง
- **สถานะ:** ⬜ ยังไม่ได้ทำ

---

## 🟢 Low (Nice to have)

### 15. Skeleton Loading UI
- **ปัญหา:** มี `LoadingOverlay` (full screen) แต่ไม่มี skeleton loading per-section
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 16. Confirmation Dialogs
- **ปัญหา:** ไม่มี confirm dialog ก่อนทำ destructive actions
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 17. Import Page Auth Check
- **ปัญหา:** `import/page.tsx` เป็น `"use client"` — ไม่มี session check ก่อน render
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 18. Fix eslint-disable Comments
- **ปัญหา:** มี `eslint-disable-next-line @typescript-eslint/no-explicit-any` หลายจุด ควร fix types ให้ถูกต้อง
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 19. Unit Tests
- **ปัญหา:** มี folder `test/` และ `coverage/` แต่ไม่มี test files จริง
- **สถานะ:** ⬜ ยังไม่ได้ทำ

### 20. Rate Limiting
- **ปัญหา:** API routes ไม่มี rate limiting (ตาม rules ต้องมี 100 req/min default)
- **สถานะ:** ⬜ ยังไม่ได้ทำ

---

## 📊 สรุป

| ระดับ | จำนวน | รายการ |
|-------|--------|--------|
| 🔴 Critical | 4 | Auth Middleware, Zod Validation, Secrets, Delete Functions |
| 🟠 High | 4 | Update Product/Warranty, Dashboard, Error Feedback, Mobile Nav |
| 🟡 Medium | 6 | Refactor, Session Security, RBAC, Pagination, Logging, Landing Page |
| 🟢 Low | 6 | Skeleton UI, Confirmations, Import Auth, ESLint, Tests, Rate Limiting |
| **รวม** | **20** | |
