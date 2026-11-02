/** Konfigurasi tunggal aplikasi. Tukar ID sebelum deployment. */
const CONFIG = Object.freeze({
  SPREADSHEET_ID: 'MASUKKAN_SPREADSHEET_ID',
  DRIVE_FOLDER_ID: 'MASUKKAN_FOLDER_ID',
  APP_TITLE: 'DASHBOARD STANDARD KUALITI @ SEKOLAH',
  APP_VERSION: '1.3.0',
  SCHOOL_EMBLEM_FILE_ID: '1byIjETieWJNW1XYMzIYmoDZLh_4MNubc',
  SCHOOL_EMBLEM_URL: 'https://lh3.googleusercontent.com/d/1byIjETieWJNW1XYMzIYmoDZLh_4MNubc=w400',
  SCHOOL_NAME: 'SEKOLAH KEBANGSAAN LORMALONG',
  DEFAULT_TARGET: 100,
  START_YEAR: 2023,
  TIMEZONE: 'Asia/Kuala_Lumpur',
  DATE_FORMAT: 'dd/MM/yyyy',
  MAX_FILE_MB: 10,
  ALLOWED_EXTENSIONS: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'JPG', 'JPEG', 'PNG'],
  DOCUMENT_CATEGORIES: ['CARTA', 'SURAT LANTIKAN', 'CARTA ORGANISASI SK@S SKL', 'TAKWIM SK@S', 'PEKELILING', 'PROSEDUR KUALITI', 'SURAT PANGGILAN', 'MINIT MESYUARAT', 'LAPORAN/OPR', 'LAIN-LAIN'],
  ACTION_STATUSES: ['BELUM DILAKSANAKAN', 'SEDANG DILAKSANAKAN', 'TELAH DILAKSANAKAN']
});

const SHEETS = Object.freeze({
  SETTINGS: '01_SETTING', STANDARD: '02_STANDARD', ITEM: '03_ITEM',
  ANALYSIS: '04_ANALISIS', ACTION: '05_PELAN_TINDAKAN', DASHBOARD: '06_DASHBOARD',
  DOCUMENT: '07_DOKUMEN', LOG: '08_LOG_AKTIVITI', ENTRY_LINK: '09_LINK_PENGISIAN'
});

const BASE_STANDARDS = Object.freeze([
  ['1', 'KEPIMPINAN'], ['2', 'PENGURUSAN ORGANISASI'],
  ['3.1', 'PENGURUSAN KURIKULUM'], ['3.2', 'PENGURUSAN KOKURIKULUM'],
  ['3.3', 'PENGURUSAN HAL EHWAL MURID'], ['4', 'PEMBELAJARAN DAN PEMUDAHCARAAN'],
  ['5', 'KEMENJADIAN MURID']
]);


