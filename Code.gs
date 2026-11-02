/**
 * SK@S Web App — lapisan pelayan. Semua fungsi awam memulangkan respons seragam.
 * Data dibaca/ditulis secara kelompok dan operasi tulis dilindungi LockService.
 */
const HEADERS = Object.freeze({
  '01_SETTING': ['KUNCI', 'NILAI', 'CATATAN', '', 'EMAIL / ID', 'NAMA', 'PERANAN', 'STATUS', 'PASSWORD_HASH', 'PASSWORD_SALT', 'PASSWORD_SET_AT'],
  '02_STANDARD': ['ID', 'TAHUN', 'STANDARD', 'NAMA STANDARD', 'SKOR', 'SASARAN', 'STATUS', 'TARIKH KEMAS KINI', 'DIKEMAS KINI OLEH', 'CATATAN'],
  '03_ITEM': ['ID', 'TAHUN', 'STANDARD', 'NAMA STANDARD', 'KOD ITEM', 'NAMA ITEM', 'SKOR', 'SASARAN', 'STATUS', 'ISU', 'TARIKH KEMAS KINI', 'DIKEMAS KINI OLEH'],
  '04_ANALISIS': ['ID', 'TAHUN', 'STANDARD', 'NAMA STANDARD', 'SKOR SEMASA', 'SKOR TAHUN SEBELUM', 'PERUBAHAN', 'PERUBAHAN PERATUS', 'SASARAN', 'STATUS', 'RANKING', 'CATATAN ANALISIS', 'TARIKH JANA'],
  '05_PELAN_TINDAKAN': ['ID', 'TAHUN', 'STANDARD', 'NAMA STANDARD', 'KOD ITEM', 'NAMA ITEM', 'SKOR', 'HAD SKOR', 'ISU', 'TINDAKAN', 'PEGAWAI', 'TARIKH MULA', 'TARIKH SASARAN', 'STATUS', 'CATATAN', 'DISEDIAKAN OLEH', 'TARIKH SIMPAN', 'TARIKH KEMAS KINI', 'FOKUS UTAMA', 'DATA TOV', 'OBJEKTIF', 'PELAN INTERVENSI', 'TEMPOH', 'TANGGUNGJAWAB', 'CATATAN PELAKSANAAN'],
  '06_DASHBOARD': ['TAHUN', 'PURATA', 'STANDARD TERTINGGI', 'SKOR TERTINGGI', 'STANDARD TERENDAH', 'SKOR TERENDAH', 'BILANGAN CAPAI', 'BILANGAN BELUM CAPAI', 'TARIKH KEMAS KINI'],
  '07_DOKUMEN': ['ID', 'TAHUN', 'KATEGORI', 'STANDARD', 'NAMA DOKUMEN', 'NAMA FAIL', 'URL FAIL', 'FILE ID', 'CATATAN', 'DIMUAT NAIK OLEH', 'TARIKH MUAT NAIK'],
  '08_LOG_AKTIVITI': ['ID', 'TARIKH MASA', 'EMAIL', 'NAMA', 'TINDAKAN', 'MODUL', 'ID REKOD', 'CATATAN'],
  '09_LINK_PENGISIAN': ['ID', 'TAHUN', 'PERKARA', 'LINK / PAUTAN', 'DITAMBAH OLEH', 'TARIKH SIMPAN']
});

