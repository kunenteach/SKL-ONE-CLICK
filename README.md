# Dashboard Standard Kualiti @ Sekolah

Web App Google Apps Script untuk pengurusan skor SK@S Sekolah Kebangsaan Lormalong. Sistem menggunakan Google Sheets sebagai pangkalan data, Google Drive untuk dokumen, dan Chart.js untuk visualisasi.

Lencana muka login terkandung sepenuhnya dalam `Login.html`, jadi perubahan lencana
hanya memerlukan satu fail dikemas kini. Fail Drive mesti dikongsi sebagai **Anyone
with the link** supaya lencana boleh dipaparkan kepada semua pengguna.

> **UI lama masih dipaparkan?** Ikuti senarai fail dan langkah penerbitan dalam
> [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md). Menyimpan kod tanpa memilih
> **New version** tidak akan mengemas kini URL Web App `/exec`.

## Struktur fail modular

Projek sengaja dipecahkan mengikut tanggungjawab supaya perubahan pada satu modul tidak
memerlukan penyuntingan satu fail monolitik:

- `Config.gs` — konfigurasi, nama sheet dan katalog asas.
- `Code.gs` — utiliti bersama, entry point Web App dan menu Spreadsheet.
- `Setup.gs` — penciptaan sheet, folder Drive dan data tahun asas.
- `Auth.gs` — pengguna, peranan, cache tetapan dan log audit.
- `StandardService.gs` dan `ItemService.gs` — operasi markah standard/item.
- `AnalyticsService.gs` — dashboard, analisis tahunan dan rumusan automatik.
- `ActionPlanService.gs`, `DocumentService.gs` dan `AdminService.gs` — pelan
  tindakan, dokumen dan operasi pentadbir.
- `Index.html` — kerangka tetap header/sidebar dan pemuat modul halaman.
- `Dashboard.html`, `Standard.html`, `Item.html`, `AnalisisTahunan.html`,
  `PelanTindakan.html`, `Dokumen.html` dan `Tetapan.html` — paparan setiap modul.
- `Scripts.html` dan fail `Client*.html` — teras frontend dan pengawal khusus modul.
- `Styles.html` — sistem reka bentuk responsif dan gaya cetakan.

Google Apps Script menggabungkan semua fail `.gs` dalam projek pada masa jalan. Oleh itu,
fungsi awam dan kontrak `google.script.run` kekal serasi walaupun implementasi dipisahkan.

## Struktur pangkalan data

`setupSystem()` mencipta lapan sheet: `01_SETTING`, `02_STANDARD`, `03_ITEM`, `04_ANALISIS`, `05_PELAN_TINDAKAN`, `06_DASHBOARD`, `07_DOKUMEN`, dan `08_LOG_AKTIVITI`. Tajuk kolum ditakrifkan secara berpusat dalam `Code.gs`. Jadual pengguna berada pada kolum E–H dalam `01_SETTING`.

## Pemasangan

1. Cipta Google Spreadsheet dan salin ID daripada URL di antara `/d/` dan `/edit`.
2. Cipta projek Apps Script (projek terikat pada Spreadsheet turut disokong).
3. Salin **semua** fail `.gs` dan `.html` serta `appsscript.json` ke projek. Nama fail
   mesti dikekalkan kerana `Index.html` memuatkan partial melalui fungsi `include()`.
4. Masukkan ID Spreadsheet pada `CONFIG.SPREADSHEET_ID`. Untuk projek terikat, placeholder boleh dibiarkan dan spreadsheet aktif digunakan.
5. Jika folder Drive sudah tersedia, masukkan ID pada `CONFIG.DRIVE_FOLDER_ID`. Jika placeholder dibiarkan, `setupSystem()` mencipta folder dan menyimpan ID dalam Script Properties.
6. Jalankan `setupSystem()` dari editor Apps Script dan luluskan kebenaran Sheets/Drive. Akaun yang menjalankan setup ditambah sebagai `ADMIN` jika e-melnya tersedia.
7. Semak jadual pengguna di kolum E–H `01_SETTING`; tambah e-mel deployment sebagai `ADMIN`/`GURU` dan `AKTIF` jika perlu.

## Deployment Web App

1. Pilih **Deploy → New deployment → Web app**.
2. Tetapkan **Execute as: User accessing the web app** untuk identiti `Session.getActiveUser()` yang paling tepat dalam domain Google Workspace. Jika polisi organisasi memerlukan **Execute as me**, pastikan akses hanya diberikan kepada domain dan uji pendedahan e-mel aktif.
3. Tetapkan **Who has access** kepada pengguna dalam domain/organisasi yang dibenarkan, bukan awam, bagi data sekolah.
4. Deploy, luluskan kebenaran, dan buka URL `/exec`.

