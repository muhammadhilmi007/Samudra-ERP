# **Technical Design Document (TDD) Sistem ERP PT. Sarana Mudah Raya (Samudra Paket)**

**Dokumen Versi:** 1.0\
&#x20;**Tanggal:** 26 April 2025\
&#x20;**Status Dokumen:** Draft\
&#x20;**Disusun oleh:** Software Architect, Database Engineer, UI/UX Designer, DevOps Engineer
==============================================================================================

## **Daftar Isi**

# 1. Pendahuluan

2. Arsitektur Sistem

3. Desain Frontend

4. Desain Backend

5. Desain Database

6. Desain API

7. Desain DevOps & Infrastruktur

8. Diagram Sistem

9. Tech Stack

## **1. Pendahuluan**

### **1.1 Tujuan Dokumen**

# Dokumen Technical Design Document (TDD) ini bertujuan untuk menjabarkan secara detail desain teknis Sistem ERP PT. Sarana Mudah Raya (Samudra Paket), meliputi arsitektur sistem, desain modul frontend dan backend, rancangan database, desain API, diagram sistem, dan rencana deployment. Dokumen ini akan menjadi panduan bagi tim pengembangan dalam mengimplementasikan sistem.

### **1.2 Ruang Lingkup**

# Dokumen ini mencakup detail teknis untuk:* Aplikasi Web (berbasis Next.js dan React.js) dengan menggunakan JavaScript sebagai Bahasa Pemrogramannya

* Aplikasi Mobile (berbasis React Native dan Expo) dengan menggunakan TypeScript sebagai Bahasa Pemrogramannya

* Backend API (berbasis Node.js dan Express) dengan menggunakan JavaScript sebagai Bahasa Pemrogramannya

* Database (MongoDB) dengan Mongoose ODM dan menggunakan Embedded Document

* Infrastruktur dan DevOpsDokumen ini tidak mencakup:* Detail implementasi bisnis proses

* Detail User Acceptance Testing (UAT)

* Detail training untuk end-user

### **1.3 Referensi**

# - Software Requirement Specification (SRS) Sistem ERP Samudra Paket

- Business Requirement Document (BRD) Sistem ERP Samudra Paket

- Alur Kerja PT. Sarana Mudah Raya

- Struktur Organisasi PT. Sarana Mudah Raya

- Job Description untuk peran di PT. Sarana Mudah Raya

### **1.4 Definisi dan Akronim**

# |                     |                                              |
| :-----------------: | :------------------------------------------: |
| **Istilah/Akronim** |                 **Definisi**                 |
|         API         |       Application Programming Interface      |
|         REST        |        Representational State Transfer       |
|         SPA         |            Single Page Application           |
|         ORM         |           Object-Relational Mapping          |
|         JWT         |                JSON Web Token                |
|        CI/CD        | Continuous Integration/Continuous Deployment |
|         RBAC        |           Role-Based Access Control          |
|         SSR         |             Server-Side Rendering            |
|         CSR         |             Client-Side Rendering            |
|         CDN         |           Content Delivery Network           |
|         PWA         |          Progressive Web Application         |
|         SSG         |            Static Site Generation            |
|         ISR         |        Incremental Static Regeneration       |

## **2. Arsitektur Sistem**

### **2.1 Arsitektur High-Level**

# Sistem ERP Samudra Paket akan dikembangkan menggunakan arsitektur microservice dengan pendekatan API-first. Arsitektur ini dipilih untuk memastikan skalabilitas, maintainability, dan deployment yang independen untuk setiap komponen sistem.**Komponen Utama:**1) **Frontend Layer**

   - Next.js Web Application (SSR + CSR hybrid) with JavaScript

   - React Native Mobile Application with TypeScript

   - Progressive Web App (PWA) capabilities

   - Offline-first mobile experience untuk operasional lapangan

2) **API Gateway Layer**

   - Express.js API Gateway with JavaScript

   - Authentication & Authorization berbasis Fitur Permission

   - Rate Limiting & Caching

   - API Documentation

   - Request validation & transformation

   - Circuit breaker pattern untuk fault tolerance

3) **Microservices Layer**

   - Core Services (User, Role, Branch, Division)

   - Operational Services (Pickup, Shipment, Delivery)

   - Financial Services (Payment, Invoice, Accounting)

   - Reporting Services

   - Each service with its own database and business logic

4) **Data Layer**

   - MongoDB Database (primary data store)

   - Redis Cache (for performance optimization)

   - File Storage (for documents and images)

   - Data synchronization mechanisms

5) **Integration Layer**

   - External API Integrations (Maps, Payment Gateway, SMS/Email)

   - Webhook Handlers

   - Event Bus (for asynchronous communication between services)

   - Adapter patterns for third-party integrations

6) **Infrastructure Layer**

   - Containerization (Docker)

   - Orchestration (Kubernetes)

   - CI/CD Pipeline

   - Monitoring & Logging

   - Auto-scaling mechanisms

   - Geographical redundancy for critical componentsmermaid`graph TD  ``    A[Client Devices] --> B[CDN]  ``    B --> C[Load Balancer]  ``    C --> D[API Gateway]  ``      ``    D --> E[Authentication Service]  ``    D --> F[Core Services]  ``    D --> G[Operational Services]  ``    D --> H[Financial Services]  ``    D --> I[Reporting Services]  ``      ``    E --> J[(MongoDB Cluster)]  ``    F --> J  ``    G --> J  ``    H --> J  ``    I --> J  ``      ``    E --> K[(Redis Cache)]  ``    F --> K  ``    G --> K  ``    H --> K  ``    I --> K  ``      ``    G --> L[File Storage]  ``      ``    G --> M[External APIs]  ``    H --> N[Payment Gateway]  ``    I --> O[Notification Service]  ``      ``    P[CI/CD Pipeline] --> Q[Kubernetes Cluster]``    R[Monitoring & Logging] --> Q`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdoMFN59KyE4G5he3PQ4OTWXJIEKbvzhq7FJSVgFqWh9Bf2KNNQAWloW1UZlo1FY9MytzYHXjJ3sMGDPbjZlB8QbFETJ4UFjzltjQilREgGPo-OGYH3Jz44wu8wyhQ-1613l5carA?key=gtPqzkyy6x4aqav6OXfEqgxy)

### **2.2 Arsitektur Low-Level**

#### **2.2.1 Frontend Architecture**

# Frontend akan menggunakan arsitektur berbasis komponen dengan implementasi flux untuk manajemen state:1) **Presentation Layer**

   - UI Components (Atoms, Molecules, Organisms)

   - Pages & Layouts

   - Navigation

2) **State Management**

   - Redux Toolkit untuk global state

   - React Query untuk data fetching dan caching

   - Context API untuk state terlokalisasi

3) **Service Layer**

   - API Services

   - Authentication Services

   - Storage Services

4) **Utility Layer**

   - Helpers & Utils

   - Form Validation

   - Date/Time Handling

   - Formatting

#### **2.2.2 Backend Architecture**

# Backend akan menggunakan arsitektur berbasis microservice dengan implementasi hexagonal:1) **API Layer**

   - Routes

   - Controllers

   - Input Validation

   - Response Formatting

2) **Business Logic Layer**

   - Services

   - Use Cases

   - Domain Models

   - Events

3) **Data Access Layer**

   - Repositories

   - Data Models

   - Query Builders

   - Caching

4) **Infrastructure Layer**

   - Database Connectors

   - External Service Clients

   - File Storage

   - Messaging

### **2.3 Integrasi Sistem**

# Sistem akan terintegrasi dengan beberapa sistem eksternal:1) **Maps & Routing Service**

   - Integrasi dengan Google Maps API untuk geocoding, route optimization

   - Webhook untuk update posisi secara real-time

2) **Payment Gateway**

   - Integrasi dengan Midtrans/Xendit untuk pembayaran elektronik

   - Callback URL untuk notifikasi pembayaran

3) **SMS/Email Gateway**

   - Integrasi dengan Twilio/SendGrid untuk notifikasi

   - Template management untuk komunikasi standar

4) **Forwarder/Mitra Systems**

   - API integration dengan sistem mitra

   - Webhook untuk update status pengiriman

### **2.4 Keamanan Sistem**

# Keamanan sistem akan diimplementasikan pada beberapa level dengan pendekatan defense-in-depth:1) **Authentication & Authorization**

   - JWT-based authentication dengan signature verification

   - Role-Based Access Control (RBAC) dengan permission granular

   - Permission-based authorization pada level API dan UI

   - Multi-factor authentication untuk akun sensitif (OTP via SMS/Email/Authenticator)

   - Session management dengan idle timeout dan absolute expiry

   - Secure password storage dengan bcrypt + salt

   - Brute force protection dengan progressive delays dan account locking

2) **Data Security**

   - Enkripsi data sensitif dalam database (AES-256)

   - Enkripsi data dalam transit (TLS 1.3)

   - End-to-end encryption untuk data sangat sensitif

   - Data masking untuk informasi sensitif (nomor telepon, alamat)

   - PII (Personally Identifiable Information) protection

   - Secure key management dengan vault service

   - Data classification dan handling berdasarkan sensitivity level

3) **Application Security**

   - Input validation pada client dan server side

   - CSRF protection dengan token per request

   - XSS prevention dengan Content Security Policy

   - SQL/NoSQL injection prevention

   - Rate limiting berbasis IP dan user

   - Content validation untuk file uploads

   - Secure headers (X-Content-Type-Options, X-Frame-Options)

   - Dependency vulnerability scanning dan management

   - OWASP Top 10 protection measures

4) **Infrastructure Security**

   - Network segmentation dengan security groups

   - Web Application Firewall (WAF)

   - Intrusion Detection/Prevention System (IDS/IPS)

   - Regular vulnerability scanning dan penetration testing

   - Security monitoring dengan SIEM integration

   - Geo-fencing untuk akses admin

   - DDoS protection

   - Secure container images dengan minimal attack surface

   - Principle of least privilege untuk semua account

5) **Operational Security**

   - Comprehensive security logging dan audit trail

   - Regular security assessments

   - Incident response plan dan procedures

   - Security awareness training untuk team members

   - Secure development lifecycle integration

   - Automated security testing dalam CI/CD pipeline

## **3. Desain Frontend**

### **3.1 Arsitektur Frontend**

#### **3.1.1 Web Application Architecture**

Aplikasi web akan dibangun menggunakan Next.js dengan menggunakan Bahasa Pemrograman JavaScript dan pendekatan hybrid (SSR + CSR) untuk mengoptimalkan performa dan SEO. Arsitektur frontend web akan mengadopsi pola Atomic Design dengan struktur berikut:/frontend\
&#x20;├── /public # Static assets\
&#x20;├── /src\
&#x20;│ ├── /components # Reusable UI components\
&#x20;│ │ ├── /atoms # Basic building blocks (buttons, inputs)\
&#x20;│ │ ├── /molecules # Combinations of atoms (form fields, cards)\
&#x20;│ │ ├── /organisms # Complex UI components (tables, forms)\
&#x20;│ │ └── /templates # Page layouts\
&#x20;│ ├── /features # Feature-based modules\
&#x20;│ │ ├── /auth # Authentication related features\
&#x20;│ │ ├── /dashboard # Dashboard related features\
&#x20;│ │ ├── /pickup # Pickup related features\
&#x20;│ │ └── ...\
&#x20;│ ├── /hooks # Custom React hooks\
&#x20;│ ├── /lib # Utility libraries\
&#x20;│ ├── /pages # Next.js pages\
&#x20;│ ├── /services # API service integrations\
&#x20;│ ├── /store # Redux store configuration\
&#x20;│ ├── /styles # Global styles and themes│ └── /types # TypeScript type definitions
========================================================================================

#### **3.1.2 Mobile Application Architecture**

Aplikasi mobile akan dibangun menggunakan React Native (Expo) dengan menggunakan Bahasa Pemrograman TypeScript dan pendekatan yang serupa dengan web, namun disesuaikan untuk mobile:/mobile\
&#x20;├── /assets # Static assets\
&#x20;├── /src\
&#x20;│ ├── /components # Reusable UI components\
&#x20;│ ├── /features # Feature-based modules\
&#x20;│ ├── /hooks # Custom React hooks\
&#x20;│ ├── /lib # Utility libraries\
&#x20;│ ├── /navigation # Navigation configuration\
&#x20;│ ├── /screens # App screens\
&#x20;│ ├── /services # API service integrations\
&#x20;│ ├── /store # Redux store configuration\
&#x20;│ ├── /styles # Global styles and themes│ └── /types # TypeScript type definitions
========================================================================================

### **3.2 Struktur Halaman Web**

# Struktur halaman web akan mencakup beberapa area utama:1) **Authentication Pages**

   - Login

   - Password Reset

   - Multi-factor Authentication

2) **Dashboard Pages**

   - Executive Dashboard

   - Operational Dashboard

   - Financial Dashboard

   - Customer Dashboard

   - HR Dashboard

3) **Operational Pages**

   - Pickup Management

   - Shipment Management

   - Delivery Management

   - Return Management

4) **Administrative Pages**

   - Branch Management

   - Division Management

   - Employee Management

   - Vehicle Management

5) **Financial Pages**

   - Sales & Invoicing

   - Billing & Collection

   - Cash Management

   - Financial Reports

6) **Settings & Configuration Pages**

   - User Management

   - Role Management

   - System Configuration

   - Integration Settings

### **3.3 Komponen Utama**

# Berikut adalah komponen UI utama yang akan dikembangkan:1) **Layout Components**

   - MainLayout (includes header, sidebar, content area, footer)

   - DashboardLayout

   - AuthLayout

   - PrintLayout

2) **Navigation Components**

   - Sidebar

   - Navbar

   - Breadcrumbs

   - TabNavigator

3) **Data Display Components**

   - DataTable (sortable, filterable, paginated)

   - DataGrid

   - Timeline

   - StatusBadge

   - Card

4) **Form Components**

   - Input fields (text, number, date, select)

   - FormBuilder

   - ValidationMessage

   - FieldArray

5) **Chart Components**

   - LineChart

   - BarChart

   - PieChart

   - GaugeChart

   - HeatMap

6) **Modal & Dialog Components**

   - ConfirmationDialog

   - FormModal

   - AlertDialog

   - SidePanel

7) **Map Components**

   - LocationMap

   - RouteMap

   - AreaMap

### **3.4 Desain Mobile**

# Aplikasi mobile akan fokus pada fungsionalitas operasional untuk petugas lapangan dengan pendekatan offline-first untuk memastikan operasional tetap berjalan meskipun koneksi internet tidak stabil. Berikut adalah detail modul-modul utama:1) **Checker App**

   - **Penerimaan & Verifikasi Barang**

     - Form digital untuk verifikasi kondisi barang

     - Checklist digital berbasis standar operasional

     - Capture foto barang dari berbagai sudut

     - Konfirmasi dengan tanda tangan digital pengirim

   - **Pengukuran & Penimbangan**

     - Integrasi dengan timbangan digital via Bluetooth

     - Kalkulasi otomatis volumetrik dengan input dimensi

     - Validasi berat terhadap dokumen pengiriman

   - **Manajemen Scanning**

     - Scan barcode/QR untuk verifikasi resi dan STT

     - Batch scanning untuk multiple items

     - History scan dengan timestamp dan geolocation

   - **Manajemen Dokumentasi**

     - Galeri foto barang terorganisir per pengiriman

     - Annotation tools untuk menandai kondisi khusus

     - Kompres foto otomatis untuk optimasi bandwidth

   - **Alokasi Barang**

     - Interface drag-and-drop untuk alokasi ke kendaraan

     - Optimasi ruang kargo dengan visualisasi

     - Konfirmasi alokasi dengan scan barcode

