# System Prompts Document

## Overview

#

This document outlines the system prompts and messages that will be used throughout the Samudra Paket ERP system to guide users, provide feedback, and communicate system status. These prompts are designed to be clear, consistent, and helpful to enhance the user experience.

## General Guidelines for System Prompts

#

1.  Clarity: All prompts should be clear and unambiguous
2.  Consistency: Use consistent terminology and tone throughout the system
3.  Conciseness: Keep messages brief but informative
4.  Helpfulness: Provide guidance on how to resolve issues when appropriate
5.  Politeness: Maintain a professional and respectful tone
6.  Localization: All prompts should support both Bahasa Indonesia and English

## Types of System Prompts

### Success Messages

#

Success messages confirm that an action has been completed successfully.

| Context       | English                                          | Bahasa Indonesia                                 |
| ------------- | ------------------------------------------------ | ------------------------------------------------ |
| Login         | "You have successfully logged in."               | "Anda telah berhasil masuk."                     |
| Create Record | "{Item} has been created successfully."          | "{Item} telah berhasil dibuat."                  |
| Update Record | "{Item} has been updated successfully."          | "{Item} telah berhasil diperbarui."              |
| Delete Record | "{Item} has been deleted successfully."          | "{Item} telah berhasil dihapus."                 |
| Save Data     | "Your changes have been saved successfully."     | "Perubahan Anda telah berhasil disimpan."        |
| Submit Form   | "Form has been submitted successfully."          | "Formulir telah berhasil dikirim."               |
| Upload File   | "File has been uploaded successfully."           | "File telah berhasil diunggah."                  |
| Assign Task   | "Task has been assigned successfully to {User}." | "Tugas telah berhasil ditetapkan kepada {User}." |

### Error Messages

#

Error messages inform users that an action has failed and often provide guidance on how to resolve the issue.

| Context           | English                                                                    | Bahasa Indonesia                                                             |
| ----------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Login Failed      | "Login failed. Please check your username and password."                   | "Gagal masuk. Silakan periksa nama pengguna dan kata sandi Anda."            |
| Required Field    | "This field is required."                                                  | "Bidang ini wajib diisi."                                                    |
| Invalid Input     | "Please enter a valid {field type}."                                       | "Silakan masukkan {field type} yang valid."                                  |
| Server Error      | "An error occurred while processing your request. Please try again later." | "Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti." |
| Network Error     | "Connection lost. Please check your internet connection and try again."    | "Koneksi terputus. Silakan periksa koneksi internet Anda dan coba lagi."     |
| Access Denied     | "You don't have permission to access this resource."                       | "Anda tidak memiliki izin untuk mengakses sumber daya ini."                  |
| Duplicate Entry   | "A {item} with this {field} already exists."                               | "{item} dengan {field} ini sudah ada."                                       |
| File Size Limit   | "File size exceeds the maximum limit of {size}."                           | "Ukuran file melebihi batas maksimum {size}."                                |
| Invalid File Type | "Invalid file type. Allowed types: {types}."                               | "Jenis file tidak valid. Jenis yang diizinkan: {types}."                     |

### Warning Messages

#

Warning messages alert users to potential issues or consequences of their actions.

| Context             | English                                                                      | Bahasa Indonesia                                                                                 |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Delete Confirmation | "Are you sure you want to delete this {item}? This action cannot be undone." | "Apakah Anda yakin ingin menghapus {item} ini? Tindakan ini tidak dapat dibatalkan."             |
| Unsaved Changes     | "You have unsaved changes. Are you sure you want to leave this page?"        | "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?" |
| Low Stock           | "Stock level for {item} is below the minimum threshold."                     | "Tingkat stok untuk {item} di bawah ambang batas minimum."                                       |
| Session Expiring    | "Your session will expire in {time}. Do you want to extend it?"              | "Sesi Anda akan berakhir dalam {time}. Apakah Anda ingin memperpanjangnya?"                      |
| Large Data Set      | "This operation will process a large amount of data and may take some time." | "Operasi ini akan memproses data dalam jumlah besar dan mungkin membutuhkan waktu."              |
| Data Overwrite      | "This action will overwrite existing data. Do you want to continue?"         | "Tindakan ini akan menimpa data yang ada. Apakah Anda ingin melanjutkan?"                        |

