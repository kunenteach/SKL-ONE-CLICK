function getRecentActivity(limit) {
  return readSheetObjects_(APP_CONFIG.sheets.activity).slice(-Math.max(1, Number(limit) || 8)).reverse();
}

/** Appends one audit event atomically when persistence is configured. */
function logActivity_(event) {
  const db = getDatabase_();
  if (!db) return;
  const sheet = ensureSheet_(APP_CONFIG.sheets.activity, ['ID_LOG','TARIKH_MASA','PENGGUNA','TINDAKAN','STANDARD','NO_ASPEK','PERUBAHAN']);
  const user = getCurrentUser();
  sheet.appendRow([Utilities.getUuid(), new Date(), user.email, event.action, event.standardId || '', event.aspectId || '', JSON.stringify(event.changes || {})]);
}

/** Writes audit events in one Sheets call to keep assignment batches fast. */
function logActivities_(events) {
  if (!events || !events.length) return;
  const db = getDatabase_();
  if (!db) return;
  const sheet = ensureSheet_(APP_CONFIG.sheets.activity, ['ID_LOG','TARIKH_MASA','PENGGUNA','TINDAKAN','STANDARD','NO_ASPEK','PERUBAHAN']);
  const user = getCurrentUser(), now = new Date();
  const rows = events.map(event => [Utilities.getUuid(),now,user.email,event.action,event.standardId || '',event.aspectId || '',JSON.stringify(event.changes || {})]);
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}
