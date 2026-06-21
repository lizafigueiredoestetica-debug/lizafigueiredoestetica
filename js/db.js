/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — db.js
   Objeto db, loadData, saveData, export/import backup,
   filtros de período, renderAll, badges
   ===================================================== */

let db = {
  servicos: [],
  materiais: [],
  atendimentos: [],
  despAdm: [],
  despExtra: [],
  categorias: [],
  agenda: [],
  anamneses: [],
  acomp: [],
  protocolos: []
};

let currentPeriod = 'hoje';
let _periodoDe = '';
let _periodoAte = '';
let selectedServicos = [];
let selectedMateriais = {};

// ── Carregar dados (cache local + Supabase) ──
async function loadData() {
  const raw = localStorage.getItem('lizafig_db');
  if(raw) {
    try { db = JSON.parse(raw); } catch(e) {}
  }
  if(!db.categorias) db.categorias = [];
  if(!db.agenda) db.agenda = [];
  if(!db.anamneses) db.anamneses = [];
  if(!db.acomp) db.acomp = [];
  if(!db.protocolos) db.protocolos = [];
  if(!db.entradaEstoque) db.entradaEstoque = [];

  var carregouNuvem = await _carregarDaNuvem();
  if (!carregouNuvem) {
    const ls = localStorage.getItem('lizafig_lastsync') || localStorage.getItem('lizafig_lastsave');
    var el = document.getElementById('lastSave');
    if(ls && el) el.textContent = '📴 Offline — cache de ' + ls;
  } else {
    _ultimoSync = new Date().toISOString();
  }
}

// ── Salvar localmente ──
function saveData() {
  localStorage.setItem('lizafig_db', JSON.stringify(db));
  const now = new Date().toLocaleString('pt-BR');
  localStorage.setItem('lizafig_lastsave', now);
  _atualizarStatusSync('ok', now);
  addLog('INFO', '💾 Dados salvos — ' + now);
}

// ── Export JSON backup ──
function exportData() {
  const blob = new Blob([JSON.stringify(db, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'liza-figueiredo-backup-' + _hoje() + '.json';
  a.click();
  showToast('Backup exportado com sucesso!');
}

// ── Import JSON backup ──
function importData(e) {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      db = JSON.parse(ev.target.result);
      saveData();
      renderAll();
      showToast('Backup restaurado! Migrando para nuvem...');
      setTimeout(function(){ _migrarParaNovaArquitetura(); }, 1000);
    } catch(err) { showToast('Erro ao importar arquivo.'); }
  };
  reader.readAsText(file);
}

// ── Limpar todos os dados ──
function limparTodosDados() {
  if(!confirm('⚠️ Isso vai APAGAR todos os dados cadastrados.\n\nAs categorias serão mantidas.\n\nTem certeza?')) return;
  db.servicos = [];
  db.materiais = [];
  db.atendimentos = [];
  db.despAdm = [];
  db.despExtra = [];
  saveData();
  renderAll();
  showToast('Todos os dados foram apagados.');
}

// ── Filtro por período ──
function setPeriod(p, btn) {
  currentPeriod = p;
  document.querySelectorAll('.period-btn').forEach(function(b){ b.classList.remove('active'); });
  if(btn) btn.classList.add('active');
  renderDashboard();
}

// ── Filtro por período customizado (De/Até) ──
function setPeriodoCustom() {
  var de = document.getElementById('dashPeriodoDe').value;
  var ate = document.getElementById('dashPeriodoAte').value;
  if (!de && !ate) { showToast('Preencha pelo menos uma data!'); return; }
  _periodoDe = de;
  _periodoAte = ate;
  currentPeriod = 'custom';
  document.querySelectorAll('.period-btn').forEach(function(b){ b.classList.remove('active'); });
  renderDashboard();
}

function limparPeriodoCustom() {
  document.getElementById('dashPeriodoDe').value = '';
  document.getElementById('dashPeriodoAte').value = '';
  _periodoDe = '';
  _periodoAte = '';
  setPeriod('hoje', document.querySelector('.period-btn'));
}

function filterByPeriod(items, dateField) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  return items.filter(function(item) {
    const d = item[dateField];
    if(!d) return true;
    if(currentPeriod === 'hoje') return d === today;
    if(currentPeriod === 'semana') {
      const w = new Date(now); w.setDate(w.getDate()-7);
      return d >= w.toISOString().split('T')[0];
    }
    if(currentPeriod === 'mes') return d.startsWith(now.getFullYear()+'-'+(String(now.getMonth()+1).padStart(2,'0')));
    if(currentPeriod === 'custom') {
      if (_periodoDe && d < _periodoDe) return false;
      if (_periodoAte && d > _periodoAte) return false;
      return true;
    }
    return true;
  });
}

// renderAll e updateBadges definidos em utils.js