2) **Driver App**

   - **Manajemen Tugas**

     - Dashboard tugas harian dengan prioritas

     - Detail informasi pickup/delivery dengan timer

     - Notifikasi untuk tugas urgent dan perubahan jadwal

   - **Navigasi & Optimasi Rute**

     - Integrasi Google Maps/Mapbox untuk navigasi turn-by-turn

     - Optimasi rute untuk multiple pick-up/delivery

     - Traffic-aware routing dengan ETA real-time

     - Offline maps untuk area dengan koneksi terbatas

   - **Tracking & Update Status**

     - GPS tracking dengan interval configurable

     - Update status dengan single-tap (arrived, loading, departed)

     - Geofencing untuk update status otomatis

     - Timeline visual untuk progress pengiriman

   - **Proof of Delivery**

     - Tanda tangan digital penerima

     - Foto dokumentasi saat serah terima

     - Konfirmasi identitas penerima

     - Input catatan khusus dari penerima

   - **Manajemen COD**

     - Perhitungan jumlah COD dengan validasi

     - Opsi pembayaran (cash, transfer bank, e-wallet)

     - Receipt generator untuk bukti pembayaran

     - Rekonsiliasi COD end-of-day

3) **Debt Collector App**

   - **Manajemen Penagihan**

     - Daftar tagihan dengan detail customer dan invoice

     - Prioritas penagihan berdasarkan jumlah dan jatuh tempo

     - Customer history dengan catatan penagihan sebelumnya

   - **Optimasi Rute Penagihan**

     - Pemetaan lokasi penagihan dengan clustering

     - Rute optimal dengan pertimbangan prioritas

     - Jadwal penagihan dengan time windows

   - **Pencatatan Kunjungan**

     - Formulir digital hasil kunjungan

     - Outcome options (paid, partial, reschedule, skip)

     - Voice notes untuk catatan verbal

     - Follow-up scheduler untuk janji bayar

   - **Proses Penerimaan Pembayaran**

     - Validasi jumlah pembayaran

     - Foto bukti pembayaran/transfer

     - Receipt generator untuk pelanggan

     - Rekonsiliasi pembayaran real-time

4) **Warehouse App**

   - **Inventory Management**

     - Real-time visibility inventory gudang

     - Batch tracking untuk grup pengiriman

     - Alert untuk barang terlalu lama di gudang

     - Space utilization dashboard

   - **Barcode Operations**

     - Multiple scan modes (single, batch, continuous)

     - Cross-check scan dengan manifest

     - Error handling dengan alternative workflows

   - **Manajemen Penyimpanan**

     - Zone & rack management dengan visual map

     - Optimasi penyimpanan berdasarkan frekuensi akses

     - Search & locate functionality

   - **Muat & Lansir Management**

     - Digital checklist proses muat/lansir

     - Team assignment untuk operasional gudang

     - Konfirmasi multi-level untuk validasi

   - **Dashboard Operasional**

     - KPI real-time per shift dan petugas

     - Throughput monitoring (items processed/hour)

     - Bottleneck identification

     - Workload forecastingSemua aplikasi mobile akan memiliki fitur-fitur umum berikut:* Sinkronisasi data otomatis saat online

* Offline mode dengan complete functionality

* Low-bandwidth optimized API calls

* Background sync untuk data baru

* Push notifications untuk alerts penting

* Biometric authentication (fingerprint/face ID)

* Dark mode untuk operasional malam

* Battery optimization untuk penggunaan full-day

### **3.5 User Interface & Experience**

#### **3.5.1 Design System**

# Aplikasi akan menggunakan design system yang konsisten dengan:1) **Color Palette**

   - Primary: `#2563EB` (Blue)

   - Secondary: `#10B981` (Green)

   - Accent: `#F59E0B` (Amber)

   - Neutral: `#64748B` (Slate)

   - Semantic colors (success, warning, error, info)

2) **Typography**

   - Heading font: Inter

   - Body font: Inter

   - Monospace font: JetBrains Mono

   - Type scale (h1-h6, body, caption, etc.)

3) **Spacing System**

   - Base unit: 4px

   - Spacing scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px

4) **Component Library**

   - Tailwind CSS untuk styling

   - Custom component library berdasarkan Tailwind

#### **3.5.2 Responsive Design**

# Aplikasi web akan mengadopsi pendekatan mobile-first dengan breakpoints:* Mobile: < 640px

* Tablet: 640px - 1024px

* Desktop: > 1024px

* Large desktop: > 1280px

#### **3.5.3 Accessibility**

# Aplikasi akan mengikuti WCAG 2.1 Level AA dengan fitur seperti:* Semantic HTML

* Keyboard navigation

* ARIA attributes

* Sufficient color contrast

* Alternative text for images

* Focus management

## **4. Desain Backend**

### **4.1 Arsitektur Backend**

Backend sistem akan menggunakan arsitektur microservice dengan Node.js dan Express.js dengan menggunakan bahasa pemrograman JavaScript. Setiap microservice akan dirancang menggunakan prinsip hexagonal architecture (ports and adapters) untuk memisahkan domain logika bisnis dari framework dan infrastruktur eksternal./backend\
&#x20;├── /services # Microservices\
&#x20;│ ├── /auth-service # Authentication & Authorization\
&#x20;│ ├── /user-service # User Management\
&#x20;│ ├── /branch-service # Branch Management\
&#x20;│ ├── /operational-service # Operational Management\
&#x20;│ ├── /finance-service # Finance Management\
&#x20;│ ├── /reporting-service # Reporting & Analytics\
&#x20;│ └── ...\
&#x20;│\
&#x20;├── /gateway # API Gateway\
&#x20;│ ├── /routes # API Routes\
&#x20;│ ├── /middleware # Gateway Middleware\
&#x20;│ ├── /auth # Auth Handlers\
&#x20;│ └── /docs # API Documentation\
&#x20;│\
&#x20;└── /shared # Shared Resources\
&#x20;├── /models # Shared Models\
&#x20;├── /utils # Shared Utilities\
&#x20;├── /constants # Shared Constants`└── /middlewares             \# Shared Middlewares`Setiap microservice memiliki struktur internal:/service-name\
&#x20;├── /src\
&#x20;│ ├── /api # API Layer\
&#x20;│ │ ├── /controllers # Request handlers\
&#x20;│ │ ├── /routes # Route definitions\
&#x20;│ │ ├── /middlewares # API middlewares\
&#x20;│ │ └── /validations # Input validation\
&#x20;│ │\
&#x20;│ ├── /domain # Domain Layer\
&#x20;│ │ ├── /models # Domain models\
&#x20;│ │ ├── /services # Domain services\
&#x20;│ │ ├── /events # Domain events\
&#x20;│ │ └── /errors # Domain errors\
&#x20;│ │\
&#x20;│ ├── /infrastructure # Infrastructure Layer\
&#x20;│ │ ├── /repositories # Data access\
&#x20;│ │ ├── /database # DB config & models\
&#x20;│ │ ├── /external # External services\
&#x20;│ │ └── /queues # Message queues\
&#x20;│ │\
&#x20;│ ├── /app # Application Layer\
&#x20;│ │ ├── /use-cases # Business logic\
&#x20;│ │ ├── /commands # Command handlers\
&#x20;│ │ ├── /queries # Query handlers\
&#x20;│ │ └── /dtos # Data Transfer Objects\
&#x20;│ │\
&#x20;│ └── /config # Service configuration\
&#x20;│\
&#x20;├── /tests # Tests\
&#x20;│ ├── /unit # Unit tests\
&#x20;│ ├── /integration # Integration tests\
&#x20;│ └── /e2e # End-to-end tests\
&#x20;│\
&#x20;├── package.json # Dependencies└── Dockerfile # Docker configuration
==========================================================================

### **4.2 Struktur Service**

# Backend sistem akan diorganisir ke dalam beberapa service utama:

#### **4.2.1 Core Services**

# 1. **Auth Service**

   - Authentication & Authorization

   - User authentication (login, logout)

   - JWT token management

   - RBAC management

   - Multi-factor authentication

2. **User Service**

   - User management

   - Profile management

   - Role & permission management

   - Password management

3. **Master Data Service**

   - Branch management

   - Division management

   - Employee management

   - Service area management

   - Forwarder partner management

#### **4.2.2 Operational Services**

# 1. **Pickup Service**

   - Pickup request management

   - Pickup assignment

   - Pickup execution

   - Pickup verification

2. **Shipment Service**

   - Shipment order management

   - Loading management

   - Inter-branch shipment

   - Shipment tracking

3. **Delivery Service**

   - Delivery planning

   - Route optimization

   - Delivery execution

   - Proof of delivery

4. **Return Service**

   - Return request management

   - Return processing

   - Return tracking

   - Return resolution

5. **Vehicle Service**

   - Vehicle management

   - Maintenance scheduling

   - Vehicle assignment

   - Fuel consumption tracking

#### **4.2.3 Financial Services**

# 1. **Sales Service**

   - Invoice generation

   - Pricing calculation

   - Payment method handling

   - Customer management

2. **Payment Service**

   - Payment processing

   - Payment verification

   - Payment gateway integration

   - Receipt generation

3. **Billing Service**

   - Billing management

   - Debt collection

   - Aging reports

   - Payment reminders

4. **Accounting Service**

   - Journal entries

   - General ledger

   - Financial statements

   - Asset management

#### **4.2.4 Supporting Services**

# 1. **Notification Service**

   - Email notifications

   - SMS notifications

   - Push notifications

   - In-app notifications

2. **Reporting Service**

   - Report generation

   - Data aggregation

   - Analytics

   - Dashboard metrics

3. **Integration Service**

   - External API integration

   - Webhook handling

   - Data synchronization

   - File processing

### **4.3 Workflow Server**

# Backend akan menangani beberapa workflow utama:

#### **4.3.1 Authentication Workflow**

# 1. User mengirim credentials ke Auth Service

2. Auth Service memvalidasi credentials

3. Jika valid, Auth Service membuat JWT token

4. Token dikirim kembali ke client

5. Client menyimpan token untuk requests berikutnya

6. Token divalidasi untuk setiap API request

7. Refresh token digunakan untuk memperpanjang sesi

#### **4.3.2 Pickup Workflow**

# 1. Pickup Request dibuat melalui API

2. Pickup Service memvalidasi request dan area layanan

3. Notification Service mengirim notifikasi ke Kepala Gudang

4. Kepala Gudang menugaskan tim melalui API

5. Tim pickup menerima tugas melalui mobile app

6. Tim pickup memperbarui status secara real-time

7. Data pengambilan divalidasi dan disimpan

8. Notifikasi dikirim ke checker untuk verifikasi

#### **4.3.3 Shipment Workflow**

# 1. Checker menginput data barang melalui API

2. Shipment Service membuat shipment order

3. Sistem menghitung biaya pengiriman

4. Resi/STT dibuat dan disimpan

5. Barang dialokasikan ke truk melalui API

6. Dokumen pengiriman dibuat secara otomatis

7. Status pengiriman diperbarui secara real-time

8. Notifikasi dikirim ke cabang tujuan

#### **4.3.4 Financial Workflow**

# 1. Transaksi penjualan dicatat melalui API

2. Payment Service memproses pembayaran

3. Accounting Service membuat jurnal otomatis

4. Untuk pembayaran CAD, Billing Service membuat jadwal penagihan

5. Notification Service mengirim pengingat pembayaran

6. Pembayaran yang diterima direkonsiliasi dengan invoice

7. Laporan keuangan dibuat berdasarkan data transaksi

### **4.4 Middleware**

# Backend akan menggunakan middleware berikut:1) **Authentication Middleware**

   - Verifies JWT token

   - Extracts user information

   - Handles token expiration

2) **Authorization Middleware**

   - Checks user permissions

   - Enforces role-based access

   - Validates resource ownership

3) **Validation Middleware**

   - Validates request body

   - Sanitizes input

   - Provides validation errors

4) **Error Handling Middleware**

   - Catches and processes errors

   - Formats error responses

   - Logs errors appropriately

5) **Logging Middleware**

   - Logs request details

   - Tracks response times

   - Captures error details

6) **Request ID Middleware**

   - Assigns unique ID to each request

   - Enables request tracing across services

   - Enhances debugging

7) **CORS Middleware**

   - Manages Cross-Origin Resource Sharing

   - Configures allowed origins

   - Handles preflight requests

8) **Rate Limiting Middleware**

   - Prevents abuse

   - Manages API quotas

   - Protects against DoS attacks

9) **Compression Middleware**

   - Compresses response data

   - Reduces bandwidth usage

   - Improves response times

10) **Caching Middleware**

    - Caches responses

    - Reduces database load

    - Improves response times

## **5. Desain Database**

### **5.1 Arsitektur Database**

Sistem akan menggunakan MongoDB dan Menggunakan Embedded Document sebagai database utama dengan arsitektur sebagai berikut:MongoDB Cluster\
&#x20;├── Database: samudra\_paket\
&#x20;│ ├── Collections: core # Core data collections\
&#x20;│ ├── Collections: operational # Operational data collections\
&#x20;│ ├── Collections: financial # Financial data collections\
&#x20;│ ├── Collections: reporting # Reporting data collections│ └── Collections: configurations # System configurations
========================================================================================================================

#### **5.1.1 Database Strategy**

# - **Deployment Model**: MongoDB Atlas (cloud managed)

- **Cluster Configuration**: 3-node replica set

- **Sharding Strategy**: Akan diimplementasikan ketika data mencapai 500GB

- **Backup Strategy**: Daily automated backups + point-in-time recovery

- **Indexing Strategy**: Comprehensive indexing based on query patterns

#### **5.1.2 Caching Strategy**

# Redis akan digunakan untuk caching dengan strategi:* Cache API responses untuk endpoint yang sering diakses

* Cache user sessions

* Cache lookup data yang jarang berubah (master data)

* Time-to-live (TTL) bervariasi berdasarkan tipe data

### **5.2 Schema & Collections**

#### **5.2.1 Core Collections**