const BASE_ITEM_GROUPS = Object.freeze({
  '1': [['1.1', 'PGB SEBAGAI PENERAJU'], ['1.2', 'PGB SEBAGAI PEMBIMBING'], ['1.3', 'PGB SEBAGAI PENDORONG']],
  '2': [['2.1', 'PENGURUSAN SUMBER MANUSIA'], ['2.2', 'PENGURUSAN ASET'], ['2.3', 'PENGURUSAN KEWANGAN'], ['2.4', 'PENGURUSAN SUMBER PENDIDIKAN'], ['2.5', 'IKLIM'], ['2.6', 'PENGURUSAN PERPADUAN'], ['2.7', 'PERMUAFAKATAN STRATEGIK']],
  '3.1': [['3.1.1', 'KETETAPAN PELAKSANAAN KURIKULUM'], ['3.1.2', 'PENGURUSAN MATA PELAJARAN'], ['3.1.3', 'PENGURUSAN MASA INSTRUKSIONAL'], ['3.1.4', 'PENGURUSAN PENILAIAN MURID']],
  '3.2': [['3.2.1', 'KETETAPAN PELAKSANAAN KOKURIKULUM'], ['3.2.2', 'PENGURUSAN KELAB/PERSATUAN'], ['3.2.3', 'PENGURUSAN BADAN BERUNIFORM'], ['3.2.4', 'PENGURUSAN SUKAN/PERMAINAN'], ['3.2.5', 'PENGURUSAN PROGRAM KECEMERLANGAN KOKURIKULUM'], ['3.2.6', 'PENGURUSAN SUKAN UNTUK SEMUA'], ['3.2.7', 'PENGURUSAN PENTAKSIRAN KOKURIKULUM']],
  '3.3': [['3.3.1', 'KETETAPAN PELAKSANAAN HAL EHWAL MURID'], ['3.3.2', 'PENGURUSAN DISIPLIN MURID'], ['3.3.3', 'PENGURUSAN KESELAMATAN MURID'], ['3.3.4', 'PENGURUSAN KESIHATAN MURID'], ['3.3.5', 'PENGURUSAN BANTUAN PELAJARAN MURID'], ['3.3.6', 'PENGURUSAN PERKHIDMATAN BIMBINGAN DAN KAUNSELING'], ['3.3.7', 'PENGURUSAN PENTADBIRAN PSIKOMETRIK']],
  '4': [['4.1', 'GURU SEBAGAI PERANCANG'], ['4.2', 'GURU SEBAGAI PENGAWAL'], ['4.3', 'GURU SEBAGAI PEMBIMBING'], ['4.4', 'GURU SEBAGAI PENDORONG'], ['4.5', 'GURU SEBAGAI PENILAI'], ['4.6', 'MURID SEBAGAI PEMBELAJAR AKTIF']],
  '5': [['5.1', 'KEMENJADIAN MURID DALAM AKADEMIK'], ['5.2', 'KEMENJADIAN MURID DALAM KOKURIKULUM'], ['5.3', 'KEMENJADIAN SAHSIAH MURID'], ['5.4', 'PENCAPAIAN GURU DAN SEKOLAH']]
});