### Information Messages

#

Information messages provide context or additional details without indicating success or failure.

| Context        | English                                                                                  | Bahasa Indonesia                                                                           |
| -------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Loading Data   | "Loading data. Please wait..."                                                           | "Memuat data. Harap tunggu..."                                                             |
| Processing     | "Processing your request..."                                                             | "Memproses permintaan Anda..."                                                             |
| No Results     | "No results found for your search criteria."                                             | "Tidak ada hasil yang ditemukan untuk kriteria pencarian Anda."                            |
| Item Count     | "Showing {count} of {total} items."                                                      | "Menampilkan {count} dari {total} item."                                                   |
| Sync Status    | "Last synchronized: {time}"                                                              | "Terakhir disinkronkan: {time}"                                                            |
| Offline Mode   | "You are working in offline mode. Changes will be synchronized when you're back online." | "Anda bekerja dalam mode offline. Perubahan akan disinkronkan ketika Anda kembali online." |
| Filter Applied | "Showing results filtered by {filter}."                                                  | "Menampilkan hasil yang difilter berdasarkan {filter}."                                    |
| Version Info   | "System version: {version}"                                                              | "Versi sistem: {version}"                                                                  |

### Progress Indicators

#

Progress indicators inform users about the status of ongoing operations.

| Context           | English                                                | Bahasa Indonesia                                        |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| Upload Progress   | "Uploading file: {percent}% complete"                  | "Mengunggah file: {percent}% selesai"                   |
| Download Progress | "Downloading file: {percent}% complete"                | "Mengunduh file: {percent}% selesai"                    |
| Processing Steps  | "Step {current} of {total}: {step description}"        | "Langkah {current} dari {total}: {step description}"    |
| Import Progress   | "Importing data: {count} of {total} records processed" | "Mengimpor data: {count} dari {total} catatan diproses" |
| Sync Progress     | "Synchronizing data: {percent}% complete"              | "Menyinkronkan data: {percent}% selesai"                |

## Module-Specific Prompts

### Authentication Module

#

| Context         | English                                                                                                | Bahasa Indonesia                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Password Reset  | "Password reset instructions have been sent to your email."                                            | "Instruksi reset kata sandi telah dikirim ke email Anda."                                  |
| Account Locked  | "Your account has been locked due to multiple failed login attempts. Please contact an administrator." | "Akun Anda telah dikunci karena beberapa kali gagal masuk. Silakan hubungi administrator." |
| 2FA Required    | "Please enter the verification code sent to your device."                                              | "Silakan masukkan kode verifikasi yang dikirim ke perangkat Anda."                         |
| Session Expired | "Your session has expired. Please log in again."                                                       | "Sesi Anda telah berakhir. Silakan masuk lagi."                                            |
| First Login     | "Please change your password on first login."                                                          | "Silakan ubah kata sandi Anda pada login pertama."                                         |
| Logout Success  | "You have been successfully logged out."                                                               | "Anda telah berhasil keluar."                                                              |

### Pickup Module

#

| Context             | English                                                                       | Bahasa Indonesia                                                                        |
| ------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Pickup Created      | "Pickup request #{id} has been created successfully."                         | "Permintaan pickup #{id} telah berhasil dibuat."                                        |
| Pickup Assigned     | "Pickup request has been assigned to {driver}."                               | "Permintaan pickup telah ditetapkan kepada {driver}."                                   |
| Pickup Completed    | "Pickup #{id} has been completed successfully."                               | "Pickup #{id} telah berhasil diselesaikan."                                             |
| Out of Service Area | "The pickup address is outside our service area."                             | "Alamat pickup berada di luar area layanan kami."                                       |
| No Available Driver | "No drivers are currently available for this pickup. Please try again later." | "Tidak ada pengemudi yang tersedia untuk pickup ini saat ini. Silakan coba lagi nanti." |
| Pickup Rescheduled  | "Pickup has been rescheduled to {date} {time}."                               | "Pickup telah dijadwalkan ulang ke {date} {time}."                                      |
| Pickup Cancelled    | "Pickup request #{id} has been cancelled."                                    | "Permintaan pickup #{id} telah dibatalkan."                                             |