> Ketersediaan e-mel daripada `Session.getActiveUser()` bergantung pada jenis akaun, polisi domain dan tetapan deployment. Sistem menolak akses jika e-mel tidak boleh dikenal pasti atau tidak aktif dalam jadual pengguna.

## Operasi

- Apabila URL Web App dibuka, tekan **Log Masuk dengan Akaun Google**. Sistem
  menyemak akaun Google aktif melalui `Session.getActiveUser().getEmail()` dan hanya
  membenarkan e-mel berstatus `AKTIF` dalam jadual pengguna `01_SETTING`.
- Untuk menambah tahun, log masuk sebagai **ADMIN** dan tekan **Tambah Tahun** di
  sebelah medan Tahun pada halaman **Skor Standard**. Pilihan yang sama juga terdapat
  pada sidebar dan di sebelah penapis tahun pada header. Masukkan tahun, kemudian
  tekan **Jana Tahun**.
  Pilihan yang sama turut tersedia melalui **Tetapan → Tambah Tahun Baharu** atau
  menu Spreadsheet **SK@S SYSTEM → Jana Tahun Baharu**. Sistem menyalin katalog
  standard/item tahun sebelumnya dan mengosongkan semua skor.
- Skor standard disimpan satu rekod bagi setiap gabungan tahun/standard. Skor item dihantar secara pukal dalam satu panggilan.
- ADMIN boleh mengurus tetapan, pengguna dan pemadaman. GURU hanya boleh mengubah skor yang dimasukkan oleh e-mel sendiri.
- Gunakan **Cetak / PDF** dan pilih *Save as PDF*, orientasi landskap, saiz A4. Eksport CSV tersedia pada dashboard.

## Penyelesaian masalah

- **Sheet belum disediakan:** jalankan `setupSystem()` dan semak ID Spreadsheet.
- **E-mel belum didaftarkan:** tambah e-mel pada kolum E–H `01_SETTING` dengan status `AKTIF`, kemudian deploy semula jika skop berubah.
- **E-mel kosong:** gunakan akaun Workspace dan deployment untuk pengguna organisasi; semak polisi pentadbir domain.
- **Fail gagal dimuat naik:** semak format, had 10 MB, ID folder dan kebenaran Drive.
- **Carta tidak muncul:** pastikan rangkaian membenarkan CDN `cdn.jsdelivr.net`, kemudian muat semula.
- **Perubahan kod tidak kelihatan:** cipta versi deployment baharu atau edit deployment kepada versi terkini.

## Kaedah pengiraan skor item

Guru mengisi semua skor item bagi tahun dan standard yang dipilih melalui modul
**Skor Item**. Purata item dikira sebagai rujukan, manakala **Peratus Skor Standard
Rasmi** diisi berdasarkan rumusan SK@S kerana kaedah pemberatan boleh berbeza antara
standard. Nilai rasmi ini disimpan dalam `02_STANDARD` dan digunakan oleh dashboard,
carta serta perbandingan tahunan. Jalankan `setupSystem()` sekali selepas menaik taraf
untuk menambah item katalog yang belum wujud; skor dan item tersuai sedia ada tidak
dipadam.


## Perubahan Item dan Sasaran

- Sasaran lalai sistem ialah `100`. Jalankan semula `setupSystem()` selepas kemas kini untuk menyelaraskan sasaran item katalog sedia ada kepada 100.
- Modul Skor Item memaparkan sub tajuk rasmi seperti `1.1 PGB SEBAGAI PENERAJU` sebelum item `1.1.1`, kemudian `1.2` sebelum `1.2.1`, dan seterusnya sehingga Standard 5.
- Peratus skor standard rasmi masih perlu diisi di medan **Peratus Skor Standard Rasmi** kerana peratus rumusan SK@S mungkin menggunakan pemberatan rasmi, bukan purata ringkas item. Nilai ini disimpan ke `02_STANDARD` dan digunakan untuk dashboard/perbandingan tahunan.


## Ralat Simpan Skor

Jika butang **Simpan / Kemas Kini** pada Skor Standard atau **Simpan Skor Item dan Peratus Standard** gagal selepas data pernah dibuka/diimport daripada Excel, kemas kini `Code.gs` dan `Scripts.html`. Fungsi bacaan data kini membaca hanya lebar kolum rasmi berdasarkan `HEADERS`, bukan semua kolum kosong/format tambahan pada sheet. Ini mengelakkan ralat saiz kolum semasa `setValues()`. Frontend juga memaparkan mesej ralat sebenar daripada pelayan supaya punca kegagalan lebih jelas.


