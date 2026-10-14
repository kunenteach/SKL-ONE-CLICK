const PPS_ASSIGNMENT_HEADERS = ['ID_ASSIGNMENT','STANDARD','NO_ASPEK','SUB_KATEGORI','SUB_ITEM','ID_GURU','NAMA_GURU','JAWATAN','STATUS','TARIKH_AGIHAN','UPDATED_AT'];
const UNIT_HEADERS = ['ID_UNIT','KATEGORI','NAMA_UNIT','AKTIF','TARIKH_CIPTA','TARIKH_KEMASKINI'];

/** Reads active teachers once per bootstrap and caches the normalized result for five minutes. */
function getMasterGuru() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('MASTER_GURU_V1');
  if (cached) return JSON.parse(cached);
  const teachers = readSheetObjects_(APP_CONFIG.sheets.teachers).map(normalizeTeacher_)
    .filter(teacher => teacher.id && teacher.name && teacher.active)
    .filter((teacher, index, all) => all.findIndex(item => item.id === teacher.id || item.name.toUpperCase() === teacher.name.toUpperCase()) === index)
    .sort((a, b) => a.name.localeCompare(b.name, 'ms'));
  cache.put('MASTER_GURU_V1', JSON.stringify(teachers), 300);
  return teachers;
}

/** Returns positions from MASTER_JAWATAN, falling back to distinct teacher positions. */
function getMasterJawatan() {
  const rows = readSheetObjects_(APP_CONFIG.sheets.positions);
  const values = rows.filter(row => !valueByAliases_(row, ['AKTIF','STATUS']) || /^(AKTIF|YA|YES|TRUE|1)$/i.test(valueByAliases_(row, ['AKTIF','STATUS'])))
    .map(row => valueByAliases_(row, ['JAWATAN','NAMA_JAWATAN','NAMA']))
    .concat(getMasterGuru().map(teacher => teacher.position)).filter(Boolean);
  return values.filter((value, index, all) => all.findIndex(item => item.toUpperCase() === value.toUpperCase()) === index)
    .sort((a, b) => a.localeCompare(b, 'ms'));
}