### Shipment Module

#

| Context            | English                                                                       | Bahasa Indonesia                                                                  |
| ------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Shipment Created   | "Shipment #{id} has been created successfully."                               | "Pengiriman #{id} telah berhasil dibuat."                                         |
| Waybill Generated  | "Waybill #{id} has been generated successfully."                              | "Resi/STT #{id} telah berhasil dibuat."                                           |
| Weight Discrepancy | "Weight discrepancy detected. Measured: {measured}kg, Declared: {declared}kg" | "Perbedaan berat terdeteksi. Terukur: {measured}kg, Dideklarasikan: {declared}kg" |
| Shipment Tracking  | "Shipment #{id} is currently in {location} ({status})"                        | "Pengiriman #{id} saat ini berada di {location} ({status})"                       |
| Delivery Estimated | "Estimated delivery date: {date}"                                             | "Perkiraan tanggal pengiriman: {date}"                                            |
| Shipment Forwarded | "Shipment has been forwarded to our partner {partner} for final delivery."    | "Pengiriman telah diteruskan ke mitra kami {partner} untuk pengiriman akhir."     |
| COD Payment        | "COD payment of {amount} received for shipment #{id}."                        | "Pembayaran COD sebesar {amount} diterima untuk pengiriman #{id}."                |

### Delivery Module

#

| Context              | English                                                                      | Bahasa Indonesia                                                              |
| -------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Delivery Assigned    | "Delivery has been assigned to {driver}."                                    | "Pengiriman telah ditetapkan kepada {driver}."                                |
| Out for Delivery     | "Shipment #{id} is out for delivery."                                        | "Pengiriman #{id} sedang dalam proses pengiriman."                            |
| Delivery Attempted   | "Delivery attempted. Reason for failure: {reason}"                           | "Pengiriman telah dicoba. Alasan kegagalan: {reason}"                         |
| Delivery Complete    | "Delivery completed. Signed by: {name}"                                      | "Pengiriman selesai. Ditandatangani oleh: {name}"                             |
| Rescheduled Delivery | "Delivery has been rescheduled for {date}."                                  | "Pengiriman telah dijadwalkan ulang untuk {date}."                            |
| Address Not Found    | "Delivery address could not be found. Please provide additional directions." | "Alamat pengiriman tidak dapat ditemukan. Silakan berikan petunjuk tambahan." |
| Cash Collected       | "Cash amount of {amount} has been collected from the recipient."             | "Jumlah uang tunai sebesar {amount} telah ditagih dari penerima."             |

### Returns Module

#

| Context              | English                                                     | Bahasa Indonesia                                           |
| -------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| Return Created       | "Return #{id} has been created for shipment #{shipmentId}." | "Retur #{id} telah dibuat untuk pengiriman #{shipmentId}." |
| Return Reason        | "Return reason: {reason}"                                   | "Alasan retur: {reason}"                                   |
| Return Approved      | "Return request has been approved."                         | "Permintaan retur telah disetujui."                        |
| Return Rejected      | "Return request has been rejected. Reason: {reason}"        | "Permintaan retur telah ditolak. Alasan: {reason}"         |
| Return Processed     | "Return has been processed successfully."                   | "Retur telah berhasil diproses."                           |
| Sender Notification  | "Sender has been notified about the return."                | "Pengirim telah diberitahu tentang retur."                 |
| Redelivery Scheduled | "Redelivery scheduled for {date}."                          | "Pengiriman ulang dijadwalkan untuk {date}."               |

### Billing Module

#

