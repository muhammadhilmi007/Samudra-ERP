# **Software Requirement Specification (SRS)**

# **Sistem ERP PT. Sarana Mudah Raya (Samudra Paket)**

**Versi Dokumen:** 1.0\
&#x20;**Tanggal Pembuatan:** 27 April 2025\
&#x20;**Disusun oleh:** Business Analyst, System Analyst, Akuntan\
&#x20;**Status Dokumen:** Draft
===============================

## **Riwayat Revisi**

# |           |               |                                                    |                                  |
| :-------: | :-----------: | :------------------------------------------------: | :------------------------------: |
| **Versi** |  **Tanggal**  |               **Deskripsi Perubahan**              |          **Dibuat oleh**         |
|    0.1    | 18 April 2025 |                    Initial draft                   |         Business Analyst         |
|    0.5    | 22 April 2025 | Penambahan kebutuhan fungsional dan non-fungsional |          System Analyst          |
|    0.8    | 25 April 2025 |  Penambahan kebutuhan modul keuangan dan akuntansi |              Akuntan             |
|    1.0    | 27 April 2025 |                 Finalisasi dokumen                 | Business Analyst, System Analyst |

## **Daftar Isi**

# 1. [Pendahuluan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#1-pendahuluan)

   1. [Tujuan Dokumen](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#11-tujuan-dokumen)

   2. [Ruang Lingkup Sistem](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#12-ruang-lingkup-sistem)

   3. [Definisi dan Istilah](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#13-definisi-dan-istilah)

   4. [Referensi](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#14-referensi)

2. [Deskripsi Umum Sistem](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#2-deskripsi-umum-sistem)

   1. [Perspektif Produk](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#21-perspektif-produk)

   2. [Fungsi Produk](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#22-fungsi-produk)

   3. [Karakteristik Pengguna](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#23-karakteristik-pengguna)

   4. [Batasan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#24-batasan)

   5. [Asumsi dan Ketergantungan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#25-asumsi-dan-ketergantungan)

3. [Kebutuhan Fungsional](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#3-kebutuhan-fungsional)

   1. [Modul Autentikasi dan Otorisasi](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#31-modul-autentikasi-dan-otorisasi)

   2. [Modul Dashboard](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#32-modul-dashboard)

   3. [Modul Manajemen Cabang & Divisi](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#33-modul-manajemen-cabang--divisi)

   4. [Modul Manajemen Pegawai](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#34-modul-manajemen-pegawai)

   5. [Modul Pengambilan Barang (Pickup)](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#35-modul-pengambilan-barang-pickup)

   6. [Modul Penjualan dan Pembuatan Resi](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#36-modul-penjualan-dan-pembuatan-resi)

   7. [Modul Manajemen Kendaraan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#37-modul-manajemen-kendaraan)

   8. [Modul Muat & Langsir Barang](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#38-modul-muat--langsir-barang)

   9. [Modul Retur](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#39-modul-retur)

   10. [Modul Penagihan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#310-modul-penagihan)

   11. [Modul Keuangan dan Akuntansi](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#311-modul-keuangan-dan-akuntansi)

   12. [Modul HRD](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#312-modul-hrd)

   13. [Modul Pelaporan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#313-modul-pelaporan)

   14. [Modul Tracking dan Monitoring](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#314-modul-tracking-dan-monitoring)

4. [Kebutuhan Non-Fungsional](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#4-kebutuhan-non-fungsional)

   1. [Kebutuhan Performa](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#41-kebutuhan-performa)

   2. [Kebutuhan Keamanan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#42-kebutuhan-keamanan)

   3. [Kebutuhan Keandalan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#43-kebutuhan-keandalan)

   4. [Kebutuhan Kompatibilitas](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#44-kebutuhan-kompatibilitas)

   5. [Kebutuhan Skalabilitas](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#45-kebutuhan-skalabilitas)

   6. [Kebutuhan Usabilitas](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#46-kebutuhan-usabilitas)

   7. [Kebutuhan Maintainability](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#47-kebutuhan-maintainability)

5. [Diagram dan Model](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#5-diagram-dan-model)

   1. [Entity Relationship Diagram (ERD)](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#51-entity-relationship-diagram-erd)

   2. [Diagram Alur Kerja (Workflow)](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#52-diagram-alur-kerja-workflow)

   3. [Use Case Diagram](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#53-use-case-diagram)

   4. [Diagram Arsitektur Sistem](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#54-diagram-arsitektur-sistem)

6. [Antarmuka Eksternal](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#6-antarmuka-eksternal)

   1. [Antarmuka Pengguna](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#61-antarmuka-pengguna)

   2. [Antarmuka Hardware](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#62-antarmuka-hardware)

   3. [Antarmuka Software](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#63-antarmuka-software)

   4. [Antarmuka Komunikasi](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#64-antarmuka-komunikasi)

7. [Prioritas Kebutuhan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#7-prioritas-kebutuhan)

   1. [Matriks Prioritas](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#71-matriks-prioritas)

   2. [Prioritas Pengembangan](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#72-prioritas-pengembangan)

8. [Lampiran](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#8-lampiran)

   1. [Contoh Format Dokumen](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#81-contoh-format-dokumen)

   2. [Mockup Antarmuka](https://claude.ai/chat/911bf01f-03d5-44fd-a5f0-20c9df321b4c#82-mockup-antarmuka)

## **1. Pendahuluan**

### **1.1 Tujuan Dokumen**

# Dokumen Software Requirement Specification (SRS) ini bertujuan untuk:1) Mendefinisikan dan mendokumentasikan kebutuhan sistem ERP secara menyeluruh untuk PT. Sarana Mudah Raya (Samudra Paket).

2) Menyediakan acuan yang jelas bagi tim pengembangan dalam mengimplementasikan sistem.

3) Memfasilitasi komunikasi dan pemahaman yang sama antara stakeholder, tim bisnis, dan tim teknis.

4) Menjadi dasar untuk validasi dan verifikasi sistem yang dikembangkan.

5) Menyediakan dasar untuk estimasi waktu, biaya, dan sumber daya yang dibutuhkan.Dokumen ini ditujukan untuk semua pemangku kepentingan yang terlibat dalam pengembangan sistem, termasuk tim bisnis, tim pengembangan, tim pengujian, dan manajemen PT. Sarana Mudah Raya.

### **1.2 Ruang Lingkup Sistem**

# Sistem ERP Samudra Paket adalah solusi terintegrasi yang dirancang untuk mengelola seluruh proses bisnis logistik dan pengiriman barang PT. Sarana Mudah Raya, meliputi:1) **Aplikasi Web**:

   - Dashboard untuk manajemen dan monitoring

   - Sistem administrasi untuk pengelolaan data master dan transaksi

   - Sistem keuangan dan akuntansi

   - Sistem pelaporan dan analitik

2) **Aplikasi Mobile**:

   - Aplikasi untuk operasional lapangan (Checker, Supir, Kepala Gudang)

   - Modul pengambilan barang dengan validasi lokasi

   - Modul pelacakan pengiriman

   - Modul pembongkaran dan lansir

3) **Modul-modul Utama**:

   - Autentikasi dan Otorisasi (RBAC)

   - Manajemen Cabang & Divisi

   - Manajemen Pegawai

   - Pengambilan Barang (Pickup)

   - Penjualan dan Pembuatan Resi

   - Manajemen Kendaraan

   - Muat & Langsir Barang

   - Retur

   - Penagihan

   - Keuangan dan Akuntansi

   - HRD

   - Pelaporan

   - Tracking dan Monitoring

4) **Integrasi**:

   - Payment gateway

   - Layanan maps untuk optimasi rute

   - Sistem forwarder/mitraSistem ini diimplementasikan dengan arsitektur berbasis cloud, menggunakan teknologi modern untuk memastikan keandalan, skalabilitas, dan kemudahan akses.

### **1.3 Definisi dan Istilah**

# |                       |                                                                                                     |
| :-------------------: | :-------------------------------------------------------------------------------------------------: |
|      **Istilah**      |                                             **Definisi**                                            |
|        **STT**        | Surat Tanda Terima, dokumen resmi yang dikeluarkan sebagai bukti penerimaan barang untuk pengiriman |
|       **Pickup**      |                            Proses pengambilan barang dari lokasi pengirim                           |
|      **Langsir**      |                       Proses pengiriman barang dari gudang ke alamat penerima                       |
|       **Colly**       |                             Satuan ukuran berat barang dalam pengiriman                             |
|        **Muat**       |                        Proses memasukkan barang ke dalam kendaraan pengangkut                       |
|        **DMB**        |        Daftar Muat Barang, dokumen yang berisi daftar barang yang dimuat dalam satu kendaraan       |
|        **KBH**        |                  Kiriman Barang Harian, laporan harian tentang barang yang dikirim                  |
|        **CASH**       |                           Metode pembayaran di muka saat pengiriman barang                          |
|        **COD**        |              Cash On Delivery, metode pembayaran di tempat tujuan saat barang diterima              |
|        **CAD**        |  Cash After Delivery, metode pembayaran setelah barang diterima dengan tempo tertentu (kontra bon)  |
|   **Debt Collector**  |                             Petugas yang bertugas menagih pembayaran CAD                            |
| **Forwarder/Penerus** |   Mitra logistik yang meneruskan pengiriman ke daerah yang tidak terjangkau oleh cabang perusahaan  |
|        **RBAC**       |          Role-Based Access Control, sistem pengaturan hak akses berdasarkan peran pengguna          |
|        **ERP**        |  Enterprise Resource Planning, sistem terintegrasi untuk mengelola seluruh proses bisnis perusahaan |
|       **Retur**       |               Pengembalian barang yang tidak dapat dikirim atau ditolak oleh penerima               |
|     **Dashboard**     |                   Tampilan visual yang menyajikan informasi penting secara ringkas                  |
|        **API**        | Application Programming Interface, antarmuka yang memungkinkan aplikasi berbeda untuk berkomunikasi |
|      **Frontend**     |                      Bagian aplikasi yang berinteraksi langsung dengan pengguna                     |
|      **Backend**      |            Bagian aplikasi yang memproses logika bisnis dan berinteraksi dengan database            |
|        **SLA**        |                 Service Level Agreement, perjanjian tingkat layanan yang disepakati                 |
|        **KPI**        |                       Key Performance Indicator, metrik untuk mengukur kinerja                      |

### **1.4 Referensi**

# 1. Dokumen Alur Kerja PT. Sarana Mudah Raya (Alur Kerja - PT. Sarana Mudah Raya.pdf)

2. Struktur Organisasi PT. Sarana Mudah Raya (Structure Diagram PT. Sarana Mudah Raya.pdf)

3. Business Requirement Document (BRD) Sistem ERP Samudra Paket

4. Job Description untuk seluruh posisi di PT. Sarana Mudah Raya

5. Dokumen SDLC (Software Development Life Cycle) untuk Sistem ERP Samudra Paket

6. Laporan Keuangan Cabang dan Pusat PT. Sarana Mudah Raya

7. Diagram Aliran Data Sistem ERP

8. IEEE 830-1998 Recommended Practice for Software Requirements Specifications

## **2. Deskripsi Umum Sistem**

### **2.1 Perspektif Produk**

# Sistem ERP Samudra Paket merupakan sistem informasi terintegrasi yang dirancang khusus untuk mendukung operasional PT. Sarana Mudah Raya sebagai perusahaan logistik dan pengiriman barang. Sistem ini menggantikan proses manual dan semi-manual yang ada saat ini, dengan tujuan meningkatkan efisiensi, akurasi, dan transparansi di seluruh proses bisnis.Sistem ERP ini mencakup seluruh siklus operasional pengiriman barang, mulai dari pengambilan barang dari pengirim, pemrosesan di cabang pengirim, pengiriman antar cabang, penerimaan di cabang tujuan, pengiriman ke penerima akhir, hingga pengelolaan keuangan dan pelaporan.**Diagram Konteks Sistem:**Sistem ERP Samudra Paket berinteraksi dengan berbagai entitas eksternal, termasuk:1) **Pelanggan (Pengirim dan Penerima)**: Menyediakan dan menerima informasi pengiriman, status, dan pembayaran.

2) **Manajemen Pusat**: Menerima laporan dan dashboard untuk pengambilan keputusan strategis.

3) **Cabang-cabang Perusahaan**: Berinteraksi dengan sistem untuk operasional harian.

4) **Mitra Forwarder**: Menerima dan memberikan informasi untuk pengiriman lanjutan.

5) **Payment Gateway**: Memproses pembayaran elektronik.

6) **Layanan Maps**: Menyediakan data untuk optimasi rute.Sistem ini beroperasi dalam lingkungan cloud dengan aplikasi web untuk manajemen dan administrasi, serta aplikasi mobile untuk operasional lapangan.

### **2.2 Fungsi Produk**

# Berikut ini adalah fungsi utama dari Sistem ERP Samudra Paket:1) **Manajemen Pickup dan Pengambilan Barang**:

   - Registrasi dan penugasan pickup

   - Pencatatan digital form pengambilan barang

   - Verifikasi barang dengan foto

   - Pengiriman barang ke cabang

2) **Pemrosesan di Cabang Pengirim**:

   - Penerimaan, verifikasi, dan penimbangan barang

   - Pembuatan resi/STT

   - Alokasi barang ke truk

   - Pencatatan dan validasi dokumen pengiriman

3) **Pengiriman Antar Cabang**:

   - Manajemen omzet dan volume per truk

   - Koordinasi antar cabang untuk konsolidasi muatan

   - Monitoring perjalanan truk

   - Pengelolaan biaya pengiriman

4) **Penerimaan di Cabang Tujuan**:

   - Verifikasi dokumen dan barang

   - Penerimaan dan validasi muatan

   - Alokasi untuk lansir

   - Penyelesaian masalah ketidaksesuaian

5) **Pengiriman ke Penerima (Lansir)**:

   - Perencanaan rute langsir

   - Pembuatan dokumen lansir

   - Konfirmasi penerimaan dengan tanda tangan digital

   - Penanganan pembayaran COD

   - Pelaporan hasil lansir

6) **Penagihan dan Keuangan**:

   - Pengelolaan piutang CAD

   - Penjadwalan dan pencatatan hasil penagihan

   - Pencatatan transaksi keuangan

   - Pembuatan jurnal dan laporan keuangan

   - Pengelolaan kas dan bank

7) **Manajemen dan Pelaporan**:

   - Dashboard KPI untuk berbagai tingkat manajemen

   - Pelaporan operasional, keuangan, dan kinerja

   - Analisis profitabilitas dan efisiensi

   - Pelacakan dan monitoring status pengiriman

   - Analisis trend dan performa bisnis

8) **Administrasi Sistem**:

   - Manajemen pengguna dan hak akses (RBAC)

   - Pengelolaan data master (cabang, divisi, pelanggan, dll)

   - Konfigurasi sistem dan parameter

   - Audit trail dan log aktivitas

### **2.3 Karakteristik Pengguna**

# Sistem ERP Samudra Paket akan digunakan oleh berbagai level pengguna dengan kebutuhan dan kemampuan teknis yang berbeda-beda:1) **Manajemen Pusat**:

   - **Direktur Utama/Owner**: Memiliki akses penuh ke seluruh sistem dengan fokus pada dashboard dan laporan eksekutif. Memiliki kemampuan teknologi menengah dan memerlukan informasi ringkas dan cepat.

   - **Manager (Keuangan, Administrasi, Marketing, Operasional, HRD)**: Akses ke modul sesuai departemen untuk monitoring dan pengambilan keputusan. Memiliki kemampuan teknologi menengah dan fokus pada analisis departemen.

2) **Operasional Cabang**:

   - **Kepala Cabang**: Akses ke seluruh operasional dan administrasi cabang. Kemampuan teknologi bervariasi dan memerlukan pelatihan komprehensif.

   - **Kepala Gudang**: Fokus pada modul operasional gudang dan pengiriman. Kemampuan teknologi dasar hingga menengah.

   - **Kepala Administrasi**: Fokus pada modul administrasi dan keuangan cabang. Kemampuan teknologi dasar hingga menengah.

3) **Staf Operasional**:

   - **Checker**: Menggunakan aplikasi mobile dan web untuk verifikasi barang. Kemampuan teknologi dasar dan memerlukan antarmuka yang sederhana.

   - **Team Muat/Lansir**: Fokus pada tugas-tugas spesifik dengan antarmuka yang sangat sederhana. Kemampuan teknologi minimal.

   - **Supir (Pickup, Langsir, Truk Antar Cabang)**: Menggunakan aplikasi mobile untuk pelacakan dan konfirmasi. Kemampuan teknologi minimal dan memerlukan antarmuka intuitif.

4) **Staf Administrasi**:

   - **Staff Penjualan**: Fokus pada pembuatan resi dan transaksi. Kemampuan teknologi dasar hingga menengah.

   - **Staff Administrasi**: Pengelolaan dokumen pengiriman. Kemampuan teknologi dasar hingga menengah.

   - **Kasir**: Pengelolaan kas dan pencatatan keuangan. Kemampuan teknologi dasar hingga menengah.

   - **Debt Collector**: Penagihan piutang dengan aplikasi mobile. Kemampuan teknologi dasar.

   - **Customer Service**: Penanganan permintaan dan keluhan pelanggan. Kemampuan teknologi dasar hingga menengah.

5) **Pelanggan (Potensial untuk Pengembangan Masa Depan)**:

   - **Pengirim dan Penerima**: Mungkin akan diberikan akses terbatas untuk pelacakan. Kemampuan teknologi bervariasi dan memerlukan antarmuka yang sangat sederhana.

### **2.4 Batasan**

# Berikut adalah batasan-batasan yang perlu dipertimbangkan dalam pengembangan Sistem ERP Samudra Paket:1) **Batasan Teknis**:

   - Aplikasi web dikembangkan menggunakan Next.js, React dengan JavaScript

   - Aplikasi mobile dikembangkan menggunakan React Native (Expo) dengan TypeScript

   - Backend dikembangkan menggunakan Node.js dengan Express.js dengan JavaScript

   - Database menggunakan MongoDB dengan Mongoose ORM dan menggunakan Embedded Document 

   - API berbasis RESTful dengan dokumentasi Swagger/OpenAPI

   - Sistem harus dapat beroperasi pada koneksi internet dengan kecepatan minimal 1 Mbps

2) **Batasan Operasional**:

   - Sistem harus dapat mendukung operasional 24/7 dengan waktu pemeliharaan yang minimal

   - Akses aplikasi mobile harus memungkinkan operasi dasar dalam mode offline yang akan disinkronkan saat koneksi tersedia

   - Backup data harus dilakukan secara otomatis minimal setiap 24 jam

   - Sistem harus mendukung migrasi bertahap dari sistem lama

3) **Batasan Regulasi**:

   - Sistem harus mematuhi regulasi perpajakan Indonesia

   - Sistem harus mematuhi regulasi perlindungan data pribadi

   - Dokumentasi finansial harus memenuhi standar akuntansi yang berlaku

4) **Batasan Usability**:

   - Antarmuka pengguna harus dirancang untuk dapat digunakan oleh pengguna dengan kemampuan teknologi minimal

   - Aplikasi mobile harus dapat berjalan pada perangkat Android dengan spesifikasi menengah ke bawah

   - Sistem harus mendukung penggunaan dalam kondisi koneksi internet yang tidak stabil

5) **Batasan Implementasi**:

   - Pengembangan dan implementasi dilakukan secara bertahap, dimulai dari modul-modul inti

   - Integrasi dengan sistem eksternal dibatasi pada API yang tersedia

   - Pengembangan disesuaikan dengan anggaran dan timeline yang telah ditetapkan

### **2.5 Asumsi dan Ketergantungan**

#### **Asumsi:**

# 1. **Infrastruktur**:

   - Seluruh cabang memiliki akses internet yang memadai untuk mengakses sistem

   - Staf operasional (Checker, Supir, dsb.) memiliki akses ke perangkat mobile yang kompatibel

2. **Kemampuan Pengguna**:

   - Pengguna memiliki pengetahuan dasar tentang penggunaan komputer dan perangkat mobile

   - Pengguna bersedia mengikuti pelatihan untuk penggunaan sistem baru

3. **Data**:

   - Data dari sistem lama (jika ada) dapat dimigrasikan ke sistem baru

   - Struktur data di seluruh cabang konsisten dan dapat distandarisasi

4. **Proses Bisnis**:

   - SOP yang ada saat ini telah terdokumentasi dengan baik dan akan menjadi dasar untuk pengembangan sistem

   - Workflow dan proses bisnis yang didokumentasikan mencerminkan praktik aktual di lapangan

#### **Ketergantungan:**

# 1. **Ketergantungan Eksternal**:

   - Ketersediaan dan kestabilan layanan cloud yang digunakan

   - Ketersediaan dan respons API dari sistem eksternal (payment gateway, layanan maps, forwarder)

   - Kepatuhan mitra forwarder dengan protokol integrasi yang disepakati

2. **Ketergantungan Internal**:

   - Ketersediaan tim IT untuk mendukung implementasi dan pemeliharaan sistem

   - Komitmen manajemen untuk mendukung perubahan proses bisnis yang diperlukan

   - Keterlibatan aktif pengguna kunci dalam pengujian dan validasi sistem

3. **Ketergantungan Antar Modul**:

   - Modul Dashboard bergantung pada data yang dihasilkan oleh modul-modul operasional

   - Modul Keuangan bergantung pada data transaksi dari modul Penjualan dan Penagihan

   - Modul Tracking bergantung pada data status dari modul Pengambilan, Muat, dan Lansir

## **3. Kebutuhan Fungsional**

### **3.1 Modul Autentikasi dan Otorisasi**

#### **3.1.1 Manajemen Pengguna**

# |          |                             |               |                                                                                                                                                  |
| :------: | :-------------------------: | :-----------: | :----------------------------------------------------------------------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                                                   **Deskripsi**                                                                  |
| FR-AU-01 |     Registrasi Pengguna     |     Tinggi    | Sistem harus memungkinkan administrator untuk mendaftarkan pengguna baru dengan informasi dasar (nama, username, email, cabang, divisi, jabatan) |
| FR-AU-02 | Pengelolaan Profil Pengguna |     Sedang    |                   Pengguna harus dapat melihat dan memperbarui informasi profil mereka, termasuk nama, email, dan nomor telepon                  |
| FR-AU-03 |        Reset Password       |     Tinggi    |                             Sistem harus memungkinkan pengguna untuk mereset password mereka melalui email verifikasi                            |
| FR-AU-04 |  Manajemen Status Pengguna  |     Sedang    |                                      Administrator harus dapat mengaktifkan dan menonaktifkan akun pengguna                                      |

#### **3.1.2 Autentikasi**

# |          |                          |               |                                                                                          |
| :------: | :----------------------: | :-----------: | :--------------------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**      | **Prioritas** |                                       **Deskripsi**                                      |
| FR-AU-05 |           Login          |     Tinggi    |          Pengguna harus dapat masuk ke sistem dengan username/email dan password         |
| FR-AU-06 |       Login Mobile       |     Tinggi    |        Aplikasi mobile harus menyediakan login yang aman dengan opsi "remember me"       |
| FR-AU-07 | Multi-faktor Autentikasi |     Rendah    |     Sistem harus mendukung autentikasi dua faktor untuk akun dengan hak akses tinggi     |
| FR-AU-08 |    Session Management    |     Tinggi    | Sistem harus mengelola sesi pengguna dengan timeout otomatis setelah periode tidak aktif |
| FR-AU-09 |          Logout          |     Tinggi    |         Pengguna harus dapat keluar dari sistem dengan aman dari semua perangkat         |

#### **3.1.3 Otorisasi (RBAC)**

# |          |                                  |               |                                                                                                                       |
| :------: | :------------------------------: | :-----------: | :-------------------------------------------------------------------------------------------------------------------: |
|  **ID**  |           **Kebutuhan**          | **Prioritas** |                                                     **Deskripsi**                                                     |
| FR-AU-10 |          Manajemen Peran         |     Tinggi    | Sistem harus memungkinkan pendefinisian peran pengguna (Direktur, Manager, Kepala Cabang, Kepala Gudang, Staff, dll.) |
| FR-AU-11 |        Manajemen Hak Akses       |     Tinggi    |          Administrator harus dapat mengatur hak akses spesifik untuk setiap peran ke modul dan fungsi sistem          |
| FR-AU-12 | Batasan Akses Berdasarkan Cabang |     Tinggi    | Sistem harus membatasi akses pengguna hanya pada data cabang mereka, kecuali untuk peran tertentu (Direktur, Manager) |
| FR-AU-13 |         Delegasi Wewenang        |     Sedang    |         Sistem harus memungkinkan delegasi wewenang sementara untuk fungsi tertentu (misalnya saat cuti/sakit)        |

#### **3.1.4 Audit dan Keamanan**

# |          |               |               |                                                                                                         |
| :------: | :-----------: | :-----------: | :-----------------------------------------------------------------------------------------------------: |
|  **ID**  | **Kebutuhan** | **Prioritas** |                                              **Deskripsi**                                              |
| FR-AU-14 |  Audit Trail  |     Tinggi    | Sistem harus mencatat semua aktivitas pengguna yang signifikan (login, logout, modifikasi data penting) |
| FR-AU-15 |  Log Keamanan |     Tinggi    |               Sistem harus mencatat semua upaya akses tidak sah dan aktivitas mencurigakan              |
| FR-AU-16 | Laporan Audit |     Sedang    |       Administrator harus dapat melihat dan mengekspor laporan audit trail untuk periode tertentu       |

### **3.2 Modul Dashboard**

#### **3.2.1 Dashboard Eksekutif**

# |          |                         |               |                                                                                                            |
| :------: | :---------------------: | :-----------: | :--------------------------------------------------------------------------------------------------------: |
|  **ID**  |      **Kebutuhan**      | **Prioritas** |                                                **Deskripsi**                                               |
| FR-DB-01 |       KPI Summary       |     Tinggi    | Dashboard harus menampilkan ringkasan KPI utama perusahaan (pendapatan, volume pengiriman, profitabilitas) |
| FR-DB-02 |   Financial Highlights  |     Tinggi    |      Dashboard harus menampilkan highlight keuangan (cash flow, pendapatan, biaya) dengan visualisasi      |
| FR-DB-03 | Operational Performance |     Tinggi    |            Dashboard harus menampilkan performa operasional (ketepatan waktu, volume, efisiensi)           |
| FR-DB-04 |     Customer Metrics    |     Sedang    |                 Dashboard harus menampilkan metrik pelanggan (akuisisi, retensi, kepuasan)                 |
| FR-DB-05 |        HR Metrics       |     Sedang    |                       Dashboard harus menampilkan metrik HR (produktivitas, turnover)                      |

#### **3.2.2 Dashboard Operasional**

# |          |                       |               |                                                                                           |
| :------: | :-------------------: | :-----------: | :---------------------------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**     | **Prioritas** |                                       **Deskripsi**                                       |
| FR-DB-06 | Daily Shipment Volume |     Tinggi    |              Dashboard harus menampilkan volume pengiriman harian dengan tren             |
| FR-DB-07 |  Pick-up Performance  |     Tinggi    |        Dashboard harus menampilkan performa pickup (on-time rate, waktu rata-rata)        |
| FR-DB-08 |  Delivery Performance |     Tinggi    | Dashboard harus menampilkan performa pengiriman (on-time rate, first-time-right delivery) |
| FR-DB-09 | Warehouse Utilization |     Sedang    |     Dashboard harus menampilkan utilisasi gudang (cross-dock efficiency, storage time)    |
| FR-DB-10 |   Fleet Performance   |     Sedang    |      Dashboard harus menampilkan performa armada (utilization rate, fuel efficiency)      |

#### **3.2.3 Dashboard Keuangan**

# |          |                  |               |                                                                                                   |
| :------: | :--------------: | :-----------: | :-----------------------------------------------------------------------------------------------: |
|  **ID**  |   **Kebutuhan**  | **Prioritas** |                                           **Deskripsi**                                           |
| FR-DB-11 | Revenue Tracking |     Tinggi    |   Dashboard harus menampilkan tracking pendapatan (per tipe layanan, segmen pelanggan, wilayah)   |
| FR-DB-12 |   Cost Analysis  |     Tinggi    | Dashboard harus menampilkan analisis biaya (fixed vs variable, cost per shipment, per departemen) |
| FR-DB-13 |  Working Capital |     Tinggi    |   Dashboard harus menampilkan metrik working capital (AR aging, AP aging, cash conversion cycle)  |
| FR-DB-14 |   Profitability  |     Tinggi    |              Dashboard harus menampilkan profitabilitas (gross margin, EBITDA margin)             |

#### **3.2.4 Dashboard Pelanggan**

# |          |                        |               |                                                                                                |
| :------: | :--------------------: | :-----------: | :--------------------------------------------------------------------------------------------: |
|  **ID**  |      **Kebutuhan**     | **Prioritas** |                                          **Deskripsi**                                         |
| FR-DB-15 |  Customer Acquisition  |     Sedang    |  Dashboard harus menampilkan metrik akuisisi pelanggan (pelanggan baru, cost per acquisition)  |
| FR-DB-16 |   Customer Retention   |     Sedang    |        Dashboard harus menampilkan metrik retensi pelanggan (retention rate, churn rate)       |
| FR-DB-17 |  Customer Satisfaction |     Sedang    |  Dashboard harus menampilkan metrik kepuasan pelanggan (NPS score, complaint resolution rate)  |
| FR-DB-18 | Customer Profitability |     Sedang    | Dashboard harus menampilkan profitabilitas per pelanggan (revenue per customer, cost to serve) |

#### **3.2.5 Dashboard HR**

# |          |                     |               |                                                                                                   |
| :------: | :-----------------: | :-----------: | :-----------------------------------------------------------------------------------------------: |
|  **ID**  |    **Kebutuhan**    | **Prioritas** |                                           **Deskripsi**                                           |
| FR-DB-19 |  Workforce Metrics  |     Sedang    |     Dashboard harus menampilkan metrik tenaga kerja (headcount per departemen, turnover rate)     |
| FR-DB-20 | Performance Metrics |     Sedang    |    Dashboard harus menampilkan metrik kinerja (KPI achievement rate, training completion rate)    |
| FR-DB-21 | Employee Engagement |     Rendah    | Dashboard harus menampilkan metrik keterlibatan karyawan (satisfaction score, participation rate) |

#### **3.2.6 Fitur Umum Dashboard**

# |          |                      |               |                                                                                                            |
| :------: | :------------------: | :-----------: | :--------------------------------------------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**    | **Prioritas** |                                                **Deskripsi**                                               |
| FR-DB-22 |       Filtering      |     Tinggi    | Semua dashboard harus mendukung filtering berdasarkan periode waktu, cabang, dan parameter relevan lainnya |
| FR-DB-23 |      Drill Down      |     Tinggi    |           Dashboard harus memungkinkan pengguna untuk drill down ke detail yang mendasari metrik           |
| FR-DB-24 |        Export        |     Sedang    |            Dashboard harus memungkinkan ekspor data dan visualisasi ke format umum (PDF, Excel)            |
| FR-DB-25 | Alert & Notification |     Sedang    |     Dashboard harus dapat mengirimkan alert dan notifikasi untuk KPI yang melanggar threshold tertentu     |

### **3.3 Modul Manajemen Cabang & Divisi**

#### **3.3.1 Manajemen Cabang**

# |          |                             |               |                                                                                                                                     |
| :------: | :-------------------------: | :-----------: | :---------------------------------------------------------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                                            **Deskripsi**                                                            |
| FR-CD-01 |      Pendaftaran Cabang     |     Tinggi    | Sistem harus memungkinkan administrator untuk mendaftarkan cabang baru dengan informasi detail (nama, alamat, kontak, area layanan) |
| FR-CD-02 |      Modifikasi Cabang      |     Tinggi    |                                     Administrator harus dapat mengubah informasi cabang yang ada                                    |
| FR-CD-03 | Nonaktifkan/Aktifkan Cabang |     Sedang    |                         Sistem harus memungkinkan administrator untuk mengaktifkan atau menonaktifkan cabang                        |
| FR-CD-04 |   Struktur Hierarki Cabang  |     Sedang    |                              Sistem harus mendukung struktur hierarki cabang (pusat, regional, cabang)                              |
| FR-CD-05 |        Profil Cabang        |     Sedang    |                    Sistem harus menyediakan tampilan profil detail cabang termasuk performa dan statistik cabang                    |

#### **3.3.2 Manajemen Divisi**

# |          |                             |               |                                                                                                                    |
| :------: | :-------------------------: | :-----------: | :----------------------------------------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                                    **Deskripsi**                                                   |
| FR-CD-06 |      Pendaftaran Divisi     |     Tinggi    | Sistem harus memungkinkan administrator untuk mendaftarkan divisi baru (Operasional, Administrasi, Keuangan, dll.) |
| FR-CD-07 |      Modifikasi Divisi      |     Tinggi    |                            Administrator harus dapat mengubah informasi divisi yang ada                            |
| FR-CD-08 | Nonaktifkan/Aktifkan Divisi |     Sedang    |                Sistem harus memungkinkan administrator untuk mengaktifkan atau menonaktifkan divisi                |
| FR-CD-09 |     Struktur Organisasi     |     Sedang    |                    Sistem harus mendukung visualisasi struktur organisasi per divisi dan cabang                    |

#### **3.3.3 Area Layanan**

# |          |                          |               |                                                                                                      |
| :------: | :----------------------: | :-----------: | :--------------------------------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**      | **Prioritas** |                                             **Deskripsi**                                            |
| FR-CD-10 | Pendaftaran Area Layanan |     Tinggi    | Sistem harus memungkinkan pendaftaran area layanan per cabang (provinsi, kota, kecamatan, kelurahan) |
| FR-CD-11 |  Modifikasi Area Layanan |     Tinggi    |                        Administrator harus dapat mengubah area layanan cabang                        |
| FR-CD-12 |  Verifikasi Area Layanan |     Tinggi    |     Sistem harus dapat memverifikasi apakah suatu alamat masuk dalam area layanan cabang tertentu    |
| FR-CD-13 |   Pemetaan Area Layanan  |     Sedang    |                     Sistem harus menampilkan pemetaan visual area layanan cabang                     |

#### **3.3.4 Mitra Forwarder**

# |          |                             |               |                                                                                               |
| :------: | :-------------------------: | :-----------: | :-------------------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                         **Deskripsi**                                         |
| FR-CD-14 | Pendaftaran Mitra Forwarder |     Tinggi    |           Sistem harus memungkinkan pendaftaran mitra forwarder dengan area layanan           |
| FR-CD-15 |  Modifikasi Mitra Forwarder |     Tinggi    |                  Administrator harus dapat mengubah informasi mitra forwarder                 |
| FR-CD-16 |  Nonaktifkan/Aktifkan Mitra |     Sedang    |      Sistem harus memungkinkan administrator untuk mengaktifkan atau menonaktifkan mitra      |
| FR-CD-17 |       Tarif Forwarder       |     Tinggi    |              Sistem harus dapat mengelola tarif pengiriman dengan mitra forwarder             |
| FR-CD-18 |     Routing ke Forwarder    |     Tinggi    | Sistem harus dapat menentukan apakah pengiriman ke tujuan tertentu memerlukan mitra forwarder |

### **3.4 Modul Manajemen Pegawai**

#### **3.4.1 Data Pegawai**

# |          |                              |               |                                                                                                                                    |
| :------: | :--------------------------: | :-----------: | :--------------------------------------------------------------------------------------------------------------------------------: |
|  **ID**  |         **Kebutuhan**        | **Prioritas** |                                                            **Deskripsi**                                                           |
| FR-MP-01 |      Pendaftaran Pegawai     |     Tinggi    | Sistem harus memungkinkan administrator untuk mendaftarkan pegawai baru dengan informasi detail (personal, kontak, posisi, cabang) |
| FR-MP-02 |    Modifikasi Data Pegawai   |     Tinggi    |                                Administrator dan HR harus dapat mengubah informasi pegawai yang ada                                |
| FR-MP-03 | Nonaktifkan/Aktifkan Pegawai |     Tinggi    |                        Sistem harus memungkinkan administrator untuk mengaktifkan atau menonaktifkan pegawai                       |
| FR-MP-04 |        Profil Pegawai        |     Sedang    |                     Sistem harus menyediakan tampilan profil detail pegawai termasuk riwayat posisi dan kinerja                    |
| FR-MP-05 | Pencarian dan Filter Pegawai |     Sedang    |                       Sistem harus memungkinkan pencarian dan filtering pegawai berdasarkan berbagai kriteria                      |

#### **3.4.2 Struktur Organisasi**

# |          |                                 |               |                                                                              |
| :------: | :-----------------------------: | :-----------: | :--------------------------------------------------------------------------: |
|  **ID**  |          **Kebutuhan**          | **Prioritas** |                                 **Deskripsi**                                |
| FR-MP-06 |         Manajemen Posisi        |     Tinggi    |   Sistem harus memungkinkan pendefinisian posisi dalam struktur organisasi   |
| FR-MP-07 |    Alokasi Pegawai ke Posisi    |     Tinggi    |      Administrator harus dapat mengalokasikan pegawai ke posisi tertentu     |
| FR-MP-08 |          Riwayat Posisi         |     Sedang    |        Sistem harus menyimpan riwayat posisi pegawai selama masa kerja       |
| FR-MP-09 | Visualisasi Struktur Organisasi |     Sedang    | Sistem harus menampilkan struktur organisasi dalam format visual (org chart) |

#### **3.4.3 Kehadiran dan Penugasan**

# |          |                      |               |                                                                                         |
| :------: | :------------------: | :-----------: | :-------------------------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**    | **Prioritas** |                                      **Deskripsi**                                      |
| FR-MP-10 | Pencatatan Kehadiran |     Tinggi    |  Sistem harus mendukung pencatatan kehadiran pegawai (hadir, tidak hadir, izin, sakit)  |
| FR-MP-11 |    Manajemen Shift   |     Sedang    |          Sistem harus mendukung pengaturan shift kerja untuk posisi operasional         |
| FR-MP-12 |       Penugasan      |     Tinggi    | Sistem harus memungkinkan penugasan pegawai untuk tugas spesifik (pickup, muat, lansir) |
| FR-MP-13 | Monitoring Kehadiran |     Sedang    |                  Supervisor harus dapat memonitor kehadiran tim mereka                  |
| FR-MP-14 |   Laporan Kehadiran  |     Sedang    |            Sistem harus menghasilkan laporan kehadiran untuk perhitungan upah           |

#### **3.4.4 Kinerja dan Evaluasi**

# |          |                           |               |                                                                                |
| :------: | :-----------------------: | :-----------: | :----------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**       | **Prioritas** |                                  **Deskripsi**                                 |
| FR-MP-15 |       KPI per Posisi      |     Sedang    |          Sistem harus mendukung pendefinisian KPI untuk setiap posisi          |
| FR-MP-16 |     Pencatatan Kinerja    |     Sedang    |         Supervisor harus dapat mencatat kinerja pegawai berdasarkan KPI        |
| FR-MP-17 |      Evaluasi Berkala     |     Rendah    | Sistem harus mendukung evaluasi kinerja berkala (bulanan, triwulanan, tahunan) |
| FR-MP-18 | Dashboard Kinerja Pegawai |     Rendah    |         Sistem harus menyediakan dashboard kinerja untuk setiap pegawai        |

### **3.5 Modul Pengambilan Barang (Pickup)**

#### **3.5.1 Permintaan Pickup**

# |          |                              |               |                                                                                                                                          |
| :------: | :--------------------------: | :-----------: | :--------------------------------------------------------------------------------------------------------------------------------------: |
|  **ID**  |         **Kebutuhan**        | **Prioritas** |                                                               **Deskripsi**                                                              |
| FR-PU-01 | Registrasi Permintaan Pickup |     Tinggi    | Customer Service harus dapat mendaftarkan permintaan pickup dari pelanggan dengan informasi detail (alamat, waktu, jenis barang, jumlah) |
| FR-PU-02 |     Validasi Area Layanan    |     Tinggi    |                               Sistem harus memvalidasi apakah alamat pickup masuk dalam area layanan cabang                              |
| FR-PU-03 |     Penugasan Tim Pickup     |     Tinggi    |                        Kepala Gudang harus dapat menugaskan tim pickup (supir dan kenek) untuk permintaan tertentu                       |
| FR-PU-04 |     Optimasi Rute Pickup     |     Sedang    |                                Sistem harus mengoptimalkan rute untuk beberapa pickup dalam satu penugasan                               |
| FR-PU-05 |     Pemberitahuan Pickup     |     Sedang    |                                 Sistem harus mengirimkan notifikasi ke tim pickup tentang penugasan baru                                 |

#### **3.5.2 Pelaksanaan Pickup**

# |          |                           |               |                                                                                                      |
| :------: | :-----------------------: | :-----------: | :--------------------------------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**       | **Prioritas** |                                             **Deskripsi**                                            |
| FR-PU-06 |  Konfirmasi Keberangkatan |     Tinggi    |              Tim pickup harus dapat mengkonfirmasi keberangkatan melalui aplikasi mobile             |
| FR-PU-07 |     Navigasi ke Lokasi    |     Sedang    |                      Aplikasi mobile harus menyediakan navigasi ke lokasi pickup                     |
| FR-PU-08 |  Update Status Real-time  |     Tinggi    | Tim pickup harus dapat memperbarui status pickup secara real-time (dalam perjalanan, tiba di lokasi) |
| FR-PU-09 | Konfirmasi Tiba di Lokasi |     Tinggi    |                   Tim pickup harus dapat mengkonfirmasi kedatangan di lokasi pickup                  |

#### **3.5.3 Verifikasi dan Dokumentasi Barang**

# |          |                             |               |                                                                                   |
| :------: | :-------------------------: | :-----------: | :-------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                   **Deskripsi**                                   |
| FR-PU-10 |      Verifikasi Barang      |     Tinggi    |  Tim pickup harus dapat memverifikasi jenis, jumlah, dan kondisi barang di lokasi |
| FR-PU-11 |       Dokumentasi Foto      |     Tinggi    |   Aplikasi mobile harus memungkinkan pengambilan foto barang sebagai dokumentasi  |
| FR-PU-12 |   Form Pengambilan Digital  |     Tinggi    |       Tim pickup harus dapat mengisi form pengambilan barang secara digital       |
| FR-PU-13 | Verifikasi Dokumen Pengirim |     Tinggi    | Tim pickup harus dapat memverifikasi dan scan dokumen dari pengirim (surat jalan) |
| FR-PU-14 |  Estimasi Berat dan Dimensi |     Tinggi    |         Tim pickup harus dapat mencatat estimasi berat dan dimensi barang         |

#### **3.5.4 Penyelesaian Pickup**

# |          |                                  |               |                                                                        |
| :------: | :------------------------------: | :-----------: | :--------------------------------------------------------------------: |
|  **ID**  |           **Kebutuhan**          | **Prioritas** |                              **Deskripsi**                             |
| FR-PU-15 |      Konfirmasi Pengambilan      |     Tinggi    |    Tim pickup harus dapat mengkonfirmasi pengambilan barang selesai    |
| FR-PU-16 | Update Status Perjalanan Kembali |     Tinggi    | Tim pickup harus dapat memperbarui status perjalanan kembali ke cabang |
| FR-PU-17 |     Konfirmasi Tiba di Cabang    |     Tinggi    |       Tim pickup harus dapat mengkonfirmasi kedatangan di cabang       |
| FR-PU-18 |      Serah Terima ke Checker     |     Tinggi    |  Sistem harus mencatat serah terima barang dari tim pickup ke checker  |
| FR-PU-19 |          Laporan Pickup          |     Sedang    |             Sistem harus menghasilkan laporan pickup harian            |

### **3.6 Modul Penjualan dan Pembuatan Resi**

#### **3.6.1 Data Pelanggan**

# |          |                             |               |                                                                                                        |
| :------: | :-------------------------: | :-----------: | :----------------------------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                              **Deskripsi**                                             |
| FR-PR-01 |    Pendaftaran Pelanggan    |     Tinggi    | Staff Penjualan harus dapat mendaftarkan pelanggan baru dengan informasi detail (nama, alamat, kontak) |
| FR-PR-02 |     Pencarian Pelanggan     |     Tinggi    |              Sistem harus memungkinkan pencarian cepat data pelanggan yang sudah terdaftar             |
| FR-PR-03 |  Modifikasi Data Pelanggan  |     Tinggi    |                    Staff Penjualan harus dapat mengubah informasi pelanggan yang ada                   |
| FR-PR-04 | Riwayat Transaksi Pelanggan |     Sedang    |                 Sistem harus menyimpan dan menampilkan riwayat transaksi per pelanggan                 |
| FR-PR-05 |     Segmentasi Pelanggan    |     Rendah    |     Sistem harus mendukung segmentasi pelanggan berdasarkan volume, nilai, dan frekuensi transaksi     |

#### **3.6.2 Pembuatan Resi/STT**

# |          |                             |               |                                                                                                               |
| :------: | :-------------------------: | :-----------: | :-----------------------------------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                                 **Deskripsi**                                                 |
| FR-PR-06 |    Input Data Pengiriman    |     Tinggi    |       Staff Penjualan harus dapat menginput data pengiriman detail (pengirim, penerima, barang, layanan)      |
| FR-PR-07 |       Validasi Tujuan       |     Tinggi    | Sistem harus memvalidasi apakah tujuan pengiriman masuk dalam area layanan langsung atau memerlukan forwarder |
| FR-PR-08 |   Kalkulasi Otomatis Biaya  |     Tinggi    |      Sistem harus menghitung biaya pengiriman secara otomatis berdasarkan berat, jarak, dan tipe layanan      |
| FR-PR-09 |   Penomoran Resi Otomatis   |     Tinggi    |             Sistem harus menghasilkan nomor resi/STT secara otomatis dengan format terstandarisasi            |
| FR-PR-10 | Pemilihan Metode Pembayaran |     Tinggi    |                     Staff Penjualan harus dapat memilih metode pembayaran (CASH, COD, CAD)                    |
| FR-PR-11 |       Pencetakan Resi       |     Tinggi    |                 Sistem harus memungkinkan pencetakan resi/STT dalam format standar (6 lembar)                 |
| FR-PR-12 |    Distribusi Elektronik    |     Sedang    |               Sistem harus mendukung distribusi elektronik resi ke pihak terkait (email, sistem)              |

#### **3.6.3 Pengelolaan Pembayaran**

# |          |                            |               |                                                                                       |
| :------: | :------------------------: | :-----------: | :-----------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**       | **Prioritas** |                                     **Deskripsi**                                     |
| FR-PR-13 | Penerimaan Pembayaran CASH |     Tinggi    |                  Sistem harus mencatat pembayaran CASH dari pelanggan                 |
| FR-PR-14 |       Pencatatan COD       |     Tinggi    |             Sistem harus mencatat pengiriman dengan metode pembayaran COD             |
| FR-PR-15 |       Pencatatan CAD       |     Tinggi    | Sistem harus mencatat pengiriman dengan metode pembayaran CAD dan tanggal jatuh tempo |
| FR-PR-16 |     Validasi Pembayaran    |     Tinggi    |      Sistem harus memvalidasi pembayaran dengan jumlah yang seharusnya dibayarkan     |
| FR-PR-17 |      Bukti Pembayaran      |     Sedang    |               Sistem harus menghasilkan bukti pembayaran untuk pelanggan              |

#### **3.6.4 Pelaporan Penjualan**

# |          |                               |               |                                                                        |
| :------: | :---------------------------: | :-----------: | :--------------------------------------------------------------------: |
|  **ID**  |         **Kebutuhan**         | **Prioritas** |                              **Deskripsi**                             |
| FR-PR-18 |    Laporan Penjualan Harian   |     Tinggi    |           Sistem harus menghasilkan laporan penjualan harian           |
| FR-PR-19 | Laporan per Metode Pembayaran |     Sedang    |    Sistem harus menghasilkan laporan penjualan per metode pembayaran   |
| FR-PR-20 |       Laporan per Tujuan      |     Sedang    |    Sistem harus menghasilkan laporan penjualan per tujuan pengiriman   |
| FR-PR-21 |     Rekonsiliasi Penjualan    |     Tinggi    | Sistem harus mendukung rekonsiliasi penjualan dengan kas yang diterima |
| FR-PR-22 |      Dashboard Penjualan      |     Sedang    |         Sistem harus menyediakan dashboard penjualan real-time         |

### **3.7 Modul Manajemen Kendaraan**

#### **3.7.1 Data Kendaraan**

# |          |                                |               |                                                                                                                      |
| :------: | :----------------------------: | :-----------: | :------------------------------------------------------------------------------------------------------------------: |
|  **ID**  |          **Kebutuhan**         | **Prioritas** |                                                     **Deskripsi**                                                    |
| FR-MK-01 |      Pendaftaran Kendaraan     |     Tinggi    | Sistem harus memungkinkan pendaftaran kendaraan baru dengan informasi detail (jenis, merek, nomor polisi, kapasitas) |
| FR-MK-02 |    Modifikasi Data Kendaraan   |     Tinggi    |                            Administrator harus dapat mengubah informasi kendaraan yang ada                           |
| FR-MK-03 | Nonaktifkan/Aktifkan Kendaraan |     Tinggi    |                Sistem harus memungkinkan administrator untuk mengaktifkan atau menonaktifkan kendaraan               |
| FR-MK-04 |   Alokasi Kendaraan ke Cabang  |     Tinggi    |                         Administrator harus dapat mengalokasikan kendaraan ke cabang tertentu                        |
| FR-MK-05 | Pencarian dan Filter Kendaraan |     Sedang    |               Sistem harus memungkinkan pencarian dan filtering kendaraan berdasarkan berbagai kriteria              |

#### **3.7.2 Pemeliharaan Kendaraan**

# |          |                           |               |                                                                                |
| :------: | :-----------------------: | :-----------: | :----------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**       | **Prioritas** |                                  **Deskripsi**                                 |
| FR-MK-06 |    Jadwal Pemeliharaan    |     Sedang    |         Sistem harus mendukung penjadwalan pemeliharaan rutin kendaraan        |
| FR-MK-07 |  Pencatatan Pemeliharaan  |     Sedang    |              Sistem harus mencatat riwayat pemeliharaan kendaraan              |
| FR-MK-08 |  Notifikasi Pemeliharaan  |     Rendah    | Sistem harus mengirimkan notifikasi untuk jadwal pemeliharaan yang akan datang |
| FR-MK-09 | Laporan Kondisi Kendaraan |     Sedang    |       Sistem harus memungkinkan pelaporan kondisi kendaraan oleh pengguna      |

#### **3.7.3 Penggunaan Kendaraan**

# |          |                       |               |                                                                                                 |
| :------: | :-------------------: | :-----------: | :---------------------------------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**     | **Prioritas** |                                          **Deskripsi**                                          |
| FR-MK-10 |   Booking Kendaraan   |     Tinggi    | Sistem harus memungkinkan booking kendaraan untuk tugas spesifik (pickup, lansir, antar cabang) |
| FR-MK-11 |  Pengemudi Kendaraan  |     Tinggi    |      Sistem harus mencatat pengemudi yang ditugaskan untuk kendaraan pada setiap penggunaan     |
| FR-MK-12 |     Log Penggunaan    |     Tinggi    |           Sistem harus mencatat log penggunaan kendaraan (waktu mulai, selesai, jarak)          |
| FR-MK-13 | Monitoring Penggunaan |     Sedang    |            Sistem harus menyediakan monitoring real-time status dan lokasi kendaraan            |
| FR-MK-14 |    Utilization Rate   |     Sedang    |                Sistem harus menghitung dan melaporkan tingkat utilisasi kendaraan               |

#### **3.7.4 Pengelolaan BBM dan Biaya**

# |          |                          |               |                                                                        |
| :------: | :----------------------: | :-----------: | :--------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**      | **Prioritas** |                              **Deskripsi**                             |
| FR-MK-15 | Pencatatan Pengisian BBM |     Sedang    | Sistem harus mencatat pengisian BBM kendaraan (tanggal, jumlah, biaya) |
| FR-MK-16 |     Biaya Operasional    |     Sedang    |            Sistem harus mencatat biaya operasional kendaraan           |
| FR-MK-17 |   Analisis Konsumsi BBM  |     Rendah    | Sistem harus menganalisis konsumsi BBM per kendaraan dan per pengemudi |
| FR-MK-18 |  Laporan Biaya Kendaraan |     Sedang    |          Sistem harus menghasilkan laporan biaya per kendaraan         |

### **3.8 Modul Muat & Langsir Barang**

#### **3.8.1 Penerimaan dan Pengecekan Barang**

# |          |                             |               |                                                                                  |
| :------: | :-------------------------: | :-----------: | :------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                   **Deskripsi**                                  |
| FR-ML-01 |      Penerimaan Barang      |     Tinggi    |     Checker harus dapat menerima dan memverifikasi barang dari pembawa barang    |
| FR-ML-02 |  Penimbangan dan Pengukuran |     Tinggi    |          Checker harus dapat menimbang dan mengukur barang secara akurat         |
| FR-ML-03 |      Verifikasi Dokumen     |     Tinggi    | Checker harus dapat memverifikasi dokumen barang (surat jalan, form pengambilan) |
| FR-ML-04 |   Pencatatan di Buku Induk  |     Tinggi    |    Sistem harus mencatat barang yang diterima di buku induk penerimaan digital   |
| FR-ML-05 | Validasi dengan Surat Jalan |     Tinggi    |    Sistem harus memvalidasi kesesuaian barang dengan informasi di surat jalan    |

#### **3.8.2 Pemuatan Barang (Muat)**

# |          |                          |               |                                                                              |
| :------: | :----------------------: | :-----------: | :--------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**      | **Prioritas** |                                 **Deskripsi**                                |
| FR-ML-06 | Form Muat Barang Digital |     Tinggi    |             Checker harus dapat membuat form muat barang digital             |
| FR-ML-07 |  Alokasi Barang ke Truk  |     Tinggi    |     Checker harus dapat mengalokasikan barang ke truk berdasarkan tujuan     |
| FR-ML-08 |    Penugasan Tim Muat    |     Tinggi    |       Kepala Gudang harus dapat menugaskan tim muat untuk truk tertentu      |
| FR-ML-09 |    Konfirmasi Pemuatan   |     Tinggi    |     Tim muat harus dapat mengkonfirmasi bahwa barang telah dimuat ke truk    |
| FR-ML-10 |      Optimasi Muatan     |     Sedang    | Sistem harus mengoptimalkan pemuatan barang berdasarkan kapasitas dan tujuan |

#### **3.8.3 Pengiriman Antar Cabang**

# |          |                             |               |                                                                              |
| :------: | :-------------------------: | :-----------: | :--------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                 **Deskripsi**                                |
| FR-ML-11 | Penghitungan Omzet per Truk |     Tinggi    |     Sistem harus menghitung omzet per truk berdasarkan barang yang dimuat    |
| FR-ML-12 | Validasi Ketercapaian Omzet |     Tinggi    |   Sistem harus memvalidasi apakah omzet truk telah mencapai target minimal   |
| FR-ML-13 |   Koordinasi Antar Cabang   |     Tinggi    |  Sistem harus memfasilitasi koordinasi antar cabang untuk konsolidasi muatan |
| FR-ML-14 |      Dokumen Pengiriman     |     Tinggi    | Sistem harus menghasilkan dokumen pengiriman (DMB, Laporan Kiriman per Truk) |
| FR-ML-15 |       Biaya Pengiriman      |     Tinggi    |             Sistem harus menghitung biaya pengiriman antar cabang            |
| FR-ML-16 |     Tracking Perjalanan     |     Sedang    |               Sistem harus melacak perjalanan truk antar cabang              |
| FR-ML-17 |   Konfirmasi Keberangkatan  |     Tinggi    |  Supir truk harus dapat mengkonfirmasi keberangkatan melalui aplikasi mobile |
| FR-ML-18 |   Update Status Real-time   |     Tinggi    |     Supir truk harus dapat memperbarui status perjalanan secara real-time    |

#### **3.8.4 Penerimaan di Cabang Tujuan**

# |          |                            |               |                                                                               |
| :------: | :------------------------: | :-----------: | :---------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**       | **Prioritas** |                                 **Deskripsi**                                 |
| FR-ML-19 |      Pemberitahuan ETA     |     Tinggi    |            Sistem harus memberitahu cabang tujuan tentang ETA truk            |
| FR-ML-20 |    Konfirmasi Kedatangan   |     Tinggi    |       Supir truk harus dapat mengkonfirmasi kedatangan di cabang tujuan       |
| FR-ML-21 |     Verifikasi Dokumen     |     Tinggi    |    Staff Lansir harus dapat memverifikasi kelengkapan dokumen yang diterima   |
| FR-ML-22 |      Verifikasi Barang     |     Tinggi    |      Checker cabang tujuan harus dapat memverifikasi barang yang diterima     |
| FR-ML-23 | Pencatatan Ketidaksesuaian |     Tinggi    | Sistem harus mencatat ketidaksesuaian antara dokumen dan barang yang diterima |
| FR-ML-24 |    Konfirmasi Penerimaan   |     Tinggi    |     Kepala Gudang cabang tujuan harus dapat mengkonfirmasi penerimaan truk    |

#### **3.8.5 Langsir ke Penerima**

# |          |                          |               |                                                                            |
| :------: | :----------------------: | :-----------: | :------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**      | **Prioritas** |                                **Deskripsi**                               |
| FR-ML-25 | Alokasi Barang ke Lansir |     Tinggi    | Checker harus dapat mengalokasikan barang ke mobil lansir berdasarkan area |
| FR-ML-26 |   Optimasi Rute Lansir   |     Sedang    |           Sistem harus mengoptimalkan rute lansir untuk efisiensi          |
| FR-ML-27 |      Dokumen Lansir      |     Tinggi    |      Sistem harus menghasilkan dokumen lansir untuk setiap pengiriman      |
| FR-ML-28 |   Penugasan Tim Lansir   |     Tinggi    |  Kepala Gudang harus dapat menugaskan tim lansir untuk pengiriman tertentu |
| FR-ML-29 |       Navigasi Rute      |     Sedang    |     Aplikasi mobile harus menyediakan navigasi rute lansir yang optimal    |
| FR-ML-30 |  Update Status Real-time |     Tinggi    |    Tim lansir harus dapat memperbarui status pengiriman secara real-time   |

#### **3.8.6 Penerimaan oleh Pelanggan**

# |          |                           |               |                                                                                   |
| :------: | :-----------------------: | :-----------: | :-------------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**       | **Prioritas** |                                   **Deskripsi**                                   |
| FR-ML-31 |    Verifikasi Penerima    |     Tinggi    |              Tim lansir harus dapat memverifikasi identitas penerima              |
| FR-ML-32 |   Konfirmasi Penerimaan   |     Tinggi    | Penerima harus dapat mengkonfirmasi penerimaan barang dengan tanda tangan digital |
| FR-ML-33 |      Dokumentasi Foto     |     Sedang    |     Aplikasi mobile harus memungkinkan pengambilan foto penerima dengan barang    |
| FR-ML-34 | Penanganan Pembayaran COD |     Tinggi    |            Tim lansir harus dapat menerima dan mencatat pembayaran COD            |
| FR-ML-35 |       Pencatatan CAD      |     Tinggi    |     Tim lansir harus dapat mencatat pengiriman CAD untuk penagihan selanjutnya    |
| FR-ML-36 |      Bukti Pengiriman     |     Tinggi    |               Sistem harus menghasilkan bukti pengiriman elektronik               |
| FR-ML-37 |  Update Status Pengiriman |     Tinggi    |           Sistem harus memperbarui status pengiriman menjadi "Terkirim"           |

### **3.9 Modul Retur**

#### **3.9.1 Pencatatan Retur**

# |          |                   |               |                                                                                                        |
| :------: | :---------------: | :-----------: | :----------------------------------------------------------------------------------------------------: |
|  **ID**  |   **Kebutuhan**   | **Prioritas** |                                              **Deskripsi**                                             |
| FR-RE-01 |   Inisiasi Retur  |     Tinggi    |               Tim lansir harus dapat menginisiasi retur ketika barang tidak dapat dikirim              |
| FR-RE-02 |    Alasan Retur   |     Tinggi    | Sistem harus mencatat alasan detail retur (penerima tidak ada, alamat tidak ditemukan, barang ditolak) |
| FR-RE-03 | Dokumentasi Retur |     Sedang    |                Aplikasi mobile harus memungkinkan dokumentasi kondisi dan situasi retur                |
| FR-RE-04 | Persetujuan Retur |     Sedang    |                   Kepala Gudang harus dapat menyetujui atau menolak permintaan retur                   |
| FR-RE-05 |  Notifikasi Retur |     Sedang    |                          Sistem harus mengirimkan notifikasi retur ke pengirim                         |

#### **3.9.2 Penanganan Barang Retur**

# |          |                           |               |                                                                       |
| :------: | :-----------------------: | :-----------: | :-------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**       | **Prioritas** |                             **Deskripsi**                             |
| FR-RE-06 |  Penerimaan Barang Retur  |     Tinggi    | Checker harus dapat menerima dan memverifikasi barang retur di gudang |
| FR-RE-07 | Pencatatan Kondisi Barang |     Tinggi    |               Sistem harus mencatat kondisi barang retur              |
| FR-RE-08 |  Penyimpanan Barang Retur |     Sedang    |    Sistem harus mencatat lokasi penyimpanan barang retur di gudang    |
| FR-RE-09 |   Pelabelan Barang Retur  |     Sedang    |       Sistem harus menghasilkan label khusus untuk barang retur       |
| FR-RE-10 |   Tracking Barang Retur   |     Sedang    |          Sistem harus melacak status dan lokasi barang retur          |

#### **3.9.3 Penyelesaian Retur**

# |          |                          |               |                                                                                                                  |
| :------: | :----------------------: | :-----------: | :--------------------------------------------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**      | **Prioritas** |                                                   **Deskripsi**                                                  |
| FR-RE-11 |     Opsi Penyelesaian    |     Tinggi    | Sistem harus mendukung berbagai opsi penyelesaian retur (pengiriman ulang, pengembalian ke pengirim, pemusnahan) |
| FR-RE-12 |   Persetujuan Pengirim   |     Sedang    |                        Sistem harus mencatat persetujuan pengirim untuk opsi penyelesaian                        |
| FR-RE-13 |     Pengiriman Ulang     |     Tinggi    |                     Sistem harus memfasilitasi pengiriman ulang barang retur dengan resi baru                    |
| FR-RE-14 | Pengembalian ke Pengirim |     Tinggi    |                         Sistem harus memfasilitasi pengembalian barang retur ke pengirim                         |
| FR-RE-15 | Dokumentasi Penyelesaian |     Sedang    |                                 Sistem harus mendokumentasikan penyelesaian retur                                |

#### **3.9.4 Laporan dan Analisis Retur**

# |          |                            |               |                                                                             |
| :------: | :------------------------: | :-----------: | :-------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**       | **Prioritas** |                                **Deskripsi**                                |
| FR-RE-16 |    Laporan Retur Harian    |     Sedang    |                Sistem harus menghasilkan laporan retur harian               |
| FR-RE-17 |   Analisis Penyebab Retur  |     Rendah    | Sistem harus menyediakan analisis penyebab retur untuk identifikasi masalah |
| FR-RE-18 |  Statistik Retur per Area  |     Rendah    |         Sistem harus menghasilkan statistik retur per area geografis        |
| FR-RE-19 | Statistik Retur per Alasan |     Rendah    |         Sistem harus menghasilkan statistik retur berdasarkan alasan        |
| FR-RE-20 |   Dampak Finansial Retur   |     Rendah    |             Sistem harus menghitung dampak finansial dari retur             |

### **3.10 Modul Penagihan**

#### **3.10.1 Manajemen Piutang**

# |          |                           |               |                                                                                                              |
| :------: | :-----------------------: | :-----------: | :----------------------------------------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**       | **Prioritas** |                                                 **Deskripsi**                                                |
| FR-PT-01 |   Pencatatan Piutang CAD  |     Tinggi    |              Sistem harus mencatat semua pengiriman dengan metode pembayaran CAD sebagai piutang             |
| FR-PT-02 |      Kategori Piutang     |     Tinggi    | Sistem harus mengkategorikan piutang berdasarkan usia (current, 1-30 hari, 31-60 hari, 61-90 hari, >90 hari) |
| FR-PT-03 |   Batas Kredit Pelanggan  |     Sedang    |                       Sistem harus mendukung penetapan batas kredit untuk pelanggan CAD                      |
| FR-PT-04 | Alert Piutang Jatuh Tempo |     Tinggi    |               Sistem harus memberikan alert untuk piutang yang mendekati atau telah jatuh tempo              |
| FR-PT-05 |    Rekonsiliasi Piutang   |     Tinggi    |                  Sistem harus mendukung rekonsiliasi piutang dengan pembayaran yang diterima                 |

#### **3.10.2 Penjadwalan Penagihan**

# |          |                                   |               |                                                                                   |
| :------: | :-------------------------------: | :-----------: | :-------------------------------------------------------------------------------: |
|  **ID**  |           **Kebutuhan**           | **Prioritas** |                                   **Deskripsi**                                   |
| FR-PT-06 |        Identifikasi Tagihan       |     Tinggi    |           Sistem harus mengidentifikasi tagihan yang siap untuk ditagih           |
| FR-PT-07 |     Pembuatan Jadwal Penagihan    |     Tinggi    |   Kepala Administrasi harus dapat membuat jadwal penagihan untuk Debt Collector   |
| FR-PT-08 |      Optimasi Rute Penagihan      |     Sedang    |      Sistem harus mengoptimalkan rute penagihan berdasarkan lokasi pelanggan      |
| FR-PT-09 | Alokasi Tagihan ke Debt Collector |     Tinggi    | Kepala Administrasi harus dapat mengalokasikan tagihan ke Debt Collector tertentu |
| FR-PT-10 |         Notifikasi Jadwal         |     Sedang    |       Sistem harus mengirimkan notifikasi jadwal penagihan ke Debt Collector      |

#### **3.10.3 Eksekusi Penagihan**

# |          |                            |               |                                                                                    |
| :------: | :------------------------: | :-----------: | :--------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**       | **Prioritas** |                                    **Deskripsi**                                   |
| FR-PT-11 |      Dokumen Penagihan     |     Tinggi    |        Sistem harus menghasilkan dokumen penagihan (invoice, daftar tagihan)       |
| FR-PT-12 |    Konfirmasi Kunjungan    |     Tinggi    |          Debt Collector harus dapat mengkonfirmasi kunjungan ke pelanggan          |
| FR-PT-13 | Pencatatan Hasil Kunjungan |     Tinggi    | Debt Collector harus dapat mencatat hasil kunjungan (berhasil, gagal, janji bayar) |
| FR-PT-14 |       Bukti Kunjungan      |     Sedang    |           Aplikasi mobile harus memungkinkan dokumentasi bukti kunjungan           |
| FR-PT-15 |    Penerimaan Pembayaran   |     Tinggi    |     Debt Collector harus dapat mencatat pembayaran yang diterima dari pelanggan    |

#### **3.10.4 Penyelesaian Penagihan**

# |          |                               |               |                                                                         |
| :------: | :---------------------------: | :-----------: | :---------------------------------------------------------------------: |
|  **ID**  |         **Kebutuhan**         | **Prioritas** |                              **Deskripsi**                              |
| FR-PT-16 |      Validasi Pembayaran      |     Tinggi    | Sistem harus memvalidasi pembayaran yang diterima dengan jumlah tagihan |
| FR-PT-17 |        Bukti Pembayaran       |     Tinggi    |        Sistem harus menghasilkan bukti pembayaran untuk pelanggan       |
| FR-PT-18 |     Update Status Piutang     |     Tinggi    |        Sistem harus memperbarui status piutang setelah pembayaran       |
| FR-PT-19 | Pencatatan Pembayaran Parsial |     Tinggi    |           Sistem harus mendukung pencatatan pembayaran parsial          |
| FR-PT-20 |    Laporan Hasil Penagihan    |     Tinggi    |         Sistem harus menghasilkan laporan hasil penagihan harian        |

#### **3.10.5 Eskalasi Piutang Bermasalah**

# |          |                                  |               |                                                                                               |
| :------: | :------------------------------: | :-----------: | :-------------------------------------------------------------------------------------------: |
|  **ID**  |           **Kebutuhan**          | **Prioritas** |                                         **Deskripsi**                                         |
| FR-PT-21 |  Identifikasi Piutang Bermasalah |     Sedang    |         Sistem harus mengidentifikasi piutang bermasalah berdasarkan usia dan riwayat         |
| FR-PT-22 |       Eskalasi ke Manajemen      |     Sedang    | Sistem harus memfasilitasi eskalasi piutang bermasalah ke tingkat manajemen yang lebih tinggi |
| FR-PT-23 | Pencatatan Tindakan Penyelesaian |     Sedang    |       Sistem harus mencatat tindakan yang diambil untuk penyelesaian piutang bermasalah       |
| FR-PT-24 |    Pengaturan Status Pelanggan   |     Sedang    |    Sistem harus mendukung pengaturan status kredit pelanggan berdasarkan riwayat pembayaran   |
| FR-PT-25 |    Laporan Piutang Bermasalah    |     Sedang    |              Sistem harus menghasilkan laporan piutang bermasalah untuk manajemen             |

### **3.11 Modul Keuangan dan Akuntansi**

#### **3.11.1 Manajemen Kas**

# |          |                         |               |                                                                                    |
| :------: | :---------------------: | :-----------: | :--------------------------------------------------------------------------------: |
|  **ID**  |      **Kebutuhan**      | **Prioritas** |                                    **Deskripsi**                                   |
| FR-KA-01 |   Pencatatan Kas Masuk  |     Tinggi    |        Kasir harus dapat mencatat semua kas masuk dengan detail sumber dana        |
| FR-KA-02 |  Pencatatan Kas Keluar  |     Tinggi    |        Kasir harus dapat mencatat semua kas keluar dengan detail penggunaan        |
| FR-KA-03 |  Validasi Transaksi Kas |     Tinggi    | Sistem harus memvalidasi transaksi kas (otorisasi, dokumentasi, kesesuaian jumlah) |
| FR-KA-04 |   Saldo Kas Real-time   |     Tinggi    |                    Sistem harus menampilkan saldo kas real-time                    |
| FR-KA-05 | Rekonsiliasi Kas Harian |     Tinggi    |     Sistem harus mendukung rekonsiliasi kas harian antara data sistem dan fisik    |
| FR-KA-06 |      Pelaporan Kas      |     Tinggi    |         Sistem harus menghasilkan laporan kas harian, mingguan, dan bulanan        |

#### **3.11.2 Manajemen Bank**

# |          |                           |               |                                                                           |
| :------: | :-----------------------: | :-----------: | :-----------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**       | **Prioritas** |                               **Deskripsi**                               |
| FR-KA-07 | Pencatatan Transaksi Bank |     Tinggi    | Sistem harus mencatat semua transaksi bank (setoran, penarikan, transfer) |
| FR-KA-08 |     Validasi Transfer     |     Tinggi    |            Sistem harus memvalidasi transfer bank yang diterima           |
| FR-KA-09 |     Rekonsiliasi Bank     |     Tinggi    |  Sistem harus mendukung rekonsiliasi transaksi bank dengan rekening koran |
| FR-KA-10 |     Multiple Akun Bank    |     Sedang    |           Sistem harus mendukung pengelolaan multiple akun bank           |
| FR-KA-11 |    Saldo Bank Real-time   |     Tinggi    |               Sistem harus menampilkan saldo bank real-time               |
| FR-KA-12 |       Pelaporan Bank      |     Tinggi    |              Sistem harus menghasilkan laporan transaksi bank             |

#### **3.11.3 Jurnal dan Buku Besar**

# |          |                       |               |                                                                        |
| :------: | :-------------------: | :-----------: | :--------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**     | **Prioritas** |                              **Deskripsi**                             |
| FR-KA-13 |   Chart of Accounts   |     Tinggi    |       Sistem harus mendukung pengelolaan chart of accounts (CoA)       |
| FR-KA-14 |    Jurnal Otomatis    |     Tinggi    | Sistem harus menghasilkan jurnal secara otomatis dari transaksi bisnis |
| FR-KA-15 |     Jurnal Manual     |     Tinggi    |       Akuntan harus dapat membuat jurnal manual untuk penyesuaian      |
| FR-KA-16 |    Validasi Jurnal    |     Tinggi    |            Sistem harus memvalidasi jurnal (debit = kredit)            |
| FR-KA-17 | Posting ke Buku Besar |     Tinggi    |      Sistem harus memposting jurnal ke buku besar secara otomatis      |
| FR-KA-18 |  Tutup Buku Periodik  |     Tinggi    |      Sistem harus mendukung proses tutup buku bulanan dan tahunan      |
| FR-KA-19 |      Audit Trail      |     Tinggi    |   Sistem harus menyimpan audit trail untuk semua transaksi akuntansi   |

#### **3.11.4 Laporan Keuangan**

# |          |                         |               |                                                                            |
| :------: | :---------------------: | :-----------: | :------------------------------------------------------------------------: |
|  **ID**  |      **Kebutuhan**      | **Prioritas** |                                **Deskripsi**                               |
| FR-KA-20 |          Neraca         |     Tinggi    |       Sistem harus menghasilkan neraca (bulanan, triwulanan, tahunan)      |
| FR-KA-21 |    Laporan Laba Rugi    |     Tinggi    | Sistem harus menghasilkan laporan laba rugi (bulanan, triwulanan, tahunan) |
| FR-KA-22 |     Laporan Arus Kas    |     Tinggi    |                 Sistem harus menghasilkan laporan arus kas                 |
| FR-KA-23 | Laporan Perubahan Modal |     Sedang    |              Sistem harus menghasilkan laporan perubahan modal             |
| FR-KA-24 |   Konsolidasi Laporan   |     Tinggi    |     Sistem harus mengkonsolidasikan laporan keuangan dari semua cabang     |
| FR-KA-25 |      Export Laporan     |     Sedang    |    Sistem harus memungkinkan ekspor laporan ke format umum (Excel, PDF)    |

#### **3.11.5 Manajemen Aset**

# |          |                                       |               |                                                                         |
| :------: | :-----------------------------------: | :-----------: | :---------------------------------------------------------------------: |
|  **ID**  |             **Kebutuhan**             | **Prioritas** |                              **Deskripsi**                              |
| FR-KA-26 |            Pendaftaran Aset           |     Sedang    | Sistem harus memungkinkan pendaftaran aset baru dengan informasi detail |
| FR-KA-27 |            Depresiasi Aset            |     Sedang    |         Sistem harus menghitung depresiasi aset secara otomatis         |
| FR-KA-28 | Pencatatan Penjualan/Penghapusan Aset |     Sedang    |          Sistem harus mencatat penjualan atau penghapusan aset          |
| FR-KA-29 |             Revaluasi Aset            |     Rendah    |                  Sistem harus mendukung revaluasi aset                  |
| FR-KA-30 |              Laporan Aset             |     Sedang    |                  Sistem harus menghasilkan laporan aset                 |

#### **3.11.6 Manajemen Pajak**

# |          |                    |               |                                                                   |
| :------: | :----------------: | :-----------: | :---------------------------------------------------------------: |
|  **ID**  |    **Kebutuhan**   | **Prioritas** |                           **Deskripsi**                           |
| FR-KA-31 |  Perhitungan Pajak |     Sedang    |       Sistem harus menghitung pajak yang relevan (PPh, PPN)       |
| FR-KA-32 |  Pencatatan Pajak  |     Sedang    |           Sistem harus mencatat transaksi terkait pajak           |
| FR-KA-33 |    Laporan Pajak   |     Sedang    | Sistem harus menghasilkan laporan pajak untuk keperluan pelaporan |
| FR-KA-34 | Rekonsiliasi Pajak |     Rendah    |             Sistem harus mendukung rekonsiliasi pajak             |

### **3.12 Modul HRD**

#### **3.12.1 Manajemen Data Karyawan**

# |          |                    |               |                                                                            |
| :------: | :----------------: | :-----------: | :------------------------------------------------------------------------: |
|  **ID**  |    **Kebutuhan**   | **Prioritas** |                                **Deskripsi**                               |
| FR-HR-01 |  Database Karyawan |     Tinggi    |              Sistem harus menyimpan database lengkap karyawan              |
| FR-HR-02 |   Profil Karyawan  |     Tinggi    |           Sistem harus menampilkan profil detail setiap karyawan           |
| FR-HR-03 |   Riwayat Jabatan  |     Sedang    |               Sistem harus menyimpan riwayat jabatan karyawan              |
| FR-HR-04 |  Dokumen Karyawan  |     Sedang    |    Sistem harus menyimpan dokumen penting karyawan (kontrak, sertifikat)   |
| FR-HR-05 | Pencarian Karyawan |     Sedang    | Sistem harus memungkinkan pencarian karyawan berdasarkan berbagai kriteria |

#### **3.12.2 Manajemen Kehadiran**

# |          |                       |               |                                                                                 |
| :------: | :-------------------: | :-----------: | :-----------------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**     | **Prioritas** |                                  **Deskripsi**                                  |
| FR-HR-06 |  Pencatatan Kehadiran |     Tinggi    | Sistem harus mencatat kehadiran karyawan (hadir, terlambat, absen, izin, sakit) |
| FR-HR-07 | Persetujuan Izin/Cuti |     Sedang    |             Sistem harus mendukung proses persetujuan izin dan cuti             |
| FR-HR-08 |  Kalkulasi Jam Kerja  |     Tinggi    |                    Sistem harus menghitung jam kerja efektif                    |
| FR-HR-09 |   Laporan Kehadiran   |     Tinggi    |        Sistem harus menghasilkan laporan kehadiran untuk perhitungan upah       |
| FR-HR-10 |  Dashboard Kehadiran  |     Sedang    |          Sistem harus menyediakan dashboard kehadiran untuk supervisors         |

#### **3.12.3 Penggajian dan Kompensasi**

# |          |                    |               |                                                                              |
| :------: | :----------------: | :-----------: | :--------------------------------------------------------------------------: |
|  **ID**  |    **Kebutuhan**   | **Prioritas** |                                 **Deskripsi**                                |
| FR-HR-11 |    Struktur Gaji   |     Tinggi    |     Sistem harus mendukung pendefinisian struktur gaji berdasarkan posisi    |
| FR-HR-12 |    Komponen Gaji   |     Tinggi    | Sistem harus mendukung multiple komponen gaji (gaji pokok, tunjangan, bonus) |
| FR-HR-13 |   Kalkulasi Upah   |     Tinggi    |        Sistem harus menghitung upah berdasarkan kehadiran dan kinerja        |
| FR-HR-14 |      Slip Gaji     |     Tinggi    |           Sistem harus menghasilkan slip gaji untuk setiap karyawan          |
| FR-HR-15 |   Pembayaran Gaji  |     Tinggi    |               Sistem harus mencatat pembayaran gaji ke karyawan              |
| FR-HR-16 | Laporan Penggajian |     Tinggi    |    Sistem harus menghasilkan laporan penggajian untuk keperluan akuntansi    |

#### **3.12.4 Manajemen Kinerja**

# |          |                      |               |                                                                |
| :------: | :------------------: | :-----------: | :------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**    | **Prioritas** |                          **Deskripsi**                         |
| FR-HR-17 |     Penetapan KPI    |     Sedang    |    Sistem harus mendukung penetapan KPI untuk setiap posisi    |
| FR-HR-18 |   Evaluasi Kinerja   |     Sedang    |   Sistem harus memfasilitasi proses evaluasi kinerja berkala   |
| FR-HR-19 |   Feedback Kinerja   |     Rendah    |        Sistem harus mendukung pemberian feedback kinerja       |
| FR-HR-20 | Rencana Pengembangan |     Rendah    | Sistem harus mendukung pembuatan rencana pengembangan karyawan |
| FR-HR-21 |    Laporan Kinerja   |     Sedang    |       Sistem harus menghasilkan laporan kinerja karyawan       |

#### **3.12.5 Pelatihan dan Pengembangan**

# |          |                       |               |                                                                 |
| :------: | :-------------------: | :-----------: | :-------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**     | **Prioritas** |                          **Deskripsi**                          |
| FR-HR-22 |   Katalog Pelatihan   |     Rendah    |         Sistem harus menyimpan katalog program pelatihan        |
| FR-HR-23 | Pendaftaran Pelatihan |     Rendah    | Sistem harus memfasilitasi pendaftaran karyawan untuk pelatihan |
| FR-HR-24 |  Pencatatan Pelatihan |     Rendah    |         Sistem harus mencatat riwayat pelatihan karyawan        |
| FR-HR-25 |   Evaluasi Pelatihan  |     Rendah    |      Sistem harus mendukung evaluasi efektivitas pelatihan      |
| FR-HR-26 |   Laporan Pelatihan   |     Rendah    |           Sistem harus menghasilkan laporan pelatihan           |

### **3.13 Modul Pelaporan**

#### **3.13.1 Laporan Operasional**

# |          |                             |               |                                                       |
| :------: | :-------------------------: | :-----------: | :---------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                     **Deskripsi**                     |
| FR-LP-01 |  Laporan Pengiriman Harian  |     Tinggi    |  Sistem harus menghasilkan laporan pengiriman harian  |
| FR-LP-02 |        Laporan Pickup       |     Tinggi    |   Sistem harus menghasilkan laporan aktivitas pickup  |
| FR-LP-03 |         Laporan Muat        |     Tinggi    |   Sistem harus menghasilkan laporan pemuatan barang   |
| FR-LP-04 |        Laporan Lansir       |     Tinggi    |  Sistem harus menghasilkan laporan lansir ke penerima |
| FR-LP-05 |        Laporan Retur        |     Tinggi    |     Sistem harus menghasilkan laporan barang retur    |
| FR-LP-06 |   Laporan Performa Cabang   |     Tinggi    |   Sistem harus menghasilkan laporan performa cabang   |
| FR-LP-07 | Laporan Utilisasi Kendaraan |     Sedang    | Sistem harus menghasilkan laporan utilisasi kendaraan |

#### **3.13.2 Laporan Keuangan**

# |          |                        |               |                                                                          |
| :------: | :--------------------: | :-----------: | :----------------------------------------------------------------------: |
|  **ID**  |      **Kebutuhan**     | **Prioritas** |                               **Deskripsi**                              |
| FR-LP-08 |   Laporan Pendapatan   |     Tinggi    | Sistem harus menghasilkan laporan pendapatan (harian, mingguan, bulanan) |
| FR-LP-09 |      Laporan Biaya     |     Tinggi    |            Sistem harus menghasilkan laporan biaya operasional           |
| FR-LP-10 |   Laporan Kas & Bank   |     Tinggi    |              Sistem harus menghasilkan laporan kas dan bank              |
| FR-LP-11 |     Laporan Piutang    |     Tinggi    |          Sistem harus menghasilkan laporan piutang dengan aging          |
| FR-LP-12 |      Laporan Pajak     |     Sedang    |          Sistem harus menghasilkan laporan untuk keperluan pajak         |
| FR-LP-13 |    Laporan Laba-Rugi   |     Tinggi    |                Sistem harus menghasilkan laporan laba-rugi               |
| FR-LP-14 | Laporan Profitabilitas |     Tinggi    |    Sistem harus menghasilkan laporan profitabilitas per layanan/cabang   |

#### **3.13.3 Laporan Pelanggan**

# |          |                                  |               |                                                                      |
| :------: | :------------------------------: | :-----------: | :------------------------------------------------------------------: |
|  **ID**  |           **Kebutuhan**          | **Prioritas** |                             **Deskripsi**                            |
| FR-LP-15 |    Laporan Akuisisi Pelanggan    |     Sedang    |       Sistem harus menghasilkan laporan akuisisi pelanggan baru      |
| FR-LP-16 |    Laporan Aktivitas Pelanggan   |     Sedang    | Sistem harus menghasilkan laporan aktivitas pengiriman per pelanggan |
| FR-LP-17 | Laporan Profitabilitas Pelanggan |     Sedang    |    Sistem harus menghasilkan laporan profitabilitas per pelanggan    |
| FR-LP-18 |    Laporan Perilaku Pembayaran   |     Sedang    |    Sistem harus menghasilkan laporan perilaku pembayaran pelanggan   |
| FR-LP-19 |     Laporan Keluhan Pelanggan    |     Sedang    |     Sistem harus menghasilkan laporan keluhan dan penyelesaiannya    |

#### **3.13.4 Laporan Manajemen**

# |          |                      |               |                                                                                |
| :------: | :------------------: | :-----------: | :----------------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**    | **Prioritas** |                                  **Deskripsi**                                 |
| FR-LP-20 |   Laporan Eksekutif  |     Tinggi    |            Sistem harus menghasilkan laporan ringkas untuk eksekutif           |
| FR-LP-21 |      Laporan KPI     |     Tinggi    |                Sistem harus menghasilkan laporan pencapaian KPI                |
| FR-LP-22 |     Laporan Tren     |     Sedang    |  Sistem harus menghasilkan laporan tren bisnis (bulanan, triwulanan, tahunan)  |
| FR-LP-23 |   Laporan Prediktif  |     Rendah    | Sistem harus menghasilkan laporan prediktif berdasarkan analisis data historis |
| FR-LP-24 | Laporan Benchmarking |     Rendah    |           Sistem harus menghasilkan laporan perbandingan antar cabang          |

#### **3.13.5 Generator Laporan Custom**

# |          |                     |               |                                                                            |
| :------: | :-----------------: | :-----------: | :------------------------------------------------------------------------: |
|  **ID**  |    **Kebutuhan**    | **Prioritas** |                                **Deskripsi**                               |
| FR-LP-25 |   Builder Laporan   |     Sedang    |    Sistem harus menyediakan builder laporan untuk membuat laporan custom   |
| FR-LP-26 |   Template Laporan  |     Sedang    |      Sistem harus mendukung pembuatan dan penyimpanan template laporan     |
| FR-LP-27 | Ekspor Multi-format |     Sedang    | Sistem harus mendukung ekspor laporan ke berbagai format (PDF, Excel, CSV) |
| FR-LP-28 | Penjadwalan Laporan |     Rendah    |             Sistem harus mendukung penjadwalan laporan otomatis            |
| FR-LP-29 |  Distribusi Laporan |     Rendah    |        Sistem harus mendukung distribusi laporan otomatis via email        |

### **3.14 Modul Tracking dan Monitoring**

#### **3.14.1 Pelacakan Pengiriman**

# |          |                           |               |                                                                                                                               |
| :------: | :-----------------------: | :-----------: | :---------------------------------------------------------------------------------------------------------------------------: |
|  **ID**  |       **Kebutuhan**       | **Prioritas** |                                                         **Deskripsi**                                                         |
| FR-TM-01 |       Pelacakan Resi      |     Tinggi    |                          Sistem harus memungkinkan pelacakan status pengiriman berdasarkan nomor resi                         |
| FR-TM-02 |     Status Pengiriman     |     Tinggi    | Sistem harus mengelola dan menampilkan berbagai status pengiriman (diterima, dalam proses, dalam perjalanan, terkirim, retur) |
| FR-TM-03 |    Timeline Pengiriman    |     Tinggi    |                          Sistem harus menampilkan timeline lengkap pengiriman dari awal hingga akhir                          |
| FR-TM-04 |     Lokasi Pengiriman     |     Sedang    |                                        Sistem harus menampilkan lokasi terakhir barang                                        |
| FR-TM-05 | Estimasi Waktu Pengiriman |     Sedang    |                                  Sistem harus menampilkan estimasi waktu pengiriman ke tujuan                                 |

#### **3.14.2 Monitoring Armada**

# |          |                      |               |                                                                                |
| :------: | :------------------: | :-----------: | :----------------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**    | **Prioritas** |                                  **Deskripsi**                                 |
| FR-TM-06 |   Lokasi Kendaraan   |     Sedang    |        Sistem harus melacak dan menampilkan lokasi kendaraan operasional       |
| FR-TM-07 |   Status Kendaraan   |     Sedang    | Sistem harus menampilkan status kendaraan (tersedia, dalam tugas, maintenance) |
| FR-TM-08 |    Monitoring Rute   |     Sedang    |               Sistem harus memonitor rute yang ditempuh kendaraan              |
| FR-TM-09 |     Alert Deviasi    |     Rendah    |        Sistem harus memberikan alert untuk deviasi rute yang signifikan        |
| FR-TM-10 | Monitoring Kecepatan |     Rendah    |                   Sistem harus memonitor kecepatan kendaraan                   |

#### **3.14.3 Monitoring Operasional**

# |          |                                 |               |                                                                              |
| :------: | :-----------------------------: | :-----------: | :--------------------------------------------------------------------------: |
|  **ID**  |          **Kebutuhan**          | **Prioritas** |                                 **Deskripsi**                                |
| FR-TM-11 |   Monitoring Kapasitas Gudang   |     Sedang    |             Sistem harus memonitor kapasitas dan utilisasi gudang            |
| FR-TM-12 |    Monitoring Antrian Barang    |     Sedang    |          Sistem harus memonitor antrian barang yang menunggu proses          |
| FR-TM-13 |       Monitoring Performa       |     Tinggi    | Sistem harus memonitor performa operasional real-time (volume, waktu proses) |
| FR-TM-14 |      Alert Kemacetan Proses     |     Sedang    |       Sistem harus memberikan alert untuk kemacetan proses operasional       |
| FR-TM-15 | Dashboard Operasional Real-time |     Tinggi    |           Sistem harus menyediakan dashboard operasional real-time           |

#### **3.14.4 Notifikasi dan Alert**

# |          |                             |               |                                                                                                 |
| :------: | :-------------------------: | :-----------: | :---------------------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**        | **Prioritas** |                                          **Deskripsi**                                          |
| FR-TM-16 | Notifikasi Perubahan Status |     Tinggi    |              Sistem harus mengirimkan notifikasi untuk perubahan status pengiriman              |
| FR-TM-17 |   Alert Problem Pengiriman  |     Tinggi    |                   Sistem harus memberikan alert untuk problem dalam pengiriman                  |
| FR-TM-18 |          Alert SLA          |     Tinggi    |         Sistem harus memberikan alert untuk pengiriman yang mendekati atau melampaui SLA        |
| FR-TM-19 |    Notifikasi Penerimaan    |     Tinggi    |                    Sistem harus mengirimkan notifikasi konfirmasi penerimaan                    |
| FR-TM-20 |        Eskalasi Alert       |     Sedang    | Sistem harus mendukung eskalasi alert ke level manajemen yang lebih tinggi jika tidak ditangani |

## **4. Kebutuhan Non-Fungsional**

### **4.1 Kebutuhan Performa**

# |          |                       |               |                                                                                                |
| :------: | :-------------------: | :-----------: | :--------------------------------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**     | **Prioritas** |                                          **Deskripsi**                                         |
| NF-PF-01 |     Waktu Respons     |     Tinggi    | Sistem harus merespons permintaan pengguna dalam waktu kurang dari 3 detik untuk 95% transaksi |
| NF-PF-02 | Waktu Loading Halaman |     Tinggi    |     Halaman web harus dimuat dalam waktu kurang dari 5 detik pada koneksi internet standard    |
| NF-PF-03 |       Throughput      |     Tinggi    |           Sistem harus mampu menangani minimal 100 transaksi per detik pada jam sibuk          |
| NF-PF-04 |       Konkurensi      |     Tinggi    |               Sistem harus mendukung minimal 500 pengguna aktif secara bersamaan               |
| NF-PF-05 |  Waktu Respons Mobile |     Tinggi    |       Aplikasi mobile harus merespons dalam waktu kurang dari 2 detik untuk 95% transaksi      |
| NF-PF-06 |   Performa Database   |     Tinggi    |        Query database harus diselesaikan dalam waktu kurang dari 1 detik untuk 95% query       |

### **4.2 Kebutuhan Keamanan**

# |          |                            |               |                                                                                                                |
| :------: | :------------------------: | :-----------: | :------------------------------------------------------------------------------------------------------------: |
|  **ID**  |        **Kebutuhan**       | **Prioritas** |                                                  **Deskripsi**                                                 |
| NF-KM-01 |         Autentikasi        |     Tinggi    |            Sistem harus menggunakan mekanisme autentikasi yang aman dengan password hashing dan salt           |
| NF-KM-02 |          Otorisasi         |     Tinggi    |    Sistem harus menerapkan Role-Based Access Control (RBAC) untuk membatasi akses ke fungsionalitas dan data   |
| NF-KM-03 |        Enkripsi Data       |     Tinggi    | Data sensitif harus dienkripsi dalam penyimpanan dan transmisi menggunakan algoritma enkripsi standar industri |
| NF-KM-04 |         Audit Trail        |     Tinggi    |        Sistem harus mencatat semua aktivitas pengguna yang signifikan dalam log yang tidak dapat diubah        |
| NF-KM-05 | Proteksi terhadap Serangan |     Tinggi    |                Sistem harus dilindungi dari serangan umum seperti SQL injection, XSS, CSRF, dll.               |
| NF-KM-06 |        Timeout Sesi        |     Tinggi    |                  Sesi pengguna harus otomatis berakhir setelah periode tidak aktif (30 menit)                  |
| NF-KM-07 |     Manajemen Password     |     Tinggi    |            Sistem harus menegakkan kebijakan password yang kuat dan proses reset password yang aman            |
| NF-KM-08 |       Pembatasan API       |     Sedang    |                            API harus dilindungi dengan autentikasi dan rate limiting                           |
| NF-KM-09 |     Backup dan Recovery    |     Tinggi    |                    Sistem harus mendukung backup terenkripsi dan prosedur recovery yang aman                   |
| NF-KM-10 |       Validasi Input       |     Tinggi    |                      Semua input pengguna harus divalidasi untuk mencegah serangan injeksi                     |

### **4.3 Kebutuhan Keandalan**

# |          |                    |               |                                                                                                                                         |
| :------: | :----------------: | :-----------: | :-------------------------------------------------------------------------------------------------------------------------------------: |
|  **ID**  |    **Kebutuhan**   | **Prioritas** |                                                              **Deskripsi**                                                              |
| NF-KD-01 |       Uptime       |     Tinggi    |                         Sistem harus memiliki uptime minimal 99.5% (tidak termasuk waktu pemeliharaan terjadwal)                        |
| NF-KD-02 |        MTTR        |     Tinggi    |                                Mean Time to Recovery (MTTR) harus kurang dari 2 jam untuk insiden kritis                                |
| NF-KD-03 |      Failover      |     Tinggi    |                                 Sistem harus memiliki mekanisme failover otomatis untuk komponen kritis                                 |
| NF-KD-04 |       Backup       |     Tinggi    |                                       Sistem harus melakukan backup otomatis minimal setiap 24 jam                                      |
| NF-KD-05 |  Disaster Recovery |     Tinggi    | Sistem harus memiliki rencana disaster recovery dengan RTO (Recovery Time Objective) < 4 jam dan RPO (Recovery Point Objective) < 1 jam |
| NF-KD-06 | Degradasi Graceful |     Sedang    |      Saat terjadi kegagalan parsial, sistem harus mengalami degradasi secara graceful, dengan fungsionalitas inti tetap beroperasi      |
| NF-KD-07 |     Monitoring     |     Tinggi    |                              Sistem harus memiliki monitoring proaktif untuk deteksi dini masalah potensial                             |
| NF-KD-08 |  Konsistensi Data  |     Tinggi    |                                  Sistem harus menjaga konsistensi data bahkan dalam skenario kegagalan                                  |

### **4.4 Kebutuhan Kompatibilitas**

# |          |                                   |               |                                                                                                                         |
| :------: | :-------------------------------: | :-----------: | :---------------------------------------------------------------------------------------------------------------------: |
|  **ID**  |           **Kebutuhan**           | **Prioritas** |                                                      **Deskripsi**                                                      |
| NF-KP-01 |       Kompatibilitas Browser      |     Tinggi    | Aplikasi web harus kompatibel dengan browser utama (Chrome, Firefox, Safari, Edge) versi terbaru dan 2 versi sebelumnya |
| NF-KP-02 |       Kompatibilitas Mobile       |     Tinggi    |                            Aplikasi mobile harus kompatibel dengan Android 9.0+ dan iOS 13.0+                           |
| NF-KP-03 |             Responsif             |     Tinggi    |          Aplikasi web harus responsif dan dapat digunakan pada berbagai ukuran layar (desktop, tablet, mobile)          |
| NF-KP-04 |       Kompatibilitas Printer      |     Sedang    |                          Sistem harus mendukung pencetakan pada berbagai jenis printer standar                          |
| NF-KP-05 |    Kompatibilitas Ekspor/Impor    |     Sedang    |                       Sistem harus mendukung ekspor/impor data ke format standar (Excel, CSV, PDF)                      |
| NF-KP-06 |         Kompatibilitas API        |     Sedang    |                              API harus mengikuti standar RESTful dan mendukung format JSON                              |
| NF-KP-07 | Kompatibilitas dengan Sistem Lama |     Sedang    |                             Sistem harus mendukung migrasi data dari sistem lama (jika ada)                             |

### **4.5 Kebutuhan Skalabilitas**

# |          |                         |               |                                                                                                          |
| :------: | :---------------------: | :-----------: | :------------------------------------------------------------------------------------------------------: |
|  **ID**  |      **Kebutuhan**      | **Prioritas** |                                               **Deskripsi**                                              |
| NF-SK-01 | Skalabilitas Horizontal |     Tinggi    | Sistem harus dapat discale secara horizontal dengan menambahkan server untuk menangani peningkatan beban |
| NF-SK-02 |  Skalabilitas Vertikal  |     Tinggi    |          Sistem harus dapat discale secara vertikal dengan meningkatkan resource server yang ada         |
| NF-SK-03 |     Pertumbuhan Data    |     Tinggi    |       Sistem harus mendukung pertumbuhan volume data hingga 100% per tahun tanpa degradasi performa      |
| NF-SK-04 |   Pertumbuhan Pengguna  |     Tinggi    |     Sistem harus mendukung pertumbuhan jumlah pengguna hingga 50% per tahun tanpa degradasi performa     |
| NF-SK-05 |  Pertumbuhan Transaksi  |     Tinggi    |    Sistem harus mendukung pertumbuhan volume transaksi hingga 100% per tahun tanpa degradasi performa    |
| NF-SK-06 |    Database Sharding    |     Sedang    |                           Database harus mendukung sharding untuk skalabilitas                           |
| NF-SK-07 |      Load Balancing     |     Tinggi    |            Sistem harus menggunakan load balancing untuk mendistribusikan beban secara efisien           |

### **4.6 Kebutuhan Usabilitas**

# |          |                      |               |                                                                                                        |
| :------: | :------------------: | :-----------: | :----------------------------------------------------------------------------------------------------: |
|  **ID**  |     **Kebutuhan**    | **Prioritas** |                                              **Deskripsi**                                             |
| NF-US-01 | Kemudahan Penggunaan |     Tinggi    | Antarmuka pengguna harus intuitif dan mudah digunakan oleh pengguna dengan kemampuan teknologi minimal |
| NF-US-02 |    Konsistensi UI    |     Tinggi    |    Antarmuka pengguna harus konsisten di seluruh sistem dalam hal layout, navigasi, dan terminologi    |
| NF-US-03 |       Efisiensi      |     Tinggi    |                  Tugas umum harus dapat diselesaikan dengan minimal langkah dan input                  |
| NF-US-04 |  Bantuan Kontekstual |     Sedang    |                   Sistem harus menyediakan bantuan kontekstual untuk fungsi kompleks                   |
| NF-US-05 |   Pencegahan Error   |     Tinggi    |   Sistem harus mencegah error pengguna melalui validasi input dan konfirmasi untuk tindakan berisiko   |
| NF-US-06 |    Pemulihan Error   |     Tinggi    |         Sistem harus menampilkan pesan error yang jelas dan memberikan petunjuk untuk pemulihan        |
| NF-US-07 |     Aksesibilitas    |     Sedang    |                   Aplikasi web harus memenuhi standar aksesibilitas WCAG 2.1 level AA                  |
| NF-US-08 |      Lokalisasi      |     Rendah    |              Sistem harus mendukung lokalisasi untuk minimal Bahasa Indonesia dan Inggris              |
| NF-US-09 | Dokumentasi Pengguna |     Sedang    |                  Sistem harus dilengkapi dengan dokumentasi pengguna yang komprehensif                 |
| NF-US-10 |       Shortcut       |     Rendah    |              Sistem harus menyediakan shortcut keyboard untuk fungsi yang sering digunakan             |

### **4.7 Kebutuhan Maintainability**

# |          |                    |               |                                                                                               |
| :------: | :----------------: | :-----------: | :-------------------------------------------------------------------------------------------: |
|  **ID**  |    **Kebutuhan**   | **Prioritas** |                                         **Deskripsi**                                         |
| NF-MT-01 |     Modularitas    |     Tinggi    | Sistem harus dibangun dengan arsitektur modular untuk memudahkan maintenance dan pengembangan |
| NF-MT-02 |  Konfigurabilitas  |     Tinggi    |             Parameter sistem utama harus dapat dikonfigurasi tanpa perubahan kode             |
| NF-MT-03 |     Testability    |     Tinggi    |                   Sistem harus dirancang untuk memudahkan pengujian otomatis                  |
| NF-MT-04 |    Code Quality    |     Tinggi    |                    Kode harus mengikuti standar kualitas dan best practices                   |
| NF-MT-05 | Dokumentasi Teknis |     Tinggi    |              Sistem harus dilengkapi dengan dokumentasi teknis yang komprehensif              |
| NF-MT-06 |     Versioning     |     Tinggi    |              Sistem harus menggunakan version control untuk kode dan dokumentasi              |
| NF-MT-07 |        CI/CD       |     Tinggi    |            Sistem harus mendukung Continuous Integration dan Continuous Deployment            |
| NF-MT-08 |       Logging      |     Tinggi    |                Sistem harus memiliki logging yang komprehensif untuk debugging                |
| NF-MT-09 |     Monitoring     |     Tinggi    |                   Sistem harus dapat dimonitor untuk performa dan kesehatan                   |
| NF-MT-10 |  API Documentation |     Tinggi    |       API harus didokumentasikan dengan baik menggunakan standar seperti Swagger/OpenAPI      |

## **5. Diagram dan Model**

### **5.1 Entity Relationship Diagram (ERD)**

# ERD Sistem ERP Samudra Paket terbagi menjadi beberapa bagian utama sesuai dengan domain fungsinya:

#### **5.1.1 ERD Modul Administrasi dan Manajemen**

# Entitas utama:* Users (ID, Username, Password, Role, Status, CreatedAt, UpdatedAt)

* Roles (ID, Name, Description, Permissions)

* Branches (ID, Name, Code, Address, Phone, Email, Status, RegionID)

* Regions (ID, Name, Description)

* Divisions (ID, Name, Description)

* Positions (ID, Name, DivisionID, Description)

* Employees (ID, EmployeeCode, Name, DOB, Gender, Address, Phone, Email, PositionID, BranchID, JoinDate, Status)

* ServiceAreas (ID, BranchID, Province, City, District, SubDistrict, PostalCode, Status)

* ForwarderPartners (ID, Name, Code, Address, Phone, Email, ContactPerson, Status)

* ForwarderAreas (ID, ForwarderID, Province, City, District, SubDistrict, PostalCode, Status)

* ForwarderRates (ID, ForwarderID, OriginArea, DestinationArea, Rate, MinWeight, Status)Relasi utama:* Users memiliki satu Role

* Employees ditempatkan di satu Branch

* Employees memiliki satu Position

* Positions termasuk dalam satu Division

* Branches memiliki banyak ServiceAreas

* ForwarderPartners memiliki banyak ForwarderAreas

* ForwarderPartners memiliki banyak ForwarderRates

#### **5.1.2 ERD Modul Operasional**

# Entitas utama:* Customers (ID, CustomerCode, Type, Name, Address, City, Phone, Email, ContactPerson, Status, CreatedAt, UpdatedAt)

* PickupRequests (ID, RequestCode, CustomerID, PickupAddress, ContactName, ContactPhone, ScheduledTime, Status, Notes, CreatedBy, CreatedAt, UpdatedAt)

* PickupAssignments (ID, RequestID, VehicleID, DriverID, HelperID, Status, StartTime, EndTime, Notes, CreatedAt, UpdatedAt)

* PickupItems (ID, AssignmentID, Description, Quantity, EstimatedWeight, Notes, Status)

* ReceiptMaster (ID, ReceiptNo, BranchID, ReceivedFrom, ReceivedDate, TotalItems, TotalWeight, Status, CreatedBy, CreatedAt, UpdatedAt)

* ShipmentOrders (ID, WaybillNo, SenderID, SenderName, SenderAddress, SenderPhone, ReceiverName, ReceiverAddress, ReceiverPhone, OriginBranchID, DestinationBranchID, ServiceType, PaymentType, ItemDescription, Quantity, Weight, Volume, Amount, Status, CreatedBy, CreatedAt, UpdatedAt)

* LoadingForm (ID, LoadingNo, VehicleID, DriverID, HelperID, OriginBranchID, DestinationBranchID, LoadingDate, TotalItems, TotalWeight, Status, CreatedBy, CreatedAt, UpdatedAt)

* LoadingItems (ID, LoadingFormID, WaybillID, Status)

* Shipments (ID, ShipmentNo, VehicleID, DriverID, HelperID, OriginBranchID, DestinationBranchID, DepartureDate, EstimatedArrival, ActualArrival, Status, Notes, CreatedBy, CreatedAt, UpdatedAt)

* DeliveryOrders (ID, DeliveryNo, VehicleID, DriverID, HelperID, BranchID, DeliveryDate, TotalItems, Status, CreatedBy, CreatedAt, UpdatedAt)

* DeliveryItems (ID, DeliveryOrderID, WaybillID, Status, DeliveryResult, Notes)

* Returns (ID, ReturnNo, WaybillID, ReturnDate, ReturnReason, ReturnType, Status, Notes, CreatedBy, CreatedAt, UpdatedAt)

* Vehicles (ID, VehicleNo, Type, Brand, Model, Capacity, BranchID, Status, LastMaintenance, NextMaintenance, CreatedAt, UpdatedAt)Relasi utama:* PickupRequests dibuat oleh Customers

* PickupAssignments menggunakan Vehicles dan ditugaskan kepada Employees (Driver dan Helper)

* PickupItems terkait dengan PickupAssignments

* ShipmentOrders memiliki pengirim dan penerima

* ShipmentOrders berasal dari OriginBranch dan ditujukan ke DestinationBranch

* LoadingForm terkait dengan Vehicles dan Employees

* LoadingItems terhubung dengan LoadingForm dan ShipmentOrders

* Shipments menggunakan Vehicles dan ditugaskan kepada Employees

* DeliveryOrders menggunakan Vehicles dan ditugaskan kepada Employees

* DeliveryItems terhubung dengan DeliveryOrders dan ShipmentOrders

* Returns terkait dengan ShipmentOrders

#### **5.1.3 ERD Modul Keuangan**

# Entitas utama:* ChartOfAccounts (ID, AccountCode, AccountName, AccountType, Description, IsActive, CreatedAt, UpdatedAt)

* Journals (ID, JournalNo, JournalDate, Description, Reference, TotalDebit, TotalCredit, Status, CreatedBy, CreatedAt, UpdatedAt)

* JournalEntries (ID, JournalID, AccountID, Debit, Credit, Description)

* Payments (ID, PaymentNo, PaymentDate, CustomerID, WaybillID, PaymentType, Amount, ReferenceNo, Status, CreatedBy, CreatedAt, UpdatedAt)

* Expenses (ID, ExpenseNo, ExpenseDate, ExpenseType, BranchID, Amount, Description, ApprovedBy, Status, CreatedBy, CreatedAt, UpdatedAt)

* CashReceipts (ID, ReceiptNo, ReceiptDate, FromID, FromType, Amount, Description, PaymentMethod, ReferenceNo, CreatedBy, CreatedAt, UpdatedAt)

* CashDisbursements (ID, DisbursementNo, DisbursementDate, ToID, ToType, Amount, Description, PaymentMethod, ReferenceNo, ApprovedBy, Status, CreatedBy, CreatedAt, UpdatedAt)

* Receivables (ID, InvoiceNo, CustomerID, WaybillID, Amount, DueDate, Status, CreatedBy, CreatedAt, UpdatedAt)

* Collections (ID, CollectionNo, CollectionDate, InvoiceID, CollectedBy, Amount, Status, Notes, CreatedBy, CreatedAt, UpdatedAt)

* Assets (ID, AssetNo, AssetName, Category, PurchaseDate, PurchaseAmount, DepreciationMethod, UsefulLife, SalvageValue, CurrentValue, Status, CreatedBy, CreatedAt, UpdatedAt)

* DepreciationSchedule (ID, AssetID, DepreciationDate, DepreciationAmount, BookValue)Relasi utama:* JournalEntries terkait dengan Journals

* JournalEntries menggunakan ChartOfAccounts

* Payments terkait dengan Customers dan ShipmentOrders

* Expenses terkait dengan Branches

* Receivables terkait dengan Customers dan ShipmentOrders

* Collections terkait dengan Receivables dan ditugaskan kepada Employees

* DepreciationSchedule terkait dengan Assets

#### **5.1.4 ERD Modul HRD**

# Entitas utama:* Employees (shared with Administration Module)

* Attendance (ID, EmployeeID, Date, TimeIn, TimeOut, Status, Notes, CreatedBy, CreatedAt, UpdatedAt)

* Leaves (ID, EmployeeID, LeaveType, StartDate, EndDate, TotalDays, Reason, Status, ApprovedBy, CreatedAt, UpdatedAt)

* Payrolls (ID, PayrollNo, EmployeeID, Period, BasicSalary, Allowance, Deductions, NetSalary, PaymentDate, Status, CreatedBy, CreatedAt, UpdatedAt)

* Performance (ID, EmployeeID, ReviewPeriod, ReviewerID, Rating, Strengths, Weaknesses, Recommendations, Status, CreatedAt, UpdatedAt)

* Training (ID, TrainingName, Description, Trainer, StartDate, EndDate, Status, CreatedBy, CreatedAt, UpdatedAt)

* TrainingParticipants (ID, TrainingID, EmployeeID, Status, Score, Feedback)Relasi utama:* Attendance terkait dengan Employees

* Leaves diajukan oleh Employees

* Payrolls terkait dengan Employees

* Performance terkait dengan Employees (reviewed employee) dan Employees (reviewer)

* TrainingParticipants terkait dengan Training dan Employees

### **5.2 Diagram Alur Kerja (Workflow)**

# Berikut ini adalah diagram alur kerja utama dalam Sistem ERP Samudra Paket:

#### **5.2.1 Workflow Pengambilan Barang (Pickup)**

# 1. Customer Service menerima permintaan pickup dari pelanggan

2. Sistem memvalidasi area layanan

3. Kepala Gudang menugaskan tim pickup

4. Tim pickup menyiapkan kendaraan dan uang operasional

5. Tim pickup menuju lokasi pelanggan

6. Tim pickup memverifikasi dan mendokumentasikan barang

7. Tim pickup mengisi form pengambilan digital

8. Tim pickup kembali ke cabang

9. Tim pickup menyerahkan barang ke checker

10. Checker menerima dan memverifikasi barang

#### **5.2.2 Workflow Pemrosesan Barang di Cabang Pengirim**

# 1. Checker menerima barang dari tim pickup atau pengirim langsung

2. Checker menimbang dan mengukur barang

3. Checker memverifikasi dokumen (surat jalan)

4. Jika berat tidak sesuai, checker koordinasi dengan pengirim

5. Checker mencatat di buku induk penerimaan digital

6. Checker membuat form muat barang digital

7. Checker menyerahkan dokumen ke staff penjualan

8. Staff penjualan menginput data pengiriman

9. Staff penjualan menghitung biaya pengiriman

10. Staff penjualan mencatat metode pembayaran (CASH, COD, CAD)

11. Staff penjualan mencetak resi/STT

12. Jika pembayaran CASH, staff penjualan menerima pembayaran

#### **5.2.3 Workflow Pengiriman Antar Cabang**

# 1. Checker mengalokasikan barang ke truk berdasarkan tujuan

2. Team muat menyusun barang di truk

3. Checker menghitung omzet per truk

4. Jika omzet memenuhi target, Kepala Gudang dan Kepala Cabang menyetujui keberangkatan

5. Jika omzet tidak memenuhi target, koordinasi dengan cabang lain untuk konsolidasi

6. Staff Administrasi membuat dokumen pengiriman (DMB, Laporan Kiriman per Truk)

7. Kasir mengeluarkan biaya pengiriman

8. Sopir truk menerima dokumen dan biaya

9. Kepala Gudang memerintahkan pengecekan kendaraan

10. Truk berangkat ke cabang tujuan

11. Sopir truk memberikan update status perjalanan

#### **5.2.4 Workflow Penerimaan di Cabang Tujuan**

# 1. Sopir truk mengkonfirmasi kedatangan di cabang tujuan

2. Sopir truk menyerahkan dokumen ke Staff Lansir

3. Staff Lansir memverifikasi kelengkapan dokumen

4. Checker cabang tujuan memverifikasi kondisi truk

5. Checker cabang tujuan membandingkan barang dengan dokumen

6. Jika ada ketidaksesuaian, Staff Lansir koordinasi dengan cabang pengirim

7. Kepala Gudang cabang tujuan menyetujui pembongkaran

8. Team bongkar menurunkan barang

#### **5.2.5 Workflow Lansir ke Penerima**

# 1. Checker mengalokasikan barang ke mobil lansir berdasarkan area

2. Team muat memuat barang ke mobil lansir

3. Staff Lansir membuat dokumen lansir

4. Tim lansir memverifikasi barang dengan dokumen

5. Kepala Gudang menyetujui keberangkatan lansir

6. Tim lansir menuju lokasi penerima

7. Tim lansir memverifikasi penerima

8. Penerima memeriksa barang dan menandatangani bukti penerimaan

9. Jika pembayaran COD, tim lansir menerima pembayaran

10. Jika pembayaran CAD, tim lansir mencatat untuk penagihan selanjutnya

11. Tim lansir kembali ke cabang

12. Tim lansir menyerahkan bukti penerimaan dan pembayaran COD ke Staff Lansir

13. Staff Lansir memperbarui status pengiriman

#### **5.2.6 Workflow Penagihan CAD**

# 1. Staff Administrasi mengidentifikasi tagihan CAD yang jatuh tempo

2. Kepala Administrasi membuat jadwal penagihan

3. Debt Collector menerima daftar tagihan

4. Debt Collector mengunjungi pelanggan

5. Debt Collector mencatat hasil kunjungan

6. Jika pembayaran diterima, Debt Collector mencatat pembayaran

7. Jika pembayaran tidak diterima, Debt Collector mencatat alasan dan janji bayar

8. Debt Collector kembali ke cabang

9. Debt Collector menyerahkan hasil penagihan ke Kasir

10. Kasir memverifikasi dan mencatat pembayaran

11. Staff Administrasi memperbarui status piutang

### **5.3 Use Case Diagram**

# Use Case Diagram Sistem ERP Samudra Paket terbagi menjadi beberapa kelompok berdasarkan aktor utama:

#### **5.3.1 Use Case Manajemen Pusat**

# Aktor: Direktur Utama, Manager Keuangan, Manager Administrasi, Manager Operasional, Manager HRD, Manager MarketingUse Case:* Melihat dashboard eksekutif

* Mengelola struktur organisasi

* Mengelola cabang dan divisi

* Menyetujui anggaran

* Mengelola kebijakan perusahaan

* Memonitor kinerja cabang

* Menganalisis laporan konsolidasi

* Mengambil keputusan strategis

#### **5.3.2 Use Case Kepala Cabang**

# Aktor: Kepala CabangUse Case:* Melihat dashboard cabang

* Mengelola operasional cabang

* Menyetujui keberangkatan truk

* Menyelesaikan masalah operasional

* Menganalisis kinerja cabang

* Menyetujui pengeluaran biaya

* Koordinasi dengan cabang lain

* Mengelola staf cabang

#### **5.3.3 Use Case Operasional Gudang**

# Aktor: Kepala Gudang, Checker, Team Muat/Lansir, Supir, KenekUse Case:* Mengelola penerimaan barang

* Memverifikasi dan menimbang barang

* Mengalokasikan barang ke truk

* Membuat form muat barang

* Memonitor pemuatan dan pembongkaran

* Mengelola pengiriman antar cabang

* Mengelola lansir ke penerima

* Mengelola retur

* Memonitor armada kendaraan

#### **5.3.4 Use Case Administrasi Cabang**

# Aktor: Kepala Administrasi, Staff Penjualan, Staff Administrasi, Kasir, Debt Collector, Staff LansirUse Case:* Mengelola data pelanggan

* Membuat resi/STT

* Menghitung biaya pengiriman

* Mencatat pembayaran

* Membuat dokumen pengiriman

* Mengelola dokumen lansir

* Mengelola piutang dan penagihan

* Mencatat transaksi kas dan bank

* Membuat jurnal harian

* Membuat laporan keuangan cabang

#### **5.3.5 Use Case Aplikasi Mobile**

# Aktor: Checker Mobile, Supir Mobile, Debt Collector MobileUse Case:* Login/logout mobile

* Menerima tugas pickup

* Memverifikasi dan mendokumentasikan barang

* Mengisi form digital

* Memperbarui status pengiriman

* Mengkonfirmasi penerimaan barang

* Mencatat pembayaran COD

* Mengelola penagihan

* Melacak lokasi dan rute

### **5.4 Diagram Arsitektur Sistem**

# Arsitektur Sistem ERP Samudra Paket mengadopsi pendekatan multi-tier dengan komponen berikut:

#### **5.4.1 Tier Presentasi**

# - Web Frontend: Aplikasi Next.js dengan React

- Mobile Frontend: Aplikasi React Native (Expo)

#### **5.4.2 Tier API dan Middleware**

# - API Gateway: Mengelola akses ke layanan backend

- RESTful API Services: Diimplementasikan dengan Node.js dan Express.js

- Authentication Service: Mengelola autentikasi dan otorisasi

- Notification Service: Mengelola notifikasi dan alert

- File Service: Mengelola upload dan penyimpanan file

#### **5.4.3 Tier Bisnis**

# Modul-modul aplikasi yang mengimplementasikan logika bisnis:* Modul Autentikasi dan Otorisasi

* Modul Administrasi

* Modul Operasional

* Modul Keuangan

* Modul HRD

* Modul Pelaporan

* Modul Tracking dan Monitoring

#### **5.4.4 Tier Data**

# - Database: MongoDB dengan Mongoose ORM

- Cache: Redis untuk caching data

- File Storage: Untuk dokumen dan gambar

- Backup System: Untuk backup rutin dan recovery

#### **5.4.5 Tier Integrasi Eksternal**

# - Payment Gateway Adapter

- Maps Service Adapter

- Forwarder System Adapter

#### **5.4.6 Infrastruktur**

# - Load Balancer

- Application Servers

- Database Servers

- Cache Servers

- Storage Servers

- Backup Servers

- Monitoring and Logging

- CI/CD Pipeline

## **6. Antarmuka Eksternal**

### **6.1 Antarmuka Pengguna**

#### **6.1.1 Antarmuka Web**

# Aplikasi web akan dikembangkan dengan prinsip-prinsip desain berikut:* **Responsif**: Aplikasi akan responsif dan dapat diakses dari berbagai ukuran layar (desktop, tablet, mobile).

* **Intuitif**: Navigasi dan alur kerja akan dirancang secara intuitif untuk memudahkan penggunaan.

* **Konsisten**: Elemen UI, warna, dan terminologi akan konsisten di seluruh aplikasi.

* **Efisien**: Layout akan dirancang untuk meminimalkan klik dan input untuk tugas-tugas umum.Komponen UI utama:* Sidebar navigasi

* Dashboard dengan widget dan chart

* Form dengan validasi

* Tabel data dengan sorting, filtering, dan pagination

* Modal dialog untuk aksi cepat

* Notification panel

* Breadcrumbs untuk navigasi

* Search global

#### **6.1.2 Antarmuka Mobile**

# Aplikasi mobile akan fokus pada tugas-tugas operasional lapangan:* **Sederhana**: UI yang sederhana dan tidak mengganggu konsentrasi pengguna di lapangan.

* **Offline-first**: Mendukung mode offline dengan sinkronisasi saat terhubung kembali.

* **Integrasi Perangkat**: Memanfaatkan fitur perangkat seperti kamera, GPS, dan notifikasi.

* **Efisien Bandwidth**: Meminimalkan penggunaan data untuk operasi di area dengan koneksi terbatas.Komponen UI utama:* Bottom navigation

* Task list

* Form sederhana dengan validasi

* Camera integration untuk dokumentasi

* Barcode/QR scanner

* Signature pad untuk tanda tangan digital

* Maps dan navigasi

* Notification center

* Offline indicator

### **6.2 Antarmuka Hardware**

# Sistem ERP Samudra Paket akan berinteraksi dengan hardware berikut:* **Printer Thermal**: Untuk mencetak resi/STT, label, dan bukti transaksi.

* **Printer Standard**: Untuk mencetak laporan dan dokumen.

* **Barcode Scanner**: Untuk scanning resi dan dokumen.

* **Timbangan Digital**: Untuk menimbang barang dengan akurasi tinggi.

* **Perangkat Mobile**: Smartphone atau tablet untuk aplikasi mobile.

* **GPS Tracker**: Untuk tracking lokasi kendaraan.

* **Fingerprint Scanner**: Untuk absensi pegawai (opsional).Spesifikasi minimal perangkat:* **Printer Thermal**: Lebar kertas 80mm, resolusi 203 dpi, kecepatan cetak 150mm/s.

* **Barcode Scanner**: Mampu membaca code 1D dan 2D, koneksi USB atau Bluetooth.

* **Timbangan Digital**: Kapasitas hingga 100kg, akurasi 0.1kg, output digital.

* **Perangkat Mobile**: Android 9.0+, RAM 3GB+, Kamera 8MP+, GPS, 4G.

* **GPS Tracker**: Akurasi 5-10m, update interval 1-5 menit, baterai tahan 24 jam.

### **6.3 Antarmuka Software**

# Sistem ERP Samudra Paket akan berinteraksi dengan software dan layanan eksternal berikut:

#### **6.3.1 Payment Gateway**

# - **Protokol**: REST API over HTTPS

- **Format Data**: JSON

- **Autentikasi**: API Key + Secret

- **Fungsionalitas**: Proses pembayaran, verifikasi pembayaran, refund

- **Provider Potensial**: Midtrans, Xendit, Doku

#### **6.3.2 Maps dan Routing Service**

# - **Protokol**: REST API over HTTPS

- **Format Data**: JSON

- **Autentikasi**: API Key

- **Fungsionalitas**: Geocoding, reverse geocoding, route planning, distance matrix

- **Provider Potensial**: Google Maps API, Mapbox, HERE Maps

#### **6.3.3 SMS/Email Gateway**

# - **Protokol**: REST API over HTTPS

- **Format Data**: JSON

- **Autentikasi**: API Key + Secret

- **Fungsionalitas**: Pengiriman SMS dan email notifikasi

- **Provider Potensial**: Twilio, SendGrid, Mailgun

#### **6.3.4 Sistem Forwarder/Mitra**

# - **Protokol**: REST API over HTTPS atau File Exchange

- **Format Data**: JSON atau XML

- **Autentikasi**: API Key atau credentials

- **Fungsionalitas**: Permintaan tarif, pembuatan order, tracking pengiriman

- **Integrasi**: Custom per mitra forwarder

### **6.4 Antarmuka Komunikasi**

# Sistem ERP Samudra Paket akan menggunakan protokol komunikasi berikut:* **HTTPS**: Untuk semua komunikasi antara client dan server

* **WebSocket**: Untuk notifikasi real-time dan update status

* **4G/LTE**: Untuk komunikasi aplikasi mobile di lapangan

* **Wi-Fi**: Untuk komunikasi intranet di kantor dan gudangSpesifikasi keamanan komunikasi:* **TLS 1.2+**: Untuk enkripsi komunikasi

* **Certificate Pinning**: Untuk aplikasi mobile

* **API Rate Limiting**: Untuk mencegah abuse

* **JWT**: Untuk autentikasi API

* **CORS Policy**: Untuk mengatur akses dari domain eksternal

## **7. Prioritas Kebutuhan**

### **7.1 Matriks Prioritas**

# Prioritas kebutuhan dalam Sistem ERP Samudra Paket ditentukan berdasarkan faktor-faktor berikut:1) **Dampak Bisnis**: Seberapa besar dampak fitur terhadap operasional bisnis

2) **Urgensi**: Seberapa mendesak fitur diperlukan

3) **Kompleksitas**: Tingkat kesulitan implementasi

4) **Ketergantungan**: Apakah fitur menjadi prasyarat untuk fitur lainBerdasarkan faktor-faktor tersebut, prioritas kebutuhan dibagi menjadi:* **Tinggi**: Fitur kritis yang harus diimplementasikan pada fase awal

* **Sedang**: Fitur penting yang dapat diimplementasikan pada fase kedua

* **Rendah**: Fitur "nice-to-have" yang dapat diimplementasikan pada fase akhir

### **7.2 Prioritas Pengembangan**

# Berikut adalah prioritas pengembangan berdasarkan modul:

#### **7.2.1 Fase 1: Foundation (Bulan 1-2)**

# Fitur-fitur dasar dan infrastruktur yang menjadi pondasi sistem:1) **Modul Autentikasi dan Otorisasi**:

   - Manajemen pengguna

   - Login/logout

   - Role-Based Access Control (RBAC)

   - Audit trail

2) **Modul Manajemen Cabang & Divisi**:

   - Pendaftaran cabang

   - Struktur organisasi

   - Area layanan

   - Mitra forwarder

3) **Modul Manajemen Pegawai**:

   - Data pegawai

   - Struktur organisasi

   - Kehadiran dasar

4) **Infrastruktur Dasar**:

   - Database setup

   - API foundation

   - CI/CD pipeline

   - Environment (dev, staging, prod)

#### **7.2.2 Fase 2: Operasional Inti (Bulan 3-4)**

# Fitur-fitur operasional inti yang menjadi tulang punggung bisnis:1) **Modul Pengambilan Barang (Pickup)**:

   - Permintaan pickup

   - Penugasan tim

   - Verifikasi barang

   - Form pengambilan digital

2) **Modul Penjualan dan Pembuatan Resi**:

   - Data pelanggan

   - Pembuatan resi/STT

   - Kalkulasi biaya

   - Metode pembayaran

3) **Modul Muat & Langsir Barang**:

   - Pemuatan barang

   - Pengiriman antar cabang

   - Penerimaan di cabang tujuan

   - Langsir ke penerima

4) **Modul Tracking dan Monitoring**:

   - Pelacakan pengiriman

   - Status real-time

   - Notifikasi perubahan status

#### **7.2.3 Fase 3: Keuangan dan Pelaporan (Bulan 5-6)**

# Fitur-fitur keuangan dan pelaporan untuk manajemen:1) **Modul Keuangan dan Akuntansi**:

   - Manajemen kas

   - Jurnal dan buku besar

   - Laporan keuangan

   - Manajemen aset

2) **Modul Penagihan**:

   - Manajemen piutang

   - Penjadwalan penagihan

   - Eksekusi penagihan

   - Eskalasi piutang bermasalah

3) **Modul Pelaporan**:

   - Laporan operasional

   - Laporan keuangan

   - Laporan pelanggan

   - Laporan manajemen

4) **Modul Dashboard**:

   - Dashboard eksekutif

   - Dashboard operasional

   - Dashboard keuangan

   - Dashboard pelanggan dan HR

#### **7.2.4 Fase 4: Mobile App (Bulan 7)**

# Aplikasi mobile untuk operasional lapangan:1) **Mobile untuk Checker**:

   - Verifikasi barang

   - Dokumentasi foto

   - Form digital

   - Alokasi barang

2) **Mobile untuk Supir**:

   - Navigasi rute

   - Update status

   - Konfirmasi pengiriman

   - Penerimaan pembayaran COD

3) **Mobile untuk Debt Collector**:

   - Daftar penagihan

   - Pencatatan hasil kunjungan

   - Bukti pembayaran

   - Optimasi rute

#### **7.2.5 Fase 5: Optimasi dan Penyempurnaan (Bulan 8)**

# Optimasi, integrasi, dan fitur tambahan:1) **Modul Retur**:

   - Pencatatan retur

   - Penanganan barang retur

   - Penyelesaian retur

   - Analisis retur

2) **Modul HRD**:

   - Penggajian dan kompensasi

   - Manajemen kinerja

   - Pelatihan dan pengembangan

3) **Integrasi**:

   - Payment gateway

   - Maps service

   - SMS/Email gateway

   - Sistem forwarder

4) **Optimasi**:

   - Performa sistem

   - User experience

   - Mobile experience

   - Reporting engine

## **8. Lampiran**

### **8.1 Contoh Format Dokumen**

#### **8.1.1 Format Resi/STT**

# Resi/STT terdiri dari 6 lembar dengan format yang sama namun warna berbeda:1) Lembar 1 (Putih): Resi Asli untuk metode pembayaran CASH/COD/CAD

2) Lembar 2 (Merah): Resi untuk pelanggan pengirim dengan metode pembayaran COD

3) Lembar 3 (Kuning): Resi untuk pelanggan pengirim dengan metode pembayaran CAD

4) Lembar 4 (Hijau): Arsip Cabang Pengirim

5) Lembar 5 (Biru): Arsip Cabang Penerima

6) Lembar 6 (Pink): Arsip PusatInformasi pada Resi/STT:* Nomor Resi/STT

