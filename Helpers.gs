/** Membersihkan input teks dan membuang markup. */
function cleanText_(value, maxLength) {
  return String(value == null ? '' : value).replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLength || 5000);
}
function parseJson_(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch (e) { return fallback; } }
function getUser_() { return Session.getActiveUser().getEmail() || 'Pengguna Web App'; }
function getSpreadsheet_() {
  const id = CONFIG.SPREADSHEET_ID || PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error('ID Google Spreadsheet belum ditetapkan dalam Config.gs atau Script Properties.');
  return active;
}
function include(filename) { return HtmlService.createHtmlOutputFromFile(filename).getContent(); }
function formatMalayDate(date) {
  const d = date instanceof Date ? date : new Date(String(date) + (String(date).length === 10 ? 'T00:00:00+08:00' : ''));
  if (isNaN(d.getTime())) return '';
  const months = ['JANUARI','FEBRUARI','MAC','APRIL','MEI','JUN','JULAI','OGOS','SEPTEMBER','OKTOBER','NOVEMBER','DISEMBER'];
  return Utilities.formatDate(d, CONFIG.TIMEZONE, 'd') + ' ' + months[Number(Utilities.formatDate(d, CONFIG.TIMEZONE, 'M')) - 1] + ' ' + Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy');
}
function getMalayDay(date) {
  const d = date instanceof Date ? date : new Date(String(date) + (String(date).length === 10 ? 'T00:00:00+08:00' : ''));
  return isNaN(d.getTime()) ? '' : ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'][Number(Utilities.formatDate(d, CONFIG.TIMEZONE, 'u')) % 7];
}
function validateReportId_(id) { if (!/^OPR-SKL-\d{4}-\d{4,}$/.test(String(id || ''))) throw new Error('ID laporan tidak sah.'); }
function normaliseForm_(input) {
  input = input || {};
  const date = cleanText_(input.date, 10);
  const guests = (Array.isArray(input.guests) ? input.guests : []).map(g => ({name:cleanText_(g.name,150),position:cleanText_(g.position,150),workplace:cleanText_(g.workplace,200)})).filter(g => g.name || g.position || g.workplace);
  const teachers = [...new Set((Array.isArray(input.teachers) ? input.teachers : []).map(x => cleanText_(x,150)).filter(Boolean))];
  return {unit:cleanText_(input.unit,100),year:cleanText_(input.year,4),name:cleanText_(input.name,300).toUpperCase(),date:date,day:getMalayDay(date),place:toTitleCase_(cleanText_(input.place,200)),level:cleanText_(input.level,100),organiser:cleanText_(input.organiser,100),otherOrganiser:cleanText_(input.otherOrganiser,200),target:cleanText_(input.target,1000),objective1:cleanText_(input.objective1),objective2:cleanText_(input.objective2),impact:cleanText_(input.impact),hasAchievement:Boolean(input.hasAchievement),achievement:Boolean(input.hasAchievement) ? cleanText_(input.achievement) : '',hasGuests:Boolean(input.hasGuests),guests:Boolean(input.hasGuests) ? guests : [],improvement:cleanText_(input.improvement),teachers:teachers,preparedBy:cleanText_(input.preparedBy,150),existingImages:Array.isArray(input.existingImages) ? input.existingImages : [],images:Array.isArray(input.images) ? input.images : []};
}
function validateForm_(d) {
  const missing = [['unit','Unit'],['year','Tahun'],['name','Nama laporan'],['date','Tarikh'],['place','Tempat'],['level','Peringkat'],['organiser','Anjuran'],['target','Sasaran peserta'],['objective1','Objektif 1'],['objective2','Objektif 2'],['impact','Impak'],['improvement','Penambahbaikan'],['preparedBy','Disediakan oleh']].filter(x => !d[x[0]]).map(x => x[1]);
  if (d.year && !/^\d{4}$/.test(d.year)) throw new Error('Tahun mesti menggunakan empat digit.');
  if (d.organiser.toUpperCase() === 'LAIN-LAIN' && !d.otherOrganiser) missing.push('Anjuran lain');
  if (d.hasAchievement && !d.achievement) missing.push('Pencapaian');
  if (!d.teachers.length) missing.push('Penglibatan guru');
  if (missing.length) throw new Error('Sila lengkapkan: ' + missing.join(', ') + '.');
}
function toTitleCase_(s) { return s.toLowerCase().replace(/(^|\s|[-/])\S/g, c => c.toUpperCase()); }
function clearSystemCache() {
  CacheService.getScriptCache().removeAll(['dropdownData', CONFIG.DROPDOWN_CACHE_KEY]);
  return {success:true};
}
