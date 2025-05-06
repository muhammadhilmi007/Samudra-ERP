# Samudra Paket ERP - Database Seeders

Sistem seeder untuk aplikasi Samudra Paket ERP yang digunakan untuk mengisi database dengan data awal untuk keperluan pengembangan dan testing.

## Struktur Direktori

```
seeders/
├── config.js                # Konfigurasi koneksi database
├── index.js                 # Entry point untuk menjalankan semua seeder
├── modules/                 # Modul seeder berdasarkan domain
│   ├── rbacSeeder.js        # Seeder untuk role dan permission
│   ├── userSeeder.js        # Seeder untuk user
│   ├── branchSeeder.js      # Seeder untuk cabang
│   ├── customerSeeder.js    # Seeder untuk pelanggan
│   ├── employeeSeeder.js    # Seeder untuk karyawan
│   ├── forwarderSeeder.js   # Seeder untuk forwarder (area, partner, rate)
│   ├── serviceAreaSeeder.js # Seeder untuk area layanan
│   ├── pricingRuleSeeder.js # Seeder untuk aturan harga
│   ├── warehouseSeeder.js   # Seeder untuk item gudang
│   └── notificationSeeder.js # Seeder untuk template notifikasi
└── README.md                # Dokumentasi seeder
```

## Cara Penggunaan

### Menjalankan Semua Seeder

Untuk menjalankan semua seeder secara berurutan, gunakan script berikut:

```bash
node scripts/run-seeders.js
```

Seeder akan dijalankan dalam urutan yang tepat untuk memastikan dependensi antar data terpenuhi.

### Menjalankan Seeder Tertentu

Untuk menjalankan seeder tertentu, gunakan script berikut dengan menyebutkan nama seeder:

```bash
node scripts/run-seeders.js rbac
node scripts/run-seeders.js users
node scripts/run-seeders.js branches
# dan seterusnya
```

Nama seeder yang tersedia:
- `rbac` - Role dan Permission
- `users` - User
- `branches` - Cabang
- `customers` - Pelanggan
- `employees` - Karyawan
- `forwarders` - Forwarder (area, partner, rate)
- `serviceareas` - Area Layanan
- `pricingrules` - Aturan Harga
- `warehouse` - Item Gudang
- `notifications` - Template Notifikasi

### Menjalankan Seeder dari Modul

Setiap modul seeder juga dapat dijalankan secara langsung:

```bash
node src/infrastructure/database/seeders/modules/rbacSeeder.js
node src/infrastructure/database/seeders/modules/userSeeder.js
# dan seterusnya
```

## Urutan Eksekusi Seeder

Seeder dijalankan dalam urutan berikut untuk memastikan dependensi data terpenuhi:

1. RBAC (Role dan Permission)
2. User
3. Branch (Cabang)
4. Customer (Pelanggan)
5. Employee (Karyawan)
6. Forwarder (Area, Partner, Rate)
7. Service Area (Area Layanan)
8. Pricing Rule (Aturan Harga)
9. Warehouse Item (Item Gudang)
10. Notification Template (Template Notifikasi)

## Troubleshooting

### Koneksi Database

Jika terjadi masalah koneksi database, pastikan:
1. MongoDB berjalan di mesin Anda
2. Konfigurasi URI MongoDB di file `.env` sudah benar
3. Jika menggunakan MongoDB Compass, gunakan connection string yang sama

### Mengatasi Error

Jika terjadi error saat menjalankan seeder:
1. Periksa log error untuk informasi lebih detail
2. Pastikan semua dependensi sudah dijalankan (misalnya, seeder branch harus dijalankan sebelum employee)
3. Jika perlu, hapus data yang sudah ada di collection terkait dan jalankan ulang seeder

## Pengembangan Seeder Baru

Untuk membuat seeder baru:
1. Buat file baru di direktori `modules/` dengan format `[nama]Seeder.js`
2. Gunakan template yang sama dengan seeder yang sudah ada
3. Tambahkan fungsi seeder baru ke `index.js` di fungsi `runAllSeeders` dan `runSeeder`
4. Pastikan urutan eksekusi seeder sudah benar sesuai dependensi data
