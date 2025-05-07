Buatkan aplikasi Web dan Mobile ERP untuk PT. Sarana Mudah Raya (Samudra Paket) secara bertahap: Backend → Frontend → Mobile. Semua pengembangan wajib mengacu pada dokumen BRD, SRS, dan TDD yang telah disepakati.

### 1. Tujuan:
- Membangun aplikasi Web dan Mobile ERP terintegrasi sesuai desain arsitektur, wireframes, dan spesifikasi teknis.

### 2. Peran yang Terlibat:
- Fullstack Developer
- Backend Developer
- Mobile Developer

### 3. Aturan Umum:
- Semua fitur, modul, dan spesifikasi **harus** mengacu pada BRD, SRS, dan TDD.
- Dilarang keluar dari scope yang sudah disepakati.
- Data dummy testing harus mengambil dari file Project Knowledge.
- Menggunakan Git untuk version control (GitFlow strategy).
- Semua code harus bersih, modular, terdokumentasi, dan siap scale-up.
- Minimal code coverage 80% dari unit testing.

---

## Phase 1: Backend Development

**Teknologi:**
- Node.js (Express.js) + MongoDB (Mongoose ORM)
- Docker untuk containerization
- Redis untuk caching
- Swagger/OpenAPI untuk dokumentasi API
- Jest/Mocha untuk unit testing

**Arsitektur:**
- Microservices berbasis Hexagonal Architecture
- API Gateway berbasis Express.js
- JWT Authentication + Role-Based Access Control (RBAC)
- Event Bus untuk komunikasi antar service
- Enkripsi data AES-256 dan TLS 1.3 untuk keamanan

**Microservices yang Harus Dibuat:**
- Authentication & Authorization Service
- User Management Service
- Branch & Division Management Service
- Pickup, Shipment, Delivery Management
- Financial & Billing Management
- Reporting & Analytics

**Output Phase 1:**
- API lengkap dan terdokumentasi
- Dockerfile + Docker Compose untuk environment backend
- Unit test dengan minimal coverage 80%
- Git repo terstruktur

---

## Phase 2: Frontend Development (Web)

**Teknologi:**
- Next.js (React.js)
- Redux Toolkit + React Query
- TailwindCSS untuk styling
- Formik + Yup untuk validasi form
- SSR + CSR hybrid
- PWA (Progressive Web App) Support

**Arsitektur:**
- Atomic Design Structure
- Modular pages & reusable components
- Role-based view access
- Mobile-First & Responsive Design (WCAG 2.1 AA compliance)

**Fitur Web:**
- Login, Logout, MFA
- Dashboard Monitoring
- Pickup, Delivery, Invoicing Management
- Financial Reporting
- System & Role Management

**Output Phase 2:**
- Frontend source code terstruktur dan dokumentasi build
- Integrasi API backend berhasil
- Unit test UI menggunakan React Testing Library
- PWA build siap deploy

---

## Phase 3: Mobile Development

**Teknologi:**
- React Native (Expo)
- TypeScript
- Redux Toolkit + React Query
- Firebase Cloud Messaging untuk Push Notifications
- Secure storage + Offline-first sync capability

**Arsitektur:**
- Feature-based Modular Mobile Architecture
- Data sync otomatis saat online
- Optimasi untuk low-bandwidth environment

**Fitur Mobile:**
- **Checker App:** Verifikasi pickup, scanning, foto bukti.
- **Driver App:** Navigasi rute, Proof of Delivery, COD management.
- **Debt Collector App:** Daftar penagihan, route optimasi, bukti pembayaran.
- **Warehouse App:** Inventory tracking, batch scanning, muat-langsir management.

**Output Phase 3:**
- APK/IPA file siap distribusi
- Offline mode testing success
- API Integration success
- Unit and integration testing report
- Git repo terstruktur mobile

---

## Integrasi Eksternal:
- Midtrans/Xendit untuk Payment Gateway.
- Google Maps API untuk optimasi rute dan geocoding.
- Twilio/SendGrid untuk SMS/Email Notification.
- Webhook untuk integrasi sistem mitra Forwarder.

---

### 4. Standar Pengembangan:
- **Version Control:** Git dengan branching GitFlow.
- **Testing:** Unit, Integration, dan e2e Testing wajib.
- **Deployment:** Siap menggunakan CI/CD pipeline.
- **Documentation:** Wajib dokumentasi API, System Manual, dan Deployment Guide.
- **Security:** Defense in depth: JWT, RBAC, Input Validation, Data Encryption, CSRF/XSS protection.

### 5. Output Akhir:
- Source code backend, frontend, dan mobile siap deploy.
- API dokumentasi lengkap Swagger/OpenAPI.
- Deployment files (Docker, Kubernetes manifest jika diperlukan).
- Unit testing reports.
- User Manual & System Admin Guide.
- Aplikasi siap masuk ke tahap QA & UAT.

