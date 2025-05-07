# **Business Requirement Document (BRD)**

# **Sistem ERP PT. Sarana Mudah Raya (Samudra Paket)**

**Versi Dokumen:** 1.0\
&#x20;**Tanggal Pembuatan:** 26 April 2025\
&#x20;**Disusun oleh:** Business Analyst, System Analyst, Project Manager


## **Daftar Isi**

1. [Latar Belakang Proyek](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#1-latar-belakang-proyek)

2. [Tujuan dan Manfaat Proyek](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#2-tujuan-dan-manfaat-proyek)

3. [Ruang Lingkup Proyek](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#3-ruang-lingkup-proyek)

4. [Analisis Kebutuhan Bisnis](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#4-analisis-kebutuhan-bisnis)

5. [Stakeholder yang Terlibat](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#5-stakeholder-yang-terlibat)

6. [Fitur-Fitur Utama](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#6-fitur-fitur-utama)

7. [Asumsi dan Batasan Proyek](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#7-asumsi-dan-batasan-proyek)

8. [Risiko Awal yang Teridentifikasi](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#8-risiko-awal-yang-teridentifikasi)

9. [Estimasi Biaya Awal Proyek](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#9-estimasi-biaya-awal-proyek)

10. [Persetujuan Dokumen](https://claude.ai/chat/a1236d78-333d-44e8-9647-ef9ddf7c084a#10-persetujuan-dokumen)


## **1. Latar Belakang Proyek**

PT. Sarana Mudah Raya (Samudra Paket) merupakan perusahaan logistik dan pengiriman barang yang beroperasi secara luas di Indonesia, terutama di Pulau Jawa dengan jaringan mitra forwarder yang menjangkau hingga ke Sulawesi, Kalimantan, dan Papua. Saat ini, perusahaan menghadapi tantangan dalam mengintegrasikan seluruh proses bisnisnya yang masih dilakukan dengan cara semi-manual menggunakan spreadsheet dan dokumen fisik.

Proses bisnis utama Samudra Paket meliputi pengambilan barang (pickup), pemrosesan di cabang pengirim, pengiriman antar cabang, penerimaan di cabang tujuan, pengiriman ke penerima (lansir), serta penagihan dan pengelolaan keuangan. Semua proses ini sering menghadapi kendala seperti:

1. Ketidaksinambungan informasi antar departemen dan cabang

2. Kesulitan pelacakan pengiriman secara real-time

3. Inefisiensi dalam manajemen kendaraan dan rute

4. Pengelolaan keuangan dan piutang yang rumit, terutama untuk metode pembayaran CAD (Cash After Delivery)

5. Kesulitan dalam mengkonsolidasikan data dan laporan dari berbagai cabang

6. Ketidakefisienan dalam pengelolaan sumber daya manusia dan operasional

Untuk mengatasi permasalahan tersebut, PT. Sarana Mudah Raya memutuskan untuk mengembangkan sistem Enterprise Resource Planning (ERP) yang terintegrasi, mencakup seluruh proses bisnis, dan mampu mengakomodasi kebutuhan spesifik perusahaan.


## **2. Tujuan dan Manfaat Proyek**

### **Tujuan Proyek:**

1. Mengembangkan sistem ERP terintegrasi yang menyatukan seluruh proses bisnis operasional, administrasi, keuangan,HRD dan manajemen PT. Sarana Mudah Raya

2. Mengotomatisasi proses-proses manual atau semi-manual menjadi digital

3. Menyediakan visibilitas real-time terhadap status pengiriman dan keuangan perusahaan

4. Meningkatkan efisiensi operasional melalui optimasi rute, pengelolaan armada, dan sumber daya manusia

5. Menciptakan sistem pelaporan terpadu untuk pengambilan keputusan strategis


### **Manfaat Proyek:**

1. **Manfaat Operasional:**

   - Peningkatan efisiensi pengiriman dengan optimasi rute dan muatan

   - Pengurangan waktu proses dokumentasi dengan digitalisasi

   - Pelacakan real-time untuk semua tahapan pengiriman

   - Peningkatan akurasi data dengan mengurangi input manual

2. **Manfaat Finansial:**

   - Pengurangan biaya operasional hingga 15-20%

   - Peningkatan pendapatan melalui layanan yang lebih baik dan cepat

   - Pengelolaan piutang yang lebih efektif

   - Pengurangan kesalahan penagihan dan pembayaran

3. **Manfaat Strategis:**

   - Data terpadu untuk pengambilan keputusan berbasis data

   - Kemampuan untuk menganalisis profitabilitas per rute, pelanggan, dan cabang

   - Peningkatan kepuasan pelanggan dengan layanan yang lebih cepat dan akurat

   - Skalabilitas untuk ekspansi bisnis ke wilayah baru


## **3. Ruang Lingkup Proyek**

### **In-Scope (Termasuk dalam Proyek):**

1. **Pengembangan Frontend:**

   - Aplikasi Web berbasis Next.js dengan React yang dikembangkan menggunakan bahasa pemrograman JavaScript untuk dashboard, administrasi, keuangan, dan manajemen

   - Aplikasi Mobile berbasis React Native (Expo) yang dikembangkan menggunakan bahasa pemrograman TypeScript untuk operasional lapangan (Checker, Supir, Kepala Gudang)

2. **Pengembangan Backend:**

   - API berbasis Node.js dengan Express.js yang dikembangkan menggunakan bahasa pemrograman JavaScript

   - Database menggunakan MongoDB dengan Mongoose ORM dan menggunakan Embedded Document

   - Dokumentasi API dengan Swagger/OpenAPI

3. **Pengembangan Modul-Modul Utama:**

   - Modul Autentikasi dan Authorization (RBAC)

   - Modul Dashboard

   - Modul Manajemen Cabang & Divisi

   - Modul Manajemen Pegawai

   - Modul Pengambilan Barang (Pickup)

   - Modul Penjualan dan Pembuatan Resi/STT

   - Modul Manajemen Kendaraan

   - Modul Muat & Langsir Barang

   - Modul Retur

   - Modul Penagihan

   - Modul Keuangan dan Akuntansi

   - Modul HRD

   - Modul Pelaporan

   - Modul Tracking dan Monitoring Pengiriman

4. **Integrasi dengan Sistem Eksternal:**

   - Integrasi dengan payment gateway

   - Integrasi dengan layanan maps untuk optimasi rute

   - Integrasi dengan sistem forwarder/mitra

5. **Implementasi Infrastruktur:**

   - Server Development, Staging, dan Production

   - Database Server (MongoDB)

   - Storage untuk backup dan file

   - Implementasi CI/CD

6. **Deployment dan Training:**

   - Deployment aplikasi web dan mobile

   - Migrasi data dari sistem lama jika ada

   - Pelatihan administrator sistem dan pengguna akhir


### **Out-of-Scope (Diluar Proyek):**

1. Pengembangan hardware khusus seperti perangkat barcode scanner (akan menggunakan perangkat yang sudah tersedia di pasaran)

2. Integrasi dengan sistem accounting eksternal (sistem akan menyediakan fitur ekspor data untuk integrasi manual)

3. Pengembangan aplikasi untuk pelanggan akhir (hanya fokus pada aplikasi internal perusahaan)

4. Pengembangan modul customer service dan ticketing (akan dipertimbangkan dalam fase pengembangan lanjutan)

5. Implementasi sistem Internet of Things (IoT) untuk tracking kendaraan (akan menggunakan solusi pihak ketiga jika diperlukan)


## **4. Analisis Kebutuhan Bisnis**

### **4.1 Kebutuhan Operasional**

1. **Manajemen Pickup dan Pengambilan Barang:**

   - Kemampuan menerima pesanan pickup melalui sistem

   - Penugasan tim pickup dengan rute yang dioptimalkan

   - Pencatatan digital form pengambilan barang

   - Verifikasi kondisi barang dengan foto

2. **Pemrosesan Barang di Cabang:**

   - Penimbangan dan pengukuran barang dengan validasi otomatis

   - Pencatatan digital di buku induk penerimaan

   - Pembuatan form muat digital dan alokasi ke truk

   - Pencatatan lokasi penyimpanan barang pending

3. **Manajemen Pengiriman Antar Cabang:**

   - Pengelolaan omzet dan volume tonase per truk

   - Optimasi muatan truk untuk efisiensi

   - Koordinasi antar cabang untuk konsolidasi muatan

   - Pelacakan real-time status pengiriman truk

4. **Manajemen Lansir dan Pengiriman ke Penerima:**

   - Optimasi rute pengiriman lansir

   - Validasi digital saat penerimaan barang oleh pelanggan

   - Penanganan retur secara sistematis

   - Proses komunikasi dengan penerima


### **4.2 Kebutuhan Administrasi**

1. **Manajemen Pelanggan:**

   - Database pelanggan (pengirim dan penerima) terintegrasi

   - Riwayat transaksi per pelanggan

   - Pengelolaan pelanggan berdasarkan jenis (retail, korporat)

   - Analisis pelanggan berdasarkan nilai transaksi

2. **Pembuatan Resi dan Dokumentasi:**

   - Digitalisasi proses pembuatan resi/STT

   - Penomoran resi otomatis dengan format terstandarisasi

   - Distribusi elektronik resi ke pihak-pihak terkait

   - Penyimpanan digital surat jalan dan dokumen pendukung

3. **Penagihan dan Manajemen Piutang:**

   - Pengelolaan tipe pembayaran (CASH, COD, CAD)

   - Sistem reminder otomatis untuk penagihan CAD

   - Jadwal penagihan untuk debt collector

   - Pencatatan dan rekonsiliasi hasil penagihan


### **4.3 Kebutuhan Keuangan**

1. **Manajemen Kas dan Bank:**

   - Pencatatan digital penerimaan dan pengeluaran kas

   - Pembuatan jurnal harian otomatis

   - Rekonsiliasi kas dan bank

   - Pengelolaan uang operasional

2. **Akuntansi dan Pelaporan Keuangan:**

   - Pencatatan transaksi keuangan sesuai dengan standar akuntansi

   - Pembuatan laporan keuangan (neraca, laba rugi)

   - Pengelolaan aset dan penyusutan

   - Analisis profitabilitas per cabang dan rute

3. **Pengelolaan Biaya:**

   - Pencatatan dan kontrol biaya operasional

   - Pengelolaan biaya kirim antar cabang

   - Penghitungan biaya langsir

   - Pengelolaan upah karyawan


### **4.4 Kebutuhan Manajemen**

1. **Dashboard dan Business Intelligence:**

   - Dashboard real-time untuk KPI utama

   - Analisis trend pengiriman dan pendapatan

   - Laporan kinerja cabang dan rute

   - Alat analisis untuk pengambilan keputusan

2. **Manajemen Sumber Daya Manusia:**

   - Pengelolaan data karyawan

   - Pencatatan kehadiran dan perhitungan upah

   - Evaluasi kinerja berdasarkan KPI

   - Manajemen pelatihan dan pengembangan

3. **Manajemen Aset dan Armada:**

   - Pencatatan dan pemeliharaan armada kendaraan

   - Jadwal perawatan preventif

   - Monitoring penggunaan bahan bakar

   - Optimasi penggunaan aset


## **5. Stakeholder yang Terlibat**

### **5.1 Manajemen Pusat**

- **Direktur Utama/Owner (Super User):** Pengambil keputusan tertinggi dan memiliki akses penuh ke seluruh sistem

- **Manager Keuangan:** Bertanggung jawab atas pengelolaan keuangan dan akuntansi

- **Manager Administrasi:** Bertanggung jawab atas standarisasi prosedur administrasi

- **Manager Operasional:** Bertanggung jawab atas efisiensi operasional dan SOP pengiriman

- **Manager HRD:** Bertanggung jawab atas pengelolaan SDM dan pelatihan

- **Manager Marketing:** Bertanggung jawab atas strategi pemasaran dan layanan pelanggan


### **5.2 Operasional Cabang**

- **Kepala Cabang:** Penanggung jawab operasional dan administrasi cabang

- **Kepala Gudang:** Penanggung jawab operasional gudang dan pengiriman

- **Kepala Administrasi:** Penanggung jawab administrasi dan keuangan cabang


### **5.3 Staf Operasional**

- **Checker:** Verifikasi dan validasi barang yang masuk dan keluar

- **Team Muat/Lansir:** Penanganan fisik barang dalam proses muat dan bongkar

- **Supir (Pickup, Langsir, Truk Antar Cabang):** Pengangkutan barang

- **Kenek:** Asisten supir dalam proses pengiriman


### **5.4 Staf Administrasi**

- **Staff Penjualan:** Pembuatan resi dan pencatatan transaksi

- **Staff Administrasi:** Pengelolaan dokumen pengiriman

- **Staff Lansir:** Pengelolaan proses langsir

- **Kasir:** Pengelolaan kas dan pencatatan transaksi keuangan

- **Debt Collector:** Penagihan piutang dari pelanggan

- **Customer Service:** Penanganan permintaan dan keluhan pelanggan


### **5.5 Pengguna Eksternal**

- **Pelanggan (Pengirim):** Pihak yang mengirimkan barang

- **Pelanggan (Penerima):** Pihak yang menerima barang

- **Mitra/Forwarder:** Pihak ketiga untuk pengiriman ke luar jangkauan cabang


## **6. Fitur-Fitur Utama**

### **6.1 Modul Operasional**

1. **Modul Pengambilan Barang (Pickup):**

   - Registrasi permintaan pickup

   - Penjadwalan dan penugasan tim pickup

   - Verifikasi dan validasi barang di lokasi

   - Pencatatan digital form pengambilan barang

2. **Modul Pemeriksaan dan Penerimaan Barang:**

   - Penimbangan dan pengukuran digital

   - Validasi otomatis dengan dokumen pengirim

   - Pencatatan di buku induk penerimaan digital

   - Pencatatan form muat barang digital

3. **Modul Penjualan dan Pembuatan Resi:**

   - Pembuatan resi/STT digital

   - Penghitungan otomatis biaya pengiriman

   - Pencatatan metode pembayaran (CASH, COD, CAD)

   - Distribusi elektronik resi ke pihak terkait

4. **Modul Pengiriman Antar Cabang:**

   - Pengelolaan omzet dan volume per truk

   - Pembuatan dokumen pengiriman digital

   - Konfirmasi keberangkatan dan monitoring perjalanan

   - Koordinasi antar cabang untuk konsolidasi

5. **Modul Penerimaan Barang Antar Cabang:**Verifikasi digital dokumen dan barang

   - Pembongkaran dan validasi muatan

   - Pencatatan barang yang diterima

   - Alokasi untuk lansir

6. **Modul Pelangsiran dan Pengiriman ke Penerima:**

   - Optimasi rute langsir

   - Pembuatan dokumen lansir digital

   - Konfirmasi penerimaan dengan tanda tangan digital

   - Penanganan pembayaran COD

7. **Modul Tracking dan Monitoring:**

   - Pelacakan real-time status pengiriman

   - Notifikasi perubahan status

   - Visualisasi rute pengiriman

   - Riwayat lengkap perjalanan barang


### **6.2 Modul Administrasi**

1. **Modul Manajemen Pelanggan:**

   - Database pelanggan terpadu

   - Riwayat transaksi dan pengiriman

   - Kategorisasi pelanggan

   - Analisis nilai pelanggan

2. **Modul Manajemen Cabang & Divisi:**

   - Struktur organisasi dan cabang

   - Pengaturan wilayah layanan

   - Konsolidasi data antar cabang

   - Monitoring kinerja cabang

3. **Modul Penagihan dan Debt Collection:**

   - Pengelolaan tagihan CAD

   - Penjadwalan penagihan

   - Pencatatan hasil penagihan

   - Analisis aging piutang

4. **Modul Dokumen Management:**

   - Penyimpanan digital dokumen

   - Pencarian dan retrieval dokumen

   - Versioning dokumen

   - Distribusi dokumen


### **6.3 Modul Keuangan**

1. **Modul Kasir:**

   - Pencatatan penerimaan dan pengeluaran kas

   - Pembuatan jurnal harian

   - Rekonsiliasi kas harian

   - Pengelolaan uang operasional

2. **Modul Akuntansi:**

   - Chart of accounts

   - Jurnal umum dan buku besar

   - Laporan keuangan (neraca, laba rugi)

   - Manajemen aset dan penyusutan

3. **Modul Pengelolaan Biaya:**

   - Pencatatan biaya pengiriman

   - Pengelolaan biaya operasional

   - Analisis biaya per pengiriman

   - Pengelolaan upah karyawan


### **6.4 Modul Manajemen**

1. **Modul Dashboard:**

   - Dashboard KPI operasional

   - Dashboard keuangan

   - Dashboard customer

   - Dashboard HR

2. **Modul Manajemen Pegawai:**

   - Database karyawan

   - Pengelolaan kehadiran

   - Perhitungan upah dan insentif

   - Evaluasi kinerja

3. **Modul Manajemen Kendaraan:**

   - Database armada kendaraan

   - Jadwal perawatan

   - Monitoring penggunaan

   - Analisis efisiensi kendaraan

4. **Modul Pelaporan:**

   - Laporan operasional

   - Laporan keuangan

   - Laporan kinerja

   - Laporan custom sesuai kebutuhan


### **6.5 Modul Keamanan dan Integrasi**

1. **Modul Autentikasi dan Otorisasi (RBAC):**

   - Manajemen pengguna

   - Role-based access control

   - Audit trail aktivitas pengguna

   - Keamanan data

2. **Modul Integrasi Eksternal:**

   - API untuk integrasi dengan sistem eksternal

   - Integrasi dengan payment gateway

   - Integrasi dengan layanan maps

   - Integrasi dengan sistem forwarder/mitra


## **7. Asumsi dan Batasan Proyek**

### **7.1 Asumsi**

1. Manajemen dan staf PT. Sarana Mudah Raya akan memberikan dukungan penuh selama pengembangan

2. Infrastruktur IT dasar (jaringan, internet, komputer) sudah tersedia di setiap cabang

3. Seluruh cabang memiliki konektivitas internet yang cukup untuk mengakses sistem

4. Perusahaan sudah memiliki SOP yang terdokumentasi dan dapat digunakan sebagai dasar pengembangan sistem

5. Pengembangan dilakukan dengan metodologi Agile yang memungkinkan adaptasi terhadap perubahan kebutuhan

6. Staf perusahaan memiliki kemampuan dasar komputer dan dapat menerima pelatihan

7. Data lama (jika ada) dapat dimigrasikan ke sistem baru dengan effort yang wajar


### **7.2 Batasan**

1. **Batasan Waktu:**

   - Proyek diharapkan selesai dalam 8 bulan (32 minggu)

   - Implementasi dilakukan secara bertahap modul per modul

   - Pelatihan pengguna dilakukan paralel dengan pengembangan

2. **Batasan Sumber Daya:**

   - Tim pengembangan terdiri dari 14 orang sesuai estimasi

   - Keterlibatan staf operasional perusahaan terbatas untuk tidak mengganggu operasional sehari-hari

   - Server dan infrastruktur terbatas pada anggaran yang dialokasikan

3. **Batasan Teknis:**

   - Pengembangan frontend web menggunakan Next.js dan React yang dikembangkan menggunakan bahasa pemrograman JavaScript

   - Pengembangan mobile menggunakan React Native (Expo) yang dikembangkan menggunakan bahasa pemrograman TypeScript

   - Backend menggunakan Node.js dengan Express.js yang dikembangkan menggunakan bahasa pemrograman JavaScript

   - Database menggunakan MongoDB dengan Mongoose ORM dan menggunakan Embedded Document.

   - Infrastruktur hosting menggunakan Railway.com (<https://docs.railway.com/>)

4. **Batasan Operasional:**

   - Sistem diimplementasikan bertahap dengan prioritas pada modul inti

   - Periode transisi dari sistem lama ke sistem baru akan berjalan paralel untuk mengurangi risiko

   - Beberapa proses mungkin masih memerlukan intervensi manual pada fase awal


## **8. Risiko Awal yang Teridentifikasi**

|        |                                                       |            |                  |                                                                                                                                                |
| :----: | :---------------------------------------------------: | :--------: | :--------------: | :--------------------------------------------------------------------------------------------------------------------------------------------: |
| **No** |                       **Risiko**                      | **Dampak** | **Probabilitas** |                                                              **Strategi Mitigasi**                                                             |
|    1   |         Resistensi pengguna terhadap perubahan        |   Tinggi   |      Sedang      |              - Keterlibatan pengguna sejak awal\<br>- Program pelatihan komprehensif\<br>- Pendampingan intensif saat implementasi             |
|    2   |      Kebutuhan bisnis berubah selama pengembangan     |   Sedang   |      Tinggi      |               - Metodologi Agile dengan sprint 2 minggu\<br>- Review dan feedback reguler\<br>- Dokumentasi perubahan yang jelas               |
|    3   |        Kualitas data lama yang tidak konsisten        |   Sedang   |      Tinggi      |                     - Analisis data awal\<br>- Strategi cleaning dan transformasi data\<br>- Validasi data sebelum migrasi                     |
|    4   | Konektivitas internet tidak stabil di beberapa cabang |   Tinggi   |      Sedang      | - Fitur offline mode untuk aplikasi mobile\<br>- Mekanisme sinkronisasi saat koneksi tersedia\<br>- Penggunaan teknologi yang ringan bandwidth |
|    5   |      Kesenjangan keterampilan teknologi pada staf     |   Sedang   |      Sedang      |                   - Program pelatihan bertahap\<br>- Materi pelatihan yang mudah dipahami\<br>- Pendampingan dan support desk                  |
|    6   |               Keamanan data dan privasi               |   Tinggi   |      Rendah      |                     - Implementasi RBAC yang ketat\<br>- Enkripsi data sensitif\<br>- Audit trail untuk aktivitas pengguna                     |
|    7   |       Performa sistem tidak memenuhi ekspektasi       |   Tinggi   |      Rendah      |               - Pengujian performa sejak awal\<br>- Desain arsitektur yang scalable\<br>- Monitoring proaktif pada infrastruktur               |
|    8   |      Integrasi dengan sistem eksternal bermasalah     |   Sedang   |      Sedang      |                       - Proof of concept awal\<br>- Dokumentasi API yang komprehensif\<br>- Testing integrasi menyeluruh                       |
|    9   |           Keterlambatan penyelesaian proyek           |   Tinggi   |      Sedang      |        - Manajemen proyek Agile dengan buffer\<br>- Prioritas fitur (MoSCoW method)\<br>- Komunikasi transparalel tentang status proyek        |
|   10   |                     Budget overrun                    |   Tinggi   |      Sedang      |                - Monitoring biaya secara ketat\<br>- Pelaporan reguler status anggaran\<br>- Mekanisme change request yang jelas               |


## **9. Estimasi Biaya Awal Proyek**

### **9.1 Biaya Sumber Daya Manusia**

|                        |            |                    |                                    |                   |
| :--------------------: | :--------: | :----------------: | :--------------------------------: | :---------------: |
|        **Peran**       | **Jumlah** | **Durasi (bulan)** | **Estimasi Biaya per Bulan (IDR)** |  **Total (IDR)**  |
|     Project Manager    |      1     |          8         |             25,000,000             |    200,000,000    |
|    Business Analyst    |      1     |          4         |             20,000,000             |     80,000,000    |
|     System Analyst     |      1     |          6         |             20,000,000             |    120,000,000    |
|     UI/UX Designer     |      1     |          5         |             18,000,000             |     90,000,000    |
|    Backend Developer   |      3     |          8         |             18,000,000             |    432,000,000    |
|   Frontend Developer   |      3     |          8         |             18,000,000             |    432,000,000    |
|    Mobile Developer    |      2     |          6         |             18,000,000             |    216,000,000    |
|       QA Engineer      |      2     |          8         |             16,000,000             |    256,000,000    |
|     DevOps Engineer    |      1     |          8         |             20,000,000             |    160,000,000    |
| Database Administrator |      1     |          8         |             20,000,000             |    160,000,000    |
|   **Total Biaya SDM**  |            |                    |                                    | **2,146,000,000** |


### **9.2 Biaya Infrastruktur dan Lisensi**

|                               |            |                          |                 |
| :---------------------------: | :--------: | :----------------------: | :-------------: |
|            **Item**           | **Jumlah** | **Estimasi Biaya (IDR)** | **Total (IDR)** |
|       Server Development      |      1     |        50,000,000        |    50,000,000   |
|         Server Staging        |      1     |        50,000,000        |    50,000,000   |
|       Server Production       |      2     |        75,000,000        |   150,000,000   |
|        Database Server        |      1     |        60,000,000        |    60,000,000   |
|       Storage dan Backup      |      1     |        40,000,000        |    40,000,000   |
|         CI/CD Platform        |      1     |        20,000,000        |    20,000,000   |
|        SSL Certificate        |      3     |         2,000,000        |    6,000,000    |
|       Software Licenses       |   Various  |        50,000,000        |    50,000,000   |
| **Total Biaya Infrastruktur** |            |                          | **426,000,000** |


### **9.3 Biaya Implementasi dan Pelatihan**

|                                           |                          |
| :---------------------------------------: | :----------------------: |
|                  **Item**                 | **Estimasi Biaya (IDR)** |
|       Pelatihan administrator sistem      |        50,000,000        |
| Pelatihan pengguna akhir (per departemen) |        150,000,000       |
|         Pembuatan materi pelatihan        |        30,000,000        |
|              Dukungan go-live             |        75,000,000        |
|                Migrasi data               |        40,000,000        |
|        **Total Biaya Implementasi**       |      **345,000,000**     |


### **9.4 Biaya Lain-lain**

|                           |                          |
| :-----------------------: | :----------------------: |
|          **Item**         | **Estimasi Biaya (IDR)** |
|  Perjalanan dan akomodasi |        100,000,000       |
|   Komunikasi dan meeting  |        30,000,000        |
|        Dokumentasi        |        25,000,000        |
|     Contingency (10%)     |        297,000,000       |
| **Total Biaya Lain-lain** |      **452,000,000**     |


### **9.5 Total Estimasi Biaya Proyek**

|                                  |                          |
| :------------------------------: | :----------------------: |
|           **Kategori**           | **Estimasi Biaya (IDR)** |
|     Biaya Sumber Daya Manusia    |       2,146,000,000      |
|  Biaya Infrastruktur dan Lisensi |        426,000,000       |
| Biaya Implementasi dan Pelatihan |        345,000,000       |
|          Biaya Lain-lain         |        452,000,000       |
|  **Total Estimasi Biaya Proyek** |     **3,369,000,000**    |


## **10. Persetujuan Dokumen**

|          |                                      |                  |             |
| :------: | :----------------------------------: | :--------------: | :---------: |
| **Nama** |              **Jabatan**             | **Tanda Tangan** | **Tanggal** |
|  \[Nama] | Direktur Utama PT. Sarana Mudah Raya |                  |             |
|  \[Nama] |            Project Manager           |                  |             |
|  \[Nama] |           Business Analyst           |                  |             |
|  \[Nama] |            System Analyst            |                  |             |

**Catatan:** Dokumen ini bersifat dinamis dan dapat diperbarui sepanjang proyek berlangsung dengan persetujuan semua pihak terkait.