* Tanggal

* Cabang Pengirim dan Tujuan

* Data Pengirim (Nama, Alamat, Telepon)

* Data Penerima (Nama, Alamat, Telepon)

* Detail Barang (Deskripsi, Jumlah, Berat, Volume)

* Biaya Pengiriman

* Metode Pembayaran

* Kode Penerus (jika ada)

* Barcode/QR Code

#### **8.1.2 Format Form Pengambilan Barang**

# Form Pengambilan Barang berisi:* Nomor Pengambilan (Pickup ID)

* Tanggal Pengambilan

* Nama Supir dan Kenek

* Data Pengirim (Nama, Alamat, Telepon)

* Data Penerima (Nama, Alamat, Telepon)

* Detail Barang (Deskripsi, Jumlah, Berat Estimasi)

* Kondisi Barang

* Foto Barang (di aplikasi mobile)

* Tanda Tangan Pengirim

* Barcode/QR Code

#### **8.1.3 Format Daftar Muat Barang (DMB)**

# DMB berisi:* Nomor Muat

* Nomor Rit (Nomor Keberangkatan Truk)

* Tanggal

* Data Kendaraan (Nomor Polisi, Jenis)

* Data Supir dan Kenek

* Nomor Kontak

* Daftar Barang:

  - Nomor Resi/STT

  - Nama Pengirim

  - Nama Penerima

  - Jumlah Colly

  - Jumlah Item

  - Berat

  - Status