/** Returns active subject committees and seeds the official list only when the entity is empty. */
function getMasterPanitia() {
  const db = getDatabase_();
  if (!db) return PPS_MODULE_CONFIG.committees.slice();
  const headers = ['ID_PANITIA','NAMA_PANITIA','AKTIF'];
  const sheet = ensureSheet_(APP_CONFIG.sheets.committees, headers);
  if (sheet.getLastRow() === 1) {
    const rows = PPS_MODULE_CONFIG.committees.map(name => [Utilities.getUuid(),name,'AKTIF']);
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  return readSheetObjects_(APP_CONFIG.sheets.committees).filter(row => row.AKTIF !== 'TIDAK AKTIF').map(row => row.NAMA_PANITIA).filter(Boolean);
}

function normalizeTeacher_(row) {
  const status = valueByAliases_(row, ['AKTIF','STATUS']) || 'AKTIF';
  return { id: valueByAliases_(row, ['ID','ID_GURU']), name: valueByAliases_(row, ['NAMA GURU','NAMA_GURU','NAMA']), position: valueByAliases_(row, ['JAWATAN','JAWATAN_UTAMA']), active: /^(AKTIF|YA|YES|TRUE|1)$/i.test(status) };
}

function valueByAliases_(row, aliases) {
  const key = Object.keys(row).find(name => aliases.includes(String(name).trim().toUpperCase()));
  return key ? String(row[key] || '').trim() : '';
}

/** Returns persistent units, seeding the supplied defaults only on an empty data source. */
function getCoCurricularUnits() {
  const db = getDatabase_();
  if (!db) return Object.keys(PPS_MODULE_CONFIG.defaultUnits).flatMap(category => PPS_MODULE_CONFIG.defaultUnits[category].map((name, index) => ({ id: 'DEFAULT_' + category + '_' + index, category: category, name: name, active: true })));
  const sheet = ensureSheet_(APP_CONFIG.sheets.units, UNIT_HEADERS);
  if (sheet.getLastRow() === 1) {
    const now = new Date();
    const seed = Object.keys(PPS_MODULE_CONFIG.defaultUnits).flatMap(category => PPS_MODULE_CONFIG.defaultUnits[category].map(name => [Utilities.getUuid(),category,name,'AKTIF',now,now]));
    if (seed.length) sheet.getRange(2, 1, seed.length, UNIT_HEADERS.length).setValues(seed);
  }
  return readSheetObjects_(APP_CONFIG.sheets.units).filter(row => row.AKTIF !== 'TIDAK AKTIF').map(row => ({ id: row.ID_UNIT, category: row.KATEGORI, name: row.NAMA_UNIT, active: true }));
}

/** Creates a co-curricular unit and immediately returns its normalized record. */
function createCoCurricularUnit(input, sessionToken) {
  requireAppSession_(sessionToken);
  requirePermission_('assign_pps');
  const category = String(input && input.category || '');
  const name = String(input && input.name || '').trim().toUpperCase().slice(0, 120);
  if (!Object.prototype.hasOwnProperty.call(PPS_MODULE_CONFIG.defaultUnits, category) || !name) throw new Error('Kategori atau nama unit tidak sah.');
  const lock = LockService.getDocumentLock(); lock.waitLock(10000);
  try {
    const existing = getCoCurricularUnits().find(unit => unit.category === category && unit.name.toUpperCase() === name);
    if (existing) throw new Error('Unit ini telah wujud.');
    const now = new Date(), id = Utilities.getUuid();
    ensureSheet_(APP_CONFIG.sheets.units, UNIT_HEADERS).appendRow([id,category,name,'AKTIF',now,now]);
    logActivity_({action:'UNIT_KOKURIKULUM_DITAMBAH',changes:{category:category,name:name}});
    return {id:id,category:category,name:name,active:true};
  } finally { lock.releaseLock(); }
}

/** Soft-deletes a unit so historical assignments remain auditable. */
function deleteCoCurricularUnit(id, sessionToken) {
  requireAppSession_(sessionToken);
  requirePermission_('assign_pps');
  const sheet = ensureSheet_(APP_CONFIG.sheets.units, UNIT_HEADERS), values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex((row, index) => index > 0 && String(row[0]) === String(id));
  if (rowIndex < 1) throw new Error('Unit tidak ditemui.');
  sheet.getRange(rowIndex + 1, 4, 1, 3).setValues([['TIDAK AKTIF',values[rowIndex][4],new Date()]]);
  logActivity_({action:'UNIT_KOKURIKULUM_DIBUANG',changes:{id:id,name:values[rowIndex][2]}});
  return {success:true};
}

/** Atomically applies assignment creates/updates/deletes; one assignment is always one row. */
function savePpsAssignments(changeSet, sessionToken) {
  requireAppSession_(sessionToken);
  const user = requirePermission_('assign_pps'), teachers = getMasterGuru();
  const upserts = (changeSet && changeSet.upserts || []).map(item => validateAssignment_(item, teachers));
  const deleteIds = new Set((changeSet && changeSet.deletes || []).map(String));
  const lock = LockService.getDocumentLock(); lock.waitLock(20000);
  try {
    const sheet = ensureSheet_(APP_CONFIG.sheets.assignments, PPS_ASSIGNMENT_HEADERS);
    const existing = readSheetObjects_(APP_CONFIG.sheets.assignments);
    const byId = existing.reduce((map, item) => { map[String(item.ID_ASSIGNMENT)] = item; return map; }, {});
    deleteIds.forEach(id => delete byId[id]);
    const now = new Date();
    upserts.forEach(item => { const id = item.id || Utilities.getUuid(); byId[id] = {'ID_ASSIGNMENT':id,'STANDARD':item.standard,'NO_ASPEK':item.aspectCode,'SUB_KATEGORI':item.subCategory,'SUB_ITEM':item.subItem,'ID_GURU':item.teacherId,'NAMA_GURU':item.teacherName,'JAWATAN':item.position,'STATUS':'AKTIF','TARIKH_AGIHAN':item.assignedAt || now,'UPDATED_AT':now}; });
    const rows = Object.keys(byId).map(id => PPS_ASSIGNMENT_HEADERS.map(header => byId[id][header] || ''));
    if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, PPS_ASSIGNMENT_HEADERS.length).clearContent();
    if (rows.length) sheet.getRange(2, 1, rows.length, PPS_ASSIGNMENT_HEADERS.length).setValues(rows);
    const events = [];
    deleteIds.forEach(id => events.push({action:'PPS_DIBUANG',aspectId:(existing.find(item => String(item.ID_ASSIGNMENT) === id) || {}).NO_ASPEK || '',changes:{before:existing.find(item => String(item.ID_ASSIGNMENT) === id) || null,after:null}}));
    upserts.forEach(item => events.push({action:item.id&&existing.some(old => String(old.ID_ASSIGNMENT)===item.id)?'PPS_DIKEMASKINI':'PPS_DITAMBAH',aspectId:item.aspectCode,changes:{before:item.id?existing.find(old=>String(old.ID_ASSIGNMENT)===item.id)||null:null,after:item}}));
    logActivities_(events);
    return { assignments: getPpsAssignments(), savedAt: now.toISOString() };
  } finally { lock.releaseLock(); }
}

function validateAssignment_(item, teachers) {
  const teacher = teachers.find(record => record.id === String(item.teacherId));
  if (!teacher) throw new Error('Guru yang dipilih tidak aktif atau tidak ditemui.');
  if (!item.standard || !item.aspectCode) throw new Error('Standard dan nombor aspek diperlukan.');
  return {id:String(item.id || ''),standard:String(item.standard),aspectCode:String(item.aspectCode),subCategory:String(item.subCategory || ''),subItem:String(item.subItem || ''),teacherId:teacher.id,teacherName:teacher.name,position:String(item.position || teacher.position || '').trim().slice(0,120),assignedAt:item.assignedAt || ''};
}

/** Creates required master tables without overwriting existing school data. */
function initializePpsModule() {
  requirePermission_('settings');
  ensureSheet_(APP_CONFIG.sheets.teachers, ['ID_GURU','NAMA_GURU','JAWATAN','STATUS']);
  ensureSheet_(APP_CONFIG.sheets.positions, ['ID_JAWATAN','JAWATAN','AKTIF']);
  ensureSheet_(APP_CONFIG.sheets.assignments, PPS_ASSIGNMENT_HEADERS);
  ensureSheet_(APP_CONFIG.sheets.units, UNIT_HEADERS);
  ensureSheet_(APP_CONFIG.sheets.committees, ['ID_PANITIA','NAMA_PANITIA','AKTIF']);
  ensureSheet_(APP_CONFIG.sheets.activity, ['ID_LOG','TARIKH_MASA','PENGGUNA','TINDAKAN','STANDARD','NO_ASPEK','PERUBAHAN']);
  ensureSheet_(APP_CONFIG.sheets.evidence, EVIDENCE_HEADERS);
  ensureSheet_(APP_CONFIG.sheets.files, EVIDENCE_FILE_HEADERS);
  getCoCurricularUnits();
  return {success:true};
}
