/** Titik masuk Web App. */
function doGet(){return HtmlService.createTemplateFromFile('Index').evaluate().setTitle('One Page Report SK Lormalong').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).addMetaTag('viewport','width=device-width, initial-scale=1, viewport-fit=cover');}

/**
 * Dispatcher tunggal untuk panggilan pelayar.
 *
 * google.script.run ialah proksi khas dan tidak menyokong akses dinamik seperti
 * google.script.run[namaFungsi](). Senarai putih ini memastikan hanya fungsi
 * Web App yang memang dibenarkan boleh dipanggil oleh klien.
 *
 * @param {string} method Nama operasi yang dibenarkan.
 * @param {Array<*>} args Senarai argumen operasi.
 * @return {*} Hasil operasi server.
 */
function callServer(method, args) {
  const operation = cleanText_(method, 60);
  const parameters = Array.isArray(args) ? args : [];
  // Gunakan dispatch malas: hanya fungsi yang diminta akan dirujuk. Dengan ini,
  // satu modul yang belum disalin tidak menghalang getInitialData dan dropdown.
  switch (operation) {
    case 'getInitialData': return getInitialData.apply(null, parameters);
    case 'getDropdownData': return getDropdownData.apply(null, parameters);
    case 'getSchoolLogoData': return getSchoolLogoData.apply(null, parameters);
    case 'getUnitTemplate': return getUnitTemplate.apply(null, parameters);
    case 'saveReport': return saveReport.apply(null, parameters);
    case 'updateReport': return updateReport.apply(null, parameters);
    case 'getReportById': return getReportById.apply(null, parameters);
    case 'getReportHistory': return getReportHistory.apply(null, parameters);
    case 'deleteReport': return deleteReport.apply(null, parameters);
    case 'generateReportPdf': return generateReportPdf.apply(null, parameters);
    case 'generatePreview': return generatePreview.apply(null, parameters);
    case 'clearSystemCache': return clearSystemCache.apply(null, parameters);
    default: throw new Error('Operasi server tidak dibenarkan.');
  }
}