| Context              | English                                                                          | Bahasa Indonesia                                                                      |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Invoice Generated    | "Invoice #{id} has been generated for {customer}."                               | "Faktur #{id} telah dibuat untuk {customer}."                                         |
| Payment Received     | "Payment of {amount} has been received for invoice #{id}."                       | "Pembayaran sebesar {amount} telah diterima untuk faktur #{id}."                      |
| Payment Due          | "Payment for invoice #{id} is due on {date}."                                    | "Pembayaran untuk faktur #{id} jatuh tempo pada {date}."                              |
| Payment Overdue      | "Payment for invoice #{id} is overdue by {days} days."                           | "Pembayaran untuk faktur #{id} terlambat {days} hari."                                |
| Collection Assigned  | "Collection for invoice #{id} has been assigned to {collector}."                 | "Penagihan untuk faktur #{id} telah ditetapkan kepada {collector}."                   |
| Partial Payment      | "Partial payment of {amount} received for invoice #{id}. Remaining: {remaining}" | "Pembayaran sebagian sebesar {amount} diterima untuk faktur #{id}. Sisa: {remaining}" |
| Credit Limit Reached | "Customer {customer} has reached their credit limit."                            | "Pelanggan {customer} telah mencapai batas kredit mereka."                            |

### Finance Module

#

| Context              | English                                                     | Bahasa Indonesia                                                |
| -------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| Transaction Recorded | "Transaction #{id} has been recorded successfully."         | "Transaksi #{id} telah berhasil dicatat."                       |
| Journal Entry        | "Journal entry #{id} has been created."                     | "Entri jurnal #{id} telah dibuat."                              |
| Reconciliation       | "Account reconciliation completed for period {period}."     | "Rekonsiliasi akun selesai untuk periode {period}."             |
| Month End Closing    | "Month-end closing process has been completed for {month}." | "Proses penutupan akhir bulan telah selesai untuk {month}."     |
| Expense Approved     | "Expense #{id} has been approved."                          | "Pengeluaran #{id} telah disetujui."                            |
| Expense Rejected     | "Expense #{id} has been rejected. Reason: {reason}"         | "Pengeluaran #{id} telah ditolak. Alasan: {reason}"             |
| Cash Advance         | "Cash advance of {amount} has been issued to {employee}."   | "Uang muka sebesar {amount} telah diberikan kepada {employee}." |

### Warehouse Module

#

| Context            | English                                                  | Bahasa Indonesia                                                |
| ------------------ | -------------------------------------------------------- | --------------------------------------------------------------- |
| Item Received      | "{quantity} items received in warehouse {warehouse}."    | "{quantity} item diterima di gudang {warehouse}."               |
| Item Allocated     | "{quantity} items allocated for shipment #{shipmentId}." | "{quantity} item dialokasikan untuk pengiriman #{shipmentId}."  |
| Low Space          | "Warehouse {warehouse} is at {percent}% capacity."       | "Gudang {warehouse} berada pada {percent}% kapasitas."          |
| Loading Complete   | "Loading complete for vehicle {vehicle}."                | "Pemuatan selesai untuk kendaraan {vehicle}."                   |
| Unloading Complete | "Unloading complete for vehicle {vehicle}."              | "Pembongkaran selesai untuk kendaraan {vehicle}."               |
| Inventory Count    | "Inventory count complete. Discrepancies found: {count}" | "Penghitungan inventaris selesai. Perbedaan ditemukan: {count}" |
| Item Relocation    | "Items relocated from {source} to {destination}."        | "Item dipindahkan dari {source} ke {destination}."              |

### Vehicle Management Module

#