const BASE_ITEMS = Object.freeze([
  // Standard 1 — Kepimpinan
  ['1','1.1.1','PGB menetapkan hala tuju sekolah secara terancang.'],
  ['1','1.1.2','PGB mengetuai penyediaan Rancangan Pemajuan Sekolah secara terancang dan sistematik.'],
  ['1','1.1.3','PGB mengetuai pemantauan pengoperasian sekolah secara terancang dan sistematik.'],
  ['1','1.1.4','PGB menerajui aktiviti instruksional dalam pelaksanaan PdP secara profesional dan terancang.'],
  ['1','1.1.5','PGB menerajui aktiviti instruksional dalam pelaksanaan pencerapan PdP secara profesional dan terancang.'],
  ['1','1.1.6','PGB menerajui aktiviti instruksional dalam pelaksanaan pemantauan kemajuan dan pencapaian murid.'],
  ['1','1.1.7','PGB menangani masalah pengoperasian sekolah secara profesional dan terancang.'],
  ['1','1.2.1','PGB memberikan bimbingan kepada guru dan AKP secara profesional dan terancang.'],
  ['1','1.2.2','PGB memberi bimbingan kepada barisan pemimpin yang diturunkan kuasa secara profesional.'],
  ['1','1.3.1','PGB mendorong warga sekolah dengan menjadi suri teladan secara profesional dan terancang.'],
  ['1','1.3.2','PGB menggalakkan warga sekolah memberi input berkaitan pemajuan sekolah secara profesional.'],
  ['1','1.3.3','PGB menggerakkan warga sekolah dalam melaksanakan tanggungjawab secara terancang.'],
  // Standard 2 — Pengurusan Organisasi
  ['2','2.1.1','Sumber manusia diurus secara sistematik dan terancang.'],
  ['2','2.1.2','Pembangunan sumber manusia diurus secara terancang.'],
  ['2','2.2.1','Aset alih dan aset tak alih diurus secara sistematik dan terancang.'],
  ['2','2.3.1','Kewangan diurus secara sistematik dan terancang.'],
  ['2','2.4.1','Sumber pendidikan diurus secara sistematik dan terancang.'],
  ['2','2.5.1','Persekitaran fizikal disenggara secara sistematik dan terancang.'],
  ['2','2.5.2','Suasana yang selesa dan harmoni diwujud dan dikekalkan secara sistematik dan terancang.'],
  ['2','2.6.1','Pemahaman dan penerimaan terhadap kepelbagaian masyarakat Malaysia diurus secara terancang.'],
  ['2','2.7.1','Permuafakatan strategik diusahakan secara profesional dan terancang.'],
  // Standard 3.1 — Pengurusan Kurikulum
  ['3.1','3.1.1.1','Pelaksanaan kurikulum diurus secara sistematik dan terancang.'],
  ['3.1','3.1.2.1','Pelaksanaan mata pelajaran diurus secara profesional dan terancang.'],
  ['3.1','3.1.2.2','Program peningkatan kualiti pengajaran guru diurus secara terancang.'],
  ['3.1','3.1.2.3','Program peningkatan pencapaian murid diurus secara profesional dan terancang.'],
  ['3.1','3.1.2.4','Bantuan geran per kapita mata pelajaran dimanfaatkan secara sistematik dan terancang.'],
  ['3.1','3.1.3.1','Masa pelaksanaan PdP diurus secara sistematik dan terancang.'],
  ['3.1','3.1.4.1','Peperiksaan dan pentaksiran diurus secara sistematik dan terancang.'],
  // Standard 3.2 — Pengurusan Kokurikulum
  ['3.2','3.2.1.1','Pelaksanaan kokurikulum diurus secara sistematik dan terancang.'],
  ['3.2','3.2.2.1','Kelab dan persatuan diurus secara sistematik dan terancang.'],
  ['3.2','3.2.3.1','Badan beruniform diurus secara sistematik dan terancang.'],
  ['3.2','3.2.4.1','Sukan dan permainan diurus secara sistematik dan terancang.'],
  ['3.2','3.2.5.1','Program kecemerlangan kokurikulum diurus secara profesional dan terancang.'],
  ['3.2','3.2.6.1','Aktiviti Sukan Untuk Semua diurus secara profesional dan terancang.'],
  ['3.2','3.2.7.1','Pentaksiran kokurikulum dilaksanakan secara sistematik dan terancang.'],
  // Standard 3.3 — Pengurusan Hal Ehwal Murid
  ['3.3','3.3.1.1','Pelaksanaan hal ehwal murid diurus secara sistematik dan terancang.'],
  ['3.3','3.3.2.1','Disiplin murid diurus secara sistematik dan terancang.'],
  ['3.3','3.3.3.1','Keselamatan murid diurus secara sistematik dan terancang.'],
  ['3.3','3.3.4.1','Program dan perkhidmatan kesihatan murid diurus secara sistematik dan terancang.'],
  ['3.3','3.3.5.1','Bantuan pelajaran murid diurus secara sistematik dan terancang.'],
  ['3.3','3.3.6.1','Perkhidmatan bimbingan dan kaunseling diurus secara profesional dan terancang.'],
  ['3.3','3.3.7.1','Pentaksiran psikometrik diurus secara sistematik dan terancang.'],
  // Standard 4 — Pembelajaran dan Pemudahcaraan
  ['4','4.1.1','Guru merancang pelaksanaan PdPc secara profesional dan sistematik.'],
  ['4','4.2.1','Guru mengawal proses pembelajaran secara profesional dan terancang.'],
  ['4','4.2.2','Guru mengawal suasana pembelajaran secara profesional dan terancang.'],
  ['4','4.3.1','Guru membimbing murid secara profesional dan terancang.'],
  ['4','4.4.1','Guru mendorong minda murid dalam melaksanakan aktiviti pembelajaran secara profesional.'],
  ['4','4.4.2','Guru mendorong emosi murid dalam melaksanakan aktiviti pembelajaran secara profesional.'],
  ['4','4.5.1','Guru melaksanakan penilaian secara sistematik dan terancang.'],
  ['4','4.6.1','Murid melibatkan diri dalam proses pembelajaran secara berkesan.'],
  // Standard 5 — Kemenjadian Murid
  ['5','5.1','Kemenjadian murid dalam akademik.'],
  ['5','5.2','Kemenjadian murid dalam kokurikulum.'],
  ['5','5.3','Kemenjadian sahsiah murid.'],
  ['5','5.4.1','Bilangan pencapaian guru dalam aktiviti/program/pertandingan yang diiktiraf mengikut peringkat.'],
  ['5','5.4.2','Bilangan pencapaian sekolah dalam aktiviti/program/pertandingan yang diiktiraf mengikut peringkat.']
]);
