/** Muat naik, senarai dan pemadaman Fail Digital SK@S dalam Google Drive. */
function uploadDocument(data) {
  return response_(function () {
    return withLock_(function () {
      data = data || {};
      var user = user_(data);
      var year = year_(data.year);
      var category = clean_(data.category);
      var documentName = clean_(data.documentName);
      var fileName = clean_(data.fileName);
      if (CONFIG.DOCUMENT_CATEGORIES.indexOf(category) < 0) throw new Error('Kategori dokumen tidak sah.');
      if (!documentName) throw new Error('Nama dokumen wajib diisi.');
      if (!fileName || !clean_(data.base64)) throw new Error('Sila pilih fail untuk dimuat naik.');
      var extension = fileName.split('.').pop().toUpperCase();
      if (CONFIG.ALLOWED_EXTENSIONS.indexOf(extension) < 0) throw new Error('Format fail tidak dibenarkan.');
      var raw = clean_(data.base64).replace(/^data:[^;]+;base64,/, '');
      var bytes = Utilities.base64Decode(raw);
      if (bytes.length > CONFIG.MAX_FILE_MB * 1024 * 1024) throw new Error('Saiz fail melebihi ' + CONFIG.MAX_FILE_MB + ' MB.');
      var file = DriveApp.getFolderById(ensureFolder_()).createFile(
        Utilities.newBlob(bytes, data.mimeType || 'application/octet-stream', fileName)
      );
      var id = uuid_();
      var row = [id, year, category, '', documentName, fileName, file.getUrl(),
        file.getId(), '', user.email, now_()];
      var sheet = getSS_().getSheetByName(SHEETS.DOCUMENT);
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
      log_('MUAT NAIK', 'FAIL DIGITAL SK@S', id, fileName, user);
      return ok_('Dokumen berjaya dimuat naik.', { id: id, url: file.getUrl() });
    });
  }, 'Dokumen gagal dimuat naik.');
}

/** Senarai sentiasa disusun mengikut tahun terkini, kemudian tarikh muat naik terkini. */
function getDocuments(filters) {
  return response_(function () {
    user_(filters);
    var filter = filters || {};
    var documents = values_(SHEETS.DOCUMENT).map(function (row) {
      return {
        id: row[0], year: Number(row[1]), category: row[2], documentName: row[4],
        fileName: row[5], url: row[6], fileId: row[7], uploadedBy: row[9],
        uploadedAt: serialDate_(row[10]), uploadedAtValue: row[10] instanceof Date ? row[10].getTime() : 0
      };
    }).filter(function (document) {
      return (!filter.year || document.year === Number(filter.year)) &&
        (!filter.category || document.category === filter.category);
    }).sort(function (a, b) {
      return b.year - a.year || b.uploadedAtValue - a.uploadedAtValue;
    });
    documents.forEach(function (document) { delete document.uploadedAtValue; });
    return ok_('Dokumen dimuatkan.', documents);
  }, 'Dokumen gagal dimuatkan.');
}

/** ADMIN boleh mengubah Tahun, Kategori dan Nama Dokumen tanpa mengganti fail Drive. */
function updateDocument(data) {
  return response_(function () {
    return withLock_(function () {
      data = data || {};
      var user = requireAdmin_(data);
      var id = clean_(data.id);
      var year = year_(data.year);
      var category = clean_(data.category);
      var documentName = clean_(data.documentName);
      if (!id) throw new Error('ID dokumen tidak sah.');
      if (CONFIG.DOCUMENT_CATEGORIES.indexOf(category) < 0) throw new Error('Kategori dokumen tidak sah.');
      if (!documentName) throw new Error('Nama dokumen wajib diisi.');
      var rows = values_(SHEETS.DOCUMENT);
      var index = rows.findIndex(function (row) { return clean_(row[0]) === id; });
      if (index < 0) throw new Error('Dokumen tidak ditemui.');
      var sheet = getSS_().getSheetByName(SHEETS.DOCUMENT);
      sheet.getRange(index + 2, 2, 1, 4).setValues([[
        year, category, rows[index][3], documentName
      ]]);
      log_('KEMAS KINI', 'FAIL DIGITAL SK@S', id, documentName, user);
      return ok_('Maklumat dokumen berjaya dikemas kini.', { id: id });
    });
  }, 'Dokumen gagal dikemas kini.');
}

function deleteDocument(input) {
  return response_(function () {
    return withLock_(function () {
      var id = typeof input === 'object' ? input.value || input.id : input;
      var user = requireAdmin_(input);
      var rows = values_(SHEETS.DOCUMENT);
      var index = rows.findIndex(function (row) { return row[0] === id; });
      if (index < 0) throw new Error('Dokumen tidak ditemui.');
      try { DriveApp.getFileById(rows[index][7]).setTrashed(true); } catch (error) { console.warn(error); }
      getSS_().getSheetByName(SHEETS.DOCUMENT).deleteRow(index + 2);
      log_('PADAM', 'FAIL DIGITAL SK@S', id, rows[index][5], user);
      return ok_('Dokumen berjaya dipadam.');
    });
  }, 'Dokumen gagal dipadam.');
}

function deleteRowAdmin_(sheetName, input, module) { return response_(function(){return withLock_(function(){var id=typeof input==='object'?input.value||input.id:input,u=requireAdmin_(input),s=getSS_().getSheetByName(sheetName),rows=values_(sheetName),i=rows.findIndex(function(r){return r[0]===id;});if(i<0)throw new Error('Rekod tidak ditemui.');s.deleteRow(i+2);log_('PADAM',module,id,'Rekod dipadam',u);return ok_('Rekod berjaya dipadam.');});},'Rekod gagal dipadam.'); }
