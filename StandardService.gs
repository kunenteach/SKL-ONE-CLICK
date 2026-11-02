/**
 * Operasi baca, simpan dan padam markah standard.
 */
function getStandardData(filters) {
  return response_(function () { user_(filters); var f = filters || {}; return ok_('Data standard dimuatkan.', values_(SHEETS.STANDARD).map(standardObject_).filter(function (r) { return (!f.year || r.year === Number(f.year)) && (!f.standard || r.standard === String(f.standard)); })); }, 'Data standard gagal dimuatkan.');
}
function saveStandardScore(data) {
  return response_(function () { return withLock_(function () {
    if (!data || typeof data !== 'object') throw new Error('Fungsi saveStandardScore memerlukan data daripada borang Skor Standard. Jangan jalankan terus melalui butang Run; uji melalui Web App atau gunakan fungsi setupSystem() untuk setup.');
    var u = user_(data), y = year_(data.year), code = clean_(data.standard), score = number_(data.score, 'Skor'), target = number_(data.target, 'Sasaran');
    if (!code) throw new Error('Standard wajib dipilih.'); var s = getSS_().getSheetByName(SHEETS.STANDARD), rows = values_(SHEETS.STANDARD), index = rows.findIndex(function (r) { return Number(r[1]) === y && String(r[2]) === code; });
    if (index < 0) throw new Error('Rekod standard tidak ditemui. Jana tahun terlebih dahulu.');
    var existing = rows[index], owner = clean_(existing[8]).toLowerCase(); if (u.role !== 'ADMIN' && owner && owner !== u.email) throw new Error('GURU hanya boleh mengedit markah sendiri.');
    existing[4] = score; existing[5] = target; existing[6] = score >= target ? 'CAPAI' : 'BELUM CAPAI'; existing[7] = now_(); existing[8] = u.email; existing[9] = clean_(data.note);
    s.getRange(index + 2, 1, 1, 10).setValues([existing]); log_('KEMAS KINI', 'SKOR STANDARD', existing[0], code + ' / ' + y, u);
    var analysisError = safeGenerateAnalysis_();
    return ok_('Markah Standard ' + code + ' bagi tahun ' + y + ' berjaya disimpan.' + (analysisError ? ' Namun analisis belum disegarkan: ' + analysisError : ''), standardObject_(existing));
  }); }, 'Data standard gagal disimpan.');
}
function deleteStandardScore(input) {
  return response_(function () { return withLock_(function () { var id = typeof input === 'object' ? input.value || input.id : input; var u = requireAdmin_(input), s = getSS_().getSheetByName(SHEETS.STANDARD), rows = values_(SHEETS.STANDARD), i = rows.findIndex(function (r) { return r[0] === id; }); if (i < 0) throw new Error('Rekod tidak ditemui.'); rows[i][4] = ''; rows[i][6] = 'BELUM DIISI'; rows[i][7] = now_(); rows[i][8] = u.email; s.getRange(i + 2, 1, 1, 10).setValues([rows[i]]); log_('PADAM', 'SKOR STANDARD', id, 'Skor dikosongkan', u); generateAnalysis_(); return ok_('Markah berjaya dipadam.'); }); }, 'Markah gagal dipadam.');
}