| Context              | English                                                      | Bahasa Indonesia                                                        |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Vehicle Assigned     | "Vehicle {vehicle} has been assigned to {driver}."           | "Kendaraan {vehicle} telah ditetapkan kepada {driver}."                 |
| Maintenance Due      | "Maintenance is due for vehicle {vehicle} in {days} days."   | "Pemeliharaan untuk kendaraan {vehicle} jatuh tempo dalam {days} hari." |
| Maintenance Complete | "Maintenance for vehicle {vehicle} has been completed."      | "Pemeliharaan untuk kendaraan {vehicle} telah selesai."                 |
| Fuel Added           | "{amount} liters of fuel added to vehicle {vehicle}."        | "{amount} liter bahan bakar ditambahkan ke kendaraan {vehicle}."        |
| Vehicle Status       | "Vehicle {vehicle} status updated to {status}."              | "Status kendaraan {vehicle} diperbarui menjadi {status}."               |
| Route Optimized      | "Route optimized for {stops} delivery stops."                | "Rute dioptimalkan untuk {stops} perhentian pengiriman."                |
| Vehicle Breakdown    | "Vehicle {vehicle} reported breakdown. Location: {location}" | "Kendaraan {vehicle} dilaporkan rusak. Lokasi: {location}"              |

### Employee Module

#

| Context                | English                                                     | Bahasa Indonesia                                            |
| ---------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| Employee Created       | "Employee profile for {name} has been created."             | "Profil karyawan untuk {name} telah dibuat."                |
| Leave Request          | "Leave request for {employee} has been {status}."           | "Permintaan cuti untuk {employee} telah {status}."          |
| Attendance Recorded    | "Attendance for {employee} has been recorded. Time: {time}" | "Kehadiran untuk {employee} telah dicatat. Waktu: {time}"   |
| Shift Assigned         | "{employee} has been assigned to {shift} shift on {date}."  | "{employee} telah ditetapkan ke shift {shift} pada {date}." |
| Performance Evaluation | "Performance evaluation for {employee} has been completed." | "Evaluasi kinerja untuk {employee} telah selesai."          |
| Training Assigned      | "{employee} has been assigned to training: {training}"      | "{employee} telah ditetapkan untuk pelatihan: {training}"   |
| Payroll Processed      | "Payroll for period {period} has been processed."           | "Penggajian untuk periode {period} telah diproses."         |

### Mobile App Specific

#

| Context             | English                                                                       | Bahasa Indonesia                                                                           |
| ------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Location Permission | "Location permission is required to use this feature."                        | "Izin lokasi diperlukan untuk menggunakan fitur ini."                                      |
| Camera Permission   | "Camera permission is required to use this feature."                          | "Izin kamera diperlukan untuk menggunakan fitur ini."                                      |
| Storage Permission  | "Storage permission is required to use this feature."                         | "Izin penyimpanan diperlukan untuk menggunakan fitur ini."                                 |
| Offline Mode Active | "You are in offline mode. Data will be synchronized when you're back online." | "Anda dalam mode offline. Data akan disinkronkan ketika Anda kembali online."              |
| Sync Required       | "Data sync required. Please connect to the internet."                         | "Sinkronisasi data diperlukan. Silakan hubungkan ke internet."                             |
| Low Battery         | "Low battery. Please charge your device to ensure uninterrupted operation."   | "Baterai lemah. Silakan isi daya perangkat Anda untuk memastikan operasi tidak terganggu." |
| GPS Signal Lost     | "GPS signal lost. Some features may be limited."                              | "Sinyal GPS hilang. Beberapa fitur mungkin terbatas."                                      |
| New Version         | "A new version of the app is available. Please update."                       | "Versi baru aplikasi tersedia. Silakan perbarui."                                          |

## Error Codes and Descriptions

#

The system uses standardized error codes to identify specific error conditions. These codes are included in error messages for easier troubleshooting.