* Total Barang (Colly dan Item)

* Barcode/QR Code

#### **8.1.4 Format Dokumen Lansir**

# Dokumen Lansir berisi:* Nomor Lansir

* Tanggal

* Data Kendaraan (Nomor Polisi, Jenis)

* Data Supir dan Kenek

* Daftar Barang:

  - Nomor Resi/STT

  - Nama Penerima

  - Alamat Penerima

  - Telepon Penerima

  - Jumlah Colly

  - Jumlah Item

  - Metode Pembayaran

  - Jumlah COD (jika ada)

  - Status

* Total Barang dan Total COD

* Barcode/QR Code

### **8.2 Mockup Antarmuka**

# Mockup antarmuka akan disediakan sebagai lampiran terpisah, mencakup:

#### **8.2.1 Mockup Web Application**

# - Login Page

- Dashboard

- Halaman Manajemen Cabang & Divisi

- Halaman Manajemen Pegawai

- Halaman Permintaan Pickup

- Halaman Pembuatan Resi

- Halaman Muat Barang

- Halaman Lansir

- Halaman Tracking

- Halaman Keuangan

- Halaman Penagihan

- Halaman Pelaporan

#### **8.2.2 Mockup Mobile Application**

# - Login Mobile

- Dashboard Mobile

- Halaman Tugas Pickup