# 1. **users**javascript`{  ``  _id: ObjectId,  ``  username: String,  ``  email: String,  ``  passwordHash: String,  ``  salt: String,  ``  firstName: String,  ``  lastName: String,  ``  phoneNumber: String,  ``  role: ObjectId,  ``  branch: ObjectId,  ``  position: ObjectId,  ``  status: String,  ``  lastLogin: Date,  ``  mfaEnabled: Boolean,  ``  mfaSecret: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`2. **roles**javascript`{  ``  _id: ObjectId,  ``  name: String,  ``  description: String,  ``  permissions: [String],  ``  isSystem: Boolean,  ``  status: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`3. **branches**javascript`{  ``  _id: ObjectId,  ``  code: String,  ``  name: String,  ``  type: String,  ``  address: {  ``    street: String,  ``    city: String,  ``    district: String,  ``    province: String,  ``    postalCode: String,  ``    country: String  ``  },  ``  contact: {  ``    phone: String,  ``    email: String,  ``    fax: String  ``  },  ``  manager: ObjectId,  ``  parent: ObjectId,  ``  status: String,  ``  location: {  ``    type: "Point",  ``    coordinates: [Number, Number]  // [longitude, latitude]  ``  },  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`4. **divisions**javascript`{  ``  _id: ObjectId,  ``  name: String,  ``  code: String,  ``  description: String,  ``  manager: ObjectId,  ``  status: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`5. **positions**javascript`{  ``  _id: ObjectId,  ``  name: String,  ``  code: String,  ``  division: ObjectId,  ``  description: String,  ``  responsibilities: [String],  ``  reportTo: ObjectId,  ``  status: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`6. **employees**javascript`{  ``  _id: ObjectId,  ``  employeeId: String,  ``  user: ObjectId,  ``  firstName: String,  ``  lastName: String,  ``  birthDate: Date,  ``  gender: String,  ``  maritalStatus: String,  ``  address: {  ``    street: String,  ``    city: String,  ``    district: String,  ``    province: String,  ``    postalCode: String,  ``    country: String  ``  },  ``  contact: {  ``    phone: String,  ``    email: String,  ``    emergencyContact: String,  ``    emergencyPhone: String  ``  },  ``  position: ObjectId,  ``  branch: ObjectId,  ``  joinDate: Date,  ``  status: String,  ``  documents: [  ``    {  ``      type: String,  ``      number: String,  ``      issuedDate: Date,  ``      expiryDate: Date,  ``      fileUrl: String  ``    }  ``  ],  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`7. **serviceAreas**javascript`{  ``  _id: ObjectId,  ``  branch: ObjectId,  ``  province: String,  ``  city: String,  ``  district: String,  ``  subDistrict: String,  ``  postalCode: String,  ``  status: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`8. **forwarderPartners**javascript`{  ``  _id: ObjectId,  ``  name: String,  ``  code: String,  ``  contactPerson: String,  ``  phone: String,  ``  email: String,  ``  address: {  ``    street: String,  ``    city: String,  ``    district: String,  ``    province: String,  ``    postalCode: String,  ``    country: String  ``  },  ``  status: String,  ``  apiConfig: {  ``    baseUrl: String,  ``    apiKey: String,  ``    username: String,  ``    passwordHash: String,  ``    timeout: Number  ``  },  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`9. **forwarderAreas**javascript`{  ``  _id: ObjectId,  ``  forwarder: ObjectId,  ``  province: String,  ``  city: String,  ``  district: String,  ``  subDistrict: String,  ``  postalCode: String,  ``  status: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`10. **forwarderRates**javascript`{  ``  _id: ObjectId,  ``  forwarder: ObjectId,  ``  originArea: {  ``    province: String,  ``    city: String  ``  },  ``  destinationArea: {  ``    province: String,  ``    city: String  ``  },  ``  rate: Number,  ``  minWeight: Number,  ``  effectiveDate: Date,  ``  expiryDate: Date,  ``  status: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`

#### **5.2.2 Operational Collections**

# 1. **customers**javascript`{  ``  _id: ObjectId,  ``  customerCode: String,  ``  customerType: String,  ``  name: String,  ``  contactPerson: String,  ``  phoneNumber: String,  ``  email: String,  ``  address: {  ``    street: String,  ``    city: String,  ``    district: String,  ``    province: String,  ``    postalCode: String,  ``    country: String  ``  },  ``  taxId: String,  ``  creditLimit: Number,  ``  paymentTerms: Number,  ``  status: String,  ``  branch: ObjectId,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`2. **pickupRequests**javascript`{  ``  _id: ObjectId,  ``  requestCode: String,  ``  customer: ObjectId,  ``  branch: ObjectId,  ``  pickupAddress: {  ``    street: String,  ``    city: String,  ``    district: String,  ``    province: String,  ``    postalCode: String,  ``    country: String,  ``    location: {  ``      type: "Point",  ``      coordinates: [Number, Number]  ``    }  ``  },  ``  contactName: String,  ``  contactPhone: String,  ``  requestDate: Date,  ``  scheduledDate: Date,  ``  scheduledTimeWindow: {  ``    start: String,  ``    end: String  ``  },  ``  estimatedItems: Number,  ``  estimatedWeight: Number,  ``  notes: String,  ``  status: String,  ``  assignment: ObjectId,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`3. **pickupAssignments**javascript`{  ``  _id: ObjectId,  ``  assignmentCode: String,  ``  branch: ObjectId,  ``  vehicle: ObjectId,  ``  driver: ObjectId,  ``  helper: ObjectId,  ``  requests: [ObjectId],  ``  assignmentDate: Date,  ``  startTime: Date,  ``  endTime: Date,  ``  status: String,  ``  route: {  ``    optimized: Boolean,  ``    sequence: [ObjectId],  ``    totalDistance: Number,  ``    estimatedDuration: Number  ``  },  ``  notes: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`4. **pickupItems**javascript`{  ``  _id: ObjectId,  ``  pickupRequest: ObjectId,  ``  description: String,  ``  quantity: Number,  ``  weight: Number,  ``  dimensions: {  ``    length: Number,  ``    width: Number,  ``    height: Number  ``  },  ``  status: String,  ``  photos: [String],  ``  notes: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`5. **shipmentOrders**javascript`{  ``  _id: ObjectId,  ``  waybillNo: String,  ``  branch: ObjectId,  ``  sender: {  ``    customer: ObjectId,  ``    name: String,  ``    address: {  ``      street: String,  ``      city: String,  ``      district: String,  ``      province: String,  ``      postalCode: String,  ``      country: String  ``    },  ``    phone: String,  ``    email: String  ``  },  ``  receiver: {  ``    name: String,  ``    address: {  ``      street: String,  ``      city: String,  ``      district: String,  ``      province: String,  ``      postalCode: String,  ``      country: String  ``    },  ``    phone: String,  ``    email: String  ``  },  ``  originBranch: ObjectId,  ``  destinationBranch: ObjectId,  ``  serviceType: String,  ``  paymentType: String,  ``  forwarderCode: String,  ``  items: [  ``    {  ``      description: String,  ``      quantity: Number,  ``      weight: Number,  ``      volume: Number,  ``      value: Number  ``    }  ``  ],  ``  totalItems: Number,  ``  totalWeight: Number,  ``  totalVolume: Number,  ``  amount: {  ``    baseRate: Number,  ``    additionalServices: Number,  ``    insurance: Number,  ``    tax: Number,  ``    discount: Number,  ``    total: Number  ``  },  ``  pickupRequest: ObjectId,  ``  status: String,  ``  statusHistory: [  ``    {  ``      status: String,  ``      timestamp: Date,  ``      location: String,  ``      notes: String,  ``      user: ObjectId  ``    }  ``  ],  ``  documents: [  ``    {  ``      type: String,  ``      fileUrl: String,  ``      uploadedAt: Date  ``    }  ``  ],  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`6. **loadingForms**javascript`{  ``  _id: ObjectId,  ``  loadingNo: String,  ``  branch: ObjectId,  ``  vehicle: ObjectId,  ``  driver: ObjectId,  ``  helper: ObjectId,  ``  originBranch: ObjectId,  ``  destinationBranch: ObjectId,  ``  loadingDate: Date,  ``  totalItems: Number,  ``  totalWeight: Number,  ``  status: String,  ``  shipments: [  ``    {  ``      shipment: ObjectId,  ``      waybillNo: String,  ``      status: String  ``    }  ``  ],  ``  notes: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`7. **shipments**javascript`{  ``  _id: ObjectId,  ``  shipmentNo: String,  ``  loadingForm: ObjectId,  ``  vehicle: ObjectId,  ``  driver: ObjectId,  ``  helper: ObjectId,  ``  originBranch: ObjectId,  ``  destinationBranch: ObjectId,  ``  departureDate: Date,  ``  estimatedArrival: Date,  ``  actualArrival: Date,  ``  status: String,  ``  statusHistory: [  ``    {  ``      status: String,  ``      timestamp: Date,  ``      location: String,  ``      notes: String,  ``      user: ObjectId  ``    }  ``  ],  ``  tracking: [  ``    {  ``      timestamp: Date,  ``      location: {  ``        type: "Point",  ``        coordinates: [Number, Number]  ``      },  ``      address: String,  ``      status: String  ``    }  ``  ],  ``  notes: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`8. **deliveryOrders**javascript`{  ``  _id: ObjectId,  ``  deliveryNo: String,  ``  branch: ObjectId,  ``  vehicle: ObjectId,  ``  driver: ObjectId,  ``  helper: ObjectId,  ``  deliveryDate: Date,  ``  totalItems: Number,  ``  status: String,  ``  route: {  ``    optimized: Boolean,  ``    sequence: [ObjectId],  ``    totalDistance: Number,  ``    estimatedDuration: Number  ``  },  ``  shipments: [  ``    {  ``      shipmentOrder: ObjectId,  ``      waybillNo: String,  ``      status: String,  ``      deliveryResult: String,  ``      notes: String,  ``      proofOfDelivery: {  ``        signature: String,  ``        photos: [String],  ``        timestamp: Date,  ``        receiverName: String  ``      }  ``    }  ``  ],  ``  notes: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`9. **vehicles**javascript`{  ``  _id: ObjectId,  ``  vehicleNo: String,  ``  plateNumber: String,  ``  type: String,  ``  brand: String,  ``  model: String,  ``  year: Number,  ``  capacity: {  ``    weight: Number,  ``    volume: Number  ``  },  ``  fuelType: String,  ``  ownership: String,  ``  branch: ObjectId,  ``  status: String,  ``  maintenance: {  ``    lastMaintenance: Date,  ``    nextMaintenance: Date,  ``    maintenanceInterval: Number,  ``    odometerReading: Number  ``  },  ``  documents: [  ``    {  ``      type: String,  ``      number: String,  ``      issuedDate: Date,  ``      expiryDate: Date,  ``      fileUrl: String  ``    }  ``  ],  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`10. **returns**javascript`{  ``  _id: ObjectId,  ``  returnNo: String,  ``  shipmentOrder: ObjectId,  ``  waybillNo: String,  ``  branch: ObjectId,  ``  returnDate: Date,  ``  returnReason: String,  ``  returnType: String,  ``  status: String,  ``  resolution: {  ``    type: String,  ``    notes: String,  ``    resolvedBy: ObjectId,  ``    resolvedAt: Date  ``  },  ``  items: [  ``    {  ``      description: String,  ``      quantity: Number,  ``      condition: String,  ``      notes: String,  ``      photos: [String]  ``    }  ``  ],  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`

#### **5.2.3 Financial Collections**

# 1. **chartOfAccounts**javascript`{  ``  _id: ObjectId,  ``  accountCode: String,  ``  accountName: String,  ``  accountType: String,  ``  category: String,  ``  subCategory: String,  ``  description: String,  ``  isActive: Boolean,  ``  balance: Number,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`2. **journals**javascript`{  ``  _id: ObjectId,  ``  journalNo: String,  ``  journalDate: Date,  ``  description: String,  ``  reference: String,  ``  referenceType: String,  ``  referenceId: ObjectId,  ``  totalDebit: Number,  ``  totalCredit: Number,  ``  status: String,  ``  branch: ObjectId,  ``  entries: [  ``    {  ``      account: ObjectId,  ``      description: String,  ``      debit: Number,  ``      credit: Number  ``    }  ``  ],  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`3. **payments**javascript`{  ``  _id: ObjectId,  ``  paymentNo: String,  ``  paymentDate: Date,  ``  customer: ObjectId,  ``  waybill: ObjectId,  ``  paymentType: String,  ``  paymentMethod: String,  ``  amount: Number,  ``  referenceNo: String,  ``  status: String,  ``  branch: ObjectId,  ``  notes: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`4. **expenses**javascript`{  ``  _id: ObjectId,  ``  expenseNo: String,  ``  expenseDate: Date,  ``  expenseType: String,  ``  description: String,  ``  amount: Number,  ``  branch: ObjectId,  ``  approvedBy: ObjectId,  ``  status: String,  ``  receipt: {  ``    fileUrl: String,  ``    uploadedAt: Date  ``  },  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`5. **receivables**javascript`{  ``  _id: ObjectId,  ``  invoiceNo: String,  ``  customer: ObjectId,  ``  waybill: ObjectId,  ``  amount: Number,  ``  dueDate: Date,  ``  status: String,  ``  branch: ObjectId,  ``  collections: [  ``    {  ``      collectionNo: String,  ``      amount: Number,  ``      collectionDate: Date,  ``      collectedBy: ObjectId,  ``      status: String,  ``      notes: String  ``    }  ``  ],  ``  notes: String,  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`6. **assets**javascript`{  ``  _id: ObjectId,  ``  assetNo: String,  ``  assetName: String,  ``  category: String,  ``  purchaseDate: Date,  ``  purchaseAmount: Number,  ``  depreciationMethod: String,  ``  usefulLife: Number,  ``  salvageValue: Number,  ``  currentValue: Number,  ``  branch: ObjectId,  ``  location: String,  ``  status: String,  ``  documents: [  ``    {  ``      type: String,  ``      fileUrl: String,  ``      uploadedAt: Date  ``    }  ``  ],  ``  createdAt: Date,  ``  updatedAt: Date,  ``  createdBy: ObjectId,  ``  updatedBy: ObjectId``}`

### **5.3 Relasi Data**

# MongoDB adalah database NoSQL yang tidak mendukung relasi seperti database relasional, namun relasi akan diimplementasikan melalui:1) **Embedded Documents**

   - Untuk relasi one-to-few dan data yang selalu diakses bersama

   - Contoh: status history dalam shipmentOrders

2) **Document References**

   - Untuk relasi one-to-many dan many-to-many

   - Contoh: references ObjectId ke collections lain

3) **Denormalization**

   - Untuk data yang sering dibaca tetapi jarang diubah

   - Contoh: menyimpan informasi sender/receiver dalam shipmentOrdersKunci relasi utama:* users → roles (many-to-one)

* employees → users (one-to-one)

* employees → positions (many-to-one)

* positions → divisions (many-to-one)

* branches → employees (one-to-many)

* pickupRequests → customers (many-to-one)

* pickupAssignments → vehicles, employees (many-to-one)

* shipmentOrders → customers, branches (many-to-one)

* loadingForms → vehicles, employees, shipmentOrders (many-to-many)

* payments → shipmentOrders (many-to-one)

* receivables → customers, shipmentOrders (many-to-one)

### **5.4 Strategi Indexing**

# Berikut adalah strategi indexing untuk optimasi query:

#### **5.4.1 Core Collections**

# - **users**: { username: 1 }, { email: 1 }, { branch: 1, status: 1 }

- **roles**: { name: 1 }

- **branches**: { code: 1 }, { status: 1 }, { "location": "2dsphere" }

- **divisions**: { code: 1 }

- **positions**: { division: 1 }

- **employees**: { employeeId: 1 }, { position: 1 }, { branch: 1, status: 1 }

- **serviceAreas**: { branch: 1 }, { province: 1, city: 1 }

- **forwarderPartners**: { code: 1 }, { status: 1 }

- **forwarderAreas**: { forwarder: 1 }, { province: 1, city: 1 }

#### **5.4.2 Operational Collections**

# - **customers**: { customerCode: 1 }, { phoneNumber: 1 }, { email: 1 }, { branch: 1, status: 1 }

- **pickupRequests**: { requestCode: 1 }, { customer: 1 }, { branch: 1, status: 1 }, { scheduledDate: 1, status: 1 }

- **pickupAssignments**: { assignmentCode: 1 }, { branch: 1 }, { driver: 1 }, { assignmentDate: 1, status: 1 }

- **shipmentOrders**: { waybillNo: 1 }, { "sender.customer": 1 }, { originBranch: 1 }, { destinationBranch: 1 }, { status: 1 }, { createdAt: 1, status: 1 }

- **loadingForms**: { loadingNo: 1 }, { vehicle: 1 }, { driver: 1 }, { loadingDate: 1, status: 1 }

- **shipments**: { shipmentNo: 1 }, { loadingForm: 1 }, { originBranch: 1, destinationBranch: 1 }, { departureDate: 1, status: 1 }

- **deliveryOrders**: { deliveryNo: 1 }, { vehicle: 1 }, { driver: 1 }, { branch: 1, status: 1 }, { deliveryDate: 1, status: 1 }

- **vehicles**: { vehicleNo: 1 }, { plateNumber: 1 }, { branch: 1, status: 1 }

- **returns**: { returnNo: 1 }, { shipmentOrder: 1 }, { waybillNo: 1 }, { branch: 1, status: 1 }

#### **5.4.3 Financial Collections**

