/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — utils.js
   Funções utilitárias: uid, formatação, toast, log,
   mascaras, helpers gerais
   ===================================================== */

function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

function _hoje() {
  var d = new Date();
  var utc = d.getTime() + d.getTimezoneOffset() * 60000;
  var br = new Date(utc - 3 * 3600000);
  return br.getFullYear() + '-' + String(br.getMonth()+1).padStart(2,'0') + '-' + String(br.getDate()).padStart(2,'0');
}

function fmtDate(s) {
  if (!s) return '—';
  var p = s.split('-');
  if (p.length === 3) return p[2] + '/' + p[1] + '/' + p[0];
  return s;
}

function fmtMoney(v) {
  return 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); }, 3500);
}

function addLog(level, msg) {
  var el = document.getElementById('log-entries');
  if (!el) return;
  var ts = new Date().toLocaleTimeString('pt-BR');
  var color = level === 'WARN' ? '#f0a878' : '#a8d8f0';
  el.innerHTML += '<div style="color:' + color + ';margin-bottom:2px"><span style="opacity:0.5">[' + ts + '] </span>' + msg + '</div>';
  el.scrollTop = el.scrollHeight;
}

function toggleLog() {
  var p = document.getElementById('log-panel');
  if (p) p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

function mascaraCpf(el) {
  var v = el.value.replace(/\D/g,'').slice(0,11);
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,'$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/,'$1.$2.$3');
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/,'$1.$2');
  el.value = v;
}

function pagtoBadge(p) {
  var m = { pix:'badge-pix', dinheiro:'badge-dinheiro', cartao_debito:'badge-cartao', cartao_credito:'badge-cartao' };
  return m[p] || '';
}

function pagtoLabel(p) {
  var m = { pix:'PIX', dinheiro:'Dinheiro', cartao_debito:'Cartão Débito', cartao_credito:'Cartão Crédito' };
  return m[p] || p || '—';
}

function toggleDetail(id, row) {
  var detail = document.getElementById(id);
  var icon = document.getElementById('icon-' + id);
  if (!detail) return;
  var isOpen = detail.classList.contains('open');
  document.querySelectorAll('.detail-row.open').forEach(function(r){ r.classList.remove('open'); });
  document.querySelectorAll('.expand-icon.open').forEach(function(i){ i.classList.remove('open'); });
  if (!isOpen) {
    detail.classList.add('open');
    if (icon) icon.classList.add('open');
  }
}

function _buildPagHtml(pag, total, totalItens, porPag, varName, renderFn) {
  if (total <= 1) return '';
  var inicio = (pag - 1) * porPag + 1;
  var fim = Math.min(pag * porPag, totalItens);
  var html = '<div style="display:flex;align-items:center;gap:0.5rem;padding:1rem;flex-wrap:wrap">';
  html += '<button onclick="' + varName + '=' + Math.max(1,pag-1) + ';' + renderFn + '" ' + (pag===1?'disabled':'') + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">‹</button>';
  for (var i = 1; i <= total; i++) {
    html += '<button onclick="' + varName + '=' + i + ';' + renderFn + '" style="padding:4px 10px;border:1px solid '+(i===pag?'#D4A0A8':'var(--border)')+';border-radius:6px;background:'+(i===pag?'#D4A0A8':'white')+';color:'+(i===pag?'white':'inherit')+';cursor:pointer;font-size:12px">' + i + '</button>';
  }
  html += '<button onclick="' + varName + '=' + Math.min(total,pag+1) + ';' + renderFn + '" ' + (pag===total?'disabled':'') + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">›</button>';
  html += '<span style="font-size:11px;color:var(--text-light);margin-left:4px">' + inicio + '-' + fim + ' de ' + totalItens + '</span>';
  html += '</div>';
  return html;
}

function _renderPagAtend(pag, total, totalItens) {
  var el = document.getElementById('pagAtend');
  if (!el) return;
  el.innerHTML = _buildPagHtml(pag, total, totalItens, 10, 'window._pagAtend', 'renderAtendimentos()');
}

function _agServicos(ag) {
  if (!ag || !ag.sessoes || !ag.sessoes.length) return '—';
  var ids = [];
  ag.sessoes.forEach(function(s){ (s.servicoIds||[]).forEach(function(id){ if(ids.indexOf(id)<0) ids.push(id); }); });
  if (ids.length) {
    var nomes = ids.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:null; }).filter(Boolean);
    if (nomes.length) return nomes.join(' + ');
  }
  var srv = ag.sessoes.find(function(s){ return s.servico; });
  return srv ? srv.servico : '—';
}

function setToday() {
  var today = _hoje();
  ['atend-data','dadm-data','dext-data'].forEach(function(id) {
    var el = document.getElementById(id);
    if(el) el.value = today;
  });
}

function updateHeaderDate() {
  var el = document.getElementById('headerDate');
  if (!el) return;
  var now = new Date();
  el.textContent = now.toLocaleDateString('pt-BR', {weekday:'short', day:'2-digit', month:'short', year:'numeric'});
}