- Halaman Form Pengambilan

- Halaman Verifikasi Barang

- Halaman Update Status

- Halaman Konfirmasi Pengiriman

- Halaman Penagihan

- Halaman Tracking

#### **8.2.3 Mockup Laporan**

# - Format Dashboard Eksekutif

- Format Laporan Operasional

- Format Laporan Keuangan

- Format Laporan Pelanggan

- Format Laporan Kinerja

## **Daftar Kebutuhan Functional Requirements Pelaku Utama**

# Berikut adalah daftar kebutuhan fungsional berdasarkan pelaku utama sistem untuk memudahkan pemahaman perspektif pengguna:

### **Direktur Utama/Owner (Super User)**

# 1. Mengakses dashboard eksekutif dengan KPI dan metrik utama perusahaan

2. Melihat laporan konsolidasi seluruh cabang

3. Memonitor kinerja dan profitabilitas semua cabang

4. Mengakses laporan keuangan perusahaan

5. Menganalisis tren dan forecasting bisnis

6. Melakukan persetujuan kebijakan dan anggaran

### **Manager Keuangan**

# 1. Memonitor arus kas perusahaan

2. Menganalisis laporan keuangan konsolidasi

3. Memantau piutang dan usianya

4. Mengelola akun dan struktur keuangan

