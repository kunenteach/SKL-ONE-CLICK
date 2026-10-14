/** Serves the single-page application. */
function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle(APP_CONFIG.appName)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Includes a trusted project HTML partial. */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** Returns the minimum bootstrap payload in one server call. */
function getBootstrapData(sessionToken) {
  requireAppSession_(sessionToken);
  return getBootstrapData_();
}

function getBootstrapData_() {
  return {
    config: getPublicConfig_(),
    profile: getInstitutionProfile(),
    standards: getStandards(),
    strengths: getStrengths(),
    assignments: getPpsAssignments(),
    ppsConfig: getPpsModuleConfig(),
    teachers: getMasterGuru(),
    positions: getMasterJawatan(),
    coCurricularUnits: getCoCurricularUnits(),
    evidenceData: getEvidenceBootstrapData(),
    activities: getRecentActivity(8),
    user: getCurrentUser()
  };
}
