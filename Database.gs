function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1,1,1,headers.length).setValues([headers]);
  else if (sheet.getLastColumn() < headers.length) sheet.getRange(1,1,1,headers.length).setValues([headers]);
  sheet.setFrozenRows(1); sheet.getRange(1,1,1,headers.length).setBackground('#12372a').setFontColor('#fff').setFontWeight('bold').setWrap(true);
  sheet.autoResizeColumns(1, headers.length); return sheet;
}
/** Mencipta struktur data dan folder tanpa memadam data sedia ada. */
function setupSystem() {
  const ss = getSpreadsheet_(); const props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', ss.getId());
  ensureSheet_(ss,SHEETS.REPORTS,REPORT_HEADERS); const settings = ensureSheet_(ss,SHEETS.SETTINGS,SETTING_HEADERS); ensureSheet_(ss,SHEETS.LOG,LOG_HEADERS);
  if (settings.getLastRow() === 1) settings.getRange(2,1,getSeedSettings_().length,SETTING_HEADERS.length).setValues(getSeedSettings_());
  setupSeparateSettingsSheets_(ss);
  const folders = ensureFolders_(); clearSystemCache();
  const result = {success:true, spreadsheetId:ss.getId(), folders:folders, message:'Sistem berjaya disediakan.'}; Logger.log(JSON.stringify(result)); return result;
}

/**
 * Menyediakan helaian tetapan berasingan supaya pentadbir boleh menyunting
 * senarai tanpa perlu memahami struktur TETAPAN. TETAPAN dikekalkan untuk
 * keserasian projek lama dan sebagai sumber fallback.
 */
