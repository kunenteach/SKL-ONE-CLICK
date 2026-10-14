function uploadEvidenceFile(file, sessionToken) {
  requireAppSession_(sessionToken);
  const user = requirePermission_('upload');
  return createEvidenceDriveFile_(file, user);
}

/** Validates and creates one Drive file without logging a separate incomplete evidence event. */
function createEvidenceDriveFile_(file, user) {
  if (!APP_CONFIG.evidenceFolderId) throw new Error('Folder evidens belum dikonfigurasi.');
  if (!file || !file.base64 || !APP_CONFIG.allowedMimeTypes.includes(file.mimeType)) throw new Error('Format fail tidak disokong.');
  const bytes = Utilities.base64Decode(file.base64);
  if (bytes.length > APP_CONFIG.maxUploadBytes) throw new Error('Saiz fail melebihi had 10 MB.');
  const safeName = String(file.name || 'evidens').replace(/[^a-zA-Z0-9._ -]/g, '_');
  const created = DriveApp.getFolderById(APP_CONFIG.evidenceFolderId).createFile(Utilities.newBlob(bytes, file.mimeType, safeName));
  return { id: '', fileId: created.getId(), fileUrl: created.getUrl(), fileName: safeName, mimeType: file.mimeType, uploader: user.email, timestamp: new Date().toISOString() };
}

function trashDriveFileSafely_(fileId) {
  if (!fileId) return;
  try { DriveApp.getFileById(String(fileId)).setTrashed(true); } catch (error) { console.warn('Fail Drive tidak dapat dipadam: ' + fileId); }
}
