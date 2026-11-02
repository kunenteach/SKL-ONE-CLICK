/**
 * Penjanaan tahun, tetapan sistem dan pengguna oleh ADMIN.
 */
function generateNewYear(year) {
  return response_(function () {
    return withLock_(function () {
      var u = requireAdmin_(year);
      year = year_(typeof year === 'object' ? year.value : year);
      seedYear_(year, true);
      CacheService.getScriptCache().remove('catalog');
      log_('TAMBAH', 'TETAPAN', String(year), 'Jana tahun baharu', u);
      var years = values_(SHEETS.STANDARD).map(function (row) {
        return Number(row[1]);
      }).filter(function (value, index, all) {
        return value && all.indexOf(value) === index;
      }).sort(function (a, b) {
        return a - b;
      });
      return ok_('Standard dan item tahun ' + year + ' berjaya dijana.', {
        year: year,
        years: years,
        items: values_(SHEETS.ITEM).filter(function (row) {
          return Number(row[1]) === year;
        }).map(itemObject_)
      });
    });
  }, 'Tahun baharu gagal dijana.');
}
function saveSettings(data) { return response_(function () { return withLock_(function () { var u = requireAdmin_(data), s = getSS_().getSheetByName(SHEETS.SETTINGS), rows = values_(SHEETS.SETTINGS); Object.keys(data.settings || {}).forEach(function(k){var i=rows.findIndex(function(r){return r[0]===k;});if(i>=0)s.getRange(i+2,2).setValue(clean_(data.settings[k]));else s.getRange(s.getLastRow()+1,1,1,3).setValues([[k,clean_(data.settings[k]),'Dikemas kini melalui aplikasi']]);}); if(data.folderId){DriveApp.getFolderById(clean_(data.folderId)).getName();PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID',clean_(data.folderId));} CacheService.getScriptCache().remove('settings');log_('KEMAS KINI','TETAPAN','', 'Tetapan sistem',u);return ok_('Tetapan berjaya disimpan.'); }); }, 'Tetapan gagal disimpan.'); }
/** Simpan pengguna dan sediakan kata laluan permulaan mengikut peranan. */
function saveUser(data) {
  return response_(function () { return withLock_(function () {
    var admin = requireAdmin_(data);
    var id = clean_(data.userId || data.email).toLowerCase();
    var role = clean_(data.role).toUpperCase();
    var status = clean_(data.status).toUpperCase();
    if (!/^[a-z0-9._@-]{3,80}$/.test(id)) throw new Error('ID pengguna mesti 3 hingga 80 aksara dan hanya menggunakan huruf, nombor, titik, garis atau @.');
    if (!clean_(data.name)) throw new Error('Nama pengguna wajib diisi.');
    if (['ADMIN', 'GURU'].indexOf(role) < 0 || ['AKTIF', 'TIDAK AKTIF'].indexOf(status) < 0) throw new Error('Peranan atau status tidak sah.');
    var sheet = getSS_().getSheetByName(SHEETS.SETTINGS);
    var rows = values_(SHEETS.SETTINGS);
    var index = rows.findIndex(function (row) { return clean_(row[4]).toLowerCase() === id; });
    var existing = index >= 0 ? rows[index] : null;
    var credentials = existing && clean_(existing[8]) ? [existing[8], existing[9], existing[10]] : passwordRecord_(defaultPasswordForRole_(role));
    var row = [id, clean_(data.name), role, status].concat(credentials);
    if (index >= 0) sheet.getRange(index + 2, 5, 1, 7).setValues([row]);
    else sheet.getRange(sheet.getLastRow() + 1, 5, 1, 7).setValues([row]);
    log_(index >= 0 ? 'KEMAS KINI' : 'TAMBAH', 'PENGGUNA', id, 'Pengguna; kata laluan permulaan mengikut peranan', admin);
    return ok_('Pengguna berjaya disimpan. Kata laluan permulaan: ' + defaultPasswordForRole_(role) + '.', { userId: id, defaultPassword: defaultPasswordForRole_(role) });
  }); }, 'Pengguna gagal disimpan.');
}