# - **chartOfAccounts**: { accountCode: 1 }, { accountType: 1, isActive: 1 }

- **journals**: { journalNo: 1 }, { journalDate: 1 }, { branch: 1, status: 1 }, { referenceType: 1, referenceId: 1 }

- **payments**: { paymentNo: 1 }, { customer: 1 }, { waybill: 1 }, { branch: 1, status: 1 }, { paymentDate: 1, status: 1 }

- **expenses**: { expenseNo: 1 }, { branch: 1, status: 1 }, { expenseDate: 1, expenseType: 1 }

- **receivables**: { invoiceNo: 1 }, { customer: 1 }, { waybill: 1 }, { branch: 1, status: 1 }, { dueDate: 1, status: 1 }

- **assets**: { assetNo: 1 }, { category: 1 }, { branch: 1, status: 1 }

### **5.5 Strategi Sharding**

# Sharding akan diimplementasikan ketika data mencapai 500GB atau ketika performa query mulai menurun. Strategi sharding:1) **Shard Key Selection**

   - shipmentOrders: { originBranch: 1, createdAt: 1 }

   - journals: { branch: 1, journalDate: 1 }

   - payments: { branch: 1, paymentDate: 1 }

2) **Zona Sharding**

   - Zona berdasarkan region geografis

   - Masing-masing zona berisi data yang relevan dengan region tersebut

3) **Chunk Size Optimization**

   - Chunk size default 64MB

   - Akan dioptimasi berdasarkan pola akses data

## **6. Desain API**

### **6.1 Arsitektur API**

# API akan diimplementasikan menggunakan RESTful principles dengan beberapa karakteristik:1) **Resource-Oriented**

   - API endpoints mewakili resources (nouns, not verbs)

   - HTTP methods mewakili actions (GET, POST, PUT, DELETE)

2) **Stateless**

   - Setiap request mengandung semua informasi yang diperlukan

   - Tidak ada state yang disimpan antar requests pada server

3) **Cacheable**

   - Responses dapat di-cache dengan appropriate cache headers

   - Cache invalidation dikelola dengan entity tags (ETags)

4) **Layered System**

   - API Gateway sebagai entry point

   - Load balancing dan caching transparan untuk client

5) **Uniform Interface**

   - Standard URL structure

   - Standard response format

   - HATEOAS (Hypertext As The Engine Of Application State)

### **6.2 Autentikasi & Otorisasi**

#### **6.2.1 Autentikasi**

# Autentikasi akan menggunakan JWT (JSON Web Tokens) dengan strategi:1) **Token-Based Flow**

   - User login dengan credentials

   - Server validasi credentials dan generate JWT

   - JWT berisi user ID, role, dan permissions

   - JWT ditandatangani dengan secret key

   - JWT dikirim ke client dan disimpan

   - JWT disertakan di setiap request sebagai Authorization header

2) **Token Refresh Mechanism**

   - Access token dengan lifetime pendek (1 jam)

   - Refresh token dengan lifetime panjang (7 hari)

   - Refresh endpoint untuk mendapatkan access token baru

3) **Secure Storage**

   - Access token disimpan di memory atau localStorage

   - Refresh token disimpan di HTTP-only cookies

#### **6.2.2 Otorisasi**

Otorisasi akan menggunakan Role-Based Access Control (RBAC) dengan strategi permission berbasiskan fitur yang ada, jadi setiap user itu bisa melakukan CRUD pada fitur tertentu yang disediakan dan fitur bisa saja bisa dihilangkan bagaimana superuser yang memberikan aksesnya, dan fitur otorisasi juga memiliki tampilan UI yang memudahkan superuser untuk mengatur permission dan otorisasi:1) **Roles**

   - Super Admin: Akses penuh ke seluruh sistem

   - Admin: Akses ke fitur administrasi

   - Manager: Akses ke fitur manajemen

   - Operator: Akses ke fitur operasional

   - User: Akses terbatas ke fitur dasar

2) **Permissions**

   - Resource-based permissions (users\
     &#x20;, users\
     &#x20;)

   - Action-based permissions (create, read, update, delete)

   - Scope-based permissions (own, branch, all)

3) **Permission Checking**

   - Middleware checks user permissions before allowing access

   - Denies access if permissions are insufficient

   - Returns appropriate error message
======================================

### **6.3 Endpoint List**

# Berikut adalah endpoint list untuk core functionality:

#### **6.3.1 Authentication Endpoints**

POST /api/auth/login # Login user\
&#x20;POST /api/auth/refresh # Refresh token\
&#x20;POST /api/auth/logout # Logout user\
&#x20;POST /api/auth/forgot-password # Request password reset\
&#x20;POST /api/auth/reset-password # Reset password GET /api/auth/me # Get current user info
=============================================================================================

#### **6.3.2 User Management Endpoints**

GET /api/users # List users\
&#x20;POST /api/users # Create user\
&#x20;GET /api/users/# Get user detailsPUT /api/users/# Update userDELETE /api/users/# Delete userPOST /api/users//activate # Activate user POST /api/users//deactivate # Deactivate user
=========================================================================================================================================================================================

#### **6.3.3 Role Management Endpoints**

GET /api/roles # List roles\
&#x20;POST /api/roles # Create role\
&#x20;GET /api/roles/# Get role detailsPUT /api/roles/# Update roleDELETE /api/roles/# Delete roleGET /api/roles//permissions # Get role permissions PUT /api/roles//permissions # Update role permissions
==========================================================================================================================================================================================================

#### **6.3.4 Branch Management Endpoints**

GET /api/branches # List branches\
&#x20;POST /api/branches # Create branch\
&#x20;GET /api/branches/# Get branch detailsPUT /api/branches/# Update branchDELETE /api/branches/# Delete branchGET /api/branches//employees # Get branch employeesGET /api/branches//services # Get branch service areas POST /api/branches//services # Add branch service area
=================================================================================================================================================================================================================================================================================

#### **6.3.5 Employee Management Endpoints**

GET /api/employees # List employees\
&#x20;POST /api/employees # Create employee\
&#x20;GET /api/employees/# Get employee detailsPUT /api/employees/# Update employeeDELETE /api/employees/# Delete employeePOST /api/employees//activate # Activate employee POST /api/employees//deactivate# Deactivate employee
================================================================================================================================================================================================================================

#### **6.3.6 Pickup Management Endpoints**

GET /api/pickups # List pickup requests\
&#x20;POST /api/pickups # Create pickup request\
&#x20;GET /api/pickups/# Get pickup detailsPUT /api/pickups/# Update pickupDELETE /api/pickups/# Delete pickupPOST /api/pickups//assign # Assign pickup to teamGET /api/pickups//items # Get pickup itemsPOST /api/pickups//items # Add pickup item PUT /api/pickups//status # Update pickup status
===================================================================================================================================================================================================================================================================================================

#### **6.3.7 Shipment Management Endpoints**

GET /api/shipments # List shipment orders\
&#x20;POST /api/shipments # Create shipment order\
&#x20;GET /api/shipments/# Get shipment detailsPUT /api/shipments/# Update shipmentDELETE /api/shipments/# Delete shipmentPUT /api/shipments//status # Update shipment statusGET /api/shipments//tracking # Get shipment trackingPOST /api/shipments//tracking # Add tracking updateGET /api/shipments//documents # Get shipment documents POST /api/shipments//documents # Upload shipment document
====================================================================================================================================================================================================================================================================================================================================================================================================

#### **6.3.8 Loading Management Endpoints**

GET /api/loadings # List loading forms\
&#x20;POST /api/loadings # Create loading form\
&#x20;GET /api/loadings/# Get loading detailsPUT /api/loadings/# Update loadingDELETE /api/loadings/# Delete loadingPUT /api/loadings//status # Update loading statusGET /api/loadings//shipments # Get loading shipmentsPOST /api/loadings//shipments # Add shipment to loading DELETE /api/loadings//shipments/# Remove shipment
==================================================================================================================================================================================================================================================================================================================================

#### **6.3.9 Delivery Management Endpoints**

GET /api/deliveries # List delivery orders\
&#x20;POST /api/deliveries # Create delivery order\
&#x20;GET /api/deliveries/# Get delivery detailsPUT /api/deliveries/# Update deliveryDELETE /api/deliveries/# Delete deliveryPUT /api/deliveries//status # Update delivery statusGET /api/deliveries//route # Get delivery routePUT /api/deliveries//route # Update delivery route POST /api/deliveries//complete # Complete delivery
=====================================================================================================================================================================================================================================================================================================================================

#### **6.3.10 Payment Management Endpoints**

GET /api/payments # List payments\
&#x20;POST /api/payments # Create payment\
&#x20;GET /api/payments/# Get payment detailsPUT /api/payments/# Update paymentPUT /api/payments//status # Update payment statusGET /api/payments/shipment/# Get payments by shipment GET /api/payments/customer/# Get payments by customer
===========================================================================================================================================================================================================================================

#### **6.3.11 Receivable Management Endpoints**

GET /api/receivables # List receivables\
&#x20;POST /api/receivables # Create receivable\
&#x20;GET /api/receivables/# Get receivable detailsPUT /api/receivables/# Update receivablePUT /api/receivables//status # Update receivable statusPOST /api/receivables//collect # Record collectionGET /api/receivables/aging # Get aging receivables GET /api/receivables/customer/# Get receivables by customer
==================================================================================================================================================================================================================================================================================================================

### **6.4 Format Request & Response**

#### **6.4.1 Request Format**

1. **URL Parameters**

   - Format: `/api/resources/:id`

   - Example: `/api/users/60d5ec38f37c901e6facb3e2`

2. **Query Parameters**

   - Format: `/api/resources?param1=value1&param2=value2`

   - Example: `/api/users?page=1&limit=10&sortBy=createdAt&order=desc`**Request Body (JSON)**json`{  ``  "property1": "value1",  ``  "property2": "value2",  ``  "nestedObject": {  ``    "nestedProperty": "nestedValue"  ``  },  ``  "arrayProperty": [  ``    "item1",  ``    "item2"  ``  ]``}`**Headers** Authorization: Bearer {jwt\_token}\
&#x20;Content-Type: application/json Accept: application/json
=============================================================

#### **6.4.2 Response Format**

# **Success Response**json`{  ``  "success": true,  ``  "data": {  ``    // Resource data or array of resources  ``  },  ``  "meta": {  ``    "pagination": {  ``      "page": 1,  ``      "limit": 10,  ``      "totalItems": 100,  ``      "totalPages": 10  ``    }  ``  }``}`**Error Response**json`{  ``  "success": false,  ``  "error": {  ``    "code": "ERROR_CODE",  ``    "message": "Human readable error message",  ``    "details": {  ``      // Additional error details  ``    }  ``  }``}`**Validation Error Response**json`{  ``  "success": false,  ``  "error": {  ``    "code": "VALIDATION_ERROR",  ``    "message": "Validation failed",  ``    "details": {  ``      "field1": [  ``        "Error message for field1"  ``      ],  ``      "field2": [  ``        "Error message for field2"  ``      ]  ``    }  ``  }``}`

### **6.5 Dokumentasi API**

# API akan didokumentasikan menggunakan OpenAPI Specification (Swagger):1) **API Documentation Platform**

   - Swagger UI untuk interactive documentation

   - ReDoc untuk static documentation

   - Postman Collections untuk testing

2) **Documentation Structure**

   - API Overview

   - Authentication

   - Endpoints

   - Request/Response Examples

   - Error Codes

   - Rate Limits

3) **Code Generation**

   - OpenAPI spec akan digunakan untuk generate client SDKs

   - Typescript type definitions akan digenerate dari API spec

4) **Documentation Automation**

   - API documentation akan otomatis di update pada setiap release

   - Integration tests akan memvalidasi API spec

## **7. Desain DevOps & Infrastruktur**

### **7.1 Arsitektur Infrastruktur**

# Sistem akan diimplementasikan menggunakan arsitektur berbasis Railway.com sebagai platform deployment utama, memberikan kemudahan deployment, skalabilitas, dan ketahanan yang tinggi tanpa perlu mengelola infrastruktur yang kompleks:mermaid`graph TD``    Client[Client Devices] --> CDN[CDN]``    CDN --> Railway[Railway.com Platform]``    ``    subgraph "Railway.com Platform"``        Gateway[API Gateway]``        ``        subgraph "Service Deployments"``            Frontend[Web Frontend]``            MobileBackend[Mobile API Backend]``            CoreServices[Core Services]``            OperationalServices[Operational Services]``            FinancialServices[Financial Services]``            ReportingServices[Reporting Services]``        end``        ``        subgraph "Managed Databases"``            MongoDB[(MongoDB Atlas)]``            Redis[(Redis)]``        end``        ``        subgraph "Storage"``            ObjectStorage[(Object Storage)]``        end``        ``        subgraph "Background Tasks"``            Workers[Background Workers]``            Schedulers[Scheduled Jobs]``        end``        ``        subgraph "Monitoring"``            Logs[Railway Logs]``            Metrics[Metrics]``            Alerts[Alerts]``        end``    end``    ``    Railway --> ExternalServices[External Services]``    ``    subgraph "External Services"``        PaymentGateway[Payment Gateway]``        SMSGateway[SMS Gateway]``        EmailService[Email Service]``        MapsAPI[Maps API]``    end``    ``    Developer[Developer] --> GitRepo[Git Repository]``    GitRepo --> Railway`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXe9AlX1eg8JDufpM4YMDDIM9UM7v8HXmum8l7BM-cZRVYU-dxkXBAdpV--_f5YR0mhtig4r0DvqYzVvfwUo1VFQEoo4J_MtgTNKEbpqV7-o8DMP-Pgvd8dypgXSf_X1AdsWKp6FBQ?key=gtPqzkyy6x4aqav6OXfEqgxy)**Komponen Utama:**1) **Railway.com Platform Services**

   - Fully managed deployment environment

   - Auto-scaling untuk aplikasi web dan API

   - Built-in monitoring dan logging

   - Git-based deployment dengan continuous integration

   - Auto-scaling untuk services

   - Automatic HTTPS dengan certificate management

   - Zero-downtime deployments

2) **Service Deployments**

   - Semua microservices diatur sebagai Railway services terpisah

   - Frontend Next.js sebagai dedicated service

   - Backend services dikelompokkan berdasarkan domain (Core, Operational, Financial, dll.)

   - Shared environment variables untuk service communication

   - Service health checks dan auto-restart

3) **Database Integrations**

   - MongoDB Atlas (cloud-hosted) terhubung dengan Railway services

   - Redis untuk caching dan message queuing

   - Managed database connections dengan environment variables

   - Automated backups dan monitoring

4) **Storage Solutions**

   - Object storage untuk file dan media (S3 compatible)

   - Railway Volumes untuk persistent storage kebutuhan khusus

   - CDN integration untuk static assets

5) **CI/CD Workflow**

   - Direct integration dengan GitHub/GitLab

   - Automated deployments dari repository

   - Preview environments untuk pull requests

   - Deployment pipelines dengan testing stages

6) **Monitoring & Operations**

   - Railway Logs untuk centralized logging

   - Metrics dashboard untuk service performance

   - Alert notifications untuk SLAs

   - Infrastructure status reports**Deployment Model:**Sistem akan di-deploy menggunakan arsitektur multi-environment di Railway.com untuk memastikan proses development dan deployment yang lancar:1) **Development Environment**

   - Linked langsung ke development branch

   - Automatic deploys untuk setiap push

   - Isolated database instances

2) **Staging Environment**

   - Connected ke staging/release branches

   - Identical configuration dengan production

   - User acceptance testing (UAT)

   - Performance testing

3) **Production Environment**

   - Connected ke main/master branch

   - Controlled deployments dengan approval

   - Dedicated resources dan database instances

   - Automatic scaling berdasarkan traffic

   - Production-grade monitoring dan observability

