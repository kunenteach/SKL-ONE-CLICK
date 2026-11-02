/**
 * Operasi kelompok bagi skor item SK@S.
 */
function saveBulkItemScores(data) {
  return response_(function () {
    return withLock_(function () {
      if (!data || typeof data !== 'object') {
        throw new Error('Fungsi saveBulkItemScores memerlukan data daripada borang Skor Item. Jangan jalankan terus melalui butang Run; uji melalui Web App atau gunakan fungsi setupSystem() untuk setup.');
      }
      var u = user_(data);
      var y = year_(data.year);
      var code = clean_(data.standard);
      var updates = data.items || [];
      var officialPercentage = number_(data.standardPercentage, 'Peratus skor standard');
      if (!code || !updates.length) throw new Error('Standard dan skor item wajib diisi.');

      var rows = values_(SHEETS.ITEM);
      var standardRows = rows.filter(function (row) {
        return Number(row[1]) === y && String(row[2]) === code;
      });
      if (!standardRows.length) throw new Error('Tiada item ditemui bagi standard ini.');
      var updateMap = {};
      updates.forEach(function (item) { updateMap[clean_(item.id)] = item; });
      if (standardRows.some(function (row) { return !updateMap[row[0]]; })) {
        throw new Error('Semua item bagi standard ini mesti mempunyai skor.');
      }

      var total = 0;
      var changed = [];
      rows.forEach(function (row) {
        if (Number(row[1]) !== y || String(row[2]) !== code) return;
        var input = updateMap[row[0]];
        var owner = clean_(row[11]).toLowerCase();
        if (u.role !== 'ADMIN' && owner && owner !== u.email) {
          throw new Error('GURU hanya boleh mengedit markah sendiri.');
        }
        var score = number_(input.score, 'Skor item ' + row[4]);
        var target = number_(input.target, 'Sasaran item ' + row[4]);
        row[6] = score;
        row[7] = target;
        row[8] = score >= target ? 'CAPAI' : 'BELUM CAPAI';
        row[9] = clean_(input.issue);
        row[10] = now_();
        row[11] = u.email;
        total += score;
        changed.push(row[0]);
      });
      var itemAverage = Math.round((total / changed.length) * 100) / 100;
      getSS_().getSheetByName(SHEETS.ITEM).getRange(2, 1, rows.length, 12).setValues(rows);
      saveOfficialStandardPercentage_(y, code, officialPercentage, changed.length, u);
      log_('KEMAS KINI', 'SKOR ITEM', changed.join(','),
        changed.length + ' item; peratus standard rasmi ' + officialPercentage + '%', u);
      var analysisError = safeGenerateAnalysis_();
      return ok_(changed.length + ' skor item disimpan. Peratus Standard ' + code +
        ' ialah ' + officialPercentage.toFixed(2) + '%.' +
        (analysisError ? ' Namun analisis belum disegarkan: ' + analysisError : ''), {
        count: changed.length,
        itemAverage: itemAverage,
        standardPercentage: officialPercentage
      });
    });
  }, 'Markah item gagal disimpan.');
}

/** Simpan peratus rumusan rasmi standard sebagai sumber dashboard tahunan. */
function saveOfficialStandardPercentage_(year, code, percentage, itemCount, user) {
  var sheet = getSS_().getSheetByName(SHEETS.STANDARD);
  var rows = values_(SHEETS.STANDARD);
  var index = rows.findIndex(function (row) {
    return Number(row[1]) === year && String(row[2]) === code;
  });
  if (index < 0) throw new Error('Rekod standard bagi tahun dipilih tidak ditemui.');
  var row = rows[index];
  var target = number_(row[5] === '' ? CONFIG.DEFAULT_TARGET : row[5], 'Sasaran standard');
  row[4] = percentage;
  row[6] = percentage >= target ? 'CAPAI' : 'BELUM CAPAI';
  row[7] = now_();
  row[8] = user.email;
  row[9] = 'Peratus rumusan rasmi; ' + itemCount + ' skor item telah direkodkan.';
  sheet.getRange(index + 2, 1, 1, 10).setValues([row]);
}
