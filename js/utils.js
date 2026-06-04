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
  if (id === 'mensagens') renderMensagens();
  if (id === 'modelos') renderModelosAnamnese();
  if (id === 'fichas-custom') renderFichasCustom();
  if (id === 'aniversariantes') renderAniversariantesAba();
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
  var bMod = document.getElementById('badgeModelos'); if(bMod) bMod.textContent = (_modelosAnamnese||[]).filter(function(m){return m.ativo;}).length;
  var bFC = document.getElementById('badgeFichasCustom'); if(bFC) bFC.textContent = db.anamneses.filter(function(a){ return a.modelo_respostas && Object.keys(a.modelo_respostas).length > 0; }).length;
  // Badge aniversariantes do mês atual
  var _mesAtual = new Date().getMonth() + 1;
  var _bAniv = document.getElementById('badgeAniv');
  if (_bAniv) _bAniv.textContent = db.anamneses.filter(function(a){
    if (!a.pessoais || !a.pessoais.dataNasc) return false;
    var p = a.pessoais.dataNasc.split('-'); return p.length >= 2 && parseInt(p[1]) === _mesAtual;
  }).length;
}

// =====================================================================
// ABA ANIVERSARIANTES
// =====================================================================

var _anivMesAtual = new Date().getMonth() + 1;
var _anivAnoAtual = new Date().getFullYear();

var _MESES_ANIV = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function anivMesAnterior() {
  _anivMesAtual--;
  if (_anivMesAtual < 1) { _anivMesAtual = 12; _anivAnoAtual--; }
  renderAniversariantesAba();
}
function anivMesProximo() {
  _anivMesAtual++;
  if (_anivMesAtual > 12) { _anivMesAtual = 1; _anivAnoAtual++; }
  renderAniversariantesAba();
}
function anivMesAtual() {
  var agora = new Date();
  _anivMesAtual = agora.getMonth() + 1;
  _anivAnoAtual = agora.getFullYear();
  renderAniversariantesAba();
}

function renderAniversariantesAba() {
  var el = document.getElementById('anivListaCompleta');
  var titulo = document.getElementById('anivMesTitulo');
  var contador = document.getElementById('anivContador');
  if (!el) return;

  if (titulo) titulo.textContent = _MESES_ANIV[_anivMesAtual - 1] + ' ' + _anivAnoAtual;

  var hoje = new Date();
  var mesHoje = hoje.getMonth() + 1;
  var diaHoje = hoje.getDate();
  var anoHoje = hoje.getFullYear();

  // Coletar todos do mês selecionado
  var lista = [];
  db.anamneses.forEach(function(a) {
    if (!a.pessoais || !a.pessoais.dataNasc) return;
    var partes = a.pessoais.dataNasc.split('-');
    if (partes.length < 3) return;
    var anoNasc = parseInt(partes[0]);
    var mes = parseInt(partes[1]);
    var dia = parseInt(partes[2]);
    if (mes !== _anivMesAtual) return;

    var idade = _anivAnoAtual - anoNasc;
    var isHoje = (mes === mesHoje && dia === diaHoje && _anivAnoAtual === anoHoje);
    var jaPAssou = (_anivAnoAtual === anoHoje && mes === mesHoje && dia < diaHoje);
    var tel = a.pessoais.telefone ? a.pessoais.telefone.replace(/\D/g,'') : '';

    lista.push({ nome: a.pessoais.nome || '—', dia: dia, mes: mes, idade: idade,
                 tel: tel, isHoje: isHoje, jaPAssou: jaPAssou });
  });

  lista.sort(function(a, b) { return a.dia - b.dia; });

  if (contador) contador.textContent = lista.length + (lista.length === 1 ? ' aniversariante' : ' aniversariantes');

  if (!lista.length) {
    el.innerHTML = '<div class="empty-state" style="padding:3rem"><div class="empty-icon">🎂</div><p>Nenhum aniversariante em ' + _MESES_ANIV[_anivMesAtual-1] + '</p></div>';
    return;
  }

  var html = '<div style="display:flex;flex-direction:column;gap:0.5rem">';

  lista.forEach(function(a) {
    var msg = _getMensagem('aniversario').replace(/{nome}/g, a.nome.split(' ')[0]);
    var waUrl = 'https://wa.me/' + (a.tel ? '55' + a.tel : '') + '?text=' + encodeURIComponent(msg);

    var bgCard = 'background:white;border:1px solid var(--border)';
    var labelStatus = '';

    if (a.isHoje) {
      bgCard = 'background:linear-gradient(135deg,#FFF8F9,#FFF0F5);border:1px solid #D4A0A8';
      labelStatus = '<span style="background:#D4A0A8;color:white;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600">🎂 Hoje!</span>';
    } else if (a.jaPAssou) {
      bgCard = 'background:#FAFAFA;border:1px solid var(--border)';
      labelStatus = '<span style="background:#F5F5F5;color:var(--text-light);padding:3px 10px;border-radius:20px;font-size:11px">✓ Passou</span>';
    } else {
      labelStatus = '<span style="background:#EDF4FF;color:#1565C0;padding:3px 10px;border-radius:20px;font-size:11px">Dia ' + String(a.dia).padStart(2,'0') + '</span>';
    }

    html += '<div style="' + bgCard + ';border-radius:12px;padding:0.9rem 1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem">'
      + '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">'
      + '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#D4A0A8,#B07880);display:flex;align-items:center;justify-content:center;color:white;font-family:Cormorant Garamond,serif;font-size:18px;flex-shrink:0">'
      + a.nome.charAt(0).toUpperCase()
      + '</div>'
      + '<div>'
      + '<div style="font-weight:600;font-size:14px;color:var(--text-dark)">' + a.nome + '</div>'
      + '<div style="font-size:12px;color:var(--text-light);margin-top:2px">'
      + String(a.dia).padStart(2,'0') + '/' + String(a.mes).padStart(2,'0')
      + (a.idade > 0 ? ' &nbsp;·&nbsp; ' + a.idade + ' anos' : '')
      + (a.tel ? ' &nbsp;·&nbsp; ' + a.tel : '')
      + '</div>'
      + '</div>'
      + labelStatus
      + '</div>'
      + '<div style="display:flex;gap:0.5rem;align-items:center">'
      + (a.tel
        ? '<button onclick="window.open(\'' + waUrl.replace(/'/g,"\\'") + '\',\'_blank\')" style="background:#E7F7EE;border:1px solid #7DB87D;color:#276749;border-radius:8px;padding:6px 14px;font-size:12px;cursor:pointer;white-space:nowrap">💬 Parabenizar</button>'
        : '<span style="font-size:11px;color:var(--text-light)">Sem telefone</span>')
      + '</div>'
      + '</div>';
  });

  html += '</div>';
  el.innerHTML = html;
}