### **7.2 Environment Setup**

# Railway.com menyediakan environment management yang terintegrasi, yang akan dimanfaatkan sebagai berikut:1) **Project Structure**

   - Single Railway project dengan multiple environments

   - Shared services dan environment-specific services

   - Shared variables untuk credentials dan configurations

   - Service grouping berdasarkan domain

2) **Environment Configuration**

   - Environment variables management melalui Railway UI

   - Secrets management untuk credentials dan keys

   - Environment-specific configurations

   - Development, Staging, dan Production environments

3) **Database Configuration**

   - Railway Managed Postgres untuk data relasional simple

   - MongoDB Atlas integration untuk NoSQL data

   - Redis untuk caching dan session management

   - Automatic connection string management

4) **Networking Setup**

   - Public and private networking

   - Custom domains dengan automatic SSL/TLS

   - CORS dan security headers configuration

   - IP allowlisting untuk sensitive services

5) **Resource Allocation**

   - Scalable resource allocation:

     - Development: Small instances (512MB RAM)

     - Staging: Medium instances (1GB RAM)

     - Production: Large dedicated instances (2-4GB RAM)

   - Auto-scaling berdasarkan CPU dan memory usagemermaid`graph TD``    subgraph "Railway.com Project: Samudra Paket ERP"``        subgraph "Production Environment"``            ProdFrontend[Web Frontend]``            ProdBackend[API Gateway]``            ProdCoreServices[Core Services]``            ProdOperationalServices[Operational Services]``            ProdFinancialServices[Financial Services]``            ProdMonitoring[Monitoring & Logging]``            ProdDB[(Production Database)]``            ProdCache[(Production Cache)]``        end``        ``        subgraph "Staging Environment"``            StagingFrontend[Web Frontend]``            StagingBackend[API Gateway]``            StagingServices[Service Stack]``            StagingDB[(Staging Database)]``        end``        ``        subgraph "Development Environment"``            DevFrontend[Web Frontend]``            DevBackend[API Gateway]``            DevServices[Service Stack]``            DevDB[(Development Database)]``        end``        ``        subgraph "Shared Resources"``            ObjectStorage[(Object Storage)]``            SecretsManager[Secrets Manager]``            NetworkConfig[Network Configuration]``        end``    end``    ``    GitRepo[Git Repository] --> DevTrigger[Dev Deploy Trigger]``    DevTrigger --> DevFrontend``    DevTrigger --> DevBackend``    DevTrigger --> DevServices``    ``    GitRepo --> StagingTrigger[Staging Deploy Trigger]``    StagingTrigger --> StagingFrontend``    StagingTrigger --> StagingBackend``    StagingTrigger --> StagingServices``    ``    GitRepo --> ProdTrigger[Production Deploy Trigger]``    ProdTrigger --> ProdFrontend``    ProdTrigger --> ProdBackend``    ProdTrigger --> ProdCoreServices``    ProdTrigger --> ProdOperationalServices``    ProdTrigger --> ProdFinancialServices`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXe1GOS9uOlEW1l3ty3DIfUq9NcEZO7cfFv-iB5jihNS72t7Thw2rLCI37fh8ycB7BP6q1eKj1BVI5emtrPijV5L9mtNVEbTyuXLET-JIhYUQ6ql2A7vLMyiT3CO_B026UfLzYJv_g?key=gtPqzkyy6x4aqav6OXfEqgxy)

### **7.3 CI/CD Pipeline**

# Railway.com menyediakan integrated CI/CD pipeline yang akan dimanfaatkan sebagai berikut:mermaid`graph LR``    Dev[Developer] -->|Push Code| Repo[Git Repository]``    Repo -->|Trigger| Build[Railway Build Process]``    ``    subgraph "Railway CI/CD Pipeline"``        Build -->|Run Tests| Test[Test Stage]``        Test -->|Success| Approval{Needs Approval?}``        Approval -->|No: Dev/Feature Branch| DevDeploy[Deploy to Dev]``        Approval -->|Yes: Main Branch| ApprovalStep[Manual Approval]``        ApprovalStep -->|Approved| ProdDeploy[Deploy to Production]``        ``        DevDeploy --> DevEnv[Development Environment]``        ProdDeploy --> ProdEnv[Production Environment]``    end``    ``    DevEnv -->|Successful Testing| PromoteToProd[Promote to Production]``    PromoteToProd --> ApprovalStep``    ``    Test -->|Failure| Notify[Notify Team]``    Notify --> Fix[Fix Issues]``    Fix --> Dev`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdiU0fUTGr7RdBWIF6eiFrPyOOM1y2V0bCquuYqz15EdwP6UJ74efkLxuwpjxBYIzTAe5iOjxwUFtVNTVOzKAPZ5qSpvovocSGXIv__YCJTMrDzwGCNzoh_ihSOTQP61MYyKzuXoQ?key=gtPqzkyy6x4aqav6OXfEqgxy)1) **Automated Workflow**

   - Direct integration dengan GitHub/GitLab repositories

   - Automatic builds saat code baru di-push

   - Branch-based deployments:

     - Feature branches → Preview environments

     - Development branch → Development environment

     - Staging branch → Staging environment

     - Main branch → Production environment (dengan approval)

2) **Build Process**

   - Automated dependency installation

   - Docker-based build process

   - Environment-specific build configurations

   - Optimized build caching

3) **Testing Integration**

   - Pre-deployment testing dengan GitHub Actions

   - Integration dengan testing frameworks (Jest, Cypress)

   - Status reporting ke repository

   - Automatic rejection untuk failed tests

4) **Deployment Strategies**

   - Zero-downtime deployments

   - Automatic rollbacks untuk failed deployments

   - Gradual traffic shifting (untuk production updates)

   - Scheduled deployments untuk lower-risk periods

5) **Release Management**

   - Release tagging dan versioning

   - Deployment history dan logs

   - Rollback capability ke previous versions

   - Changelog generation dari commit messages

### **7.4 Monitoring & Logging**

# Railway.com menyediakan beberapa integrated monitoring tools, namun akan diaugmentasi dengan third-party services untuk monitoring dan logging yang lebih komprehensif:1) **Railway Native Monitoring**

   - Service health monitoring

   - Resource usage metrics (CPU, Memory, Disk)

   - Request metrics dan latency

   - Deployment status dan history

   - Basic alerts untuk service downtime

2) **Enhanced Logging Solution**

   - Railway logs untuk service logs

   - Integration dengan LogDNA atau DataDog untuk advanced logging

   - Log retention dan search capabilities

   - Structured logging format

   - Log aggregation across services

3) **Application Performance Monitoring**

   - Integration dengan New Relic atau Sentry

   - Error tracking dan reporting

   - Performance bottleneck detection

   - User experience monitoring

   - Real-time alerting

4) **Custom Metrics Dashboard**

   - Business metrics tracking

   - Custom KPI dashboards

   - Real-time operational metrics

   - Financial metrics visualization

   - Trend analysis dan reporting

5) **Alert Management**

   - Multi-channel alerts (Email, Slack, SMS)

   - Alert severity levels

   - On-call rotation integration

   - Alert aggregation untuk related issues

   - Runbooks untuk common alert scenariosmermaid`graph TD``    subgraph "Railway.com Platform"``        Apps[Railway Apps] --> RailwayLogs[Railway Logs]``        Apps --> RailwayMetrics[Railway Metrics]``    end``    ``    subgraph "Enhanced Monitoring"``        RailwayLogs --> LogAggregator[Log Aggregator]``        RailwayMetrics --> MetricsCollector[Metrics Collector]``        ``        LogAggregator --> LogDashboard[Logging Dashboard]``        MetricsCollector --> APM[Application Performance Monitoring]``        MetricsCollector --> BusinessMetrics[Business Metrics Dashboard]``        ``        LogDashboard --> AlertSystem[Alert System]``        APM --> AlertSystem``        BusinessMetrics --> AlertSystem``    end``    ``    AlertSystem --> NotificationChannels[Notification Channels]``    ``    subgraph "Notification Channels"``        NotificationChannels --> Email[Email]``        NotificationChannels --> Slack[Slack]``        NotificationChannels --> SMS[SMS]``        NotificationChannels --> PagerDuty[PagerDuty]``    end``    ``    NotificationChannels --> Team[Development & Ops Team]`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdCrBW1OWq3zl1CBqpuh9Pbv8x5DWagc6nGe7rxp5xXoLJ_5Y4nxcidoXIWuC84SakW6RKWdVOoxGZzaes0po-oFQMkP4HJoiL8dIt2Fcn9cipmgx3iLiiVcQ4UQ-yfbhG_rhgdOQ?key=gtPqzkyy6x4aqav6OXfEqgxy)

### **7.5 Backup & Recovery**

# Strategi backup dan recovery akan menggunakan kombinasi Railway.com capabilities dan third-party services:1) **Database Backup Strategy**

   - MongoDB Atlas automated backups:

     - Daily full backups

     - Continuous incremental backups

     - Point-in-time recovery

     - 30-day backup retention

   - Manual backups sebelum large deployments atau data migrations

   - Regular backup testing dan validation

2) **Application State Backup**

   - Environment variables dan configuration backup

   - Service version control dengan Git

   - Infrastructure-as-Code untuk Railway configuration

   - Regular export dari critical application states

3) **File & Media Backup**

   - Object storage dengan versioning

   - Cross-region replication untuk critical files

   - Regular integrity checks

   - Automated restore testing

4) **Disaster Recovery Plan**

   - Documented recovery procedures

   - Regular recovery drills

   - Recovery Time Objective (RTO): < 4 hours untuk critical services

   - Recovery Point Objective (RPO): < 1 hour

5) **Service Continuity**

   - Deployment rollback capability

   - Blue/green deployment strategy untuk zero-downtime

   - Database failover configuration

   - Regular disaster recovery testingmermaid`graph TD``    subgraph "Backup Strategy"``        AppState[Application State] --> GitBackup[Git Repository]``        Config[Configuration] --> ConfigBackup[Configuration Backup]``        DBs[Databases] --> AutoBackup[Automated Backups]``        DBs --> ManualBackup[Manual Pre-Deployment Backups]``        Media[Media & Files] --> ObjectStorage[Object Storage with Versioning]``    end``    ``    subgraph "Recovery Scenarios"``        AppFailure[Application Failure] --> RollbackDeploy[Rollback Deployment]``        ConfigIssue[Configuration Issue] --> RestoreConfig[Restore Configuration]``        DataLoss[Data Corruption/Loss] --> DBRestore[Database Restore]``        MediaLoss[Media Loss] --> MediaRestore[Restore from Object Storage]``        CatastrophicFailure[Catastrophic Failure] --> DRP[Disaster Recovery Plan]``    end``    ``    GitBackup --> RollbackDeploy``    ConfigBackup --> RestoreConfig``    AutoBackup --> DBRestore``    ManualBackup --> DBRestore``    ObjectStorage --> MediaRestore``    ``    RollbackDeploy --> ServiceRestoration[Service Restoration]``    RestoreConfig --> ServiceRestoration``    DBRestore --> ServiceRestoration``    MediaRestore --> ServiceRestoration``    DRP --> ServiceRestoration`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdVUlzt-OpYD0sqPHJfwB5gqyC-Lno7Tl5RSPpJg885Y4zKU54CZAQFlWYAx--Mr-OjlVSs4Y5A3Fux9_93x2FRWNzJkSAmEjmUbc6Drhj3DMWoWviJ5y8bNSWWNtV_AYWJ-LK7?key=gtPqzkyy6x4aqav6OXfEqgxy)

### **7.6 Railway.com-Specific Optimizations**

# Untuk memaksimalkan kemampuan Railway.com platform, beberapa optimisasi spesifik akan diimplementasikan:1) **Service Componentization**

   - Microservices akan dibagi berdasarkan domain fungsional

   - Shared services untuk common functionality

   - Optimized resource allocation per service

   - Independent scaling per service component

2) **Resource Optimization**

   - Right-sized containers untuk setiap service

   - Memory dan CPU allocation berdasarkan service requirements

   - Scheduled scaling untuk predictable load patterns

   - Cost optimization dengan sleep-when-idle untuk non-critical services

3) **Caching Strategy**

   - Multi-level caching:

     - Browser-level caching untuk static assets

     - CDN caching untuk public content

     - Redis caching untuk application data

     - In-memory caching untuk high-frequency data

   - Cache invalidation strategies per data type

4) **Database Performance**

   - Connection pooling optimization

   - Indexed queries monitoring dan optimization

   - Read/write separation untuk high-load scenarios

   - Data archiving strategy untuk historical data

5) **Deployment Efficiency**

   - Optimized Docker images untuk fast deployment

   - Layer caching untuk rapid builds

   - Dependency management untuk reducing package size

   - Custom build scripts untuk environment-specific optimizationsmermaid`graph TD``    subgraph "Railway Service Optimization"``        WebApp[Web Application] --> WebOptimization[Web Optimization Techniques]``        API[API Services] --> APIOptimization[API Optimization Techniques]``        Worker[Background Workers] --> WorkerOptimization[Worker Optimization Techniques]``    end``    ``    subgraph "Web Optimization Techniques"``        WebOptimization --> StaticAssets[Static Asset Optimization]``        WebOptimization --> SSR[Server-Side Rendering Optimization]``        WebOptimization --> ClientCaching[Client-Side Caching]``        WebOptimization --> CodeSplitting[Code Splitting]``    end``    ``    subgraph "API Optimization Techniques"``        APIOptimization --> Compression[Response Compression]``        APIOptimization --> RateLimiting[Rate Limiting]``        APIOptimization --> QueryOptimization[Query Optimization]``        APIOptimization --> APICaching[API Response Caching]``    end``    ``    subgraph "Worker Optimization Techniques"``        WorkerOptimization --> BatchProcessing[Batch Processing]``        WorkerOptimization --> ResourceAllocation[Resource Allocation]``        WorkerOptimization --> JobScheduling[Optimal Job Scheduling]``        WorkerOptimization --> MemoryManagement[Memory Management]``    end``    ``    subgraph "Overall Optimizations"``        ResourceAllocation[Resource Allocation]``        AutoScaling[Auto-Scaling Rules]``        LoadBalancing[Load Balancing]``        ErrorHandling[Error Handling & Resilience]``    end`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXctwHV9DZ4X6erW5ljvxfJ6PRBchUevQQNGUmhWlREG1BfQBtiM01RkdEqfGMUyGYU66vMdwHvv9QeU1dGS-TAptOGedM-xkZp8sP07n_QVgTOk9TxLx2YQJRcp-JMnAJHecNNE-Q?key=gtPqzkyy6x4aqav6OXfEqgxy)Semua komponen infrastruktur di atas dirancang untuk bekerja dengan Railway.com sebagai platform utama, menyederhanakan operasional infrastruktur sambil tetap mempertahankan kehandalan, skalabilitas, dan kemudahan pengelolaan yang dibutuhkan untuk sistem ERP PT. Sarana Mudah Raya.

## **8. Diagram Sistem**

### **8.1 System Architecture Diagram**

