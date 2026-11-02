# Senarai Fail Wajib Dikemas Kini

Dokumen ini digunakan apabila projek Google Apps Script masih memaparkan UI lama,
contohnya medan **Nama Standard** masih kelihatan atau butang **Tambah Tahun** belum
muncul.

## Fail runtime yang wajib disalin

Kemas kini kandungan fail berikut dalam editor Google Apps Script:

| Bil. | Fail | Sebab diperlukan |
|---:|---|---|
| 1 | `Config.gs` | Menetapkan versi aplikasi `1.3.0`. |
| 2 | `Auth.gs` | Menghantar identiti pengguna dan versi aplikasi kepada frontend. |
| 3 | `AdminService.gs` | Menjana tahun baharu serta memulangkan tahun dan item terkini. |
| 4 | `Index.html` | Memuatkan login, dialog tahun, butang header dan menu sidebar. |
| 5 | `Login.html` | **Fail baharu** untuk skrin Log Masuk Google. |
| 6 | `Standard.html` | Membuang medan Nama Standard dan menambah butang Tambah Tahun. |
| 7 | `Scripts.html` | Mengendalikan login, dialog tahun dan butang Tambah Tahun. |
| 8 | `ClientStandardItem.html` | Menghapuskan rujukan JavaScript kepada medan `stdName`. |
| 9 | `ClientDocumentAdmin.html` | Mengemas kini dropdown selepas tahun baharu dijana. |
| 10 | `Styles.html` | Gaya login, dialog dan butang Tambah Tahun yang responsif. |
| 11 | `Tetapan.html` | Pilihan alternatif Tambah Tahun dalam halaman Tetapan. |

> Jika salah satu fail di atas tidak dikemas kini, frontend dan backend boleh menjadi
> tidak sepadan. Cara paling selamat ialah menyegerakkan **semua fail `.gs` dan
> `.html`** daripada repositori ini.

## Cara mencipta `Login.html`

Dalam editor Apps Script:

1. Tekan ikon **+** di sebelah `Files`.
2. Pilih **HTML**.
3. Masukkan nama `Login` — editor akan menghasilkan `Login.html`.
4. Salin keseluruhan kandungan `Login.html` daripada repositori.

Jangan namakan fail sebagai `Login.html.html`.

## Terbitkan versi baharu

Menyimpan fail sahaja tidak mengemas kini URL `/exec` yang sedang digunakan.

1. Tekan **Save project**.
2. Pilih **Deploy → Manage deployments**.
3. Tekan ikon pensel pada deployment Web App semasa.
4. Pada **Version**, pilih **New version**.
5. Masukkan penerangan `SK@S v1.3.0`.
6. Tekan **Deploy**.
7. Buka semula URL yang berakhir dengan `/exec`.
8. Tekan `Ctrl + Shift + R`.

## Cara mengesahkan versi betul

Deployment baharu adalah betul apabila:

- halaman pertama ialah skrin **Log Masuk**;
- selepas masuk, header menunjukkan `v1.3.0`;
- halaman **Skor Standard** tidak lagi mempunyai medan **Nama Standard**;
- butang **Tambah Tahun** berada di sebelah dropdown Tahun;
- menu **Tambah Tahun** turut muncul dalam sidebar untuk pengguna `ADMIN`.

Jika `v1.3.0` tidak kelihatan, URL tersebut masih menggunakan deployment lama atau
cache pelayar lama.

## Kemas kini lencana sekolah

Untuk perubahan lencana pada skrin login, kemas kini **satu fail sahaja**:

1. `Login.html`

Lencana semasa menggunakan Google Drive file ID
`1byIjETieWJNW1XYMzIYmoDZLh_4MNubc`. Pastikan tetapan perkongsian fail ialah
**Anyone with the link — Viewer**. Jika imej tidak boleh dicapai, sistem memaparkan
ikon sekolah sebagai fallback dan tidak menghalang proses login.

## Kemas kini pengisian skor item dan peratus standard

Untuk modul skor item berasaskan katalog SK@S, kemas kini fail runtime berikut:

1. `Config.gs`
2. `Setup.gs`
3. `ItemService.gs`
4. `Item.html`
5. `ClientStandardItem.html`
6. `Styles.html`

Selepas menyalin fail, jalankan `setupSystem()` sekali untuk menambah item yang belum
wujud. Proses penyelarasan tidak memadam skor, isu atau item tersuai sedia ada.
Kemudian terbitkan **New version** bagi Web App.
