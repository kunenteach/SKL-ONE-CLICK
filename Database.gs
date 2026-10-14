/** Returns the configured spreadsheet, or null while Phase 3 is not configured. */
function getDatabase_() {
  if (APP_CONFIG.spreadsheetId) return SpreadsheetApp.openById(APP_CONFIG.spreadsheetId);
  try { return SpreadsheetApp.getActiveSpreadsheet(); } catch (error) { return null; }
}

/** Reads a normalized sheet into objects while avoiding per-row API calls. */
function readSheetObjects_(sheetName) {
  const db = getDatabase_();
  if (!db) return [];
  const sheet = db.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.shift();
  return values.map(row => headers.reduce((item, key, index) => {
    item[key] = row[index];
    return item;
  }, {}));
}

function getInstitutionProfile() {
  const rows = readSheetObjects_(APP_CONFIG.sheets.profile);
  return rows[0] || { namaSekolah: '', kodSekolah: '', program: [], labels: [] };
}
function getStandards() { return OFFICIAL_DATA.standards; }
function getStrengths() { return OFFICIAL_DATA.strengths; }
function getPpsAssignments() { return readSheetObjects_(APP_CONFIG.sheets.assignments); }

/** Creates a normalized sheet once and returns it. */
function ensureSheet_(sheetName, headers) {
  const db = getDatabase_();
  if (!db) throw new Error('Google Sheet belum dikonfigurasi. Tetapkan spreadsheetId dalam Config.gs.');
  let sheet = db.getSheetByName(sheetName);
  if (!sheet) sheet = db.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  return sheet;
}