5. Mengakses dashboard keuangan dengan analitik mendalam

6. Melakukan persetujuan pengeluaran besar

### **Manager Administrasi**

# 1. Mengelola standar prosedur administrasi

2. Memonitor administrasi seluruh cabang

3. Mengakses laporan administrasi dan dokumentasi

4. Mengevaluasi kinerja administrasi cabang

5. Mengelola struktur organisasi administrasi

### **Manager Operasional**

# 1. Memonitor operasional seluruh cabang

2. Menganalisis efisiensi operasional

3. Mengakses dashboard operasional real-time

4. Mengevaluasi KPI operasional

5. Mengelola standar operasional prosedur

6. Mengoptimasi alokasi sumber daya

### **Manager HRD**

# 1. Mengelola struktur organisasi perusahaan

2. Menganalisis kebutuhan SDM

3. Mengevaluasi kinerja karyawan

4. Mengelola program pelatihan dan pengembangan

5. Mengakses laporan SDM dan analytics

### **Manager Marketing**

# 1. Menganalisis performa layanan dan produk

2. Memonitor akuisisi dan retensi pelanggan

3. Menganalisis profitabilitas per segmen pelanggan

4. Mengelola program promosi dan harga

5. Mengakses laporan kepuasan pelanggan

### **Kepala Cabang**

