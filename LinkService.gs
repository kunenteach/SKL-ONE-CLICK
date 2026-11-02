/** Pengurusan pautan pengisian untuk GURU dan ADMIN. */
function ensureEntryLinkSheet_() {
  var spreadsheet = getSS_();
  var sheet = spreadsheet.getSheetByName(SHEETS.ENTRY_LINK);
  var headers = HEADERS[SHEETS.ENTRY_LINK];
  if (!sheet) sheet = spreadsheet.insertSheet(SHEETS.ENTRY_LINK);
  ensureColumnCount_(sheet, headers.length);
  if (sheet.getLastRow() === 0 || clean_(sheet.getRange(1, 1).getValue()) !== headers[0]) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setBackground('#13213a').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Simpan satu pautan pengisian selepas pengesahan tahun, perkara dan URL. */
function saveEntryLink(data) {
  return response_(function () {
    return withLock_(function () {
      data = data || {};
      var user = user_(data);
      var year = year_(data.year);
      var subject = clean_(data.subject);
      var url = clean_(data.url);
      if (!subject) throw new Error('Perkara wajib diisi.');
      if (!/^https?:\/\/[^\s]+$/i.test(url)) throw new Error('Link/Pautan mesti bermula dengan http:// atau https://.');
      var sheet = ensureEntryLinkSheet_();
      var id = uuid_();
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, 6).setValues([[
        id, year, subject, url, user.email, now_()
      ]]);
      log_('TAMBAH', 'LINK PENGISIAN', id, subject, user);
      return ok_('Link pengisian berjaya disimpan.', { id: id });
    });
  }, 'Link pengisian gagal disimpan.');
}

/** Ambil semua pautan dan susun daripada tahun terkini. */
function getEntryLinks(filters) {
  return response_(function () {
    user_(filters);
    ensureEntryLinkSheet_();
    var rows = values_(SHEETS.ENTRY_LINK).map(function (row) {
      return {
        id: row[0], year: Number(row[1]), subject: row[2], url: row[3],
        createdBy: row[4], createdAt: serialDate_(row[5]),
        createdAtValue: row[5] instanceof Date ? row[5].getTime() : 0
      };
    }).sort(function (a, b) {
      return b.year - a.year || b.createdAtValue - a.createdAtValue;
    });
    rows.forEach(function (row) { delete row.createdAtValue; });
    return ok_('Link pengisian dimuatkan.', rows);
  }, 'Link pengisian gagal dimuatkan.');
}
