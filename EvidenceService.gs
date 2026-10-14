const EVIDENCE_HEADERS = ['ID_EVIDENS','STANDARD','NO_ASPEK','SUB_KATEGORI','SUB_ITEM','NAMA_EVIDENS','LOKASI_TYPE','LOKASI_FIZIKAL','NO_DIVIDER','STATUS','CATATAN','CREATED_BY','CREATED_AT','UPDATED_BY','UPDATED_AT','NAMA_LINK','URL_LINK'];
const EVIDENCE_FILE_HEADERS = ['ID_FILE','ID_EVIDENS','FILE_ID','FILE_URL','FILE_NAME','MIME_TYPE','UPLOADED_BY','UPLOADED_AT'];

/** Returns evidence and file metadata in two batched reads for the bootstrap payload. */
function getEvidenceBootstrapData() {
  return {
    records: readSheetObjects_(APP_CONFIG.sheets.evidence),
    files: readSheetObjects_(APP_CONFIG.sheets.files)
  };
}

function calculateEvidenceStatus_(evidence) {
  if (!evidence || !evidence.name) return 'BELUM DIISI';
  if (evidence.locationType === 'FIZIKAL') return evidence.physicalLocation ? 'TELAH DIISI' : 'SEBAHAGIAN LENGKAP';
  if (evidence.locationType === 'LINK') return evidence.linkName && evidence.linkUrl ? 'TELAH DIISI' : 'SEBAHAGIAN LENGKAP';
  return evidence.files && evidence.files.length ? 'TELAH DIISI' : 'SEBAHAGIAN LENGKAP';
}

/**
 * Saves every evidence record for one unique aspect context under one lock.
 * New Drive uploads are completed first and rolled back if any upload or Sheet write fails.
 */
function saveAspectEvidence(payload, sessionToken) {
  requireAppSession_(sessionToken);
  const user = requirePermission_('upload');
  const context = validateEvidenceContext_(payload && payload.context);
  const entries = (payload && payload.entries || []).map(validateEvidenceEntry_);
  const uploadedFileIds = [];
  try {
    entries.forEach(entry => {
      entry.files = (entry.files || []).map(file => {
        if (!file.base64) return normalizeExistingFile_(file);
        const created = createEvidenceDriveFile_(file, user);
        uploadedFileIds.push(created.fileId);
        return created;
      });
      entry.status = calculateEvidenceStatus_(entry);
      if (entry.status !== 'TELAH DIISI') throw new Error('Lengkapkan lokasi atau fail bagi setiap evidens.');
    });

    const result = persistAspectEvidence_(context, entries, user);
    return result;
  } catch (error) {
    uploadedFileIds.forEach(fileId => trashDriveFileSafely_(fileId));
    throw error;
  }
}

/** Deletes one evidence record and its file metadata, then updates the client count. */
function deleteEvidenceRecord(evidenceId, sessionToken) {
  requireAppSession_(sessionToken);
  requirePermission_('upload');
  const id = String(evidenceId || '');
  if (!id) throw new Error('ID evidens diperlukan.');
  const lock = LockService.getDocumentLock();
  lock.waitLock(20000);
  let removedFiles = [];
  try {
    const evidence = readSheetObjects_(APP_CONFIG.sheets.evidence);
    const existing = evidence.find(item => String(item.ID_EVIDENS) === id);
    if (!existing) throw new Error('Evidens tidak ditemui.');
    const files = readSheetObjects_(APP_CONFIG.sheets.files);
    removedFiles = files.filter(file => String(file.ID_EVIDENS) === id);
    writeObjects_(APP_CONFIG.sheets.evidence, EVIDENCE_HEADERS, evidence.filter(item => String(item.ID_EVIDENS) !== id));
    writeObjects_(APP_CONFIG.sheets.files, EVIDENCE_FILE_HEADERS, files.filter(file => String(file.ID_EVIDENS) !== id));
    logActivities_([{action:'EVIDENS_DIPADAM',standardId:existing.STANDARD,aspectId:existing.NO_ASPEK,changes:{before:existing,after:null}}]);
  } finally {
    lock.releaseLock();
  }
  removedFiles.forEach(file => trashDriveFileSafely_(file.FILE_ID));
  return getEvidenceBootstrapData();
}

