/**
 * Pengiraan dashboard, analisis tahunan dan ringkasan automatik.
 */
function dashboardModel_(selectedYear) {
  var all = values_(SHEETS.STANDARD).map(standardObject_), filled = all.filter(function (r) { return r.score !== null; });
  var years = filled.map(function (r) { return r.year; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(); var year = Number(selectedYear) || years[years.length - 1] || CONFIG.START_YEAR;
  var current = filled.filter(function (r) { return r.year === year; }), previousYears = years.filter(function (y) { return y < year; }), previousYear = previousYears[previousYears.length - 1];
  var previous = filled.filter(function (r) { return r.year === previousYear; }); var avg = current.length ? current.reduce(function (a, r) { return a + r.score; }, 0) / current.length : 0; var prevAvg = previous.length ? previous.reduce(function (a, r) { return a + r.score; }, 0) / previous.length : 0;
  var sorted = current.slice().sort(function (a, b) { return b.score - a.score; }), high = sorted[0] || null, low = sorted[sorted.length - 1] || null;
  var summaries = []; if (high) summaries.push('Standard ' + high.standard + ' mencatat pencapaian tertinggi sebanyak ' + high.score.toFixed(2) + '% pada tahun ' + year + '.');
  if (previous.length) summaries.push('Purata keseluruhan ' + (avg >= prevAvg ? 'meningkat' : 'menurun') + ' sebanyak ' + Math.abs(avg - prevAvg).toFixed(2) + ' mata berbanding tahun ' + previousYear + '.');
  current.forEach(function (r) { var p = previous.filter(function (x) { return x.standard === r.standard; })[0]; if (p && r.score < p.score) summaries.push('Standard ' + r.standard + ' menunjukkan penurunan sebanyak ' + (p.score - r.score).toFixed(2) + ' mata berbanding tahun sebelumnya dan memerlukan perhatian.'); });
  var reached = current.filter(function (r) { return r.status === 'CAPAI'; }).length; summaries.push('Sebanyak ' + reached + ' daripada ' + current.length + ' standard telah mencapai sasaran yang ditetapkan.');
  var matrix = {}; filled.forEach(function (r) { matrix[r.standard] = matrix[r.standard] || { name: r.name, scores: {} }; matrix[r.standard].scores[r.year] = r.score; });
  var items = values_(SHEETS.ITEM).map(itemObject_).filter(function (r) { return r.year === year && r.score !== null; }).sort(function (a, b) { return a.score - b.score; }).slice(0, 10);
  return { year: year, years: years, average: avg, previousYear: previousYear || null, previousAverage: prevAvg, change: previous.length ? avg - prevAvg : null, highest: high, lowest: low, reached: reached, notReached: current.length - reached, standards: current, allStandards: filled, matrix: matrix, lowItems: items, summaries: summaries };
}
function getDashboardData(filters) { return response_(function () { user_(filters); return ok_('Dashboard dimuatkan.', dashboardModel_((filters || {}).year)); }, 'Dashboard gagal dimuatkan.'); }
function getAnnualAnalysis(filters) { return response_(function () { user_(filters); var f = filters || {}, model = dashboardModel_(f.endYear), start = Number(f.startYear) || -Infinity, end = Number(f.endYear) || Infinity; model.allStandards = model.allStandards.filter(function (r) { return r.year >= start && r.year <= end && (!f.standard || r.standard === String(f.standard)); }); return ok_('Analisis tahunan dijana.', model); }, 'Analisis tahunan gagal dijana.'); }
function getLowScoreItems(filters) { return response_(function () { user_(filters); var f = filters || {}, limit = number_(f.limit == null ? 95 : f.limit, 'Had skor'); var rows = values_(SHEETS.ITEM).map(itemObject_).filter(function (r) { return r.score !== null && r.score <= limit && (!f.year || r.year === Number(f.year)) && (!f.standard || r.standard === String(f.standard)); }).sort(function (a, b) { return a.score - b.score; }); return ok_('Item skor rendah ditemui.', rows); }, 'Carian item gagal.'); }

function generateAnalysis_() {
  var rows = values_(SHEETS.STANDARD).map(standardObject_).filter(function (r) { return r.score !== null; }), byYear = {}; rows.forEach(function (r) { (byYear[r.year] = byYear[r.year] || []).push(r); }); var years = Object.keys(byYear).map(Number).sort(), output = [];
  years.forEach(function (year, yi) { var list = byYear[year].slice().sort(function (a, b) { return b.score - a.score; }), prev = byYear[years[yi - 1]] || []; list.forEach(function (r, rank) { var p = prev.filter(function (x) { return x.standard === r.standard; })[0], change = p ? r.score - p.score : '', pct = p && p.score ? change / p.score * 100 : ''; output.push([uuid_(), year, r.standard, r.name, r.score, p ? p.score : '', change, pct, r.target, r.status, rank + 1, p ? (change >= 0 ? 'Peningkatan' : 'Penurunan') + ' ' + Math.abs(change).toFixed(2) + ' mata.' : 'Tiada data tahun sebelumnya.', now_()]); }); });
  var s = getSS_().getSheetByName(SHEETS.ANALYSIS); if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, 13).clearContent(); if (output.length) s.getRange(2, 1, output.length, 13).setValues(output);
  refreshDashboard_();
}
function refreshDashboard_() { var all = values_(SHEETS.STANDARD).map(standardObject_).filter(function (r) { return r.score !== null; }), years = all.map(function (r) { return r.year; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(), out = years.map(function (y) { var m = dashboardModel_(y); return [y, m.average, m.highest && m.highest.name, m.highest && m.highest.score, m.lowest && m.lowest.name, m.lowest && m.lowest.score, m.reached, m.notReached, now_()]; }), s = getSS_().getSheetByName(SHEETS.DASHBOARD); if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, 9).clearContent(); if (out.length) s.getRange(2, 1, out.length, 9).setValues(out); }
function safeGenerateAnalysis_() {
  try {
    generateAnalysis_();
    return '';
  } catch (e) {
    console.error(e.stack || e);
    return String(e && e.message || e || 'Analisis gagal dijana.');
  }
}
function refreshAnalysis() { return response_(function () { var u = requireAdmin_(arguments[0]); generateAnalysis_(); log_('JANA ANALISIS', 'ANALISIS', '', 'Analisis disegarkan', u); return ok_('Analisis berjaya disegarkan.'); }, 'Analisis gagal disegarkan.'); }
