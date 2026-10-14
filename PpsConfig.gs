/** Official PPS assignment structure supplied by the school. Evidence data remains separate. */
const PPS_MODULE_CONFIG = Object.freeze({
  standards: [
    { id: 'STD1', code: '1', title: 'STANDARD 1 — KEPEMIMPINAN', groups: [
      { code: '1.1', name: 'PGB SEBAGAI PENERAJU', items: [
        ['1.1.1','PGB menetapkan hala tuju sekolah secara terancang.'],['1.1.2','PGB mengetuai penyediaan Rancangan Pemajuan Sekolah secara terancang dan sistematik.'],['1.1.3','PGB mengetuai pemantauan pengoperasian sekolah secara terancang dan sistematik.'],['1.1.4','PGB menerajui aktiviti instruksional dalam pelaksanaan PdP secara profesional dan terancang.'],['1.1.5','PGB menerajui aktiviti instruksional dalam pelaksanaan pencerapan PdP secara profesional dan terancang.'],['1.1.6','PGB menerajui aktiviti instruksional dalam pelaksanaan pemantauan kemajuan dan pencapaian murid secara sistematik dan terancang.'],['1.1.7','PGB menangani masalah pengoperasian sekolah secara profesional dan terancang.']]},
      { code: '1.2', name: 'PGB SEBAGAI PEMBIMBING', items: [['1.2.1','PGB memberi bimbingan kepada guru dan AKP secara profesional dan terancang.'],['1.2.2','PGB memberi bimbingan kepada barisan pemimpin yang diturunkan kuasa secara profesional dan terancang.']]},
      { code: '1.3', name: 'PGB SEBAGAI PENDORONG', items: [['1.3.1','PGB mendorong warga sekolah dengan menjadi suri teladan secara profesional dan terancang.'],['1.3.2','PGB menggalakkan warga sekolah memberi input berkaitan pemajuan sekolah secara profesional dan terancang.'],['1.3.3','PGB menggerakkan warga sekolah dalam melaksanakan tanggungjawab secara terancang.']]}
    ]},
    { id: 'STD2', code: '2', title: 'STANDARD 2 — PENGURUSAN ORGANISASI', groups: [
      {code:'2.1',name:'PENGURUSAN SUMBER MANUSIA',items:[['2.1.1','Sumber manusia diurus secara sistematik dan terancang.'],['2.1.2','Pembangunan sumber manusia diurus secara terancang.']]},
      {code:'2.2',name:'PENGURUSAN ASET',items:[['2.2.1','Aset alih dan aset tak alih diurus secara sistematik dan terancang.']]},{code:'2.3',name:'PENGURUSAN KEWANGAN',items:[['2.3.1','Kewangan diurus secara sistematik dan terancang.']]},{code:'2.4',name:'PENGURUSAN SUMBER PENDIDIKAN',items:[['2.4.1','Sumber pendidikan diurus secara sistematik dan terancang.']]},
      {code:'2.5',name:'IKLIM',items:[['2.5.1','Persekitaran fizikal diselenggara secara sistematik dan terancang.'],['2.5.2','Suasana yang selesa dan harmoni diwujud dan dikekalkan secara sistematik dan terancang.']]},{code:'2.6',name:'PENGURUSAN PERPADUAN',items:[['2.6.1','Pemahaman dan penerimaan terhadap kepelbagaian masyarakat Malaysia diurus secara terancang.']]},{code:'2.7',name:'PERMUAFAKATAN STRATEGIK',items:[['2.7.1','Permuafakatan strategik diusahakan secara profesional dan terancang.']]}
    ]},
    { id: 'STD31', code: '3.1', title: 'STANDARD 3.1 — PENGURUSAN KURIKULUM', groups: [
      {code:'3.1.1',name:'KETETAPAN PELAKSANAAN KURIKULUM',items:[['3.1.1.1','Pelaksanaan kurikulum diurus secara sistematik dan terancang.']]},
      {code:'3.1.2',name:'PENGURUSAN MATA PELAJARAN',subCategory:'PANITIA',items:[['3.1.2.1','Pelaksanaan mata pelajaran diurus secara profesional dan terancang.'],['3.1.2.2','Program peningkatan kualiti pengajaran guru diurus secara terancang.'],['3.1.2.3','Program peningkatan pencapaian murid diurus secara profesional dan terancang.'],['3.1.2.4','Bantuan geran per kapita mata pelajaran dimanfaatkan secara sistematik dan terancang.']]},
      {code:'3.1.3',name:'PENGURUSAN MASA INSTRUKSIONAL',items:[['3.1.3.1','Masa pelaksanaan PdP diurus secara sistematik dan terancang.']]},{code:'3.1.4',name:'PENGURUSAN PENILAIAN MURID',items:[['3.1.4.1','Peperiksaan dan pentaksiran diurus secara sistematik dan terancang.']]}
    ]},
    { id: 'STD32', code: '3.2', title: 'STANDARD 3.2 — PENGURUSAN KOKURIKULUM', groups: [
      {code:'3.2.1',name:'KETETAPAN PELAKSANAAN KOKURIKULUM',items:[['3.2.1.1','Pelaksanaan kokurikulum diurus secara sistematik dan terancang.']]},
      {code:'3.2.2',name:'PENGURUSAN KELAB/PERSATUAN',subCategory:'KELAB_PERSATUAN',items:[['3.2.2.1','Kelab/persatuan diurus secara sistematik dan terancang.']]},{code:'3.2.3',name:'PENGURUSAN BADAN BERUNIFORM',subCategory:'BADAN_BERUNIFORM',items:[['3.2.3.1','Badan beruniform diurus secara sistematik dan terancang.']]},{code:'3.2.4',name:'PENGURUSAN SUKAN/PERMAINAN',subCategory:'SUKAN_PERMAINAN',items:[['3.2.4.1','Sukan/permainan diurus secara sistematik dan terancang.']]},
      {code:'3.2.5',name:'PENGURUSAN PROGRAM KECEMERLANGAN KOKURIKULUM',items:[['3.2.5.1','Program kecemerlangan kokurikulum diurus secara profesional dan terancang.']]},{code:'3.2.6',name:'PENGURUSAN SUKAN UNTUK SEMUA',items:[['3.2.6.1','Aktiviti Sukan Untuk Semua diurus secara profesional dan terancang.']]},{code:'3.2.7',name:'PENGURUSAN PENTAKSIRAN KOKURIKULUM',items:[['3.2.7.1','Pentaksiran kokurikulum dilaksanakan secara sistematik dan terancang.']]}
    ]},
    { id: 'STD33', code: '3.3', title: 'STANDARD 3.3 — PENGURUSAN HAL EHWAL MURID', groups: [
      {code:'3.3.1',name:'KETETAPAN PELAKSANAAN HAL EHWAL MURID',items:[['3.3.1.1','Pelaksanaan hal ehwal murid diurus secara sistematik dan terancang.']]},{code:'3.3.2',name:'PENGURUSAN DISIPLIN MURID',items:[['3.3.2.1','Disiplin murid diurus secara profesional dan terancang.']]},{code:'3.3.3',name:'PENGURUSAN KESELAMATAN MURID',items:[['3.3.3.1','Keselamatan murid diurus secara sistematik dan terancang.']]},{code:'3.3.4',name:'PENGURUSAN KESIHATAN MURID',items:[['3.3.4.1','Program dan perkhidmatan kesihatan murid diurus secara sistematik dan terancang.']]},{code:'3.3.5',name:'PENGURUSAN BANTUAN PELAJARAN MURID',items:[['3.3.5.1','Bantuan pelajaran murid diurus secara sistematik dan terancang.']]},{code:'3.3.6',name:'PENGURUSAN PERKHIDMATAN BIMBINGAN DAN KAUNSELING',items:[['3.3.6.1','Perkhidmatan bimbingan dan kaunseling diurus secara profesional dan terancang.']]},{code:'3.3.7',name:'PENGURUSAN PENTADBIRAN PSIKOMETRIK',items:[['3.3.7.1','Pentaksiran psikometrik diurus secara sistematik dan terancang.']]}
    ]}
  ],
  committees: ['BAHASA MELAYU','BAHASA INGGERIS','MATEMATIK','SAINS','PJPK','SEJARAH','PEN AGAMA ISLAM','BAHASA ARAB','PENDIDIKAN MORAL','PENDIDIKAN SENI VISUAL','REKA BENTUK TEKNOLOGI (RBT)','PENDIDIKAN MUZIK'],
  defaultUnits: { KELAB_PERSATUAN:['BAHASA MELAYU','BAHASA INGGERIS','SAINS MATEMATIK','SENI TARI','PEN AGAMA ISLAM'], BADAN_BERUNIFORM:['PENGAKAP','BULAN SABIT MERAH MALAYSIA','TUNAS PUTERI','TKRS','PPIM'], SUKAN_PERMAINAN:['BADMINTON','OLAHRAGA','PING PONG','BOLA JARING','BOLA SEPAK'] }
});

function getPpsModuleConfig() {
  const config = JSON.parse(JSON.stringify(PPS_MODULE_CONFIG));
  config.committees = getMasterPanitia();
  return config;
}
