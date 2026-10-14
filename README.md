# STANDARD KUALITI @ SEKOLAH

Shell Phase 1 untuk Sistem Pengurusan & Pengumpulan Evidens berasaskan Google Apps Script.

## Penyediaan

1. Cipta projek Apps Script atau gunakan `clasp` untuk memuat naik fail projek.
2. Tetapkan `spreadsheetId` dan `evidenceFolderId` dalam `Config.gs` apabila integrasi Phase 3 dimulakan.
3. Deploy sebagai Web App.

## Login Kata Laluan Sahaja

Login dashboard menggunakan **password sahaja**. Tiada ID, email atau nama pengguna diperlukan. Selepas semua fail versi terkini disimpan dan Web App dideploy semula, gunakan satu-satunya password:

```text
A001
```

Kod hanya menyimpan salted hash bagi `A001`, bukan plaintext. Script Properties dan fungsi setup password lama tidak lagi digunakan, jadi tiada password alternatif boleh mengatasi `A001`.

### Jika halaman masih meminta Email / ID Pengguna

Itu ialah UI versi lama. Auth baharu tidak mempunyai ID pengguna—hanya satu medan password. Pastikan sekurang-kurangnya `Index.html`, `Scripts.html`, `AuthService.gs` dan `Code.gs` dalam project Apps Script telah diganti dengan versi repository terkini. Menyalin `AuthService.gs` sahaja tidak akan mengubah borang login kerana struktur borang berada dalam `Index.html` dan aliran login berada dalam `Scripts.html`.

Selepas semua fail disimpan, gunakan **Deploy → Manage deployments → Edit → New version → Deploy**. Buka semula URL deployment `/exec` dalam tab baharu atau lakukan hard refresh. Halaman terkini akan memaparkan hanya medan **Kata laluan**; masukkan `A001`. Jangan masukkan sebarang ID.

Butang **LIHAT/SOROK** tersedia untuk menyemak password sebelum log masuk.

Data aspek rasmi sengaja dibiarkan kosong dalam `OFFICIAL_DATA`. Masukkan data sumber kebenaran daripada screenshot ke konfigurasi tersebut tanpa mengubah komponen UI.

## Modul Agihan PPS

Jalankan `initializePpsModule()` sekali sebagai pentadbir untuk menyediakan jadual normalized tanpa menimpa data sedia ada. Isi `MASTER_GURU` dan, jika digunakan, `MASTER_JAWATAN`; aplikasi hanya memuatkan guru/jawatan aktif dan mengambil kedua-duanya sekali dalam bootstrap.

Setiap PPS disimpan sebagai satu row dalam `PPS_ASSIGNMENT`. Unit dinamik disimpan dalam `MASTER_UNIT_KOKURIKULUM`, manakala panitia disimpan dalam `MASTER_PANITIA`. Semua operasi tambah, kemas kini dan buang direkodkan dalam `ACTIVITY_LOG`.

## Modul Pengisian Evidens

`EVIDENS` menyimpan satu evidens bagi setiap row menggunakan konteks unik `STANDARD + NO_ASPEK + SUB_KATEGORI + SUB_ITEM`. `FILE_UPLOAD` menyimpan satu fail bagi setiap row dan membolehkan satu evidens mempunyai berbilang fail. Paparan PPS sentiasa dibaca daripada `PPS_ASSIGNMENT`, jadi guru tidak perlu diagihkan semula dalam modul evidens.

Tetapkan `evidenceFolderId` sebelum menggunakan pilihan Upload. Pilihan Fail Fizikal boleh digunakan tanpa Google Drive. Penyimpanan dilakukan bagi satu konteks aspek pada satu masa, dengan document lock, rollback metadata jika operasi gagal, audit trail dan auto-collapse pada klien selepas server mengesahkan simpanan.

### Import evidens secara pukal

Dalam editor sesuatu aspek, klik **IMPORT PUKAL** dan paste satu nama evidens pada setiap baris. Senarai bernombor (`1.`, `2)`), bullet (`-`, `•`, `*`), baris kosong dan nama pendua akan dibersihkan secara automatik. Klik **BINA JADUAL** untuk menghasilkan rekod berasingan yang masih boleh diedit.

Setiap baris evidens mempunyai lokasi sendiri: **FAIL** untuk nama/lokasi fail fizikal dan divider, **LINK** untuk nama serta URL `https://`, atau **UPLOAD** untuk satu atau lebih fail digital. Semua baris disimpan secara atomik bagi aspek tersebut.