# graph TD    %% Client Layer    subgraph "Client Layer"    A\[Web Browsers]    B\[Mobile Apps: Checker/Driver/Debt Collector]    WebSocket\[WebSocket Connections]    PWA\[Progressive Web App]    end        %% Delivery Layer    subgraph "Delivery Layer"    C\[Global CDN]    APIGateway\[Railway API Gateway]    end        %% Railway.com Platform Layer    subgraph "Railway.com Platform"    Railway\[Railway Services]    RailwayLogs\[Railway Logs]    RailwayMetrics\[Railway Metrics]    RailwayDeploy\[Railway Deployment Pipeline]        %% Application Layer    subgraph "Application Layer"    F\[Next.js Web Application]        subgraph "Core Services"    G1\[Auth Service]    G2\[User Service]    G3\[Master Data Service]    end        subgraph "Operational Services"    O1\[Pickup Service]    O2\[Shipment Service]    O3\[Delivery Service]    O4\[Return Service]    O5\[Vehicle Service]    end        subgraph "Financial Services"    F1\[Sales Service]    F2\[Payment Service]    F3\[Billing Service]    F4\[Accounting Service]    end        subgraph "Supporting Services"    S1\[Notification Service]    S2\[Reporting Service]    S3\[Integration Service]    S4\[File Service]    end        EventBus\[Event Bus / Message Broker]    end    end        %% Data Layer    subgraph "Data Layer"    subgraph "MongoDB Atlas"    H1\[MongoDB Primary]    H2\[MongoDB Secondary]    H3\[MongoDB Secondary]    end        subgraph "Cache Layer"    I1\[Redis Master]    I2\[Redis Replica]    end        subgraph "Storage"    J1\[Object Storage - Documents]    J2\[Object Storage - Images]    J3\[Object Storage - Exports]    end        subgraph "Analytics"    TS2\[Analytics Store]    end    end        %% Integration Layer    subgraph "Integration Layer"    K\[Payment Gateway]    L\[Maps Service]    M\[SMS/Email Gateway]    N\[Forwarder APIs]    Webhooks\[Webhook Handlers]    end        %% Connections - Client to Delivery    A --> C    A --> WebSocket    B --> APIGateway    B --> WebSocket    PWA --> C    PWA --> APIGateway        %% Connections - Delivery to App    C --> F    APIGateway --> Railway        %% Railway Platform internal connections    Railway --- G1    Railway --- G2    Railway --- G3    Railway --- O1    Railway --- O2    Railway --- O3    Railway --- O4    Railway --- O5    Railway --- F1    Railway --- F2    Railway --- F3    Railway --- F4    Railway --- S1    Railway --- S2    Railway --- S3    Railway --- S4    Railway --- F    Railway --- EventBus        %% Railway Platform monitoring    RailwayLogs --> Railway    RailwayMetrics --> Railway    RailwayDeploy --> Railway        %% Service Interconnections    G1 <--> EventBus    G2 <--> EventBus    G3 <--> EventBus    O1 <--> EventBus    O2 <--> EventBus    O3 <--> EventBus    O4 <--> EventBus    O5 <--> EventBus    F1 <--> EventBus    F2 <--> EventBus    F3 <--> EventBus    F4 <--> EventBus    S1 <--> EventBus    S2 <--> EventBus    S3 <--> EventBus    S4 <--> EventBus    WebSocket <--> S1        %% Services to Data Layer    G1 --> H1    G2 --> H1    G3 --> H1    O1 --> H1    O2 --> H1    O3 --> H1    O4 --> H1    O5 --> H1    F1 --> H1    F2 --> H1    F3 --> H1    F4 --> H1    S2 --> H1        H1 --- H2    H1 --- H3        G1 --> I1    G2 --> I1    O1 --> I1    O2 --> I1    O3 --> I1    S1 --> I1    S2 --> I1        I1 --- I2        S4 --> J1    S4 --> J2    S4 --> J3    O1 --> J2    O3 --> J2        S2 --> TS2        %% Integration    S3 --> K    S3 --> L    S3 --> M    S3 --> N    Webhooks --> S3        %% Define styles    classDef clientLayer fill:#f9f9f9,stroke:#333,stroke-width:1px;    classDef deliveryLayer fill:#e1f5fe,stroke:#0288d1,stroke-width:1px;    classDef appLayer fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px;    classDef dataLayer fill:#fff3e0,stroke:#ef6c00,stroke-width:1px;    classDef integrationLayer fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;    classDef railwayLayer fill:#ede7f6,stroke:#4527a0,stroke-width:1px;        class A,B,WebSocket,PWA clientLayer;    class C,APIGateway deliveryLayer;    class F,G1,G2,G3,O1,O2,O3,O4,O5,F1,F2,F3,F4,S1,S2,S3,S4,EventBus appLayer;    class H1,H2,H3,I1,I2,J1,J2,J3,TS2 dataLayer;    class K,L,M,N,Webhooks integrationLayer;    class Railway,RailwayLogs,RailwayMetrics,RailwayDeploy railwayLayer;![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXegzZBPrhlmo26DEndTj0rW5whOQp_4eVVc-k3W-iXZtFVM8_25cpj7dHg6ugMs8iiyRg_vjC5RIYmzHQo86FmN_2wl59jTyeKmHQZ-ZtXOuk5W-hlojprxpsWkTM40tj7aYygyNg?key=gtPqzkyy6x4aqav6OXfEqgxy)

### **8.2 Entity Relationship Diagram (ERD)**

# mermaid`erDiagram``    USERS ||--o{ EMPLOYEES : has``    USERS }|--|| ROLES : has``    BRANCHES ||--o{ EMPLOYEES : employs``    BRANCHES ||--o{ SERVICE_AREAS : covers``    DIVISIONS ||--o{ POSITIONS : contains``    POSITIONS ||--o{ EMPLOYEES : has``    ``    CUSTOMERS ||--o{ PICKUP_REQUESTS : makes``    CUSTOMERS ||--o{ SHIPMENT_ORDERS : sends``    ``    PICKUP_REQUESTS ||--o{ PICKUP_ITEMS : contains``    PICKUP_REQUESTS }|--|| PICKUP_ASSIGNMENTS : assigned_to``    ``    VEHICLES }|--o{ PICKUP_ASSIGNMENTS : used_in``    EMPLOYEES }|--o{ PICKUP_ASSIGNMENTS : assigned_to``    ``    SHIPMENT_ORDERS ||--o{ LOADING_FORMS : included_in``    SHIPMENT_ORDERS }|--|| PAYMENTS : has``    SHIPMENT_ORDERS }|--|| RECEIVABLES : generates``    SHIPMENT_ORDERS }|--o{ RETURNS : has``    ``    LOADING_FORMS ||--|| SHIPMENTS : generates``    LOADING_FORMS }|--|| VEHICLES : uses``    LOADING_FORMS }|--|| EMPLOYEES : operated_by``    ``    SHIPMENTS ||--o{ DELIVERY_ORDERS : included_in``    ``    DELIVERY_ORDERS }|--|| VEHICLES : uses``    DELIVERY_ORDERS }|--|| EMPLOYEES : operated_by``    ``    CHART_OF_ACCOUNTS ||--o{ JOURNAL_ENTRIES : posted_to``    JOURNALS ||--o{ JOURNAL_ENTRIES : contains`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXczQfnsN0VwpcOC-NkGdyiCHhEfzUiWgxqrI4EURZBDja4ZaEghicpS2Po9uygaDsYfhAGnz8D0SBwnP76P0Znip2lIwib1Sl3_gQ5NFORRbve3sB95ToH0rB8BYLUJOhzYkP8Agw?key=gtPqzkyy6x4aqav6OXfEqgxy)

### **8.3 Data Flow Diagram**

# mermaid`graph TD``    A[Customer] -->|Request Pickup| B(Pickup Service)``    B -->|Assign| C[Checker]``    C -->|Verify & Weigh| D(Shipment Service)``    D -->|Create Order| E[Staff Penjualan]``    E -->|Create Resi| F(Loading Service)``    F -->|Allocate to Truck| G[Truck Driver]``    G -->|Deliver| H(Delivery Service)``    H -->|Assign| I[Delivery Driver]``    I -->|Deliver to| J[Receiver]``    ``    K[Payment] -->|Process| L(Financial Service)``    L -->|Record| M[Accounting]``    L -->|Generate| N[Invoice]``    N -->|Send to| A``    ``    O[Debt Collector] -->|Collect| P(Collection Service)``    P -->|Update| L``    ``    Q[Management] -->|View| R(Reporting Service)``    R -->|Fetch Data| B``    R -->|Fetch Data| D``    R -->|Fetch Data| F``    R -->|Fetch Data| H``    R -->|Fetch Data| L`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdQpI2F8handLR0RXtf96jyON4VZyIP8x3ne3c275-DLbDF5j07QzlQwPCjfa87LizT61Art7fgz2vWMjOVV4ud3v9thKmLUvGDJprd-c3UvZhw54BefzItXgNe-ATDgj59XlVlYQ?key=gtPqzkyy6x4aqav6OXfEqgxy)

### **8.4 Sequence Diagram**

# _Sequence diagram untuk alur bisnis pickup dan pengiriman:_mermaid`sequenceDiagram``    participant C as Customer``    participant CS as CustomerService``    participant PS as PickupService``    participant D as Driver``    participant CH as Checker``    participant SS as ShipmentService``    participant SP as StaffPenjualan``    ``    C->>CS: Request Pickup``    CS->>PS: Create Pickup Request``    PS->>D: Assign Pickup Task``    D->>C: Arrive at Location``    D->>D: Verify & Load Items``    D->>CH: Deliver to Warehouse``    CH->>CH: Weigh & Verify Items``    CH->>SS: Record Shipment Details``    SS->>SP: Provide Shipment Info``    SP->>SP: Create Resi/STT``    SP->>C: Send Resi/STT`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXfYBN5AASB9SCp291M3T_ET8U3EkS9b4M4857vJgvD_51VjMfFme1YyEYcegkAI8keVKyU-du6c1WeDWlNUMXIAm29lSVL6CN820nJF5FT9Ttn-ORmmNnwFm26_a9MkCys11ZRZUQ?key=gtPqzkyy6x4aqav6OXfEqgxy)

### **8.5 Component Diagram**

# mermaid`graph TD``    %% Frontend Components``    subgraph "Web Frontend Components"``    ``    subgraph "Core Components"``    Auth[Authentication Module]``    Profile[User Profile Module]``    Nav[Navigation System]``    end``    ``    subgraph "Dashboard Components"``    ExecDash[Executive Dashboard]``    OpsDash[Operational Dashboard]``    FinDash[Financial Dashboard]``    CustDash[Customer Dashboard]``    HRDash[HR Dashboard]``    end``    ``    subgraph "Operational Components"``    Pickup[Pickup Management]``    ShipmentMgmt[Shipment Management]``    LoadingMgmt[Loading Management]``    DeliveryMgmt[Delivery Management]``    ReturnMgmt[Return Management]``    TrackTrace[Track & Trace]``    end``    ``    subgraph "Administrative Components"``    BranchMgmt[Branch Management]``    DivisionMgmt[Division Management]``    EmployeeMgmt[Employee Management]``    VehicleMgmt[Vehicle Management]``    UserMgmt[User Management]``    RoleMgmt[Role Management]``    end``    ``    subgraph "Financial Components"``    InvoiceMgmt[Invoice Management]``    PaymentMgmt[Payment Management]``    CollectionMgmt[Collection Management]``    AccountingMgmt[Accounting Management]``    ReportMgmt[Financial Reporting]``    end``    ``    subgraph "Shared Components"``    FormBuilder[Form Builder]``    DataTable[Data Table]``    Charts[Visualization Components]``    Maps[Map Components]``    FileUploader[File Uploader]``    Notifications[Notification System]``    Modal[Modal System]``    end``    ``    end``    ``    %% Mobile Frontend Components``    subgraph "Mobile Frontend Components"``    ``    subgraph "Checker App Modules"``    CheckerAuth[Authentication]``    CheckerItem[Item Management]``    CheckerScan[Scanning Module]``    CheckerCamera[Camera Module]``    CheckerForms[Digital Forms]``    CheckerSync[Sync Manager]``    end``    ``    subgraph "Driver App Modules"``    DriverAuth[Authentication]``    DriverNav[Navigation]``    DriverTask[Task Management]``    DriverPOD[Proof of Delivery]``    DriverCOD[COD Management]``    DriverSync[Sync Manager]``    end``    ``    subgraph "Debt Collector Modules"``    DCAuth[Authentication]``    DCTasks[Collection Tasks]``    DCRoutes[Route Optimization]``    DCPayment[Payment Recording]``    DCSync[Sync Manager]``    end``    ``    subgraph "Mobile Shared Components"``    MobileOffline[Offline Storage]``    MobileSync[Sync Engine]``    MobileCamera[Camera Utilities]``    MobileLocation[Location Services]``    MobileNotifications[Notifications]``    end``    ``    end``    ``    %% Backend Components``    subgraph "Backend Components (Railway Services)"``    ``    subgraph "Core Service Components"``    AuthService[Authentication Service]``    UserService[User Service]``    BranchService[Branch Service]``    MasterDataService[Master Data Service]``    NotificationService[Notification Service]``    FileService[File Service]``    end``    ``    subgraph "Operational Service Components"``    PickupService[Pickup Service]``    ShipmentService[Shipment Service]``    LoadingService[Loading Service]``    DeliveryService[Delivery Service]``    ReturnService[Return Service]``    VehicleService[Vehicle Service]``    TracingService[Tracing Service]``    end``    ``    subgraph "Financial Service Components"``    SalesService[Sales Service]``    PaymentService[Payment Service]``    BillingService[Billing Service]``    CollectionService[Collection Service]``    AccountingService[Accounting Service]``    FinanceReportService[Finance Report Service]``    end``    ``    subgraph "Backend Shared Components"``    Validation[Validation Layer]``    ErrorHandler[Error Handler]``    Logger[Logging System]``    EventManager[Event Manager]``    CacheManager[Cache Manager]``    StorageManager[Storage Manager]``    end``    ``    end``    ``    %% Data Storage Components``    subgraph "Data Storage Components"``    MongoDB[(MongoDB Atlas)]``    RedisCache[(Redis Cache)]``    ObjectStorage[(Object Storage)]``    EventStore[(Event Store)]``    end``    ``    %% External Integrations``    subgraph "External Integrations"``    PaymentGateway[Payment Gateway Integration]``    MapsAPI[Maps API Integration]``    SMSGateway[SMS Gateway Integration]``    EmailService[Email Service Integration]``    ForwarderAPI[Forwarder API Integration]``    end``    ``    %% Railway.com Platform``    subgraph "Railway.com Platform"``    RailwayServices[Railway Services]``    RailwayDeployment[Railway Deployment]``    RailwayCustomDomains[Railway Custom Domains]``    RailwayEnvironments[Railway Environments]``    end``    ``    %% Web Frontend to Backend Connections``    Auth --> AuthService``    Profile --> UserService``    ``    ExecDash --> FinanceReportService``    OpsDash --> TracingService``    FinDash --> FinanceReportService``    ``    Pickup --> PickupService``    ShipmentMgmt --> ShipmentService``    LoadingMgmt --> LoadingService``    DeliveryMgmt --> DeliveryService``    ReturnMgmt --> ReturnService``    TrackTrace --> TracingService``    ``    BranchMgmt --> BranchService``    UserMgmt --> UserService``    VehicleMgmt --> VehicleService``    ``    InvoiceMgmt --> SalesService``    PaymentMgmt --> PaymentService``    CollectionMgmt --> CollectionService``    AccountingMgmt --> AccountingService``    ``    FileUploader --> FileService``    Notifications --> NotificationService``    ``    %% Mobile Components to Backend Connections``    CheckerAuth --> AuthService``    CheckerItem --> ShipmentService``    CheckerSync --> EventManager``    ``    DriverAuth --> AuthService``    DriverNav --> MapsAPI``    DriverTask --> DeliveryService``    DriverPOD --> DeliveryService``    DriverCOD --> PaymentService``    ``    DCAuth --> AuthService``    DCTasks --> CollectionService``    DCRoutes --> MapsAPI``    DCPayment --> PaymentService``    ``    MobileSync --> EventManager``    ``    %% Backend to Storage Connections``    AuthService --> MongoDB``    AuthService --> RedisCache``    UserService --> MongoDB``    BranchService --> MongoDB``    MasterDataService --> MongoDB``    MasterDataService --> RedisCache``    ``    PickupService --> MongoDB``    ShipmentService --> MongoDB``    LoadingService --> MongoDB``    DeliveryService --> MongoDB``    ReturnService --> MongoDB``    ``    SalesService --> MongoDB``    PaymentService --> MongoDB``    BillingService --> MongoDB``    AccountingService --> MongoDB``    ``    FileService --> ObjectStorage``    NotificationService --> EventStore``    ``    %% Backend to External Integration Connections``    PaymentService --> PaymentGateway``    DeliveryService --> MapsAPI``    PickupService --> MapsAPI``    NotificationService --> SMSGateway``    NotificationService --> EmailService``    ShipmentService --> ForwarderAPI``    ``    %% Railway.com Platform Connections``    RailwayServices -.-> AuthService``    RailwayServices -.-> UserService``    RailwayServices -.-> PickupService``    RailwayServices -.-> ShipmentService``    RailwayServices -.-> SalesService``    RailwayServices -.-> FileService``    ``    RailwayDeployment -.-> RailwayServices``    RailwayCustomDomains -.-> RailwayServices``    RailwayEnvironments -.-> RailwayServices``    ``    %% Shared Systems``    Logger -.-> MongoDB``    EventManager -.-> EventStore``    CacheManager -.-> RedisCache``    StorageManager -.-> ObjectStorage``    ``    %% Define styles``    classDef coreComponents fill:#e1f5fe,stroke:#0288d1,stroke-width:1px;``    classDef dashboardComponents fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px;``    classDef operationalComponents fill:#fff3e0,stroke:#ef6c00,stroke-width:1px;``    classDef administrativeComponents fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;``    classDef financialComponents fill:#e8eaf6,stroke:#3f51b5,stroke-width:1px;``    classDef sharedComponents fill:#f5f5f5,stroke:#616161,stroke-width:1px;``    classDef mobileComponents fill:#ffebee,stroke:#c62828,stroke-width:1px;``    classDef backendComponents fill:#e0f2f1,stroke:#00796b,stroke-width:1px;``    classDef dataStorage fill:#fce4ec,stroke:#c2185b,stroke-width:1px;``    classDef externalInt fill:#ede7f6,stroke:#4527a0,stroke-width:1px;``    classDef railwayPlatform fill:#e8eaf6,stroke:#3f51b5,stroke-width:1px;``    ``    %% Apply styles``    class Auth,Profile,Nav coreComponents;``    class ExecDash,OpsDash,FinDash,CustDash,HRDash dashboardComponents;``    class Pickup,ShipmentMgmt,LoadingMgmt,DeliveryMgmt,ReturnMgmt,TrackTrace operationalComponents;``    class BranchMgmt,DivisionMgmt,EmployeeMgmt,VehicleMgmt,UserMgmt,RoleMgmt administrativeComponents;``    class InvoiceMgmt,PaymentMgmt,CollectionMgmt,AccountingMgmt,ReportMgmt financialComponents;``    class FormBuilder,DataTable,Charts,Maps,FileUploader,Notifications,Modal sharedComponents;``    ``    class CheckerAuth,CheckerItem,CheckerScan,CheckerCamera,CheckerForms,CheckerSync mobileComponents;``    class DriverAuth,DriverNav,DriverTask,DriverPOD,DriverCOD,DriverSync mobileComponents;``    class DCAuth,DCTasks,DCRoutes,DCPayment,DCSync mobileComponents;``    class MobileOffline,MobileSync,MobileCamera,MobileLocation,MobileNotifications mobileComponents;``    ``    class AuthService,UserService,BranchService,MasterDataService,NotificationService,FileService backendComponents;``    class PickupService,ShipmentService,LoadingService,DeliveryService,ReturnService,VehicleService,TracingService backendComponents;``    class SalesService,PaymentService,BillingService,CollectionService,AccountingService,FinanceReportService backendComponents;``    class Validation,ErrorHandler,Logger,EventManager,CacheManager,StorageManager backendComponents;``    ``    class MongoDB,RedisCache,ObjectStorage,EventStore dataStorage;``    class PaymentGateway,MapsAPI,SMSGateway,EmailService,ForwarderAPI externalInt;``    class RailwayServices,RailwayDeployment,RailwayCustomDomains,RailwayEnvironments railwayPlatform;`![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXdVCTemjhP-LY9dD21oiVfgZIv9kgJ5nlJoNCS4-81NZ512pg5qZ-rCLDSbex4IrjsWEU0DbteHXZnAtrknz3VCcjyUv9ntHqjUp-zYbdPoeBRNJ25JpCP3FYENvmTG5Ecm8rBJAw?key=gtPqzkyy6x4aqav6OXfEqgxy)