| Error Code | Description              | User Message (English)                                                   | User Message (Bahasa Indonesia)                                           |
| ---------- | ------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| AUTH001    | Invalid credentials      | "Invalid username or password."                                          | "Nama pengguna atau kata sandi tidak valid."                              |
| AUTH002    | Account locked           | "Your account has been locked due to multiple failed login attempts."    | "Akun Anda telah dikunci karena beberapa kali gagal masuk."               |
| AUTH003    | Session expired          | "Your session has expired. Please log in again."                         | "Sesi Anda telah berakhir. Silakan masuk lagi."                           |
| AUTH004    | Insufficient permissions | "You don't have permission to perform this action."                      | "Anda tidak memiliki izin untuk melakukan tindakan ini."                  |
| VAL001     | Required field missing   | "Please fill in all required fields."                                    | "Silakan isi semua bidang yang wajib diisi."                              |
| VAL002     | Invalid format           | "Invalid format for {field}."                                            | "Format tidak valid untuk {field}."                                       |
| VAL003     | Value out of range       | "Value for {field} must be between {min} and {max}."                     | "Nilai untuk {field} harus antara {min} dan {max}."                       |
| VAL004     | Duplicate entry          | "A {item} with this {field} already exists."                             | "{item} dengan {field} ini sudah ada."                                    |
| SRV001     | Service unavailable      | "Service is temporarily unavailable. Please try again later."            | "Layanan sementara tidak tersedia. Silakan coba lagi nanti."              |
| SRV002     | Database error           | "Database operation failed. Please contact support."                     | "Operasi database gagal. Silakan hubungi dukungan."                       |
| SRV003     | External service error   | "Error communicating with external service."                             | "Kesalahan berkomunikasi dengan layanan eksternal."                       |
| SRV004     | Request timeout          | "Request timed out. Please try again."                                   | "Permintaan habis waktu. Silakan coba lagi."                              |
| NET001     | Network unavailable      | "Network connection unavailable. Please check your internet connection." | "Koneksi jaringan tidak tersedia. Silakan periksa koneksi internet Anda." |
| NET002     | Weak connection          | "Weak network connection detected. Some features may be limited."        | "Koneksi jaringan lemah terdeteksi. Beberapa fitur mungkin terbatas."     |
| DAT001     | Data not found           | "Requested {item} not found."                                            | "{item} yang diminta tidak ditemukan."                                    |
| DAT002     | Data integrity error     | "Data integrity error. Please contact support."                          | "Kesalahan integritas data. Silakan hubungi dukungan."                    |
| FIL001     | File too large           | "File size exceeds the maximum limit of {size}."                         | "Ukuran file melebihi batas maksimum {size}."                             |
| FIL002     | Invalid file type        | "Invalid file type. Allowed types: {types}."                             | "Jenis file tidak valid. Jenis yang diizinkan: {types}."                  |
| DEV001     | Device error             | "Device error: {error}"                                                  | "Kesalahan perangkat: {error}"                                            |
| DEV002     | GPS error                | "Unable to determine location. Please check GPS settings."               | "Tidak dapat menentukan lokasi. Silakan periksa pengaturan GPS."          |

## Toast Notification Duration Guidelines

#

Toast notifications should follow these duration guidelines:

| Notification Type | Duration (ms) | Example                                           |
| ----------------- | ------------- | ------------------------------------------------- |
| Success           | 3000          | "Item created successfully"                       |
| Info              | 5000          | "System will be under maintenance at 10 PM"       |
| Warning           | 7000          | "You have unsaved changes"                        |
| Error             | 10000         | "An error occurred while processing your request" |

## Modal Dialog Types

#

Different types of modal dialogs are used for different purposes:

### Confirmation Dialog

#

Used to confirm user actions, especially destructive ones.

<ConfirmationDialog

  title="Delete Item"

  message="Are you sure you want to delete this item? This action cannot be undone."

  confirmButtonText="Delete"

  cancelButtonText="Cancel"

  onConfirm={() => handleDelete()}

  onCancel={() => closeDialog()}

/>

### Information Dialog

#

Used to display important information that requires user acknowledgment.

<InformationDialog

  title="Maintenance Notice"

  message="The system will be undergoing maintenance on July 15, 2025, from 10 PM to 2 AM. Some features may be unavailable during this time."

  buttonText="Got it"

  onClose={() => closeDialog()}

/>

### Form Dialog

#

Used for simple form inputs that don't require a full page.

