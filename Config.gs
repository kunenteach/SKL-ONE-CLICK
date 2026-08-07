/**
 * iGEMKIDS — PRA PINTAR SKL configuration.
 * Keep this file compatible with container-bound and standalone Apps Script projects.
 */
const APP_CONFIG = {
  APP_NAME: 'iGEMKIDS',
  APP_SUBTITLE: 'PRA PINTAR SKL',
  SCHOOL_NAME: 'SK LORMALONG',
  // Letakkan ID Google Sheet sebenar di sini jika projek Apps Script bukan terikat terus pada spreadsheet.
  // Contoh URL: https://docs.google.com/spreadsheets/d/ID_SHEET/edit -> salin bahagian ID_SHEET sahaja.
  SPREADSHEET_ID: '1EUZ5wnmMwoDgSaNLXixWBzzNjTG2BD5hT1Me1DRIwrc',
  SESSION_TTL_SECONDS: 21600,
  CACHE_TTL_SECONDS: 900,
  TIMEZONE: Session.getScriptTimeZone() || 'Asia/Kuala_Lumpur',
  SHEETS: {
    SETTINGS: ['SETTING_KEY', 'SETTING_VALUE', 'UPDATED_BY', 'UPDATED_AT'],
    STUDENTS: ['STUDENT_ID', 'STUDENT_NAME', 'CLASS', 'PASSWORD', 'AVATAR_URL', 'STATUS', 'YEAR', 'CREATED_AT', 'UPDATED_AT'],
    TEACHERS: ['TEACHER_ID', 'TEACHER_NAME', 'USERNAME', 'PASSWORD_HASH', 'ROLE', 'STATUS', 'CREATED_AT', 'UPDATED_AT'],
    FIELDS: ['FIELD_ID', 'FIELD_NAME', 'FIELD_ICON', 'FIELD_COLOR', 'STATUS'],
    STANDARD_PEMBELAJARAN: ['STANDARD_ID', 'FIELD_ID', 'FIELD_NAME', 'STANDARD_CODE', 'STANDARD_DESCRIPTION', 'STATUS'],
    GAMES: ['GAME_ID', 'GAME_NAME', 'GAME_URL', 'THUMBNAIL_URL', 'FIELD_ID', 'FIELD_NAME', 'STANDARD_ID', 'STANDARD_CODE', 'STANDARD_DESCRIPTION', 'GAME_DESCRIPTION', 'GAME_INSTRUCTION', 'DIFFICULTY', 'MAX_SCORE', 'ESTIMATED_TIME', 'GAME_TYPE', 'SCORE_METHOD', 'STATUS', 'CREATED_BY', 'CREATED_AT', 'UPDATED_AT'],
    DAILY_ASSIGNMENTS: ['ASSIGNMENT_ID', 'ASSIGNMENT_NAME', 'ASSIGNMENT_DATE', 'GAME_ID', 'GAME_NAME', 'TARGET_TYPE', 'TARGET_CLASS', 'TARGET_STUDENT_ID', 'INSTRUCTION', 'IS_REQUIRED', 'START_DATE', 'END_DATE', 'STATUS', 'CREATED_BY', 'CREATED_AT'],
    GAME_RESULTS: ['RESULT_ID', 'SESSION_ID', 'STUDENT_ID', 'STUDENT_NAME', 'CLASS', 'GAME_ID', 'GAME_NAME', 'FIELD_ID', 'FIELD_NAME', 'STANDARD_ID', 'STANDARD_CODE', 'PLAY_DATE', 'START_TIME', 'END_TIME', 'DURATION_SECONDS', 'SCORE', 'MAX_SCORE', 'SCORE_PERCENTAGE', 'ATTEMPT_NUMBER', 'RESULT_STATUS', 'PLAY_MODE', 'TEACHER_ID', 'NOTES', 'CREATED_AT'],
    GROUP_SESSIONS: ['GROUP_SESSION_ID', 'GAME_ID', 'GAME_NAME', 'CLASS', 'STUDENT_IDS', 'PLAY_DATE', 'START_TIME', 'END_TIME', 'DURATION_SECONDS', 'SCORE_METHOD', 'TEACHER_ID', 'NOTES', 'CREATED_AT'],
    LOGIN_LOG: ['LOGIN_ID', 'USER_TYPE', 'USER_ID', 'USER_NAME', 'LOGIN_DATE', 'LOGIN_TIME', 'LOGIN_STATUS', 'DEVICE_INFO'],
    ACTIVITY_LOG: ['LOG_ID', 'USER_TYPE', 'USER_ID', 'ACTION', 'REFERENCE_ID', 'DETAILS', 'LOG_DATE', 'LOG_TIME'],
    YEAR_ARCHIVE: ['ARCHIVE_ID', 'ARCHIVE_YEAR', 'ARCHIVE_TYPE', 'SOURCE_SHEET', 'RECORD_COUNT', 'ARCHIVED_BY', 'ARCHIVED_AT']
  },
  DEFAULT_SETTINGS: {
    DASHBOARD_NAME: 'iGEMKIDS',
    DASHBOARD_SUBTITLE: 'PRA PINTAR SKL',
    SCHOOL_NAME: 'SK LORMALONG',
    LOGO_URL: '',
    PRIMARY_COLOR: '#8ec5ff',
    SECONDARY_COLOR: '#c8b6ff',
    WELCOME_MESSAGE: 'Belajar sambil bermain dengan ceria!',
    CURRENT_YEAR: '2026'
  },
  DEMO_PASSWORDS: { ADMIN: 'admin123' }
};