## **9. Tech Stack**

### **9.1 Frontend Tech Stack**

#### **9.1.1 Web Application**

# - **Framework**: Next.js Versi Terbaru dengan menggunakan Bahasa Pemrograman JavaScript

  - Server-side rendering untuk initial loading performance

  - Client-side rendering untuk interactive features

  - Incremental Static Regeneration untuk content yang jarang berubah

  - API routes untuk backend functionality

- **UI Library**: React Versi Terbaru

  - Concurrent rendering untuk responsiveness

  - Suspense untuk loading states

  - Server Components untuk optimasi performance

- **State Management**:

  - Redux Toolkit untuk global state

  - React Context untuk local state

  - Redux Persist untuk offline state persistence

- **Data Fetching**:

  - React Query untuk server state management

  - SWR untuk real-time data

  - Optimistic updates untuk UI responsiveness

- **Form Handling**:

  - React Hook Form untuk form management

  - Zod untuk schema validation

  - Yup sebagai alternative validator

- **Styling**:

  - Tailwind CSS untuk utility-first styling

  - PostCSS untuk processing

  - CSS Modules untuk component-scoped styles

  - CSS-in-JS (Emotion/Styled Components) untuk dynamic styling

- **UI Components**:

  - Custom component library berdasarkan Atomic Design

  - Shadcn UI untuk accessible primitives

  - Radix UI untuk complex components

  - Storybook untuk component documentation dan development

- **Visualization**:

  - Recharts untuk interactive charts

  - D3.js untuk custom visualizations

  - Victory Charts untuk statistical visualizations

- **Mapping**:

  - Mapbox GL JS untuk interactive maps

  - Turf.js untuk geospatial analysis

  - Deck.gl untuk data visualization layers

- **Utilities**:

  - date-fns untuk date manipulation

  - Lodash untuk data manipulation

  - Immer untuk immutable state updates

- **Internationalization**:

  - i18next untuk translation

  - React-intl untuk formatting

  - Support untuk multiple languages (Bahasa Indonesia & English)

- **Optimization**:

  - Bundle analyzer untuk code splitting

  - Image optimization dengan Next.js Image

  - Lazy loading untuk components

  - Web Vitals monitoring

- **Testing**:

  - Jest untuk unit testing

  - React Testing Library untuk component testing

  - Cypress untuk E2E testing

  - MSW (Mock Service Worker) untuk API mocking

- **Build Tools**:

  - Webpack untuk bundling

  - Babel untuk transpilation

  - ESBuild untuk faster builds

  - TypeScript untuk type checking

- **Package Manager**: npm untuk efficient dependency management

#### **9.1.2 Mobile Application**

# - **Framework**:

  - React Native (Expo) untuk cross-platform development dengan menggunakan Bahasa Pemrograman TypeScript

  - Expo SDK untuk native features

  - Expo EAS Build untuk CI/CD

- **State Management**:

  - Redux Toolkit untuk global state

  - Redux Persist untuk offline persistence

  - Context API untuk component state

- **Data Fetching**:

  - React Query untuk data fetching and caching

  - Axios untuk HTTP requests

  - Offline-first architecture dengan synchronization queue

- **Form Handling**:

  - React Hook Form untuk form validation

  - Zod untuk schema validation

  - Field-level validation

- **UI Framework**:

  - React Native Paper untuk Material Design components

  - Custom Theme Provider for brand styling

- **Navigation**:

  - React Navigation (v6+)

  - Tab, Stack, and Drawer navigation

  - Deep linking support

- **Maps & Location**:

  - React Native Maps untuk maps integration

  - React Native Geolocation for location tracking

  - Geofencing capabilities

- **Device Integration**:

  - Expo Camera untuk photo capture

  - Expo Barcode Scanner untuk 1D/2D barcode scanning

  - Expo Sensors untuk device sensors

  - Expo Location untuk background location

  - React Native Bluetooth untuk device connectivity

- **Offline Capabilities**:

  - Watermelon DB untuk local database

  - AsyncStorage untuk simple key-value storage

  - Data synchronization strategies

- **Notifications**:

  - Expo Notifications untuk push notifications

  - Background notifications handling

  - Notification channels for Android

- **Security**:

  - Expo SecureStore for sensitive data

  - Biometric authentication

  - SSL pinning

- **Testing**:

  - Jest untuk unit testing

  - React Native Testing Library untuk component testing

  - Detox untuk E2E testing

- **Analytics & Monitoring**:

  - Sentry untuk error tracking

  - Custom analytics untuk user behavior

  - Performance monitoring

- **Build & Deployment**:

  - Expo Application Services (EAS)

  - CI/CD integration

  - OTA updates

### **9.2 Backend Tech Stack**

# - **Runtime**:

  - Node.js Versi Terbaru

- **Framework**:

  - Express.js untuk API server dengan Menggunakan Bahasa Pemrograman JavaScript

- **API Design**:

  - RESTful API principles

  - Swagger/OpenAPI untuk documentation

  - JSON specification compliance

- **Authentication & Authorization**:

  - JWT untuk token-based auth

  - Passport.js untuk auth strategies

  - OAuth2.0 integration

  - RBAC implementation

- **Validation & Schemas**:

  - Joi untuk request validation

  - Zod sebagai alternative validator

  - JSON Schema untuk data validation

- **Database Access**:

  - Mongoose untuk MongoDB ODM

  - Transactions support

  - Data validation layer

- **Performance Optimization**:

  - Redis untuk caching

  - Rate limiting with Redis

  - Response compression

- **Background Processing**:

  - Bull untuk task queues

  - Bull Dashboard untuk monitoring

  - Scheduled jobs dengan node-cron

- **Storage**:

  - Minio (S3 Compatible) untuk object storage

  - Image processing dengan Sharp

  - PDF generation dengan PDFKit

- **Testing**:

  - Jest untuk unit testing

  - Supertest untuk API testing

  - Sinon untuk mocking

  - Test fixtures and factories

- **Logging & Monitoring**:

  - Winston untuk structured logging

  - Morgan untuk HTTP request logging

  - Correlation IDs untuk request tracking

  - Prometheus untuk metrics

  - Sentry.io

- **Error Handling**:

  - Global error handling middleware

  - express-async-errors untuk async errors

  - Custom error classes

  - Graceful shutdown

- **Security**:

  - Helmet untuk secure headers

  - CORS dengan proper configuration

  - express-rate-limit untuk rate limiting

  - Content Security Policy

  - npm audit untuk dependency scanning

- **Development Tools**:

  - Nodemon untuk hot reloading

  - dotenv untuk environment variables

  - ESLint untuk code quality

  - Prettier untuk formatting

- **Package Manager**: npm

### **9.3 Database Tech Stack**

# - **Primary Database**:

  - MongoDB Compass

  - MongoDB Atlas (cloud-hosted)

  - Replica set configuration for high availability

- **Database Features**:

  - Time-series collections for metrics

  - Full-text search capabilities

  - Geospatial indexing

  - Aggregation pipeline

  - Change streams for real-time updates

- **Cache Database**:

  - Redis 7.0

  - Redis Cluster untuk high availability

  - Redis Sentinel untuk failover

- **Database Tooling**:

  - MongoDB Compass untuk visual interaction

  - MongoDB Charts untuk data visualization

  - Mongoose ORM untuk data modeling

  - Redis Commander untuk Redis management

- **Data Operations**:

  - mongodump/mongorestore untuk backups

  - mongoexport/mongoimport untuk data migration

  - Data masking untuk sensitive information

- **Migration & Versioning**:

  - migrate-mongo untuk schema migrations

  - Version control for database scripts

  - Automated migration testing

- **Monitoring & Management**:

  - MongoDB Atlas Monitoring

  - Custom metrics collection

  - Query performance analysis

  - Slow query logging

  - Index usage statistics

### **9.4 DevOps Tech Stack**

# - **Railway.com Platform**:

  - Railway Git-based deployment

  - Automatic environment management

  - Railway CLI untuk operation automation

  - Zero-config deployments

  - Railway Volumes untuk persistent storage

- **Containerization**:

  - Docker for application containerization

  - Multi-stage builds untuk minimizing image size

  - Container security scanning

  - Railway automatic container orchestration

- **CI/CD Pipeline**:

  - GitHub Actions untuk test automation

  - Railway automatic deployments dari Git

  - Multi-environment pipeline (dev, staging, prod)

  - Railway preview environments untuk pull requests

- **Configuration Management**:

  - Railway environment variables

  - Railway shared variables

  - Environment-specific configurations

  - Secrets management dengan Railway

- **Monitoring & Alerting**:

  - Railway native metrics

  - Integration dengan Datadog/New Relic

  - Custom dashboards untuk business metrics

  - Alert notifications via Slack/Email

- **Logging**:

  - Railway centralized logs

  - Structured logging formats

  - Integration dengan log management services

  - Log retention policies

- **Security**:

  - Railway automatic TLS certificates

  - Container security scanning

  - Network policies dengan Railway

  - Automated dependency scanning

- **Network & Routing**:

  - Railway custom domains

  - Automatic TLS certificates

  - Railway public/private services

  - IP allowlisting

### **9.5 Testing Tech Stack**

# - **Unit Testing**:

  - Jest for JavaScript/TypeScript

  - Test runners dan parallelization

  - Snapshot testing

- **API Testing**:

  - Supertest untuk HTTP testing

  - Pactum untuk contract testing

  - Postman/Newman untuk API collections

- **End-to-End Testing**:

  - Cypress untuk web E2E testing

  - Playwright sebagai alternative

  - Test recording & replays

- **Performance Testing**:

  - k6 untuk load testing

  - Artillery untuk stress testing

  - Lighthouse untuk web performance

- **UI Testing**:

  - Storybook untuk component testing

  - Chromatic untuk visual regression

  - Percy untuk visual testing

- **Accessibility Testing**:

  - axe-core untuk a11y testing

  - Pa11y untuk automated scans

  - WCAG compliance testing

- **Mobile Testing**:

  - Detox for E2E mobile testing

  - Maestro for mobile flows

  - Appium for cross-platform

- **Test Data Management**:

  - Faker.js untuk test data generation

  - Factory patterns untuk consistent test data

  - Data seeding utilities

- **Coverage & Quality**:

  - Istanbul untuk code coverage

  - SonarQube untuk code quality

  - ESLint/TSLint untuk static analysis

- **Test Management**:

  - TestRail untuk test case management

  - CI integration for results

  - Reporting dashboards

- **Mocking**:

  - Mock Service Worker (MSW)

  - Wiremock for API mocking

  - Sinon for function mocking

## **10. Strategi Migrasi & Implementasi**

### **10.1 Strategi Migrasi Data**

# Mengingat PT. Sarana Mudah Raya kemungkinan memiliki data operasional yang sudah berjalan, strategi migrasi data berikut akan diimplementasikan:1) **Analisis Data Eksisting**

   - Melakukan audit dan pemetaan data dari sistem yang sedang berjalan (spreadsheet, dokumen fisik)

   - Identifikasi struktur data, format, dan kualitas data

   - Menentukan data kritis yang harus dimigrasikan dan data yang bisa diarsipkan