function ok_(message, data) { return { success: true, message: message || 'Operasi berjaya.', data: data || {} }; }
function fail_(message, error) { return { success: false, message: message || 'Operasi gagal.', error: String(error && error.message || error || '') }; }
function uuid_() { return Utilities.getUuid(); }
function now_() { return new Date(); }
function clean_(v) { return String(v == null ? '' : v).trim(); }
function serialDate_(v) { return v instanceof Date ? Utilities.formatDate(v, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss') : clean_(v); }
function number_(v, label) { var n = Number(v); if (!isFinite(n) || n < 0 || n > 100) throw new Error(label + ' mesti antara 0 hingga 100.'); return n; }
function year_(v) { var n = Number(v); if (!Number.isInteger(n) || n < 2000 || n > 2100) throw new Error('Tahun tidak sah.'); return n; }
function getSS_() {
  var id = clean_(CONFIG.SPREADSHEET_ID);
  if (id && id !== 'MASUKKAN_SPREADSHEET_ID') return SpreadsheetApp.openById(id);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error('Masukkan SPREADSHEET_ID yang sah dalam Config.gs.');
  return active;
}
function values_(name) {
  var s = getSS_().getSheetByName(name);
  if (!s) throw new Error('Sheet ' + name + ' belum disediakan. Jalankan setupSystem().');
  var width = (HEADERS[name] || []).length || s.getLastColumn();
  if (s.getLastRow() <= 1) return [];
  var readableWidth = Math.min(width, s.getMaxColumns());
  return s.getRange(2, 1, s.getLastRow() - 1, readableWidth).getValues().map(function (row) {
    while (row.length < width) row.push('');
    return row;
  });
}

/** Pastikan sheet lama mempunyai bilangan kolum yang diperlukan sebelum menulis. */
function ensureColumnCount_(sheet, count) {
  if (sheet.getMaxColumns() < count) sheet.insertColumnsAfter(sheet.getMaxColumns(), count - sheet.getMaxColumns());
}

function hex_(bytes) { return bytes.map(function (b) { var v = b < 0 ? b + 256 : b; return ('0' + v.toString(16)).slice(-2); }).join(''); }
function hashPassword_(password, salt) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + password)); }
/** Kata laluan permulaan mengikut peranan. Nilai ini tidak pernah disimpan sebagai teks biasa. */
function defaultPasswordForRole_(role) { return clean_(role).toUpperCase() === 'ADMIN' ? 'A001' : 'A002'; }
/** Menghasilkan tiga nilai simpanan kata laluan: hash, salt dan tarikh ditetapkan. */
function passwordRecord_(password) { var salt = uuid_(); return [hashPassword_(clean_(password), salt), salt, now_()]; }
function authInput_(input) { return input && typeof input === 'object' ? input : {}; }
function response_(fn, message) { try { return fn(); } catch (e) { console.error(e.stack || e); return fail_(message, e); } }
function withLock_(fn) { var lock = LockService.getScriptLock(); lock.waitLock(30000); try { return fn(); } finally { lock.releaseLock(); } }

function doGet() {
  try {
    var template = HtmlService.createTemplateFromFile('Index');
    template.schoolLogoUrl = logoUrl_();
    return template.evaluate().setTitle(CONFIG.APP_TITLE)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (e) { return HtmlService.createHtmlOutput('<h2>Aplikasi gagal dimuatkan</h2><p>' + clean_(e.message) + '</p>'); }
}

var __logoUrlCache;
function logoUrl_() {
  if (typeof __logoUrlCache !== 'undefined') return __logoUrlCache;
  var fileId = clean_(CONFIG.SCHOOL_EMBLEM_FILE_ID);
  var fallback = clean_(CONFIG.SCHOOL_EMBLEM_URL) || (fileId ? 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(fileId) + '&sz=w400' : '');
  if (!fileId) { __logoUrlCache = fallback; return __logoUrlCache; }
  try {
    var blob = DriveApp.getFileById(fileId).getBlob();
    __logoUrlCache = 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
    return __logoUrlCache;
  } catch (e) {
    console.warn(e);
    __logoUrlCache = fallback;
    return __logoUrlCache;
  }
}
function include(filename) {
  try {
    var template = HtmlService.createTemplateFromFile(filename);
    template.schoolLogoUrl = logoUrl_();
    return template.evaluate().getContent();
  } catch (e) { return '<!-- ' + filename + ': ' + e.message + ' -->'; }
}

function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('SK@S SYSTEM').addItem('Setup Sistem', 'setupSystem')
      .addItem('Buka Dashboard', 'openDashboard').addItem('Jana Tahun Baharu', 'promptGenerateYear')
      .addItem('Segarkan Analisis', 'refreshAnalysis').addToUi();
  } catch (e) { console.error(e); }
}
function openDashboard() { try { SpreadsheetApp.getUi().alert('Deploy projek sebagai Web App melalui Deploy > New deployment untuk mendapatkan URL dashboard.'); } catch (e) { console.error(e); } }
function promptGenerateYear() { try { var ui = SpreadsheetApp.getUi(), r = ui.prompt('Jana Tahun Baharu', 'Masukkan tahun:', ui.ButtonSet.OK_CANCEL); if (r.getSelectedButton() === ui.Button.OK) ui.alert(generateNewYear(Number(r.getResponseText())).message); } catch (e) { console.error(e); } }