const LEARNING_FIELDS = [
  ['FLD-01', 'Sosioemosi', 'fa-face-smile-beam', '#ffd6e7', 'AKTIF'],
  ['FLD-02', 'Fizikal dan Kesejahteraan Diri', 'fa-person-running', '#c8f7dc', 'AKTIF'],
  ['FLD-03', 'Bahasa dan Literasi', 'fa-book-open-reader', '#bde0fe', 'AKTIF'],
  ['FLD-04', 'Kerohanian, Nilai dan Kewarganegaraan', 'fa-hands-holding-heart', '#fff1a8', 'AKTIF'],
  ['FLD-05', 'Kreativiti dan Estetika', 'fa-palette', '#ffc8dd', 'AKTIF'],
  ['FLD-06', 'Kognitif', 'fa-puzzle-piece', '#d9f0ff', 'AKTIF']
];

const DEMO_STANDARDS = [
  ['STD-0001', 'FLD-01', 'Sosioemosi', 'SE 1.1.1', 'Mengenal dan menyatakan emosi sendiri.', 'AKTIF'],
  ['STD-0002', 'FLD-02', 'Fizikal dan Kesejahteraan Diri', 'FK 2.1.1', 'Melakukan pergerakan motor halus dengan betul.', 'AKTIF'],
  ['STD-0003', 'FLD-03', 'Bahasa dan Literasi', 'BM 1.2.1', 'Mendengar dan memberi respons terhadap arahan mudah.', 'AKTIF'],
  ['STD-0004', 'FLD-03', 'Bahasa dan Literasi', 'BM 1.2.2', 'Mendengar dan memberi respons terhadap cerita.', 'AKTIF'],
  ['STD-0005', 'FLD-04', 'Kerohanian, Nilai dan Kewarganegaraan', 'KM 2.2.1', 'Mengamalkan nilai baik dalam kehidupan harian.', 'AKTIF'],
  ['STD-0006', 'FLD-05', 'Kreativiti dan Estetika', 'KE 3.1.1', 'Menghasilkan karya kreatif menggunakan pelbagai media.', 'AKTIF'],
  ['STD-0007', 'FLD-06', 'Kognitif', 'MA 2.1.1', 'Membilang objek dalam lingkungan sepuluh.', 'AKTIF']
];

const DEMO_STUDENTS = [
  ['STU-0001', 'AINA SOFIA', 'PRA PINTAR', 'SKL-AINA-4821', '', 'AKTIF', '2026'],
  ['STU-0002', 'ADAM HAKIM', 'PRA PINTAR', 'SKL-ADAM-7352', '', 'AKTIF', '2026'],
  ['STU-0003', 'NUR ALYA', 'PRA PINTAR', 'SKL-ALYA-1934', '', 'AKTIF', '2026']
];

const DEMO_GAMES = [
  ['GME-0001', 'Kenal Huruf Ceria', 'https://example.com/game/kenal-huruf', '', 'FLD-03', 'Bahasa dan Literasi', 'STD-0003', 'BM 1.2.1', 'Mendengar dan memberi respons terhadap arahan mudah.', 'Pilih huruf yang disebut.', 'Dengar arahan dan tekan jawapan yang betul.', 'Mudah', 100, '10 minit', 'Kuiz', 'POST_MESSAGE', 'AKTIF', 'ADMIN'],
  ['GME-0002', 'Padankan Gambar', 'https://example.com/game/padan-gambar', '', 'FLD-03', 'Bahasa dan Literasi', 'STD-0003', 'BM 1.2.1', 'Mendengar dan memberi respons terhadap arahan mudah.', 'Padankan gambar dengan perkataan.', 'Seret gambar kepada perkataan yang sesuai.', 'Sederhana', 100, '12 minit', 'Padanan', 'MANUAL', 'AKTIF', 'ADMIN'],
  ['GME-0003', 'Kira Buah-Buahan', 'https://example.com/game/kira-buah', '', 'FLD-06', 'Kognitif', 'STD-0007', 'MA 2.1.1', 'Membilang objek dalam lingkungan sepuluh.', 'Kira objek dan pilih nombor.', 'Kira dengan teliti sebelum memilih jawapan.', 'Mudah', 100, '8 minit', 'Numerasi', 'POST_MESSAGE', 'AKTIF', 'ADMIN'],
  ['GME-0004', 'Roda Emosi', 'https://example.com/game/emosi', '', 'FLD-01', 'Sosioemosi', 'STD-0001', 'SE 1.1.1', 'Mengenal dan menyatakan emosi sendiri.', 'Kenal pasti emosi watak.', 'Pilih emoji yang sama dengan situasi.', 'Mudah', 50, '7 minit', 'Interaktif', 'MANUAL', 'AKTIF', 'ADMIN']
];