# 1. Mengelola operasional cabang secara keseluruhan

2. Memonitor kinerja operasional dan keuangan cabang

3. Menyetujui keberangkatan truk antar cabang

4. Mengakses dashboard cabang dengan KPI utama

5. Menyelesaikan masalah operasional cabang

6. Berkoordinasi dengan cabang lain

### **Kepala Gudang**

# 1. Mengelola operasional gudang

2. Mengalokasikan tim untuk tugas operasional

3. Memonitor inventori barang di gudang

4. Menyetujui pemuatan barang ke truk

5. Mengelola armada kendaraan

6. Menyelesaikan masalah operasional gudang

### **Kepala Administrasi**

# 1. Mengelola administrasi cabang

2. Memonitor transaksi keuangan cabang

3. Mengelola piutang dan penagihan

4. Mengakses laporan administrasi cabang

5. Menyiapkan laporan untuk kantor pusat

6. Mengelola dokumentasi dan arsip

### **Checker**

# 1. Memverifikasi barang yang diterima

2. Menimbang dan mengukur barang

3. Mencatat detail barang di sistem

4. Mengalokasikan barang ke truk

5. Membuat form muat barang

6. Memverifikasi barang yang dikirim

### **Staff Penjualan**

# 1. Membuat resi/STT untuk pengiriman

