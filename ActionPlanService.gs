/**
 * Pengurusan pelan tindakan dan intervensi.
 * Kolum 1–18 dikekalkan untuk keserasian projek lama; format jadual baharu
 * disimpan pada kolum 19–25 supaya rekod lama tidak perlu dipadam.
 */
function saveActionPlan(data) {
  return response_(function () {
    return withLock_(function () {
      data = data || {};
      var user = requireAdmin_(data);
      var required = ['year', 'standard', 'focus', 'dataTov', 'objective',
        'intervention', 'period', 'responsibility', 'implementation'];
      required.forEach(function (key) {
        if (!clean_(data[key])) throw new Error('Sila lengkapkan medan ' + key + '.');
      });
      var year = year_(data.year);
      var implementation = normalizeImplementationStatus_(data.implementation);
      if (CONFIG.ACTION_STATUSES.indexOf(implementation) < 0) throw new Error('Catatan pelaksanaan tidak sah.');

      var sheet = getSS_().getSheetByName(SHEETS.ACTION);
      ensureColumnCount_(sheet, HEADERS[SHEETS.ACTION].length);
      var rows = values_(SHEETS.ACTION);
      var index = data.id ? rows.findIndex(function (row) { return clean_(row[0]) === clean_(data.id); }) : -1;
      var id = index >= 0 ? rows[index][0] : uuid_();
      var createdAt = index >= 0 && rows[index][16] ? rows[index][16] : now_();
      var score = data.score === '' || data.score == null ? '' : number_(data.score, 'Data TOV skor');
      var limit = data.limit === '' || data.limit == null ? CONFIG.DEFAULT_TARGET : number_(data.limit, 'Had skor');
      var row = [
        id, year, clean_(data.standard), clean_(data.standardName),
        clean_(data.itemCode), clean_(data.itemName), score, limit,
        clean_(data.objective), clean_(data.intervention), clean_(data.responsibility),
        '', '', implementation, '', user.email, createdAt, now_(),
        clean_(data.focus), clean_(data.dataTov), clean_(data.objective),
        clean_(data.intervention), clean_(data.period), clean_(data.responsibility),
        implementation
      ];
      if (index >= 0) sheet.getRange(index + 2, 1, 1, row.length).setValues([row]);
      else sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
      log_(index >= 0 ? 'KEMAS KINI' : 'TAMBAH', 'PELAN TINDAKAN', id, clean_(data.focus), user);
      return ok_('Pelan tindakan berjaya disimpan.', { id: id });
    });
  }, 'Pelan tindakan gagal disimpan.');
}

/** Tukar status lama kepada tiga catatan pelaksanaan yang dipersetujui. */
function normalizeImplementationStatus_(status) {
  var value = clean_(status).toUpperCase();
  var legacy = {
    'BELUM MULA': 'BELUM DILAKSANAKAN',
    'DALAM TINDAKAN': 'SEDANG DILAKSANAKAN',
    'SELESAI': 'TELAH DILAKSANAKAN',
    'DITANGGUHKAN': 'BELUM DILAKSANAKAN'
  };
  return legacy[value] || value;
}

/** Bentuk rekod baharu dengan fallback untuk data pelan tindakan versi lama. */
function actionPlanObject_(row) {
  var score = row[6] === '' ? null : Number(row[6]);
  var oldPeriod = [serialDate_(row[11]), serialDate_(row[12])].filter(Boolean).join(' hingga ');
  var standardLabel = [clean_(row[2]), clean_(row[3])].filter(Boolean).join(' — ');
  return {
    id: row[0], year: Number(row[1]), standard: String(row[2]), standardName: row[3],
    itemCode: String(row[4] || ''), itemName: row[5] || '', score: score,
    limit: row[7] === '' ? null : Number(row[7]),
    focus: clean_(row[18]) || standardLabel || clean_(row[5]),
    dataTov: clean_(row[19]) || (score == null ? '' : score.toFixed(2) + '%'),
    objective: clean_(row[20]) || clean_(row[8]),
    intervention: clean_(row[21]) || clean_(row[9]),
    period: clean_(row[22]) || oldPeriod,
    responsibility: clean_(row[23]) || clean_(row[10]),
    implementation: normalizeImplementationStatus_(row[24] || row[13])
  };
}

function getActionPlans(filters) {
  return response_(function () {
    user_(filters);
    var filter = filters || {};
    var plans = values_(SHEETS.ACTION).map(actionPlanObject_).filter(function (plan) {
      return (!filter.year || plan.year === Number(filter.year)) &&
        (!filter.standard || plan.standard === String(filter.standard));
    });
    return ok_('Pelan tindakan dimuatkan.', plans);
  }, 'Pelan tindakan gagal dimuatkan.');
}

function deleteActionPlan(id) { return deleteRowAdmin_(SHEETS.ACTION, id, 'PELAN TINDAKAN'); }