<FormDialog

  title="Add Note"

  fields={\[

    { name: 'note', label: 'Note', type: 'textarea', required: true }

  \]}

  submitButtonText="Save"

  cancelButtonText="Cancel"

  onSubmit={(values) => handleSaveNote(values)}

  onCancel={() => closeDialog()}

/>

### Error Dialog

#

Used for displaying detailed error information.

<ErrorDialog

  title="Operation Failed"

  message="We couldn't complete your request due to an error."

  errorDetails={errorDetails}

  errorCode="SRV002"

  buttonText="Close"

  reportButtonText="Report Issue"

  onClose={() => closeDialog()}

  onReport={() => reportIssue()}

/>

## Notification Sounds

#

The system uses different notification sounds for different types of alerts:

| Notification Type | Sound File   | Description               | Usage                                   |
| ----------------- | ------------ | ------------------------- | --------------------------------------- |
| Success           | success.mp3  | Short, positive sound     | Successful operations                   |
| Warning           | warning.mp3  | Medium-pitched alert      | Warnings that require attention         |
| Error             | error.mp3    | Distinct alert sound      | Errors that require immediate attention |
| Info              | info.mp3     | Gentle notification sound | Information messages                    |
| New Task          | new-task.mp3 | Distinctive notification  | New task assignments                    |
| Message           | message.mp3  | Short message tone        | New messages or comments                |

## Implementation Guidelines

#

1.  Consistency: Always use the predefined prompts for similar situations across the application
2.  Variables: Use the {variable} syntax for dynamic content in messages
3.  Localization: All prompts must be implemented using the localization system
4.  Accessibility: Ensure that all prompts are accessible to screen readers
5.  Responsive Design: Ensure that prompts display correctly on all device sizes
6.  Error Handling: Always include error codes for error messages to facilitate troubleshooting
7.  User Testing: Validate prompt clarity through user testing

## Localization Implementation

#

The system uses a centralized localization system with JSON files for each supported language:

en.json (English)

{

  "login": {

    "success": "You have successfully logged in.",

    "failed": "Login failed. Please check your username and password."

  },

  "item": {

    "created": "{item} has been created successfully.",

    "updated": "{item} has been updated successfully.",

    "deleted": "{item} has been deleted successfully."

  }

}

id.json (Bahasa Indonesia)

{

  "login": {

    "success": "Anda telah berhasil masuk.",

    "failed": "Gagal masuk. Silakan periksa nama pengguna dan kata sandi Anda."

  },

  "item": {

    "created": "{item} telah berhasil dibuat.",

    "updated": "{item} telah berhasil diperbarui.",

    "deleted": "{item} telah berhasil dihapus."

  }

}

## Usage Examples

### React Component Example

#

import { useTranslation } from 'react-i18next';

import { toast } from 'react-toastify';

const CreateItemForm = () => {

  const { t } = useTranslation();

  const handleSubmit = async (data) => {

    try {

      const result = await createItem(data);

      toast.success(t('item.created', { item: 'Product' }));

      // Redirect or further processing

    } catch (error) {

      toast.error(t('error.general', { code: error.code }));

      // Error handling

    }

  };

  return (

    // Form implementation

  );

};

### Mobile App Example

#

import { useTranslation } from 'react-i18next';

import Toast from 'react-native-toast-message';

const PickupScreen = () => {

  const { t } = useTranslation();

  const completePickup = async (pickupId) => {

    try {

      await markPickupComplete(pickupId);

      Toast.show({

        type: 'success',

        text1: t('pickup.completed', { id: pickupId }),

        duration: 3000

      });

      navigation.navigate('PickupList');

    } catch (error) {

      Toast.show({

        type: 'error',

        text1: t('error.title'),

        text2: t(\`error.${error.code}\`, { fallback: t('error.general') }),

        duration: 5000

      });

    }

  };

  return (

    // Screen implementation

  );

};

## Conclusion

#

This System Prompts Document provides a comprehensive guide for implementing consistent and user-friendly messages throughout the Samudra Paket ERP system. By following these guidelines, the system will maintain a cohesive user experience and effectively communicate with users across all modules and interfaces.