## Menjalankan Fungsi daripada Apps Script Editor

Jangan tekan **Run** terus pada fungsi `saveStandardScore` atau `saveBulkItemScores` kerana kedua-duanya memerlukan objek data daripada borang Web App melalui `google.script.run`. Untuk setup, jalankan `setupSystem()` sahaja. Untuk menguji simpan skor, buka URL Web App (`/exec`), log masuk, kemudian simpan melalui menu **Skor Standard** atau **Skor Item**.


## Pilih Standard Tidak Sepatutnya Memanggil Pelayan

Versi terkini tidak lagi memanggil `getStandardData()` setiap kali pengguna menukar pilihan Standard. Data bagi tahun dipilih dimuat sekali sahaja; pertukaran Standard hanya memilih rekod daripada state frontend. Ini mengurangkan panggilan `google.script.run` dan mengelakkan toast `Operasi gagal` muncul hanya kerana pengguna memilih Standard.


## Lencana Sekolah

Lencana sekolah menggunakan fail Google Drive `1byIjETieWJNW1XYMzIYmoDZLh_4MNubc`. Sistem kini cuba membaca fail melalui `DriveApp` dan menghantar imej sebagai data URL, jadi lencana masih boleh dipaparkan walaupun pautan thumbnail Google Drive tidak boleh dimuatkan terus oleh browser.


Lencana juga mempunyai URL terus `https://lh3.googleusercontent.com/d/1byIjETieWJNW1XYMzIYmoDZLh_4MNubc=w400` sebagai fallback paparan login dan header dashboard.

## Login Menggunakan Kata Laluan Sahaja

Selain login Google, muka depan menyokong login menggunakan satu medan kata
laluan sahaja. ID pengguna tidak diperlukan. Peranan ditentukan terus daripada
kata laluan berikut:

- `ADMIN`: `A001`
- `GURU`: `A002`

Masukkan `A001` untuk membuka sistem sebagai pentadbir atau `A002` untuk membuka
sistem sebagai guru. Tiada perubahan manual pada `01_SETTING` diperlukan untuk
aliran kata laluan ini. Rekod pengguna dalam `01_SETTING` masih digunakan oleh
pilihan log masuk Google dan pengurusan pengguna sedia ada.

## Format Pelan Tindakan

Modul Pelan Tindakan menggunakan tujuh medan utama: **Fokus Utama**, **Data
TOV**, **Objektif**, **Pelan Intervensi**, **Tempoh**, **Tanggungjawab** dan
**Catatan**. Catatan pelaksanaan mempunyai tiga pilihan: `TELAH DILAKSANAKAN`,
`BELUM DILAKSANAKAN` dan `SEDANG DILAKSANAKAN`. Kolum format baharu ditambah
selepas struktur lama dalam `05_PELAN_TINDAKAN`, jadi rekod terdahulu tidak perlu
dipadam dan masih boleh dipaparkan melalui fallback keserasian.

## Fail Digital SK@S

Menu **Fail Digital SK@S** memaparkan senarai dokumen dahulu dan menyusun rekod
daripada tahun terkini kepada tahun terdahulu. GURU atau ADMIN boleh menekan
**Tambah Dokumen** untuk membuka borang muat naik di bawah senarai. Borang hanya
memerlukan Tahun, Kategori, Nama Dokumen dan Fail. Kategori yang disediakan ialah
CARTA, SURAT LANTIKAN, CARTA ORGANISASI SK@S SKL, TAKWIM SK@S, PEKELILING,
PROSEDUR KUALITI, SURAT PANGGILAN, MINIT MESYUARAT dan LAPORAN/OPR.

Kategori `LAIN-LAIN` turut disediakan untuk fail yang tidak termasuk dalam
kategori utama.

## Link Pengisian

Menu **Link Pengisian** menyediakan jadual Tahun, Perkara dan Link/Pautan.
Senarai disusun daripada tahun terkini. GURU dan ADMIN boleh menekan **Tambah
Link Pengisian** di bawah jadual untuk menyimpan pautan baharu. Sistem mencipta
sheet `09_LINK_PENGISIAN` secara automatik jika sheet tersebut belum wujud dan
hanya menerima URL yang bermula dengan `http://` atau `https://`.