function abrirLightbox(url) {
  var lb = document.createElement('div');
  lb.className = 'foto-lightbox';
  lb.innerHTML = '<button class="foto-lightbox-close" onclick="this.parentElement.remove()">✕</button><img src="' + url + '" alt="Foto">';
  lb.addEventListener('click', function(e){ if(e.target===lb) lb.remove(); });
  document.body.appendChild(lb);
}

function _atualizarStatusSync(estado, texto) {
  var el = document.getElementById('lastSave');
  if (!el) return;
  if (estado === 'ok') el.textContent = 'Sincronizado: ' + (texto||'');
  else if (estado === 'carregando') el.textContent = '⏳ Carregando...';
  else if (estado === 'offline') el.textContent = '⚠️ Offline';
}

function mudaPagSessao(agKey, pag) {
  if (!window._acompSessaoPag) window._acompSessaoPag = {};
  window._acompSessaoPag[agKey] = pag;
  renderAcomp();
}

// toggleSidebar definido em auth.js

function toggleDrawer() {
  var sb = document.getElementById('appSidebar');
  var ov = document.getElementById('sidebarOverlay');
  var btn = document.getElementById('btnHamburger');
  if (!sb) return;
  sb.classList.toggle('drawer-aberto');
  if (ov) ov.classList.toggle('ativo');
  if (btn) btn.classList.toggle('aberto');
}

function fecharDrawer() {
  var sb = document.getElementById('appSidebar');
  var ov = document.getElementById('sidebarOverlay');
  var btn = document.getElementById('btnHamburger');
  if (sb) sb.classList.remove('drawer-aberto');
  if (ov) ov.classList.remove('ativo');
  if (btn) btn.classList.remove('aberto');
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(function(s){ s.classList.remove('active'); });
  document.querySelectorAll('.nav-tab').forEach(function(t){ t.classList.remove('active'); });
  var sec = document.getElementById('sec-' + id);
  if (sec) sec.classList.add('active');
  var tab = document.querySelector('.nav-tab[onclick*="showSection(\'' + id + '\')"]');
  if (tab) tab.classList.add('active');
  try { localStorage.setItem('lizafig_secao', id); } catch(e) {}
  // Render específico por seção
  if (id === 'agenda') renderAgenda();
  if (id === 'dashboard') renderDashboard();
  if (id === 'atendimentos') { renderAtendimentos(); renderServiceChips(); }
  if (id === 'servicos') renderServicos();
  if (id === 'materiais') renderMateriais();
  if (id === 'despAdm') renderDespAdm();
  if (id === 'despExtra') renderDespExtra();
  if (id === 'categorias') renderCategorias();
  if (id === 'anamnese') renderAnamnese();
  if (id === 'acomp') renderAcomp();
  if (id === 'financeiro') renderFinanceiro && renderFinanceiro();
}

function renderAll() {
  renderDashboard();
  renderServicos();
  renderMateriais();
  renderAtendimentos();
  if (typeof renderServiceChips === 'function') renderServiceChips();
  renderAgenda();
  renderCategorias();
  renderAnamnese();
  renderAcomp();
  if (typeof renderDespAdm === 'function') renderDespAdm();
  if (typeof renderDespExtra === 'function') renderDespExtra();
  if (typeof renderFinanceiro === 'function') renderFinanceiro();
  _atualizarBadges();
}

function _atualizarBadges() {
  var hoje = _hoje();
  // Badge agenda — sessões pendentes a partir de hoje
  var ag = 0;
  db.agenda.forEach(function(a){ a.sessoes.forEach(function(s){ if(s.status==='pendente'&&s.data>=hoje) ag++; }); });
  var bAg = document.getElementById('badgeAgenda'); if(bAg) bAg.textContent = ag;
  // Badge atendimentos
  var bAt = document.getElementById('badgeAtend'); if(bAt) bAt.textContent = db.atendimentos.length;
  // Badge serviços ativos
  var bSv = document.getElementById('badgeServ'); if(bSv) bSv.textContent = db.servicos.filter(function(s){return s.status==='ativo';}).length;
  // Badge materiais
  var bMt = document.getElementById('badgeMat'); if(bMt) bMt.textContent = db.materiais.length;
  // Badge despAdm
  var bDa = document.getElementById('badgeDespAdm'); if(bDa) bDa.textContent = db.despAdm.length;
  // Badge despExtra
  var bDe = document.getElementById('badgeDespExtra'); if(bDe) bDe.textContent = db.despExtra.length;
  // Badge categorias
  var bCt = document.getElementById('badgeCat'); if(bCt) bCt.textContent = db.categorias.length;
  // Badge anamnese
  var bAn = document.getElementById('badgeAnamnese'); if(bAn) bAn.textContent = db.anamneses.length;
  // Badge acomp
  var bAc = document.getElementById('badgeAcomp'); if(bAc) bAc.textContent = db.agenda.length;
}