2. Menghitung biaya pengiriman

3. Mencatat metode pembayaran

4. Mengelola data pelanggan

5. Menerima pembayaran CASH

6. Mencetak dokumen pengiriman

### **Kasir**

# 1. Menerima dan mencatat pembayaran

2. Mengeluarkan biaya operasional

3. Mencatat transaksi kas dan bank

4. Membuat jurnal harian

5. Melakukan rekonsiliasi kas

6. Menyiapkan laporan keuangan harian

### **Debt Collector**

# 1. Menerima daftar penagihan

2. Mengunjungi pelanggan untuk penagihan

3. Mencatat hasil kunjungan

4. Menerima pembayaran dari pelanggan

5. Memberikan bukti pembayaran

6. Melaporkan hasil penagihan

### **Supir (Pickup, Lansir, Antar Cabang)**

# 1. Menerima tugas pengambilan atau pengiriman

2. Mengkonfirmasi keberangkatan dan kedatangan

3. Memperbarui status pengiriman real-time

4. Memverifikasi barang dengan dokumen

5. Menerima pembayaran COD (untuk lansir)

6. Melakukan serah terima barang

### **Team Muat/Lansir**

# 1. Memuat dan membongkar barang

2. Menyusun barang di kendaraan dengan optimal

3. Memverifikasi barang dengan dokumen