function setupSeparateSettingsSheets_(ss) {
  const currentYear = Number(Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy'));
  const dropdowns = [
    [SHEETS.UNITS, ['Pentadbiran','Kurikulum','Hal Ehwal Murid','Kokurikulum','Prasekolah','Pusat Sumber Sekolah','Bimbingan dan Kaunseling']],
    [SHEETS.LEVELS, ['Sekolah','Zon','Daerah','Negeri','Kebangsaan','Antarabangsa']],
    [SHEETS.ORGANISERS, ['Sekolah','Panitia','Unit','Persatuan','Kelab','Agensi Luar','Lain-lain']],
    [SHEETS.TEACHERS, ['Guru Besar','Penolong Kanan Pentadbiran','Penolong Kanan HEM','Penolong Kanan Kokurikulum']],
    [SHEETS.YEARS, [currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(String)]
  ];
  dropdowns.forEach(function(entry) {
    const sheet = ensureSheet_(ss, entry[0], SIMPLE_LIST_HEADERS);
    if (sheet.getLastRow() === 1) {
      sheet.getRange(2, 1, entry[1].length, 2).setValues(entry[1].map(function(value) { return [value, 'AKTIF']; }));
    }
  });
  const aiSheet = ensureSheet_(ss, SHEETS.AI_DATABASE, AI_DATABASE_HEADERS);
  if (aiSheet.getLastRow() === 1) {
    const templates = getSeedSettings_().filter(function(row) { return row[0] === 'TEMPLATE UNIT'; });
    aiSheet.getRange(2, 1, templates.length, AI_DATABASE_HEADERS.length).setValues(templates.map(function(row) {
      return [row[2], row[3], 'Sekolah', row[4], row[5], row[6], row[7], 'AKTIF'];
    }));
  }
}
function getSeedSettings_() {
  const units=['Pentadbiran','Kurikulum','Hal Ehwal Murid','Kokurikulum','Prasekolah','Pusat Sumber Sekolah','Bimbingan dan Kaunseling']; const rows=[];
  units.forEach((u,i)=>{ rows.push(['UNIT','U'+(i+1),u,'','','','','','AKTIF']); rows.push(['TEMPLATE UNIT','T'+(i+1),u,u,'Meningkatkan pengetahuan dan kemahiran peserta.','Menggalakkan penglibatan aktif warga sekolah.','Program memberi impak positif dan mencapai matlamat yang ditetapkan.','Memantapkan perancangan, hebahan dan susulan program akan datang.','AKTIF']); });
  ['Sekolah','Zon','Daerah','Negeri','Kebangsaan','Antarabangsa'].forEach((v,i)=>rows.push(['PERINGKAT','P'+i,v,'','','','','','AKTIF']));
  ['Sekolah','Panitia','Unit','Persatuan','Kelab','Agensi Luar','Lain-lain'].forEach((v,i)=>rows.push(['ANJURAN','A'+i,v,'','','','','','AKTIF']));
  ['Guru Besar','Penolong Kanan Pentadbiran','Penolong Kanan HEM','Penolong Kanan Kokurikulum'].forEach((v,i)=>rows.push(['GURU','G'+i,v,'','','','','','AKTIF'])); return rows;
}
function getDropdownData() {
  const cache=CacheService.getScriptCache(), hit=cache.get(CONFIG.DROPDOWN_CACHE_KEY);
  if(hit) {
    const cached = parseJson_(hit, null);
    // Jangan gunakan cache lama/kosong kerana ia menyebabkan dropdown hanya
    // memaparkan placeholder walaupun helaian sudah mempunyai data.
    if (cached && ['units','levels','organisers','teachers','years'].some(function(key) {
      return Array.isArray(cached[key]) && cached[key].length;
    })) return cached;
  }
  const sh=getSpreadsheet_().getSheetByName(SHEETS.SETTINGS); if(!sh) throw new Error('Jalankan setupSystem() terlebih dahulu.');
  const rows=sh.getDataRange().getDisplayValues().slice(1).filter(r=>r[8].toUpperCase()==='AKTIF'); const out={units:[],levels:[],organisers:[],teachers:[],years:[]};
  rows.forEach(r=>{ const map={UNIT:'units',PERINGKAT:'levels',ANJURAN:'organisers',GURU:'teachers'}; if(map[r[0].toUpperCase()]&&r[2]) out[map[r[0].toUpperCase()]].push(r[2]); });
  const ss = getSpreadsheet_();
  const separate = {
    units: readSimpleList_(ss.getSheetByName(SHEETS.UNITS)),
    levels: readSimpleList_(ss.getSheetByName(SHEETS.LEVELS)),
    organisers: readSimpleList_(ss.getSheetByName(SHEETS.ORGANISERS)),
    teachers: readSimpleList_(ss.getSheetByName(SHEETS.TEACHERS)),
    years: readSimpleList_(ss.getSheetByName(SHEETS.YEARS))
  };
  Object.keys(separate).forEach(function(key) {
    if (separate[key].length) out[key] = separate[key];
    out[key] = Array.from(new Set(out[key]));
  });
  if (['units','levels','organisers','teachers','years'].some(function(key) { return out[key].length; })) {
    cache.put(CONFIG.DROPDOWN_CACHE_KEY,JSON.stringify(out),CONFIG.CACHE_SECONDS);
  }
  return out;
}

/** Membaca helaian senarai satu kolum; STATUS adalah pilihan tetapi disyorkan. */
function readSimpleList_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0].map(function(value) { return cleanText_(value, 100).toUpperCase(); });
  const valueIndex = Math.max(0, headers.indexOf('NILAI'));
  const statusIndex = headers.indexOf('STATUS');
  return values.slice(1).filter(function(row) {
    return row[valueIndex] && (statusIndex < 0 || !row[statusIndex] || row[statusIndex].toUpperCase() === 'AKTIF');
  }).map(function(row) { return cleanText_(row[valueIndex], 200); });
}
/** Data kritikal halaman; lencana dimuatkan berasingan agar payload imej tidak menyekat dropdown. */
function getInitialData() { return {dropdowns:getDropdownData(), school:{name:CONFIG.SCHOOL_NAME,slogan:CONFIG.SCHOOL_SLOGAN}, pageSize:CONFIG.HISTORY_PAGE_SIZE}; }
function getUnitTemplate(unit, reportName) {
  const ai = getSpreadsheet_().getSheetByName(SHEETS.AI_DATABASE);
  if (ai && ai.getLastRow() > 1) {
    const values = ai.getDataRange().getDisplayValues();
    const headers = values[0].map(function(value) { return cleanText_(value, 100).toUpperCase(); });
    const column = function(name) { return headers.indexOf(name); };
    const keywordIndex = column('KATA KUNCI');
    const statusIndex = column('STATUS');
    const nameKey = cleanText_(reportName, 300).toLowerCase();
    const activeRows = values.slice(1).filter(function(row) {
      return statusIndex < 0 || !row[statusIndex] || row[statusIndex].toUpperCase() === 'AKTIF';
    });
    // Hanya Nama Laporan dan KATA KUNCI digunakan untuk pemadanan. Unit dan
    // Peringkat kekal sebagai maklumat laporan dan tidak mempengaruhi templat.
    const match = nameKey && keywordIndex >= 0 ? activeRows.find(function(row) {
      const keyword = cleanText_(row[keywordIndex], 300).toLowerCase();
      return keyword && (nameKey.indexOf(keyword) >= 0 || keyword.indexOf(nameKey) >= 0);
    }) : null;
    if (match) return {
      objective1: match[column('OBJEKTIF 1')] || '',
      objective2: match[column('OBJEKTIF 2')] || '',
      impact: match[column('IMPAK')] || '',
      improvement: match[column('PENAMBAHBAIKAN')] || ''
    };
  }
  return {objective1:'',objective2:'',impact:'',improvement:''};
}
function generateReportId() {
  const lock=LockService.getScriptLock(); lock.waitLock(30000); try { const year=Utilities.formatDate(new Date(),CONFIG.TIMEZONE,'yyyy'), key='REPORT_SEQ_'+year, props=PropertiesService.getScriptProperties(); let seq=Number(props.getProperty(key)||0); if(!seq){ const values=getSpreadsheet_().getSheetByName(SHEETS.REPORTS).getRange(2,1,Math.max(1,getSpreadsheet_().getSheetByName(SHEETS.REPORTS).getLastRow()-1),1).getDisplayValues().flat(); seq=values.reduce((m,id)=>{const x=String(id).match(new RegExp('^OPR-SKL-'+year+'-(\\d+)$')); return x?Math.max(m,Number(x[1])):m;},0); } seq++; props.setProperty(key,String(seq)); return 'OPR-SKL-'+year+'-'+String(seq).padStart(4,'0'); } finally { lock.releaseLock(); }
}
function saveReport(formData) { const d=normaliseForm_(formData); validateForm_(d); const id=generateReportId(), images=uploadImages(d.images,id).images.concat(d.existingImages||[]), now=new Date(); const row=reportToRow_(id,d,images,'AKTIF',now,now); getSpreadsheet_().getSheetByName(SHEETS.REPORTS).appendRow(row); logActivity(id,'Cipta laporan',d.name); return {success:true,id:id,report:getReportById(id)}; }
function updateReport(reportId,formData) { validateReportId_(reportId); const lock=LockService.getScriptLock(); lock.waitLock(30000); try { const found=findReportRow_(reportId), old=reportFromRow_(found.values), d=normaliseForm_(formData); validateForm_(d); const keepIds=new Set((d.existingImages||[]).map(x=>x.fileId)); (old.images||[]).filter(x=>x.fileId&&!keepIds.has(x.fileId)).forEach(x=>trashFile_(x.fileId)); const images=(d.existingImages||[]).concat(uploadImages(d.images,reportId).images); const row=reportToRow_(reportId,d,images,'AKTIF',old.savedAt||new Date(),new Date(),old.pdfUrl,old.pdfFileId); found.sheet.getRange(found.row,1,1,row.length).setValues([row]); logActivity(reportId,'Edit laporan',d.name); return {success:true,id:reportId,report:getReportById(reportId)}; } finally {lock.releaseLock();} }
function reportToRow_(id,d,images,status,created,updated,pdfUrl,pdfId){return [id,d.unit,d.name,new Date(d.date+'T00:00:00+08:00'),d.day,d.place,d.level,d.organiser,d.otherOrganiser,d.target,d.objective1,d.objective2,d.impact,d.hasAchievement?'YA':'TIDAK',d.achievement,d.hasGuests?'YA':'TIDAK',JSON.stringify(d.guests),d.improvement,JSON.stringify(d.teachers),d.preparedBy,JSON.stringify(images),pdfUrl||'',pdfId||'',status,getUser_(),created,updated,d.year];}
function findReportRow_(id){validateReportId_(id); const sh=getSpreadsheet_().getSheetByName(SHEETS.REPORTS), values=sh.getDataRange().getValues(); for(let i=1;i<values.length;i++) if(values[i][0]===id) return {sheet:sh,row:i+1,values:values[i]}; throw new Error('Laporan tidak ditemui.');}
function reportFromRow_(r){const dateValue=r[3] instanceof Date?Utilities.formatDate(r[3],CONFIG.TIMEZONE,'yyyy-MM-dd'):String(r[3]);return {id:r[0],unit:r[1],name:r[2],date:dateValue,formattedDate:formatMalayDate(r[3]),day:r[4],place:r[5],level:r[6],organiser:r[7],otherOrganiser:r[8],target:r[9],objective1:r[10],objective2:r[11],impact:r[12],hasAchievement:r[13]==='YA',achievement:r[14],hasGuests:r[15]==='YA',guests:parseJson_(r[16],[]),improvement:r[17],teachers:parseJson_(r[18],[]),preparedBy:r[19],images:parseJson_(r[20],[]),pdfUrl:r[21],pdfFileId:r[22],status:r[23],createdBy:r[24],savedAt:r[25],updatedAt:r[26],year:String(r[27]||dateValue.slice(0,4))};}
function getReportById(id){const report=reportFromRow_(findReportRow_(id).values); if(report.status==='DIPADAM') throw new Error('Laporan telah dipadam.'); logActivity(id,'Lihat laporan','Paparan laporan'); return report;}
function getReportHistory(filters){filters=filters||{}; const sh=getSpreadsheet_().getSheetByName(SHEETS.REPORTS), last=sh.getLastRow(); let all=last<2?[]:sh.getRange(2,1,last-1,REPORT_HEADERS.length).getValues().map(reportFromRow_).filter(r=>r.status!=='DIPADAM'); const q=cleanText_(filters.query,200).toLowerCase(),unit=cleanText_(filters.unit,100),date=cleanText_(filters.date,10); all=all.filter(r=>(!q||(r.id+' '+r.name+' '+r.preparedBy).toLowerCase().includes(q))&&(!unit||r.unit===unit)&&(!date||r.date===date)).sort((a,b)=>new Date(b.savedAt)-new Date(a.savedAt)); const page=Math.max(1,Number(filters.page)||1), size=Math.min(50,Math.max(1,Number(filters.pageSize)||CONFIG.HISTORY_PAGE_SIZE)); return {items:all.slice((page-1)*size,page*size).map(r=>({...r,savedAt:r.savedAt?Utilities.formatDate(new Date(r.savedAt),CONFIG.TIMEZONE,'dd/MM/yyyy HH:mm'):''})),page:page,total:all.length,totalPages:Math.max(1,Math.ceil(all.length/size))};}
function deleteReport(id){const found=findReportRow_(id),r=reportFromRow_(found.values); found.sheet.getRange(found.row,REPORT_HEADERS.indexOf('STATUS')+1).setValue('DIPADAM'); [r.pdfFileId].concat((r.images||[]).map(x=>x.fileId)).filter(Boolean).forEach(trashFile_); logActivity(id,'Padam laporan',r.name); return {success:true};}
function permanentDeleteReport(id){const found=findReportRow_(id),r=reportFromRow_(found.values); if(r.status!=='DIPADAM')throw new Error('Soft delete mesti dilakukan dahulu.'); found.sheet.deleteRow(found.row); return {success:true};}
function logActivity(reportId,action,details){try{getSpreadsheet_().getSheetByName(SHEETS.LOG).appendRow([Utilities.getUuid(),reportId,action,getUser_(),new Date(),cleanText_(details,2000)]);}catch(e){console.error(e);}}