function persistAspectEvidence_(context, entries, user) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(20000);
  const now = new Date();
  let removedFileIds = [];
  let committed = false;
  let originalEvidence = null;
  let originalFiles = null;
  try {
    const allEvidence = readSheetObjects_(APP_CONFIG.sheets.evidence);
    const allFiles = readSheetObjects_(APP_CONFIG.sheets.files);
    originalEvidence = allEvidence;
    originalFiles = allFiles;
    const oldContext = allEvidence.filter(item => evidenceContextMatches_(item, context));
    const oldIds = new Set(oldContext.map(item => String(item.ID_EVIDENS)));
    const retainedEvidence = allEvidence.filter(item => !oldIds.has(String(item.ID_EVIDENS)));
    const oldById = oldContext.reduce((map, item) => { map[String(item.ID_EVIDENS)] = item; return map; }, {});
    const savedEvidence = [];
    const savedFiles = [];

    entries.forEach(entry => {
      const id = entry.id || Utilities.getUuid();
      const old = oldById[id];
      savedEvidence.push({ID_EVIDENS:id,STANDARD:context.standard,NO_ASPEK:context.aspectCode,SUB_KATEGORI:context.subCategory,SUB_ITEM:context.subItem,NAMA_EVIDENS:entry.name,LOKASI_TYPE:entry.locationType,LOKASI_FIZIKAL:entry.physicalLocation,NO_DIVIDER:entry.divider,STATUS:entry.status,CATATAN:entry.notes,CREATED_BY:old&&old.CREATED_BY||user.email,CREATED_AT:old&&old.CREATED_AT||now,UPDATED_BY:user.email,UPDATED_AT:now,NAMA_LINK:entry.linkName,URL_LINK:entry.linkUrl});
      entry.files.forEach(file => savedFiles.push({ID_FILE:file.id||Utilities.getUuid(),ID_EVIDENS:id,FILE_ID:file.fileId,FILE_URL:file.fileUrl,FILE_NAME:file.fileName,MIME_TYPE:file.mimeType,UPLOADED_BY:file.uploader||user.email,UPLOADED_AT:file.timestamp||now}));
    });

    const newEvidenceIds = new Set(savedEvidence.map(item => String(item.ID_EVIDENS)));
    const retainedFiles = allFiles.filter(file => !oldIds.has(String(file.ID_EVIDENS)));
    const keptFileIds = new Set(savedFiles.map(file => String(file.FILE_ID)));
    removedFileIds = allFiles.filter(file => oldIds.has(String(file.ID_EVIDENS)) && !keptFileIds.has(String(file.FILE_ID))).map(file => file.FILE_ID);
    writeObjects_(APP_CONFIG.sheets.evidence, EVIDENCE_HEADERS, retainedEvidence.concat(savedEvidence));
    writeObjects_(APP_CONFIG.sheets.files, EVIDENCE_FILE_HEADERS, retainedFiles.concat(savedFiles));
    const events = savedEvidence.map(item => ({action:oldById[item.ID_EVIDENS]?'EVIDENS_DIKEMASKINI':'EVIDENS_DITAMBAH',standardId:context.standard,aspectId:context.aspectCode,changes:{before:oldById[item.ID_EVIDENS]||null,after:item,subItem:context.subItem}}));
    oldContext.filter(item => !newEvidenceIds.has(String(item.ID_EVIDENS))).forEach(item => events.push({action:'EVIDENS_DIPADAM',standardId:context.standard,aspectId:context.aspectCode,changes:{before:item,after:null,subItem:context.subItem}}));
    logActivities_(events);
    committed = true;
    const response = getEvidenceBootstrapData();
    response.savedAt = now.toISOString();
    response.savedCount = savedEvidence.length;
    return response;
  } catch (error) {
    if (originalEvidence && originalFiles) {
      try {
        writeObjects_(APP_CONFIG.sheets.evidence, EVIDENCE_HEADERS, originalEvidence);
        writeObjects_(APP_CONFIG.sheets.files, EVIDENCE_FILE_HEADERS, originalFiles);
      } catch (rollbackError) {
        console.error('Rollback evidens gagal: ' + rollbackError.message);
      }
    }
    throw error;
  } finally {
    lock.releaseLock();
    if (committed) removedFileIds.forEach(fileId => trashDriveFileSafely_(fileId));
  }
}

