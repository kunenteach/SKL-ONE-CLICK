const APP_CONFIG = Object.freeze({
  appName: 'STANDARD KUALITI @ SEKOLAH',
  subtitle: 'Sistem Pengurusan & Pengumpulan Evidens',
  schoolName: 'SEKOLAH KEBANGSAAN LORMALONG',
  schoolBadgeFileId: '1byIjETieWJNW1XYMzIYmoDZLh_4MNubc',
  version: '1.0.0',
  spreadsheetId: '',
  evidenceFolderId: '',
  maxUploadBytes: 10 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf', 'image/jpeg', 'image/png',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  sheets: {
    users: 'USERS', profile: 'PROFILE', strengths: 'KEKUATAN_KAMI', standards: 'STANDARD',
    aspects: 'ASPEK', evidence: 'EVIDENS', assignments: 'PPS_ASSIGNMENT', files: 'FILE_UPLOAD', activity: 'ACTIVITY_LOG',
    teachers: 'MASTER_GURU', positions: 'MASTER_JAWATAN', units: 'MASTER_UNIT_KOKURIKULUM', committees: 'MASTER_PANITIA'
  }
});

function getPublicConfig_() {
  return {
    appName: APP_CONFIG.appName,
    subtitle: APP_CONFIG.subtitle,
    schoolName: APP_CONFIG.schoolName,
    schoolBadgeUrl: 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(APP_CONFIG.schoolBadgeFileId) + '&sz=w256',
    version: APP_CONFIG.version
  };
}

const OFFICIAL_DATA = Object.freeze({
  strengths: [],
  standards: [
    { id: 'STD1', code: '1', name: 'Standard 1', subtitle: '', aspects: [] },
    { id: 'STD2', code: '2', name: 'Standard 2', subtitle: '', aspects: [] },
    { id: 'STD31', code: '3.1', name: 'Standard 3.1', subtitle: 'Kurikulum', aspects: [] },
    { id: 'STD32', code: '3.2', name: 'Standard 3.2', subtitle: 'Kokurikulum', aspects: [] },
    { id: 'STD33', code: '3.3', name: 'Standard 3.3', subtitle: 'Hal Ehwal Murid', aspects: [] }
  ]
});