2) **Strategi Migrasi**

   - **Pendekatan Bertahap:**

     - Migrasi per modul sesuai dengan deployment bertahap

     - Data master (cabang, divisi, karyawan) dimigrasikan terlebih dahulu

     - Data operasional aktif (pengiriman yang sedang berjalan) dimigrasikan selanjutnya

     - Data historis dimigrasikan terakhir dengan prioritas yang lebih rendah

   - **ETL Process:**

     - Extract: Pengambilan data dari sumber (Excel, CSV, sistem lama)

     - Transform: Pembersihan, normalisasi, dan transformasi ke format MongoDB

     - Load: Import ke database target dengan validasi

   - **Validasi dan Verifikasi:**

     - Validasi data sebelum, selama, dan setelah migrasi

     - Pengecekan integritas referensial

     - Reconciliation reporting untuk memastikan data lengkap

3) **Periode Parallel Run**

   - Operasikan sistem baru dan lama secara paralel selama periode transisi

   - Double-entry untuk transaksi kritis selama periode transisi

   - Verifikasi silang antara output sistem baru dan lama

4) **Fallback Plan**

   - Backup komprehensif sebelum melakukan migrasi

   - Prosedur rollback yang terdokumentasi

   - Point-in-time recovery capability

### **10.2 Timeline Implementasi**

# Implementasi sistem akan dilakukan dalam fase-fase berikut, dengan durasi total 8 bulan:1. **Fase Foundation (Bulan 1-2)**

   - **Minggu 1-2:** Setup infrastruktur Railway.com dan environment

   - **Minggu 3-4:** Implementasi Modul Autentikasi & Otorisasi

   - **Minggu 5-6:** Implementasi Modul Manajemen Cabang & Divisi

   - **Minggu 7-8:** Implementasi Modul Manajemen Pegawai

   - **Deliverables:**

     - Railway.com environment yang operational

     - Aplikasi dengan login dan manajemen pengguna

     - Data master yang sudah termigrasi

2. **Fase Operasional Inti (Bulan 3-4)**

   - **Minggu 9-10:** Implementasi Modul Pengambilan Barang

   - **Minggu 11-12:** Implementasi Modul Penjualan & Pembuatan Resi

   - **Minggu 13-14:** Implementasi Modul Muat & Lansir (bagian 1)

   - **Minggu 15-16:** Implementasi Modul Muat & Lansir (bagian 2) & Tracking

   - **Deliverables:**

     - Aplikasi operasional utama yang mendukung proses bisnis inti

     - Mobile apps untuk operasional lapangan

     - Dashboard operasional dasar

3. **Fase Keuangan & Pelaporan (Bulan 5-6)**

   - **Minggu 17-18:** Implementasi Modul Keuangan (Kas & Bank)

   - **Minggu 19-20:** Implementasi Modul Keuangan (Akuntansi)

   - **Minggu 21-22:** Implementasi Modul Penagihan

   - **Minggu 23-24:** Implementasi Dashboard & Pelaporan

   - **Deliverables:**

     - Sistem keuangan terintegrasi

     - Dashboard komprehensif untuk manajemen

     - Sistem penagihan dan manajemen piutang4) **Fase Mobile Apps (Bulan 7)**

   - **Minggu 25-26:** Implementasi Mobile Apps untuk Checker & Supir

   - **Minggu 27-28:** Implementasi Mobile Apps untuk Debt Collector & Integrasi

   - **Deliverables:**

     - Aplikasi mobile yang fully functional

     - Offline-first capability dengan sinkronisasi

     - Integrasi dengan sistem backend

5) **Fase Optimasi & Penyempurnaan (Bulan 8)**

   - **Minggu 29-30:** Implementasi Modul Retur & Penyempurnaan

   - **Minggu 31-32:** Finalisasi, Performance Tuning & Go-Live

   - **Deliverables:**

     - Sistem ERP yang fully integrated

     - Performance yang teroptimasi

     - Dokumentasi lengkap

### **10.3 Strategi Deployment dengan Railway.com**

# Deployment akan menggunakan strategi Railway.com dengan pendekatan branch-based deployment untuk meminimalisir downtime dan risiko:1) **Railway.com Project Setup**

   - Single project dengan multiple environments (dev, staging, prod)

   - Custom domain setup untuk setiap environment

   - Resource allocation sesuai kebutuhan setiap environment

   - Shared variables dan secrets management

2) **Deployment Pipeline**

   - GitHub/GitLab Integration untuk automated deployment

   - Branch-based deployment:

     - `develop` branch → Development environment

     - `staging` branch → Staging environment

     - `main` branch → Production environment

   - Preview deployments untuk pull requests

   - Deployment approval untuk production

3) **Zero-Downtime Deployment**

   - Railway.com automatic zero-downtime deployment

   - Database migrations yang non-disruptive

   - Gradual rollout untuk major updates

   - Monitoring performansi selama deployment

4) **Rollback Strategy**

   - One-click rollback di Railway.com dashboard

   - Railway CLI untuk automated rollbacks via scripting

   - Database restore point via MongoDB Atlas

   - Versioned artifacts untuk tracking

### **10.4 Pelatihan & Onboarding**

# Untuk memastikan adopsi yang sukses, strategi pelatihan dan onboarding berikut akan diimplementasikan:1) **Strategi Train-the-Trainer**

   - Pelatihan intensif untuk key users dari setiap departemen

   - Key users akan menjadi champions dan trainers di departemen mereka

   - Dokumentasi dan materi pelatihan yang komprehensif

2) **Pelatihan Berdasarkan Peran**

   - Program pelatihan yang disesuaikan untuk setiap peran:

     - Manajemen Pusat

     - Kepala Cabang & Kepala Gudang

     - Staf Operasional (Checker, Supir, Team Muat/Lansir)

     - Staf Administrasi (Staff Penjualan, Kasir, Debt Collector)

   - Hands-on workshop dengan skenario nyata

3) **Support Pasca-Implementasi**

   - Help desk dedicated selama periode transisi (3 bulan)

   - Dokumentasi online dengan searchable knowledge base

   - Quick reference guides untuk tugas-tugas umum

   - Video tutorial untuk proses-proses utama

4) **Change Management**

   - Komunikasi regular tentang status proyek dan timeline

   - Sesi sosialisasi untuk memperkenalkan manfaat sistem baru

   - Feedback loop untuk perbaikan berkelanjutan

   - Recognition program untuk early adopters dan champions

## **11. Kesimpulan dan Rekomendasi**

### **11.1 Kesimpulan**

# Technical Design Document (TDD) ini telah memaparkan desain teknis untuk Sistem ERP PT. Sarana Mudah Raya (Samudra Paket) yang bertujuan untuk mengintegrasikan seluruh proses bisnis perusahaan dalam satu platform terintegrasi. Desain ini mencakup:1) **Arsitektur Modern dan Scalable:**

   - Arsitektur microservice dengan pendekatan API-first

   - Frontend berbasis Next.js dan React Native untuk pengalaman pengguna optimal

   - Backend berbasis Node.js dengan Express untuk performa dan skalabilitas

   - Database NoSQL (MongoDB) untuk fleksibilitas dan kemampuan adaptasi

   - Deployment platform menggunakan Railway.com untuk kemudahan dan kecepatan

2) **User Experience yang Dioptimalkan:**

   - UI/UX yang disesuaikan dengan kebutuhan pengguna dari berbagai level

   - Mobile apps dengan pendekatan offline-first untuk operasional lapangan

   - Dashboard komprehensif untuk pengambilan keputusan

   - Desain responsif untuk akses dari berbagai perangkat

3) **Keamanan Multi-Level:**

   - Implementasi keamanan berlapis dari jaringan hingga aplikasi

   - Role-Based Access Control (RBAC) dengan granular permissions

   - Enkripsi data sensitif dan komunikasi

   - Audit trail komprehensif untuk semua aktivitas kritis

4) **Integrasi dan Ekstensibilitas:**

   - Integrasi dengan sistem eksternal (payment gateway, maps, SMS/email)

   - API yang terdokumentasi dengan baik untuk integrasi masa depan

   - Arsitektur modular yang memungkinkan penambahan fitur dengan mudah

   - Event-driven architecture untuk komunikasi antar service

5) **Deployment dan Infrastruktur Modern:**

   - Railway.com platform untuk deployment yang cepat dan scalable

   - Automatic scaling dan zero-downtime deployments

   - Git-based deployment dengan continuous integration

   - Branch-based environments untuk development, staging, dan production

### **11.2 Rekomendasi**

# Berdasarkan desain teknis yang telah disusun, berikut adalah rekomendasi untuk implementasi sistem:1) **Pendekatan Iteratif dan Inkremental:**

   - Implementasikan sistem secara bertahap sesuai prioritas bisnis

   - Mulai dengan modul-modul inti yang memberikan nilai bisnis tercepat

   - Validasi dan perbaiki secara kontinyu berdasarkan feedback pengguna

   - Gunakan metodologi Agile dengan sprint 2 minggu untuk fleksibilitas

2) **Manfaatkan Railway.com Platform Secara Optimal:**

   - Gunakan Railway.com services untuk semua microservices

   - Manfaatkan Railway automatic scaling untuk menangani load spikes

   - Implementasi Railway preview environments untuk efficient testing

   - Optimalkan resources untuk cost efficiency

3) **Fokus pada Operational Excellence:**

   - Optimasi performa sistem sejak fase awal

   - Implementasi logging dan monitoring komprehensif

   - Buat runbook dan SOP untuk operasional sistem

   - Latih staff IT internal untuk maintenance dan operasional

4) **Penekanan pada User Adoption:**

   - Investasi yang cukup pada pelatihan pengguna

   - Buat dokumentasi yang lengkap dan user-friendly

   - Implementasikan feedback loop untuk perbaikan UX

   - Identifikasi dan train champions di setiap departemen

5) **Persiapan untuk Evolusi System:**

   - Dokumentasikan API dan interfacing points

   - Rancang untuk extensibility dan scalability

   - Persiapkan roadmap pengembangan jangka panjang

   - Pertimbangkan potential future integrations

6) **Security by Design:**

   - Implement security practices di semua tahap SDLC

   - Conduct regular security assessments

   - Prepare incident response procedures

   - Train development team on secure coding practicesDengan mengikuti desain teknis dan rekomendasi ini, PT. Sarana Mudah Raya akan memiliki sistem ERP yang robust, skalabel, dan sesuai dengan kebutuhan bisnis jangka panjang, yang akan meningkatkan efisiensi operasional dan memberikan keunggulan kompetitif dalam industri logistik dan pengiriman.

## **12. Lampiran**

### **12.1 Referensi Teknologi**

# 1. **Frontend:**

   - Next.js:[ https://nextjs.org/docs](https://nextjs.org/docs)

   - React:[ https://reactjs.org/docs](https://reactjs.org/docs)

   - React Native:[ https://reactnative.dev/docs](https://reactnative.dev/docs)

   - Redux Toolkit:[ https://redux-toolkit.js.org/](https://redux-toolkit.js.org/)

   - Tailwind CSS:[ https://tailwindcss.com/docs](https://tailwindcss.com/docs)

2. **Backend:**

   - Node.js:[ https://nodejs.org/en/docs/](https://nodejs.org/en/docs/)

   - Express.js:[ https://expressjs.com/](https://expressjs.com/)

   - Mongoose:[ https://mongoosejs.com/docs/](https://mongoosejs.com/docs/)

   - JWT:[ https://jwt.io/introduction/](https://jwt.io/introduction/)

3. **Database:**

   - MongoDB:[ https://docs.mongodb.com/](https://docs.mongodb.com/)

   - Redis:[ https://redis.io/documentation](https://redis.io/documentation)

4. **DevOps:**

   - Railway.com:[ https://docs.railway.app/](https://docs.railway.app/)

   - Docker:[ https://docs.docker.com/](https://docs.docker.com/)

   - GitHub Actions:[ https://docs.github.com/en/actions](https://docs.github.com/en/actions)

### **12.2 Checklist Implementasi**

# 1. **Railway.com Environment Setup Checklist:**

   - Railway.com account dan project setup

   - Environment variables configuration

   - Secrets management setup

   - Custom domains configuration

   - MongoDB Atlas dan Redis integration

   - Service communication setup

   - Deployment pipeline established

   - Development environments created

2. **Development Checklist:**

   - Code repository structure created

   - Base project scaffolding completed

   - Shared libraries and components created

   - API contracts defined

   - Database schema finalized

   - Coding standards and practices documented

3. **Security Checklist:**

   - Authentication system implemented

   - Authorization system implemented

   - Encryption for sensitive data configured

   - Security headers configured

   - Input validation implemented

   - Audit logging configured

4. **Testing Checklist:**

   - Unit testing framework setup

   - Integration testing framework setup

   - E2E testing framework setup

   - Test data preparation

   - Performance testing plan

   - Security testing plan

5. **Deployment Checklist:**

   - Railway deployment pipeline tested

   - Rollback procedures tested

   - Monitoring system configured

   - Alerting system configured

   - Backup procedures tested

   - DR procedures tested

### **12.3 Hardware & Software Requirements**

# 1. **Railway.com Requirements:**

   - Tier: Standard atau Enterprise berdasarkan kebutuhan

   - Services: 10-15 services (minimum)

   - Memory allocation: 1-4GB per service

   - Environments: Development, Staging, Production

   - Custom domains: 5-10 domains

2. **Database Requirements (MongoDB Atlas):**

   - Tier: M10+ (dedicated cluster)

   - Storage: 100GB+ (scalable)

   - Connections: 500+ concurrent connections

   - Backup: Daily automated backups

   - Performance: 1000+ operations/second

3. **Minimum Client Requirements:**

   - **Web Application**:

     - Modern browser (Chrome, Firefox, Safari, Edge)

     - Internet connection: 2Mbps minimum

   - **Mobile Application**:

     - Android: Version 9.0 or higher

     - iOS: Version 13.0 or higher

     - RAM: 2GB minimum

     - Internal storage: 500MB free space

     - Camera: 5MP minimum

     - GPS capability

4. **Operational Hardware Requirements:**

   - **Printer Thermal**: Untuk printing resi/STT

   - **Barcode Scanner**: Untuk scanning resi dan dokumen

   - **Timbangan Digital**: Untuk weighing barang

   - **Smartphone/Tablet**: Untuk mobile app

### **12.4 Glossary**

# |              |                                                                                                                 |
| :----------: | :-------------------------------------------------------------------------------------------------------------: |
|   **Term**   |                                                  **Definition**                                                 |
|      API     |       Application Programming Interface, interface yang memungkinkan aplikasi berkomunikasi satu sama lain      |
|     CI/CD    | Continuous Integration/Continuous Deployment, praktik DevOps untuk integrasi dan deployment kode secara kontinu |
|      ERP     |                 Enterprise Resource Planning, sistem terintegrasi untuk mengelola proses bisnis                 |
|      JWT     |                          JSON Web Token, standard untuk secure information transmission                         |
| Microservice |             Arsitektur pengembangan software dimana aplikasi dibangun sebagai kumpulan service kecil            |
|     RBAC     |          Role-Based Access Control, pendekatan untuk membatasi akses sistem berdasarkan peran pengguna          |
|    RESTful   |  Representational State Transfer, arsitektur API yang menggunakan HTTP requests untuk akses dan manipulasi data |
|      SSR     |             Server-Side Rendering, teknik rendering halaman web di server sebelum dikirim ke browser            |
|      STT     |                     Surat Tanda Terima, dokumen yang dicetak sebagai bukti pengiriman barang                    |
|      UX      |                       User Experience, pengalaman pengguna saat berinteraksi dengan sistem                      |
|  Railway.com |    Platform deployment modern yang menyediakan infrastructure-as-code dan continuous deployment capabilities    |
