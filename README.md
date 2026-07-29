# ONE PAGE REPORT SEKOLAH KEBANGSAAN LORMALONG

Sistem Google Apps Script Web App lengkap untuk menyimpan laporan dalam Google Sheets, gambar dan PDF dalam Google Drive, serta menyediakan sejarah, carian, suntingan dan soft delete.

## Bahagian 1 — Struktur Google Sheets

`setupSystem()` mencipta helaian transaksi dan tetapan berasingan tanpa memadam data sedia ada:

- **LAPORAN** — ID, butiran program, objektif, impak, pencapaian, JSON jemputan/guru/gambar, pautan PDF, status dan cap masa.
- **TETAPAN** — `JENIS`, `KOD`, `NILAI`, `UNIT BERKAITAN`, templat objektif/impak/penambahbaikan dan `STATUS`. Hanya baris `AKTIF` digunakan.
- **LOG_AKTIVITI** — ID log/laporan, tindakan, pengguna, masa dan butiran audit.
- **UNIT** — senarai unit untuk dropdown.
- **PERINGKAT** — senarai peringkat untuk dropdown.
- **ANJURAN** — senarai penganjur untuk dropdown.
- **TAHUN** — senarai tahun untuk dropdown; pentadbir boleh menambah tahun baharu tanpa mengubah HTML.
- **SENARAI_GURU** — senarai guru untuk dropdown penglibatan dan penyedia laporan.
- **AI_DATABASE** — kata kunci, unit, peringkat, dua objektif, impak dan penambahbaikan. Hanya `KATA KUNCI` dan `NAMA LAPORAN` digunakan untuk memilih templat; Unit dan Peringkat tidak mempengaruhi padanan.

Senarai kepala kolum kanonik berada dalam `Config.gs`. Data berbilang disimpan sebagai JSON.

## Bahagian 2 — Langkah Persediaan

1. Cipta Google Spreadsheet kosong dan salin ID di antara `/d/` dan `/edit` pada URL.
2. Buka **Extensions → Apps Script** dari Spreadsheet (projek bound disyorkan).
3. Cipta fail `.gs` dan `.html` mengikut nama dalam repositori ini, kemudian salin kandungannya. Salin manifest melalui paparan `appsscript.json` dalam Project Settings.
4. Masukkan ID Spreadsheet pada `CONFIG.SPREADSHEET_ID`. Untuk projek bound, ia boleh dibiarkan kosong; `setupSystem()` menyimpannya ke Script Properties.
5. Folder ID boleh dimasukkan pada `MAIN_FOLDER_ID`, `IMAGE_FOLDER_ID` dan `PDF_FOLDER_ID`. Jika kosong, `setupSystem()` mencipta struktur folder secara automatik.
6. Masukkan URL awam atau ID fail Drive lencana pada `SCHOOL_LOGO_URL`. Pastikan akaun pelaksana boleh membaca fail tersebut.
7. Pilih fungsi `setupSystem` dalam editor dan klik **Run** sekali.
8. Semak skop Sheets, Drive, external request dan identiti pengguna, kemudian klik **Allow**.
9. Pilih **Deploy → New deployment → Web app**. Jalankan sebagai **Me**, supaya storan pusat sekolah digunakan.
10. Pilih akses yang menepati polisi sekolah (contohnya **Anyone in the domain**). Elakkan akses awam jika laporan mengandungi data peribadi.

Pentadbir boleh menyunting helaian berasingan dengan mudah. Letakkan nilai pada kolum `NILAI` dan gunakan `STATUS=AKTIF`. Selepas mengubah `UNIT`, `PERINGKAT`, `ANJURAN` atau `SENARAI_GURU`, jalankan `clearSystemCache()` atau tunggu 10 minit. Helaian `TETAPAN` lama dikekalkan sebagai fallback untuk keserasian projek sedia ada.

## Bahagian 3 — Kod Penuh

Kod modular penuh terkandung dalam `Config.gs`, `Code.gs`, `Database.gs`, `DriveManager.gs`, `PDFGenerator.gs`, `Helpers.gs`, `Index.html`, `Styles.html`, `JavaScript.html`, dan `ReportTemplate.html`.

### Menukar saiz fon laporan

Semua saiz fon PDF/pratonton dipusatkan dalam blok `:root` pada baris awal `ReportTemplate.html`. Ubah pemboleh ubah `--font-report-title`, `--font-body`, `--font-label` dan saiz adaptif berkaitan tanpa menyunting selector lain. Tetapan semasa menggunakan label biru 12pt dengan fon bulat/mesra serta nilai pengisian 12pt dengan `Trebuchet MS`; nilai sederhana dan padat juga dikunci kepada 12pt. Semua kotak menggunakan navy blue pastel dengan teks navy gelap untuk kontras cetakan. Keluarga fon mempunyai fallback selamat. Gunakan unit `pt` dan uji semula pratonton selepas perubahan.

## Bahagian 4 — Cara Uji Sistem

- Simpan laporan tanpa gambar, kemudian pastikan teks memenuhi lebar laporan.
- Uji satu gambar, kemudian 2–6 dan lebih enam gambar; semak grid serta kapsyen.
- Uji kedua-dua pilihan pencapaian dan pastikan bahagian kosong tidak dipaparkan.
- Uji tanpa jemputan dan beberapa jemputan.
- Uji seorang guru dan ramai guru; cuba pilih nama pendua.
- Edit laporan dan pastikan baris sama dikemas kini.
- Padam laporan dan pastikan ia hilang daripada sejarah serta fail dialihkan ke tong sampah.
- Jana dan jana semula PDF; semak pautan terkini.
- Uji carian, unit, tarikh dan pagination.
- Gunakan DevTools responsive mode dan telefon sebenar untuk sidebar, borang, kad sejarah dan modal.

## Bahagian 5 — Penyelesaian Masalah

- **Gambar/lencana tidak keluar dalam PDF:** pastikan ID tepat dan akaun pelaksana ada akses. Sistem memasukkan blob sebagai data URI, bukan pautan paparan Drive.
- **PDF dua halaman:** pendekkan teks jika luar biasa panjang. Templat mengecilkan fon secara terkawal tetapi tidak membuang data.
- **Dropdown kosong:** jalankan `setupSystem()`, semak `STATUS=AKTIF`, kemudian `clearSystemCache()`.
- **Data tidak disimpan:** semak ID Spreadsheet, kebenaran, medan wajib dan Execution log Apps Script.
- **Drive ditolak:** jalankan semula `setupSystem()` dari editor dan benarkan semua skop; semak polisi pentadbir Workspace.
- **Web App lambat:** kecilkan gambar, gunakan cache sedia ada, dan elakkan folder Drive yang terlalu sarat.
- **Hari tidak dijana:** gunakan pemilih tarikh dalam format ISO dan semak zon masa projek `Asia/Kuala_Lumpur`.
- **PDF tidak boleh dibuka:** pastikan fail belum di tong sampah dan polisi perkongsian Drive membenarkan pengguna semasa.
- **Gambar telefon terlalu besar:** aplikasi menghadkan 8 MB dan mengecilkan sisi terpanjang kepada 1800 px; kecilkan resolusi kamera jika fail asal masih melebihi had.