function validateEvidenceContext_(context) {
  if (!context || !context.standard || !context.aspectCode) throw new Error('Konteks standard dan aspek diperlukan.');
  const clean = {standard:String(context.standard),aspectCode:String(context.aspectCode),subCategory:String(context.subCategory||''),subItem:String(context.subItem||'')};
  const standard = PPS_MODULE_CONFIG.standards.find(item => item.code === clean.standard);
  const group = standard && standard.groups.find(item => item.items.some(aspect => aspect[0] === clean.aspectCode));
  if (!group || String(group.subCategory||'') !== clean.subCategory) throw new Error('Konteks evidens tidak sah.');
  if (group.subCategory === 'PANITIA' && !getMasterPanitia().includes(clean.subItem)) throw new Error('Panitia tidak aktif atau tidak ditemui.');
  if (group.subCategory && group.subCategory !== 'PANITIA' && !getCoCurricularUnits().some(unit => unit.category === group.subCategory && unit.name === clean.subItem)) throw new Error('Unit kokurikulum tidak aktif atau tidak ditemui.');
  if (!group.subCategory && clean.subItem) throw new Error('Sub-item tidak dibenarkan bagi aspek ini.');
  return clean;
}

function validateEvidenceEntry_(entry) {
  const name = String(entry && entry.name || '').trim().slice(0,250);
  if (!name) throw new Error('Nama evidens diperlukan.');
  const locationType = ['UPLOAD','LINK'].includes(entry.locationType) ? entry.locationType : 'FIZIKAL';
  const linkUrl = String(entry.linkUrl||'').trim().slice(0,2000);
  if (locationType === 'LINK' && !/^https:\/\//i.test(linkUrl)) throw new Error('URL evidens mesti bermula dengan https://.');
  return {id:String(entry.id||''),name:name,locationType:locationType,physicalLocation:String(entry.physicalLocation||'').trim().slice(0,250),divider:String(entry.divider||'').trim().slice(0,80),linkName:String(entry.linkName||'').trim().slice(0,250),linkUrl:linkUrl,notes:String(entry.notes||'').trim().slice(0,1000),files:entry.files||[]};
}

function normalizeExistingFile_(file) {
  if (!file.fileId || !file.fileUrl || !file.fileName) throw new Error('Metadata fail sedia ada tidak lengkap.');
  return {id:String(file.id||''),fileId:String(file.fileId),fileUrl:String(file.fileUrl),fileName:String(file.fileName),mimeType:String(file.mimeType||''),uploader:String(file.uploader||''),timestamp:file.timestamp||''};
}

function evidenceContextMatches_(item, context) {
  return String(item.STANDARD)===context.standard&&String(item.NO_ASPEK)===context.aspectCode&&String(item.SUB_KATEGORI||'')===context.subCategory&&String(item.SUB_ITEM||'')===context.subItem;
}

/** Rewrites a normalized entity in one batch while preserving its header. */
function writeObjects_(sheetName, headers, objects) {
  const sheet = ensureSheet_(sheetName, headers);
  sheet.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold');
  if (sheet.getLastRow()>1) sheet.getRange(2,1,sheet.getLastRow()-1,headers.length).clearContent();
  if (objects.length) sheet.getRange(2,1,objects.length,headers.length).setValues(objects.map(item => headers.map(header => item[header]||'')));
}

/** Backward-compatible single-record endpoint used by older clients. */
function saveEvidence(payload, sessionToken) {
  return saveAspectEvidence({context:{standard:payload.standard||'',aspectCode:payload.aspectId||'',subCategory:payload.subCategory||'',subItem:payload.subItem||''},entries:[{id:payload.id||'',name:payload.namaEvidens,locationType:payload.lokasiType,physicalLocation:payload.lokasiFizikal,divider:payload.divider,linkName:payload.linkName,linkUrl:payload.linkUrl,files:payload.files||[]}]},sessionToken);
}