4. Mengamankan barang selama transportasi

5. Membantu proses serah terima barang

6. Mendokumentasikan kondisi barang

## **Rekomendasi Strategi Implementasi**

# Untuk memastikan implementasi sistem ERP Samudra Paket berjalan sukses, berikut adalah rekomendasi strategi implementasi:

### **Strategi Pengembangan**

# 1. **Pendekatan Agile**

   - Menggunakan metodologi Scrum dengan sprint 2 minggu

   - Fokus pada MVP (Minimum Viable Product) untuk setiap fase

   - Daily standup untuk koordinasi tim pengembangan

   - Sprint review dan retrospective untuk perbaikan berkelanjutan

2. **Pengembangan Bertahap**

   - Implementasi berdasarkan prioritas modul yang telah ditetapkan

   - Setiap fase diikuti dengan periode stabilisasi

   - Integrasi kontinu antar modul

   - Deployment ke lingkungan staging sebelum production

3. **Continuous Integration/Continuous Deployment (CI/CD)**

   - Implementasi pipeline CI/CD untuk otomatisasi build, test, dan deployment

   - Code review mandatori sebelum merge ke branch utama

   - Automated testing (unit test, integration test, end-to-end test)

   - Blue-green deployment untuk meminimalkan downtime

### **Migrasi Data**

# 1. **Analisis Data**

   - Identifikasi semua sumber data yang ada

   - Analisis kualitas dan struktur data

   - Pemetaan data dari sistem lama ke sistem baru

   - Identifikasi data yang perlu dibersihkan atau dinormalisasi

2. **Strategi Migrasi**

   - Migrasi bertahap sesuai dengan deployment modul

   - Validasi data sebelum dan sesudah migrasi

   - Pengujian dengan subset data sebelum migrasi penuh

   - Backup data lama sebelum migrasi

3. **Verifikasi dan Validasi**

   - Pengecekan integritas data pasca migrasi

   - Rekonsiliasi data antara sistem lama dan baru

   - UAT dengan data yang telah dimigrasi

   - Periode paralel untuk sistem lama dan baru

### **Pelatihan Pengguna**

# 1. **Strategi Pelatihan**

   - Pelatihan berjenjang sesuai dengan role pengguna

   - Train-the-trainer untuk key users yang akan menjadi champion di cabang

   - Kombinasi pelatihan kelas dan hands-on

   - Pelatihan modul sesuai dengan deployment

2. **Materi Pelatihan**

   - Manual pengguna per role

   - Video tutorial untuk tugas-tugas umum

   - Knowledge base untuk troubleshooting

   - Skenario simulasi untuk praktek

3. **Dukungan Pasca Pelatihan**

   - Helpdesk untuk periode transisi

   - Pendampingan on-site di cabang utama

   - Refreshment training setelah periode awal

   - Forum untuk berbagi best practices

### **Manajemen Perubahan**

# 1. **Komunikasi**

   - Pemetaan stakeholder dan strategi komunikasi

   - Sosialisasi berkala tentang kemajuan proyek

   - Demo sistem untuk membangun excitement

   - Transparansi tentang timeline dan ekspektasi

2. **Keterlibatan Pengguna**

   - Melibatkan key users dalam UAT dan feedback

   - Identifikasi dan pemberdayaan champion di setiap cabang

   - Forum diskusi untuk mendapatkan input dan saran

   - Penghargaan untuk adopsi sistem dan feedback konstruktif

3. **Manajemen Resistensi**

   - Identifikasi awal sumber potensial resistensi

   - Strategi spesifik untuk mengatasi resistensi

   - Komunikasi manfaat personal dan organisasional

   - Quick wins untuk membangun kepercayaan

### **Go-Live dan Stabilisasi**

# 1. **Checklist Go-Live**

   - Acceptance criteria untuk setiap modul

   - Verifikasi kesiapan infrastruktur

   - Verifikasi kesiapan pengguna

   - Rencana contingency dan rollback

2. **Deployment**

   - Timeline deployment per cabang dan modul

   - Strategi cutover dari sistem lama ke baru

   - Monitoring intensif pasca deployment

   - On-site support selama periode kritis

3. **Stabilisasi**

   - Periode stabilisasi 2-4 minggu per fase

   - Resolusi cepat untuk issues kritis

   - Fine-tuning performa dan UX

   - Dokumentasi lessons learned untuk fase berikutnya

4. **Evaluasi Pasca Implementasi**

   - Pengukuran terhadap metrics awal

   - Feedback terstruktur dari pengguna

   - Analisis ROI dan business value

   - Perencanaan untuk enhancement berikutnya

## **Risiko dan Mitigasi**

# Berikut adalah risiko utama dalam implementasi Sistem ERP Samudra Paket beserta rencana mitigasinya:|        |                                                       |            |                  |                                                                                                                                                                           |
| :----: | :---------------------------------------------------: | :--------: | :--------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| **No** |                       **Risiko**                      | **Dampak** | **Probabilitas** |                                                                           **Strategi Mitigasi**                                                                           |
|    1   |        Resistensi pengguna terhadap sistem baru       |   Tinggi   |      Tinggi      |                 - Pelatihan komprehensif\<br>- Komunikasi manfaat\<br>- Keterlibatan key users sejak awal\<br>- Periode transisi dengan dukungan intensif                 |
|    2   | Konektivitas internet tidak stabil di beberapa cabang |   Tinggi   |      Tinggi      | - Fitur offline mode di aplikasi mobile\<br>- Caching data untuk operasi dasar\<br>- Optimasi bandwidth aplikasi\<br>- Rekomendasi upgrade infrastruktur di cabang kritis |
|    3   |     Kualitas data dari sistem lama tidak konsisten    |   Sedang   |      Tinggi      |                 - Analisis dan pembersihan data awal\<br>- Validasi data sebelum migrasi\<br>- Migrasi bertahap\<br>- Verifikasi manual untuk data kritis                 |
|    4   |            Scope creep selama pengembangan            |   Tinggi   |      Sedang      |                        - Proses manajemen perubahan ketat\<br>- Prioritisasi kebutuhan yang jelas\<br>- Time-boxed development\<br>- Fokus pada MVP                       |
|    5   |      Integrasi dengan sistem eksternal bermasalah     |   Sedang   |      Sedang      |                  - Proof of concept awal\<br>- Pengujian integrasi menyeluruh\<br>- Fallback manual untuk proses kritis\<br>- Dokumentasi API yang detail                 |
|    6   |       Performa sistem tidak memenuhi ekspektasi       |   Tinggi   |      Sedang      |                         - Load testing sejak awal\<br>- Monitoring performa ongoing\<br>- Desain arsitektur yang skalabel\<br>- Optimasi database                         |
|    7   |          Biaya implementasi melebihi anggaran         |   Tinggi   |      Sedang      |                                - Monitoring biaya ketat\<br>- Prioritisasi fitur (MoSCoW)\<br>- Buffer anggaran 15-20%\<br>- Pendekatan MVP                               |
|    8   |             Timeline implementasi tertunda            |   Tinggi   |      Sedang      |                 - Manajemen proyek agile\<br>- Buffer waktu untuk setiap fase\<br>- Identifikasi dependencies awal\<br>- Resource planning yang realistis                 |
|    9   |               Keamanan dan privasi data               |   Tinggi   |      Rendah      |                           - Security assessment berkala\<br>- Penerapan best practices keamanan\<br>- Data encryption\<br>- Penetration testing                           |
|   10   |          Ketergantungan pada vendor spesifik          |   Sedang   |      Rendah      |                - Dokumentasi yang komprehensif\<br>- Knowledge transfer ke tim internal\<br>- Penggunaan teknologi standar\<br>- Klausa kontrak yang jelas                |

## **Estimasi Waktu dan Sumber Daya**

### **Estimasi Waktu**

# Total durasi proyek adalah 8 bulan (32 minggu) dengan pembagian fase sebagai berikut:1) **Fase 1: Foundation (8 minggu)**

   - Week 1-2: Setup environment dan infrastruktur dasar

   - Week 3-4: Pengembangan Modul Autentikasi dan Otorisasi

   - Week 5-6: Pengembangan Modul Manajemen Cabang & Divisi

   - Week 7-8: Pengembangan Modul Manajemen Pegawai dasar

2) **Fase 2: Operasional Inti (8 minggu)**

   - Week 9-10: Pengembangan Modul Pengambilan Barang

   - Week 11-12: Pengembangan Modul Penjualan dan Pembuatan Resi

   - Week 13-14: Pengembangan Modul Muat & Langsir (bagian 1)

   - Week 15-16: Pengembangan Modul Muat & Langsir (bagian 2) dan Tracking dasar

3) **Fase 3: Keuangan dan Pelaporan (8 minggu)**

   - Week 17-18: Pengembangan Modul Keuangan (bagian 1)

   - Week 19-20: Pengembangan Modul Keuangan (bagian 2)

   - Week 21-22: Pengembangan Modul Penagihan

   - Week 23-24: Pengembangan Modul Pelaporan dan Dashboard

4) **Fase 4: Mobile App (4 minggu)**

   - Week 25-26: Pengembangan Mobile untuk Checker dan Supir

   - Week 27-28: Pengembangan Mobile untuk Debt Collector dan integrasi

5) **Fase 5: Optimasi dan Penyempurnaan (4 minggu)**

   - Week 29-30: Pengembangan Modul Retur dan HRD

   - Week 31-32: Integrasi eksternal dan optimasi

### **Sumber Daya Manusia**

# Berikut adalah tim yang dibutuhkan untuk pengembangan Sistem ERP Samudra Paket:|                        |            |                                                                            |
| :--------------------: | :--------: | :------------------------------------------------------------------------: |
|        **Role**        | **Jumlah** |                          **Tanggung Jawab Utama**                          |
|     Project Manager    |      1     | Koordinasi keseluruhan, manajemen risiko, timeline, stakeholder management |
|    Business Analyst    |      1     |          Analisis kebutuhan bisnis, dokumentasi, UAT coordination          |
|     System Analyst     |      1     |                Desain sistem, arsitektur, spesifikasi teknis               |
|     UI/UX Designer     |      1     |            Desain antarmuka pengguna, user experience, prototype           |
|    Backend Developer   |      3     |                 Pengembangan API, logika bisnis, integrasi                 |
|   Frontend Developer   |      3     |            Pengembangan aplikasi web, komponen UI, integrasi API           |
|    Mobile Developer    |      2     |             Pengembangan aplikasi mobile, offline functionality            |
|       QA Engineer      |      2     |                Pengujian, test automation, quality assurance               |
|     DevOps Engineer    |      1     |                CI/CD, infrastruktur, monitoring, deployment                |
| Database Administrator |      1     |                 Desain database, optimasi, backup strategy                 |

### **Infrastruktur**

# Berikut adalah infrastruktur yang diperlukan untuk Sistem ERP Samudra Paket:

#### **Development & Testing Environment Menggunakan Railway.com**

# - 2 Development Server (16GB RAM, 8 Core CPU, 500GB SSD)

- 1 Testing Server (16GB RAM, 8 Core CPU, 500GB SSD)

- 1 CI/CD Server (8GB RAM, 4 Core CPU, 250GB SSD)

- 1 Development Database Server (16GB RAM, 8 Core CPU, 1TB SSD)

- Source Code Repository (GitHub/GitLab)

- Continuous Integration Tools (Jenkins/GitLab CI)

#### **Staging Environment**

# - 2 Application Server (16GB RAM, 8 Core CPU, 500GB SSD)

- 1 Database Server (32GB RAM, 16 Core CPU, 2TB SSD with RAID)

- 1 Cache Server (16GB RAM, 8 Core CPU, 250GB SSD)

- 1 Storage Server (4TB SSD with RAID)

#### **Production Environment**

# - 4 Application Server (32GB RAM, 16 Core CPU, 500GB SSD)

- 2 Database Server in Cluster (64GB RAM, 32 Core CPU, 4TB SSD with RAID)

- 2 Cache Server (32GB RAM, 16 Core CPU, 500GB SSD)

- 2 Storage Server (8TB SSD with RAID)

- 1 Backup Server (64TB storage with tape backup)

- Load Balancer

- Firewall and Security Appliances

- Monitoring Tools (Prometheus/Grafana)

#### **Hardware di Cabang**

# - Printer Thermal (1 per cabang)

- Barcode Scanner (2 per cabang)

- Timbangan Digital (1 per cabang)

- Perangkat Mobile untuk staf operasional (2-5 per cabang)

- PC/Laptop untuk staf administrasi (3-5 per cabang)

- GPS Tracker untuk kendaraan (1 per kendaraan)

## **Kesimpulan dan Rekomendasi**

### **Kesimpulan**

# Berdasarkan analisis kebutuhan yang telah dilakukan, Sistem ERP Samudra Paket akan menjadi solusi komprehensif yang mengintegrasikan seluruh proses bisnis PT. Sarana Mudah Raya. Sistem ini dirancang untuk mengatasi tantangan utama perusahaan, termasuk:1) **Integrasi Data** - Menyediakan satu sumber kebenaran untuk seluruh data operasional, administratif, dan keuangan.

2) **Visibilitas Real-time** - Memungkinkan pelacakan pengiriman secara real-time dan monitoring status operasional.

3) **Efisiensi Operasional** - Mengoptimalkan proses bisnis melalui otomatisasi dan digitalisasi.

4) **Pengambilan Keputusan** - Menyediakan data dan analytics untuk pengambilan keputusan berbasis data.

5) **Skalabilitas** - Mendukung pertumbuhan bisnis dengan arsitektur yang skalabel.Implementasi sistem ini diperkirakan memakan waktu 8 bulan dengan pendekatan agile dan fase bertahap. Dengan mempertimbangkan kompleksitas proyek, risiko yang teridentifikasi, dan strategi mitigasi yang direncanakan, proyek ini memiliki peluang sukses yang baik jika dilaksanakan dengan manajemen yang tepat.

### **Rekomendasi**

# Untuk memastikan keberhasilan implementasi Sistem ERP Samudra Paket, berikut adalah rekomendasi utama:1) **Keterlibatan Stakeholder** - Pastikan keterlibatan aktif semua stakeholder kunci sejak awal proyek, khususnya pengguna akhir yang akan menggunakan sistem sehari-hari.

2) **Manajemen Perubahan** - Investasikan pada strategi manajemen perubahan yang komprehensif, termasuk komunikasi, pelatihan, dan dukungan pasca-implementasi.

3) **Validasi Secara Iteratif** - Lakukan validasi kebutuhan secara iteratif selama pengembangan untuk memastikan bahwa sistem yang dibangun sesuai dengan kebutuhan aktual.

4) **Fokus pada User Experience** - Prioritaskan user experience yang baik, terutama untuk pengguna dengan kemampuan teknologi minimal.

5) **Implementasi Bertahap** - Terapkan pendekatan bertahap dalam deployment untuk meminimalkan gangguan operasional dan memungkinkan adaptasi pengguna secara gradual.

6) **Infrastruktur yang Memadai** - Pastikan infrastruktur yang memadai di semua cabang, terutama konektivitas internet untuk mendukung sistem cloud-based.

7) **Pelatihan Komprehensif** - Berikan pelatihan yang komprehensif untuk semua tingkat pengguna, dengan materi yang disesuaikan dengan peran mereka.

8) **Monitoring dan Evaluasi** - Terapkan mekanisme monitoring dan evaluasi yang berkelanjutan untuk mengidentifikasi area perbaikan dan optimasi.

9) **Dokumentasi yang Baik** - Pastikan dokumentasi teknis dan pengguna yang komprehensif untuk mendukung pemeliharaan dan penggunaan sistem jangka panjang.

10) **Roadmap Pengembangan** - Siapkan roadmap pengembangan jangka panjang untuk enhancement sistem setelah implementasi awal.Dengan mengikuti rekomendasi ini dan berdasarkan spesifikasi kebutuhan yang telah didokumentasikan dalam SRS ini, PT. Sarana Mudah Raya akan memiliki sistem ERP yang tangguh, terintegrasi, dan sesuai dengan kebutuhan bisnis mereka, yang akan mendukung pertumbuhan dan efisiensi operasional dalam jangka panjang.
