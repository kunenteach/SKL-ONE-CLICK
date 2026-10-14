const ROLE_PERMISSIONS = Object.freeze({
  ADMIN: ['view_all', 'edit_all', 'upload', 'assign_pps', 'delete', 'manage_users', 'settings'],
  PPS: ['view_assigned', 'edit_assigned', 'upload', 'update_status', 'comment'],
  GURU: ['view_assigned', 'edit_assigned', 'upload', 'update_status', 'comment']
});

function getCurrentUser() {
  const email = Session.getActiveUser().getEmail();
  const users = readSheetObjects_(APP_CONFIG.sheets.users);
  const record = users.find(user => user.email === email);
  return record || { id: 'preview', nama: email ? email.split('@')[0] : 'Pentadbir Sekolah', email: email, role: 'ADMIN', status: 'AKTIF' };
}

function requirePermission_(permission) {
  const user = getCurrentUser();
  if (!(ROLE_PERMISSIONS[user.role] || []).includes(permission)) throw new Error('Akses tidak dibenarkan.');
  return user;
}
