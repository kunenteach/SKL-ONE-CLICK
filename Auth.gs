/**
 * Autentikasi, autorisasi, tetapan cache dan log audit.
 */
function settings_() {
  var cache = CacheService.getScriptCache(), hit = cache.get('settings'); if (hit) return JSON.parse(hit);
  var out = {}; values_(SHEETS.SETTINGS).forEach(function (r) { if (r[0]) out[String(r[0])] = r[1]; });
  cache.put('settings', JSON.stringify(out), 300); return out;
}
function user_(auth) {
  auth = authInput_(auth);
  if (auth._authToken) {
    var token = clean_(auth._authToken);
    var key = 'auth:' + token;
    var cached = CacheService.getScriptCache().get(key);
    var stored = cached || PropertiesService.getScriptProperties().getProperty('AUTH_SESSION_' + token);
    if (!stored) throw new Error('Sesi log masuk telah tamat. Sila muat semula halaman dan log masuk semula.');
    var session = JSON.parse(stored);
    if (session.user && session.expiresAt) {
      if (Number(session.expiresAt) <= Date.now()) {
        PropertiesService.getScriptProperties().deleteProperty('AUTH_SESSION_' + token);
        throw new Error('Sesi log masuk telah tamat. Sila muat semula halaman dan log masuk semula.');
      }
      if (!cached) CacheService.getScriptCache().put(key, stored, 21600);
      return session.user;
    }
    // Keserasian dengan token cache versi terdahulu.
    return session;
  }
  var email = clean_(Session.getActiveUser().getEmail()).toLowerCase();
  if (!email) throw new Error('E-mel Google tidak dapat dikenal pasti. Deploy sebagai pengguna yang mengakses aplikasi.');
  var row = values_(SHEETS.SETTINGS).filter(function (r) { return clean_(r[4]).toLowerCase() === email; })[0];
  if (!row || clean_(row[7]).toUpperCase() !== 'AKTIF') throw new Error('E-mel anda belum didaftarkan untuk menggunakan sistem ini. Sila hubungi pentadbir.');
  return { email: email, name: clean_(row[5]) || email, role: clean_(row[6]).toUpperCase() };
}

/** Cipta sesi enam jam yang kekal berfungsi walaupun ScriptCache dikosongkan awal. */
function createAuthSession_(user) {
  var token = uuid_();
  var session = JSON.stringify({ user: user, expiresAt: Date.now() + 21600000 });
  CacheService.getScriptCache().put('auth:' + token, session, 21600);
  PropertiesService.getScriptProperties().setProperty('AUTH_SESSION_' + token, session);
  return token;
}
function requireAdmin_(auth) { var u = user_(auth); if (u.role !== 'ADMIN') throw new Error('Operasi ini hanya dibenarkan untuk ADMIN.'); return u; }
function log_(action, module, id, note, user) {
  var u = user || user_(), s = getSS_().getSheetByName(SHEETS.LOG);
  s.getRange(s.getLastRow() + 1, 1, 1, 8).setValues([[uuid_(), now_(), u.email, u.name, action, module, id || '', note || '']]);
}

function getInitialData() {
  return response_(function () { return buildInitialData_(user_(), ''); }, 'Data permulaan gagal dimuatkan.');
}
function buildInitialData_(u, token) {
    var set = settings_(), standards = values_(SHEETS.STANDARD), items = values_(SHEETS.ITEM);
    var years = standards.map(function (r) { return Number(r[1]); }).filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
    var catalog = {}; standards.forEach(function (r) { catalog[String(r[2])] = r[3]; });
    log_('LOGIN', 'SISTEM', '', 'Akses aplikasi', u);
    return ok_('Data permulaan dimuatkan.', { user: u, authToken: token, settings: set, years: years, standards: Object.keys(catalog).map(function (k) { return { code: k, name: catalog[k] }; }), items: items.map(itemObject_), categories: CONFIG.DOCUMENT_CATEGORIES, actionStatuses: CONFIG.ACTION_STATUSES, itemGroups: BASE_ITEM_GROUPS, defaultTarget: CONFIG.DEFAULT_TARGET, maxFileMb: CONFIG.MAX_FILE_MB, appVersion: CONFIG.APP_VERSION, logoUrl: set.LOGO_URL || logoUrl_() });
}
function loginWithPassword(data) {
  return response_(function () {
    data = data || {};
    var password = clean_(data.password);
    if (!password) throw new Error('Kata laluan wajib diisi.');
    var role = password === defaultPasswordForRole_('ADMIN') ? 'ADMIN' :
      password === defaultPasswordForRole_('GURU') ? 'GURU' : '';
    if (!role) throw new Error('Kata laluan tidak sah.');
    var u = {
      email: role === 'ADMIN' ? 'akses-admin' : 'akses-guru',
      name: role === 'ADMIN' ? 'Pentadbir Sistem' : 'Guru',
      role: role
    };
    var token = createAuthSession_(u);
    log_('LOGIN', 'SISTEM', '', 'Akses kata laluan peranan', u);
    return buildInitialData_(u, token);
  }, 'Log masuk gagal.');
}
function setLoginPassword(userId, password) {
  return response_(function () { return withLock_(function () {
    var u = requireAdmin_(), id = clean_(userId).toLowerCase(), pass = clean_(password);
    if (!id || pass.length < 4) throw new Error('ID pengguna dan kata laluan minimum 4 aksara diperlukan.');
    var s = getSS_().getSheetByName(SHEETS.SETTINGS), rows = values_(SHEETS.SETTINGS), i = rows.findIndex(function (r) { return clean_(r[4]).toLowerCase() === id; });
    if (i < 0) throw new Error('Pengguna tidak ditemui dalam 01_SETTING.');
    var salt = uuid_(), hash = hashPassword_(pass, salt);
    s.getRange(i + 2, 9, 1, 3).setValues([[hash, salt, now_()]]);
    log_('KEMAS KINI', 'PENGGUNA', id, 'Tetapkan kata laluan login', u);
    return ok_('Kata laluan berjaya ditetapkan untuk ' + id + '.');
  }); }, 'Kata laluan gagal ditetapkan.');
}

/** Jalankan sekali untuk memberi A001 kepada ADMIN dan A002 kepada GURU yang belum mempunyai kata laluan. */
function setupDefaultLoginPasswords() {
  return response_(function () { return withLock_(function () {
    var admin = requireAdmin_();
    syncDefaultPasswords_();
    log_('KEMAS KINI', 'PENGGUNA', '', 'Selaras kata laluan permulaan mengikut peranan', admin);
    return ok_('Kata laluan permulaan diselaraskan: ADMIN A001, GURU A002. Kata laluan sedia ada tidak diubah.');
  }); }, 'Kata laluan permulaan gagal diselaraskan.');
}

function standardObject_(r) { return { id: r[0], year: Number(r[1]), standard: String(r[2]), name: r[3], score: r[4] === '' ? null : Number(r[4]), target: Number(r[5]), status: r[6], updatedAt: serialDate_(r[7]), updatedBy: r[8], note: r[9] }; }
function itemObject_(r) { return { id: r[0], year: Number(r[1]), standard: String(r[2]), standardName: r[3], code: String(r[4]), name: r[5], score: r[6] === '' ? null : Number(r[6]), target: Number(r[7]), status: r[8], issue: r[9] }; }
