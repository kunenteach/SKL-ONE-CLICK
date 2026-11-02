/**
 * Penyediaan automatik pangkalan data, folder Drive dan katalog tahun.
 */
function setupSystem() {
  return response_(function () { return withLock_(function () {
    var ss = getSS_();
    Object.keys(HEADERS).forEach(function (name) {
      var s = ss.getSheetByName(name) || ss.insertSheet(name); var h = HEADERS[name];
      ensureColumnCount_(s, h.length);
      s.getRange(1, 1, 1, h.length).setValues([h]).setBackground('#13213a').setFontColor('#ffffff').setFontWeight('bold');
      s.setFrozenRows(1); s.autoResizeColumns(1, h.length); s.setRowHeight(1, 32);
    });
    var settings = ss.getSheetByName(SHEETS.SETTINGS);
    if (settings.getLastRow() < 2) {
      settings.getRange(2, 1, 5, 3).setValues([
        ['NAMA_SEKOLAH', CONFIG.SCHOOL_NAME, 'Nama rasmi sekolah'], ['TAJUK_SISTEM', CONFIG.APP_TITLE, 'Tajuk aplikasi'],
        ['LOGO_URL', '', 'URL logo sekolah'], ['TARGET_MARKAH', CONFIG.DEFAULT_TARGET, 'Sasaran lalai'], ['TAHUN_MULA', CONFIG.START_YEAR, 'Tahun permulaan']
      ]);
      var email = Session.getActiveUser().getEmail();
      if (email) settings.getRange(2, 5, 1, 7).setValues([[
        email, 'Pentadbir Sistem', 'ADMIN', 'AKTIF'
      ].concat(passwordRecord_(defaultPasswordForRole_('ADMIN')))]);
    }
    syncDefaultPasswords_();
    ensureFolder_();
    var startYearExists = values_(SHEETS.STANDARD).some(function (row) {
      return Number(row[1]) === Number(CONFIG.START_YEAR);
    });
    if (!startYearExists) seedYear_(CONFIG.START_YEAR, false);
    syncBaseItemCatalog_();
    CacheService.getScriptCache().removeAll(['settings', 'catalog']);
    return ok_('Setup sistem selesai.', { spreadsheetId: ss.getId(), folderId: getFolderId_() });
  }); }, 'Setup sistem gagal.');
}

/**
 * Menetapkan kata laluan permulaan mengikut peranan untuk pengguna lama yang
 * belum mempunyai hash. Kata laluan sedia ada tidak akan ditimpa.
 */
function syncDefaultPasswords_() {
  var sheet = getSS_().getSheetByName(SHEETS.SETTINGS);
  var rows = values_(SHEETS.SETTINGS);
  var changed = false;
  rows.forEach(function (row) {
    var id = clean_(row[4]);
    var role = clean_(row[6]).toUpperCase();
    if (!id || ['ADMIN', 'GURU'].indexOf(role) < 0 || clean_(row[8])) return;
    var password = passwordRecord_(defaultPasswordForRole_(role));
    row[8] = password[0]; row[9] = password[1]; row[10] = password[2];
    changed = true;
  });
  if (changed && rows.length) sheet.getRange(2, 1, rows.length, HEADERS[SHEETS.SETTINGS].length).setValues(rows);
}

function getFolderId_() {
  var prop = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  return prop || (CONFIG.DRIVE_FOLDER_ID !== 'MASUKKAN_FOLDER_ID' ? CONFIG.DRIVE_FOLDER_ID : '');
}
function ensureFolder_() {
  var id = getFolderId_();
  if (id) { try { DriveApp.getFolderById(id).getName(); return id; } catch (e) { console.warn(e); } }
  var folder = DriveApp.createFolder('SK@S - ' + CONFIG.SCHOOL_NAME);
  PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', folder.getId()); return folder.getId();
}
function seedYear_(year, copyPrevious) {
  var ss = getSS_(), std = ss.getSheetByName(SHEETS.STANDARD), item = ss.getSheetByName(SHEETS.ITEM);
  var stdExisting = values_(SHEETS.STANDARD).filter(function (r) { return Number(r[1]) === year; });
  if (stdExisting.length) throw new Error('Data bagi tahun ' + year + ' telah wujud.');
  var sourceYear = 0, stdDefs = BASE_STANDARDS.slice(), itemDefs = BASE_ITEMS.slice();
  if (copyPrevious) {
    var years = values_(SHEETS.STANDARD).map(function (r) { return Number(r[1]); }).filter(function (y) { return y < year; });
    sourceYear = years.length ? Math.max.apply(null, years) : 0;
    if (sourceYear) {
      stdDefs = values_(SHEETS.STANDARD).filter(function (r) { return Number(r[1]) === sourceYear; }).map(function (r) { return [String(r[2]), r[3]]; });
      itemDefs = values_(SHEETS.ITEM).filter(function (r) { return Number(r[1]) === sourceYear; }).map(function (r) { return [String(r[2]), String(r[4]), r[5]]; });
    }
  }
  if (stdDefs.length) std.getRange(std.getLastRow() + 1, 1, stdDefs.length, 10).setValues(stdDefs.map(function (d) { return [uuid_(), year, d[0], d[1], '', CONFIG.DEFAULT_TARGET, 'BELUM DIISI', now_(), '', '']; }));
  if (itemDefs.length) item.getRange(item.getLastRow() + 1, 1, itemDefs.length, 12).setValues(itemDefs.map(function (d) { var n = stdDefs.filter(function (s) { return s[0] === d[0]; })[0]; return [uuid_(), year, d[0], n ? n[1] : '', d[1], d[2], '', CONFIG.DEFAULT_TARGET, 'BELUM DIISI', '', now_(), '']; }));
}

/**
 * Menambah item katalog yang belum wujud bagi setiap tahun tanpa memadam skor,
 * isu atau item tersuai. Nama item asas turut diselaraskan secara kelompok.
 */
function syncBaseItemCatalog_() {
  var ss = getSS_();
  var sheet = ss.getSheetByName(SHEETS.ITEM);
  var standardSheet = ss.getSheetByName(SHEETS.STANDARD);
  var rows = values_(SHEETS.ITEM);
  var standardRows = values_(SHEETS.STANDARD);
  var years = standardRows.map(function (row) {
    return Number(row[1]);
  }).filter(function (value, index, all) {
    return value && all.indexOf(value) === index;
  });
  if (standardRows.length) {
    standardRows.forEach(function (row) { row[5] = CONFIG.DEFAULT_TARGET; });
    standardSheet.getRange(2, 1, standardRows.length, 10).setValues(standardRows);
  }
  var standardNames = {};
  BASE_STANDARDS.forEach(function (standard) {
    standardNames[standard[0]] = standard[1];
  });
  var indexByKey = {};
  rows.forEach(function (row, index) {
    indexByKey[Number(row[1]) + '|' + String(row[4])] = index;
  });
  var additions = [];
  years.forEach(function (year) {
    BASE_ITEMS.forEach(function (definition) {
      var key = year + '|' + definition[1];
      var existingIndex = indexByKey[key];
      if (existingIndex === undefined) {
        additions.push([uuid_(), year, definition[0], standardNames[definition[0]],
          definition[1], definition[2], '', CONFIG.DEFAULT_TARGET,
          'BELUM DIISI', '', now_(), '']);
      } else {
        rows[existingIndex][2] = definition[0];
        rows[existingIndex][3] = standardNames[definition[0]];
        rows[existingIndex][5] = definition[2];
        rows[existingIndex][7] = CONFIG.DEFAULT_TARGET;
      }
    });
  });
  if (rows.length) sheet.getRange(2, 1, rows.length, 12).setValues(rows);
  if (additions.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, additions.length, 12).setValues(additions);
  }
}
