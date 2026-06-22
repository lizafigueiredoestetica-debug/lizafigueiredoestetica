/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — utils.js
   Funções utilitárias: uid, formatação, toast, log,
   mascaras, helpers gerais
   ===================================================== */

// Wrappers seguros para funções que podem ser chamadas antes de carregar
function renderAtendimentos() { if(typeof window._renderAtendimentos==='function') window._renderAtendimentos(); }
function salvarAtendimento() { if(typeof window._salvarAtendimento_form==='function') window._salvarAtendimento_form(); }

// Normalizar nome para comparações sem acento/maiúsculas
function _normNome(s) {
  return (s||'').toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/\s+/g,' ');
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

// ── Resolve um servicoId, aceitando tanto o ID real quanto o NOME em texto
// (lançamentos antigos salvavam o nome do serviço no lugar do ID). Faz o
// casamento por nome normalizado (sem acento, minúsculas, trim) como fallback. ──
var _mapaServicosPorNomeCache = null;
function _mapaServicosPorNome() {
  if (_mapaServicosPorNomeCache && _mapaServicosPorNomeCache._len === db.servicos.length) return _mapaServicosPorNomeCache;
  var mapa = {};
  db.servicos.forEach(function(s) { mapa[_normalizarTexto(s.nome)] = s; });
  mapa._len = db.servicos.length;
  _mapaServicosPorNomeCache = mapa;
  return mapa;
}
function _normalizarTexto(s) {
  return (s||'').toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function _buscarServico(servicoIdOuNome) {
  var porId = db.servicos.find(function(x){ return x.id === servicoIdOuNome; });
  if (porId) return porId;
  return _mapaServicosPorNome()[_normalizarTexto(servicoIdOuNome)] || null;
}

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
  var m = { pix:'badge-pix', dinheiro:'badge-dinheiro', cartao_debito:'badge-cartao', cartao_credito:'badge-cartao', sinal:'badge-ativo' };
  return m[p] || '';
}

function pagtoLabel(p) {
  var m = { pix:'PIX', dinheiro:'Dinheiro', cartao_debito:'Cartão Débito', cartao_credito:'Cartão Crédito', sinal:'Sinal/Entrada' };
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
  if (id === 'agenda') { renderAgenda(); if (typeof renderDisponibilidade === 'function') renderDisponibilidade(); }
  if (id === 'dashboard') renderDashboard();
  if (id === 'atendimentos') { if(typeof renderAtendimentos==='function') renderAtendimentos(); if(typeof renderServiceChips==='function') renderServiceChips(); }
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
  if (id === 'acomp-custom') { _popularFiltroModelos(); renderAcompFichasCustom(); }
  if (id === 'aniversariantes') { renderAniversariantesAba(); }
  if (id === 'checkins') renderCheckins();
  if (id === 'clientes') renderClientes();
  if (id === 'aniversariantes') renderAniversariantesAba();
  if (id === 'checkins') renderCheckins();
  if (id === 'clientes') renderClientes();
}

function renderAll() {
  renderDashboard();
  renderServicos();
  renderMateriais();
  if (typeof renderAtendimentos === 'function') renderAtendimentos();
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
  // Badge clientes
  var _bCli = document.getElementById('badgeClientes');
  if (_bCli) {
    var _nomesUnicos = {};
    db.anamneses.forEach(function(a){ if(a.pessoais&&a.pessoais.nome) _nomesUnicos[a.pessoais.nome.toLowerCase().trim()]=1; });
    db.agenda.forEach(function(ag){ if(ag.cliente) _nomesUnicos[ag.cliente.toLowerCase().trim()]=1; });
    _bCli.textContent = Object.keys(_nomesUnicos).length;
  }
  // Badge checkins — total geral
  var _bCk = document.getElementById('badgeCheckins');
  if (_bCk) {
    var _ckTotal = 0;
    db.agenda.forEach(function(ag){ ag.sessoes.forEach(function(s){ if(s.checkinData) _ckTotal++; }); });
    _bCk.textContent = _ckTotal;
  }
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

// =====================================================================
// HISTÓRICO DE CHECK-INS
// =====================================================================

var _checkinPag = 1;
var _POR_PAG_CK = 20;

function _coletarCheckins() {
  var lista = [];
  db.agenda.forEach(function(ag) {
    ag.sessoes.forEach(function(s, idx) {
      if (!s.checkinData) return;
      var srvIds = s.servicoIds || [];
      var srvNome = srvIds.length
        ? srvIds.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }).join(' + ')
        : (s.servico || _agServicos(ag) || '—');
      // Converter data DD/MM/AAAA → AAAA-MM-DD para ordenação
      var partes = s.checkinData.split('/');
      var dataIso = partes.length === 3 ? partes[2]+'-'+partes[1]+'-'+partes[0] : s.checkinData;
      lista.push({
        dataIso: dataIso,
        dataFmt: s.checkinData,
        hora: s.checkinHora || '—',
        nome: s.checkinNome || ag.cliente,
        servico: srvNome,
        sessao: idx + 1,
        status: s.status
      });
    });
  });
  // Ordenar mais recente primeiro (data desc, hora desc)
  lista.sort(function(a, b) {
    var cmp = b.dataIso.localeCompare(a.dataIso);
    if (cmp !== 0) return cmp;
    return b.hora.localeCompare(a.hora);
  });
  return lista;
}

function renderCheckins() {
  var tbody = document.getElementById('tbodyCheckins');
  var resumoEl = document.getElementById('checkinResumo');
  var pagEl = document.getElementById('pagCheckins');
  if (!tbody) return;

  var busca = ((document.getElementById('filtCheckinNome')||{value:''}).value||'').toLowerCase().trim();
  var de = ((document.getElementById('filtCheckinDe')||{value:''}).value||'');
  var ate = ((document.getElementById('filtCheckinAte')||{value:''}).value||'');

  var lista = _coletarCheckins();

  if (busca) lista = lista.filter(function(c){ return c.nome.toLowerCase().indexOf(busca) >= 0; });
  if (de) lista = lista.filter(function(c){ return c.dataIso >= de; });
  if (ate) lista = lista.filter(function(c){ return c.dataIso <= ate; });

  // Resumo
  if (resumoEl) {
    var totalFiltrado = lista.length;
    var clientesUnicos = {};
    lista.forEach(function(c){ clientesUnicos[c.nome.toLowerCase()] = 1; });
    resumoEl.innerHTML = totalFiltrado
      ? '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:0.5rem">'
        + '<span style="background:#E7F7EE;color:#276749;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500">✅ ' + totalFiltrado + ' check-in' + (totalFiltrado>1?'s':'') + '</span>'
        + '<span style="background:#EDF4FF;color:#1565C0;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500">👤 ' + Object.keys(clientesUnicos).length + ' cliente' + (Object.keys(clientesUnicos).length>1?'s':'') + '</span>'
        + '</div>'
      : '';
  }

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">✅</div><p>Nenhum check-in encontrado</p></div></td></tr>';
    if (pagEl) pagEl.innerHTML = '';
    return;
  }

  // Paginação
  var totalPags = Math.ceil(lista.length / _POR_PAG_CK);
  if (_checkinPag > totalPags) _checkinPag = 1;
  var inicio = (_checkinPag - 1) * _POR_PAG_CK;
  var pagina = lista.slice(inicio, inicio + _POR_PAG_CK);

  tbody.innerHTML = pagina.map(function(c) {
    var statusBadge = c.status === 'realizado'
      ? '<span class="badge-realizado">✓ Realizado</span>'
      : '<span class="badge-presente">✅ Presente</span>';
    return '<tr>'
      + '<td>' + c.dataFmt + '</td>'
      + '<td><strong style="color:var(--gold-dark)">' + c.hora + '</strong></td>'
      + '<td><strong>' + c.nome + '</strong></td>'
      + '<td style="font-size:12px;color:var(--text-mid)">' + c.servico + '</td>'
      + '<td style="font-size:12px;color:var(--text-light);text-align:center">Sessão ' + c.sessao + '</td>'
      + '<td>' + statusBadge + '</td>'
      + '</tr>';
  }).join('');

  // Paginação HTML
  if (pagEl) {
    if (totalPags <= 1) { pagEl.innerHTML = ''; return; }
    var ph = '<div style="display:flex;align-items:center;gap:0.5rem;padding:1rem;flex-wrap:wrap">';
    ph += '<button onclick="_checkinPag=Math.max(1,_checkinPag-1);renderCheckins()" ' + (_checkinPag===1?'disabled':'') + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">‹</button>';
    for (var p = 1; p <= totalPags; p++) {
      var at = p === _checkinPag;
      ph += '<button onclick="_checkinPag='+p+';renderCheckins()" style="padding:4px 10px;border:1px solid '+(at?'#D4A0A8':'var(--border)')+';border-radius:6px;background:'+(at?'#D4A0A8':'white')+';color:'+(at?'white':'inherit')+';cursor:pointer;font-size:12px">'+p+'</button>';
    }
    ph += '<button onclick="_checkinPag=Math.min('+totalPags+',_checkinPag+1);renderCheckins()" ' + (_checkinPag===totalPags?'disabled':'') + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">›</button>';
    ph += '<span style="font-size:11px;color:var(--text-light)">'+(inicio+1)+'-'+Math.min(inicio+_POR_PAG_CK,lista.length)+' de '+lista.length+'</span>';
    ph += '</div>';
    pagEl.innerHTML = ph;
  }
}

function exportCheckinsCsv() {
  var busca = ((document.getElementById('filtCheckinNome')||{value:''}).value||'').toLowerCase().trim();
  var de = ((document.getElementById('filtCheckinDe')||{value:''}).value||'');
  var ate = ((document.getElementById('filtCheckinAte')||{value:''}).value||'');
  var lista = _coletarCheckins();
  if (busca) lista = lista.filter(function(c){ return c.nome.toLowerCase().indexOf(busca) >= 0; });
  if (de) lista = lista.filter(function(c){ return c.dataIso >= de; });
  if (ate) lista = lista.filter(function(c){ return c.dataIso <= ate; });

  var csv = 'Data;Hora;Cliente;Serviço;Sessão;Status\n';
  lista.forEach(function(c) {
    csv += [c.dataFmt, c.hora, c.nome, c.servico, 'Sessão '+c.sessao, c.status].map(function(v){ return '"'+String(v).replace(/"/g,'""')+'"'; }).join(';') + '\n';
  });
  var blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'checkins-' + _hoje() + '.csv';
  a.click();
  showToast('✅ CSV exportado!');
}

// =====================================================================
// ABA CLIENTES — FICHA CONSOLIDADA
// =====================================================================

var _clienteAbaAtiva = {}; // { nomeKey: 'atendimentos' }

function _consolidarClientes() {
  var mapa = {};

  // Fonte 1: anamneses
  db.anamneses.forEach(function(a) {
    var p = a.pessoais || {};
    if (!p.nome) return;
    var key = _normNome(p.nome);
    if (!mapa[key]) mapa[key] = { nome: p.nome, pessoais: {}, anamneses: [], fichasCustom: [], agenda: [], atendimentos: [] };
    // Mesclar dados pessoais (prioriza o mais completo)
    var cur = mapa[key].pessoais;
    if (!cur.telefone && p.telefone) cur.telefone = p.telefone;
    if (!cur.cpf && p.cpf) cur.cpf = p.cpf;
    if (!cur.idade && p.idade) cur.idade = p.idade;
    if (!cur.dataNasc && p.dataNasc) cur.dataNasc = p.dataNasc;
    if (!cur.genero && p.genero) cur.genero = p.genero;
    if (a.modelo_respostas && Object.keys(a.modelo_respostas).length > 0) {
      mapa[key].fichasCustom.push(a);
    } else {
      mapa[key].anamneses.push(a);
    }
  });

  // Fonte 2: agenda
  db.agenda.forEach(function(ag) {
    if (!ag.cliente) return;
    var key = _normNome(ag.cliente);
    if (!mapa[key]) mapa[key] = { nome: ag.cliente, pessoais: {}, anamneses: [], fichasCustom: [], agenda: [], atendimentos: [] };
    mapa[key].agenda.push(ag);
    // Telefone da agenda
    if (!mapa[key].pessoais.telefone && ag.tel) mapa[key].pessoais.telefone = ag.tel;
  });

  // Fonte 3: atendimentos
  db.atendimentos.forEach(function(a) {
    if (!a.cliente) return;
    var key = _normNome(a.cliente);
    if (!mapa[key]) mapa[key] = { nome: a.cliente, pessoais: {}, anamneses: [], fichasCustom: [], agenda: [], atendimentos: [] };
    mapa[key].atendimentos.push(a);
  });


  // ── Mesclar registros com mesmo CPF (nomes divergentes) ──
  var _cpfMapa = {};
  Object.keys(mapa).forEach(function(key) {
    var cpf = (mapa[key].pessoais.cpf || '').replace(/\D/g,'');
    if (!cpf) {
      // Tentar pegar CPF da agenda vinculada
      mapa[key].agenda.forEach(function(ag) {
        if (!cpf && ag.cpf) cpf = ag.cpf.replace(/\D/g,'');
      });
    }
    if (cpf) {
      if (!_cpfMapa[cpf]) { _cpfMapa[cpf] = key; }
      else {
        // Já existe outro registro com mesmo CPF — mesclar no de nome mais longo
        var existKey = _cpfMapa[cpf];
        var masterKey = mapa[existKey].nome.length >= mapa[key].nome.length ? existKey : key;
        var dupeKey   = masterKey === existKey ? key : existKey;
        if (masterKey !== dupeKey && mapa[masterKey] && mapa[dupeKey]) {
          var m = mapa[masterKey], d = mapa[dupeKey];
          if (!m.pessoais.telefone && d.pessoais.telefone) m.pessoais.telefone = d.pessoais.telefone;
          if (!m.pessoais.cpf && d.pessoais.cpf) m.pessoais.cpf = d.pessoais.cpf;
          if (!m.pessoais.idade && d.pessoais.idade) m.pessoais.idade = d.pessoais.idade;
          if (!m.pessoais.dataNasc && d.pessoais.dataNasc) m.pessoais.dataNasc = d.pessoais.dataNasc;
          if (!m.pessoais.genero && d.pessoais.genero) m.pessoais.genero = d.pessoais.genero;
          m.anamneses   = m.anamneses.concat(d.anamneses);
          m.fichasCustom= m.fichasCustom.concat(d.fichasCustom);
          m.agenda      = m.agenda.concat(d.agenda);
          m.atendimentos= m.atendimentos.concat(d.atendimentos);
          delete mapa[dupeKey];
          _cpfMapa[cpf] = masterKey;
        }
      }
    }
  });
  // ── Mesclar registros com mesmo telefone (quando CPF não disponível) ──
  var _telMapa = {};
  Object.keys(mapa).forEach(function(key) {
    if (!mapa[key]) return;
    var tel = (mapa[key].pessoais.telefone || '').replace(/\D/g,'');
    if (!tel) return;
    if (!_telMapa[tel]) { _telMapa[tel] = key; }
    else {
      var existKey = _telMapa[tel];
      if (existKey === key || !mapa[existKey] || !mapa[key]) return;
      var masterKey = mapa[existKey].nome.length >= mapa[key].nome.length ? existKey : key;
      var dupeKey   = masterKey === existKey ? key : existKey;
      if (masterKey !== dupeKey && mapa[masterKey] && mapa[dupeKey]) {
        var m = mapa[masterKey], d = mapa[dupeKey];
        if (!m.pessoais.cpf && d.pessoais.cpf) m.pessoais.cpf = d.pessoais.cpf;
        if (!m.pessoais.idade && d.pessoais.idade) m.pessoais.idade = d.pessoais.idade;
        if (!m.pessoais.dataNasc && d.pessoais.dataNasc) m.pessoais.dataNasc = d.pessoais.dataNasc;
        if (!m.pessoais.genero && d.pessoais.genero) m.pessoais.genero = d.pessoais.genero;
        m.anamneses    = m.anamneses.concat(d.anamneses);
        m.fichasCustom = m.fichasCustom.concat(d.fichasCustom);
        m.agenda       = m.agenda.concat(d.agenda);
        m.atendimentos = m.atendimentos.concat(d.atendimentos);
        delete mapa[dupeKey];
        _telMapa[tel] = masterKey;
      }
    }
  });

  var _excl = db.clientesExcluidos || [];
  return Object.values(mapa).filter(function(c) {
    return _excl.indexOf(c.nome.toLowerCase().trim()) < 0;
  }).sort(function(a, b) { return a.nome.localeCompare(b.nome); });
}

var _clientePag = 1;
var _POR_PAG_CLI = 15;

function renderClientes() {
  var el = document.getElementById('clientesLista');
  var resumoEl = document.getElementById('clientesResumo');
  if (!el) return;

  var busca = ((document.getElementById('filtClienteBusca')||{value:''}).value||'').toLowerCase().trim();

  var clientes = _consolidarClientes();

  if (busca) {
    clientes = clientes.filter(function(c) {
      var p = c.pessoais;
      var campos = [
        c.nome,
        p.telefone||'', p.cpf||'', p.idade||'', p.dataNasc||'', p.genero||''
      ].join(' ').toLowerCase();
      // Buscar também em anamneses
      var temAnamnese = c.anamneses.some(function(a) {
        return JSON.stringify(a).toLowerCase().indexOf(busca) >= 0;
      });
      return campos.indexOf(busca) >= 0 || temAnamnese;
    });
  }



  if (!clientes.length) {
    el.innerHTML = '<div class="empty-state" style="padding:3rem"><div class="empty-icon">👥</div><p>Nenhuma cliente encontrada</p></div>';
    return;
  }

  var totalPags = Math.ceil(clientes.length / _POR_PAG_CLI);
  if (_clientePag > totalPags) _clientePag = 1;
  var _inicio = (_clientePag - 1) * _POR_PAG_CLI;
  var _pagina = clientes.slice(_inicio, _inicio + _POR_PAG_CLI);

  if (resumoEl) {
    resumoEl.innerHTML = '<span style="font-size:12px;color:var(--text-light)">'
      + clientes.length + ' cliente' + (clientes.length !== 1 ? 's' : '')
      + (busca ? ' encontrado' + (clientes.length !== 1 ? 's' : '') : '')
      + ' &nbsp;·&nbsp; página ' + _clientePag + ' de ' + (totalPags||1) + '</span>';
  }

  var _htmlCli = _pagina.map(function(c) {
    var key = c.nome.toLowerCase().trim().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
    var p = c.pessoais;
    var totalSessoes = 0, realizadas = 0;
    c.agenda.forEach(function(ag) {
      totalSessoes += ag.sessoes.length;
      realizadas += ag.sessoes.filter(function(s){ return s.status === 'realizado'; }).length;
    });
    var ultimoAtend = c.atendimentos.slice().sort(function(a,b){ return b.data.localeCompare(a.data); })[0];
    var totalGasto = c.atendimentos.reduce(function(s,a){ return s + (parseFloat(a.valor)||0); }, 0);

    var nomeEsc = c.nome.replace(/'/g,"\\\\'");
    return '<div class="agenda-cliente-card" style="margin-bottom:0.5rem" id="cli-card-'+key+'">'
      // HEADER
      + '<div class="agenda-cliente-header" onclick="_toggleClienteCard(\''+key+'\')" style="cursor:pointer">'
      + '<div style="display:flex;align-items:center;gap:1rem">'
      + '<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#D4A0A8,#B07880);display:flex;align-items:center;justify-content:center;color:white;font-family:Cormorant Garamond,serif;font-size:20px;flex-shrink:0">'+c.nome.charAt(0).toUpperCase()+'</div>'
      + '<div>'
      + '<div class="agenda-cliente-nome">'+c.nome+'</div>'
      + '<div class="agenda-cliente-info" style="display:flex;gap:0.75rem;flex-wrap:wrap">'
      + (p.telefone ? '<span>📱 '+p.telefone+'</span>' : '')
      + (p.cpf ? '<span>🪪 '+p.cpf+'</span>' : '')
      + (totalSessoes ? '<span>📅 '+realizadas+'/'+totalSessoes+' sessões</span>' : '')
      + (ultimoAtend ? '<span>💆 Último: '+fmtDate(ultimoAtend.data)+'</span>' : '')
      + (totalGasto > 0 ? '<span>💰 Total: '+fmtMoney(totalGasto)+'</span>' : '')
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:0.5rem">'
      + (p.telefone ? '<button onclick="event.stopPropagation();var msg=_getMensagem(\'pos_atendimento\').replace(/{nome}/g,\''+c.nome.split(' ')[0]+'\').replace(/{servico}/g,\'\');window.open(\'https://wa.me/55'+((p.telefone||'').replace(/\D/g,''))+'?text=\'+encodeURIComponent(msg),\'_blank\')" style="background:#E7F7EE;border:1px solid #7DB87D;color:#276749;border-radius:8px;padding:5px 10px;font-size:11px;cursor:pointer">💬 WA</button>' : '')
      + '<button onclick="event.stopPropagation();gerarLinkCliente(\''+nomeEsc+'\')" style="background:#EDF4FF;border:1px solid #90CAF9;color:#1565C0;border-radius:8px;padding:5px 10px;font-size:11px;cursor:pointer" title="Dashboard da cliente">🔗</button>'
      + '<span class="expand-icon" id="icon-cli-'+key+'">▶</span>'
      + '</div>'
      + '</div>'
      // CONTEÚDO EXPANSÍVEL
      + '<div class="agenda-sessoes-wrap" id="cli-body-'+key+'">'
      + _renderFichaCliente(c, key)
      + '</div>'
      + '</div>';
  }).join('');

  // Paginação
  if (totalPags > 1) {
    _htmlCli += '<div style="display:flex;align-items:center;gap:0.5rem;padding:1rem;flex-wrap:wrap;margin-top:0.5rem">';
    _htmlCli += '<button onclick="_clientePag=Math.max(1,_clientePag-1);renderClientes()" ' + (_clientePag===1?'disabled':'') + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">‹</button>';
    for (var _pp = 1; _pp <= totalPags; _pp++) {
      var _at = _pp === _clientePag;
      _htmlCli += '<button onclick="_clientePag='+_pp+';renderClientes()" style="padding:4px 10px;border:1px solid '+(_at?'#D4A0A8':'var(--border)')+';border-radius:6px;background:'+(_at?'#D4A0A8':'white')+';color:'+(_at?'white':'inherit')+';cursor:pointer;font-size:12px">'+_pp+'</button>';
    }
    _htmlCli += '<button onclick="_clientePag=Math.min('+totalPags+',_clientePag+1);renderClientes()" ' + (_clientePag===totalPags?'disabled':'') + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">›</button>';
    _htmlCli += '<span style="font-size:11px;color:var(--text-light)">'+(_inicio+1)+'-'+Math.min(_inicio+_POR_PAG_CLI,clientes.length)+' de '+clientes.length+'</span>';
    _htmlCli += '</div>';
  }

  el.innerHTML = _htmlCli;
}

function _renderFichaCliente(c, key) {
  var abaAtiva = _clienteAbaAtiva[key] || 'pessoais';
  var abas = [
    { id:'pessoais', label:'👤 Dados' },
    { id:'agenda', label:'📅 Pacotes ('+c.agenda.length+')' },
    { id:'atendimentos', label:'💆 Atendimentos ('+c.atendimentos.length+')' },
    { id:'anamnese', label:'📋 Anamnese ('+c.anamneses.length+')' },
    { id:'fichas', label:'📝 Fichas Custom ('+c.fichasCustom.length+')' }
  ];

  var tabsHtml = '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:1rem;border-bottom:1px solid var(--border);padding-bottom:0.75rem">'
    + abas.map(function(a) {
        var ativa = a.id === abaAtiva;
        return '<button onclick="event.stopPropagation();_clienteAbaAtiva[\''+key+'\']=\''+a.id+'\';document.getElementById(\'cli-content-'+key+'\').innerHTML=_renderClienteAba(\''+key+'\',\''+a.id+'\')" '
          + 'style="padding:5px 12px;border-radius:20px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid '+(ativa?'#D4A0A8':'var(--border)')+';background:'+(ativa?'#D4A0A8':'white')+';color:'+(ativa?'white':'var(--text-mid)')+'">'+a.label+'</button>';
      }).join('')
    + '</div>';

  return '<div style="padding:0.5rem 0">'
    + tabsHtml
    + '<div id="cli-content-'+key+'">'+_renderClienteAba(key, abaAtiva, c)+'</div>'
    + '</div>';
}

function _renderClienteAba(key, aba, c) {
  // Buscar cliente novamente se não passado
  if (!c) {
    var todos = _consolidarClientes();
    c = todos.find(function(x){ return x.nome.toLowerCase().trim().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'') === key; });
    if (!c) return '<div class="empty-state"><p>Cliente não encontrado</p></div>';
  }
  var p = c.pessoais;

  if (aba === 'pessoais') {
    var meses = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    var aniv = '';
    if (p.dataNasc) {
      var parts = p.dataNasc.split('-');
      if (parts.length === 3) aniv = parts[2]+'/'+meses[parseInt(parts[1])]+' ('+p.dataNasc+')';
    }
    return '<div class="detail-box" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">'
      + _dField('Nome completo', c.nome)
      + _dField('Telefone', p.telefone||'—')
      + _dField('CPF', p.cpf||'—')
      + _dField('Idade', p.idade||'—')
      + _dField('Gênero', p.genero||'—')
      + _dField('Aniversário', aniv||'—')
      + '</div>';
  }

  if (aba === 'agenda') {
    if (!c.agenda.length) return '<div class="empty-state" style="padding:2rem"><div class="empty-icon">📅</div><p>Nenhum pacote</p></div>';
    return c.agenda.map(function(ag) {
      var real = ag.sessoes.filter(function(s){ return s.status==='realizado'; }).length;
      // Calcular por ciclo para aba Pacotes
      var cicloMapP = {}; var cicloOrderP = [];
      ag.sessoes.forEach(function(s){ var k=s.cor||'__original__'; if(!cicloMapP[k]){ cicloMapP[k]=[]; cicloOrderP.push(k); } cicloMapP[k].push(s); });
      var cicloInfoHtml = cicloOrderP.map(function(cicloKey, ci) {
        var sessoesCiclo = cicloMapP[cicloKey];
        var isOriginal = cicloKey === '__original__';
        var corExibir = sessoesCiclo[0].cor || ag.cor || '#D4A0A8';
        var totalCiclo = 0;
        var sessaoComProt = sessoesCiclo.find(function(s){ return s.protocoloId && s.protocoloValor; });
        if(sessaoComProt){ totalCiclo = parseFloat(sessaoComProt.protocoloValor)||0; }
        else { var idsC={}; sessoesCiclo.forEach(function(s){ (s.servicoIds||[]).forEach(function(id){ if(idsC[id]) return; idsC[id]=true; var sv=_buscarServico(id); if(sv&&sv.preco) totalCiclo+=parseFloat(sv.preco)||0; }); }); }
        var _datasC4 = sessoesCiclo.map(function(s){return s.data;}).filter(Boolean).sort();
        var _dMinC4 = _datasC4[0]||''; var _dMaxC4 = _datasC4[_datasC4.length-1]||'';
        var _atSinalP = db.atendimentos.find(function(a){ return a.cliente&&a.cliente.toLowerCase().trim()===ag.cliente.toLowerCase().trim()&&a.pagto==='sinal'; });
        var _dSinalP = _atSinalP ? _atSinalP.data : null;
        var _sinalAquiP = _dSinalP && _dSinalP >= _dMinC4 && _dSinalP <= _dMaxC4;
        var sinalCiclo = _sinalAquiP ? (parseFloat(ag.sinal)||0) : (isOriginal&&!_dSinalP?(parseFloat(ag.sinal)||0):(!isOriginal?(sessoesCiclo[0]&&sessoesCiclo[0].sinalCiclo?parseFloat(sessoesCiclo[0].sinalCiclo):0):0));
        var datasC = sessoesCiclo.map(function(s){return s.data;}).filter(Boolean).sort();
        var dMinC = datasC[0]||''; var dMaxC = datasC[datasC.length-1]||'';
        var _temAgIdP = db.atendimentos.some(function(a){ return a.agendaId === ag.id; });
        var pagoCiclo = _temAgIdP ? db.atendimentos.filter(function(a){
          return a.agendaId === ag.id && a.pagto!=='sinal'
            && (!dMinC||a.data>=dMinC) && (!dMaxC||a.data<=dMaxC);
        }).reduce(function(s,a){return s+(parseFloat(a.valor)||0);},0) : 0;
        var restCiclo = Math.max(0, totalCiclo - sinalCiclo - pagoCiclo);
        if(!totalCiclo && !sinalCiclo) return '';
        var prefix = cicloOrderP.length > 1 ? 'Ciclo '+(ci+1)+': ' : '';
        return '<span style="border-left:3px solid '+corExibir+';padding-left:6px">'+prefix
          +(sinalCiclo>0?'💰 Sinal: '+fmtMoney(sinalCiclo)+' | ':'')
          +(totalCiclo>0?'Total: '+fmtMoney(totalCiclo)+' | ':'')
          +(pagoCiclo>0?'Pago: '+fmtMoney(pagoCiclo)+' | ':'')
          +(restCiclo>0?'<span style="color:var(--danger);font-weight:600">Restante: '+fmtMoney(restCiclo)+'</span>':'<span style="color:var(--success)">✓ Quitado</span>')
          +'</span>';
      }).filter(Boolean).join('<br>');
      return '<div style="background:var(--cream);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem;border-left:4px solid '+(ag.cor||'#D4A0A8')+'">'
        + '<div style="font-weight:600;font-size:13px;margin-bottom:4px">'+_agServicos(ag)+(ag.obs?' · <span style="font-weight:400;color:var(--text-light)">'+ag.obs+'</span>':'')+'</div>'
        + '<div style="display:flex;gap:0.4rem;flex-wrap:wrap;font-size:12px;color:var(--text-mid);flex-direction:column">'
        + '<span>📅 '+real+'/'+ag.sessoes.length+' sessões</span>'
        + cicloInfoHtml
        + '</div>'
        + '</div>';
    }).join('');
  }

  if (aba === 'atendimentos') {
    if (!c.atendimentos.length) return '<div class="empty-state" style="padding:2rem"><div class="empty-icon">💆</div><p>Nenhum atendimento</p></div>';
    var ats = c.atendimentos.slice().sort(function(a,b){ return b.data.localeCompare(a.data); });
    return '<div class="table-wrap"><table style="width:100%;font-size:12px"><thead><tr>'
      + '<th>Data</th><th>Serviço</th><th>Pagamento</th><th>Valor</th>'
      + '</tr></thead><tbody>'
      + ats.map(function(a) {
          var srvIds = a.servicoIds||[];
          var nomes = srvIds.map(function(id){
            var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id;
          }).join(' + ') || (a.servicoNomesCache||[]).join(' + ') || '—';
          return '<tr><td>'+fmtDate(a.data)+'</td><td style="font-size:11px">'+nomes+'</td>'
            +'<td><span class="badge-pill '+pagtoBadge(a.pagto)+'">'+pagtoLabel(a.pagto)+'</span></td>'
            +'<td><strong>'+fmtMoney(a.valor)+'</strong></td></tr>';
        }).join('')
      + '</tbody></table></div>';
  }

  if (aba === 'anamnese') {
    if (!c.anamneses.length) return '<div class="empty-state" style="padding:2rem"><div class="empty-icon">📋</div><p>Nenhuma anamnese</p></div>';
    return c.anamneses.map(function(a) {
      var p2 = a.pessoais||{}, s=a.saude||{}, hb=a.habitos||{};
      return '<div style="background:var(--cream);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem">'
        + '<div style="font-size:10px;letter-spacing:2px;color:var(--gold-dark);text-transform:uppercase;margin-bottom:0.5rem">Ficha · '+( a.dataCadastro||'—')+'</div>'
        + '<div class="detail-box" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">'
        + _dField('Doença', s.doencaQual||s.doenca||'—')
        + _dField('Medicação', s.medicacaoQual||s.medicacao||'—')
        + _dField('Água/dia', hb.agua||'—')
        + _dField('Atividade física', hb.atividadeQual||hb.atividade||'—')
        + _dField('Alimentação', hb.alimentacao||'—')
        + '</div>'
        + '<div style="margin-top:0.5rem;text-align:right">'
        + '<button onclick="showSection(\'anamnese\');editarAnamnese(\''+a.id+'\')" class="btn btn-secondary btn-sm" style="font-size:11px">Ver ficha completa</button>'
        + '</div>'
        + '</div>';
    }).join('');
  }

  if (aba === 'fichas') {
    if (!c.fichasCustom.length) return '<div class="empty-state" style="padding:2rem"><div class="empty-icon">📝</div><p>Nenhuma ficha custom</p></div>';
    return c.fichasCustom.map(function(f) {
      return '<div style="background:var(--cream);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">'
        + '<div>'
        + '<div style="font-weight:600;font-size:13px">'+(f.modelo_nome||'Sem modelo')+'</div>'
        + '<div style="font-size:11px;color:var(--text-light)">'+(f.dataCadastro||'—')+(f.assinatura?' · ✍️ Assinada':' · ⏳ Pendente')+'</div>'
        + '</div>'
        + '<button onclick="verFichaCustom(\''+f.id+'\')" class="btn btn-primary btn-sm" style="font-size:11px">Ver ficha</button>'
        + '</div>';
    }).join('');
  }

  return '';
}

function _dField(label, val) {
  return '<div class="detail-field"><label>'+label+'</label><span>'+(val||'—')+'</span></div>';
}

function _toggleClienteCard(key) {
  var wrap = document.getElementById('cli-body-'+key);
  var icon = document.getElementById('icon-cli-'+key);
  if (!wrap) return;
  var isOpen = wrap.classList.contains('open');
  document.querySelectorAll('.agenda-sessoes-wrap.open').forEach(function(el){ el.classList.remove('open'); });
  document.querySelectorAll('.expand-icon.open').forEach(function(el){ el.classList.remove('open'); });
  if (!isOpen) {
    wrap.classList.add('open');
    if (icon) icon.classList.add('open');
  }
}

// =====================================================================
// DASHBOARD DA CLIENTE — GERAR / REVOGAR LINK
// =====================================================================

async function gerarLinkCliente(nomeCliente) {
  var token = Math.random().toString(36).substr(2,9) + Math.random().toString(36).substr(2,9);
  // Buscar CPF e todos os nomes vinculados ao cliente para gravar no link
  var todos = _consolidarClientes();
  var cli = todos.find(function(c){ return _normNome(c.nome) === _normNome(nomeCliente); });
  var cpfLink = cli && cli.pessoais && cli.pessoais.cpf ? cli.pessoais.cpf.replace(/\D/g,'') : '';
  var nomesLink = [nomeCliente];
  if (cli) {
    cli.agenda.forEach(function(ag){ if(ag.cliente && nomesLink.indexOf(ag.cliente)<0) nomesLink.push(ag.cliente); });
    cli.atendimentos.forEach(function(a){ if(a.cliente && nomesLink.indexOf(a.cliente)<0) nomesLink.push(a.cliente); });
  }
  var resp = await fetch(SUPA_URL + '/rest/v1/links_clientes', {
    method: 'POST',
    headers: {
      'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY,
      'Content-Type': 'application/json', 'Prefer': 'return=representation'
    },
    body: JSON.stringify({ id: token, nome_cliente: nomeCliente, cpf_cliente: cpfLink, nomes_alternativos: nomesLink, ativo: true })
  });
  if (!resp.ok) { showToast('Erro ao gerar link.'); return; }
  var link = 'https://lizafigueiredoestetica-debug.github.io/cliente/cliente.html?id=' + token;
  // Copiar para clipboard
  try { await navigator.clipboard.writeText(link); showToast('✅ Link copiado! Envie para a cliente.'); }
  catch(e) { showToast('Link gerado! ' + link); }
  // Mostrar modal com link
  _mostrarModalLink(nomeCliente, link);
}

function _mostrarModalLink(nome, link) {
  var old = document.getElementById('modal-link-cliente');
  if (old) old.remove();
  var modal = document.createElement('div');
  modal.id = 'modal-link-cliente';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(28,28,30,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden">'
    + '<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);display:flex;justify-content:space-between;align-items:center">'
    + '<div style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">🔗 Link gerado!</div>'
    + '<button onclick="document.getElementById(\'modal-link-cliente\').remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="padding:1.5rem">'
    + '<div style="font-size:12px;color:var(--text-light);margin-bottom:0.5rem">Dashboard exclusivo de <strong>' + nome + '</strong></div>'
    + '<div style="background:var(--cream);border-radius:8px;padding:0.75rem 1rem;font-size:12px;color:var(--text-mid);word-break:break-all;border:1px solid var(--border);margin-bottom:1rem">' + link + '</div>'
    + '<div style="display:flex;gap:0.75rem;flex-wrap:wrap">'
    + '<button onclick="navigator.clipboard.writeText(\'' + link + '\');showToast(\'✅ Link copiado!\')" class="btn btn-primary" style="flex:1">📋 Copiar Link</button>'
    + '<button onclick="window.open(\'https://wa.me/?text=\'+encodeURIComponent(\'Olá! 🌸 Aqui está o seu espaço exclusivo na Liza Figueiredo Estética:\\n\' + \'' + link + '\'),\'_blank\')" style="background:#25D366;color:white;border:none;border-radius:8px;padding:0.65rem 1.25rem;font-family:Jost,sans-serif;font-size:12px;font-weight:500;cursor:pointer;flex:1">💬 Enviar WhatsApp</button>'
    + '</div>'
    + '<div style="margin-top:1rem;font-size:11px;color:var(--text-light)">⚠️ Este link dá acesso aos dados da cliente. Envie apenas para ela.</div>'
    + '</div></div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}
// =====================================================================
// PATCH 3 — anamnese.js — Acompanhamento de Fichas Custom
// Adicionar estas funções ao final do arquivo anamnese.js
// =====================================================================

// ── Variáveis de estado ──
var _acompCustomFiltro = 'tudo';
var _acompCustomPagina = 1;

// ── Renderizar aba de acompanhamento de fichas custom ──
function renderAcompFichasCustom() {
  var el = document.getElementById('acompCustomLista');
  if (!el) return;

  var busca = ((document.getElementById('filtAcompCustomNome') || {value:''}).value || '').toLowerCase().trim();
  var filtModelo = ((document.getElementById('filtAcompCustomModelo') || {value:''}).value || '');
  var de = ((document.getElementById('filtAcompCustomDe') || {value:''}).value || '');
  var ate = ((document.getElementById('filtAcompCustomAte') || {value:''}).value || '');

  // Só fichas com respostas de modelo
  var fichas = db.anamneses.filter(function(a) {
    return a.modelo_respostas && Object.keys(a.modelo_respostas).length > 0;
  });

  // Agrupar por cliente (nome normalizado)
  var porCliente = {};
  fichas.forEach(function(a) {
    var nome = (a.pessoais && a.pessoais.nome) ? a.pessoais.nome.trim() : '—';
    var key = nome.toLowerCase();
    if (!porCliente[key]) porCliente[key] = { nome: nome, fichas: [] };
    porCliente[key].fichas.push(a);
  });

  // Converter para array e ordenar por nome
  var clientes = Object.values(porCliente).sort(function(a, b) {
    return a.nome.localeCompare(b.nome);
  });

  // Aplicar filtros
  if (busca) {
    clientes = clientes.filter(function(c) {
      return c.nome.toLowerCase().indexOf(busca) >= 0;
    });
  }
  if (filtModelo) {
    clientes = clientes.filter(function(c) {
      return c.fichas.some(function(f) { return f.modelo_nome === filtModelo; });
    });
  }
  if (de || ate) {
    clientes = clientes.filter(function(c) {
      return c.fichas.some(function(f) {
        var dataBr = f.dataCadastro || '';
        var partes = dataBr.split('/');
        var dataIso = partes.length === 3 ? partes[2]+'-'+partes[1]+'-'+partes[0] : '';
        if (de && dataIso && dataIso < de) return false;
        if (ate && dataIso && dataIso > ate) return false;
        return true;
      });
    });
  }

  if (!clientes.length) {
    el.innerHTML = '<div class="empty-state" style="padding:3rem"><div class="empty-icon">📝</div><p>Nenhum acompanhamento encontrado</p></div>';
    return;
  }

  // Paginação: 10 clientes por página
  var POR_PAG = 10;
  var totalPags = Math.ceil(clientes.length / POR_PAG);
  if (_acompCustomPagina > totalPags) _acompCustomPagina = 1;
  var inicio = (_acompCustomPagina - 1) * POR_PAG;
  var pagClientes = clientes.slice(inicio, inicio + POR_PAG);

  var html = '';

  pagClientes.forEach(function(c) {
    // Ordenar fichas por data (mais recente primeiro)
    var fichasOrd = c.fichas.slice().sort(function(a, b) {
      var da = _parseDateBr(a.dataCadastro);
      var db2 = _parseDateBr(b.dataCadastro);
      return db2.localeCompare(da);
    });

    // Agrupar por modelo
    var porModelo = {};
    fichasOrd.forEach(function(f) {
      var mod = f.modelo_nome || 'Sem modelo';
      if (!porModelo[mod]) porModelo[mod] = [];
      porModelo[mod].push(f);
    });

    var cardId = 'acomp-custom-' + c.nome.replace(/\s/g,'_').replace(/[^a-zA-Z0-9_]/g,'');

    html += '<div class="agenda-cliente-card" style="margin-bottom:0.75rem">'
      + '<div class="agenda-cliente-header" onclick="_toggleAcompCustomCard(\'' + cardId + '\')" style="cursor:pointer">'
      + '<div>'
      + '<div class="agenda-cliente-nome">👤 ' + c.nome + '</div>'
      + '<div class="agenda-cliente-info">' + fichasOrd.length + ' ficha(s) · ' + Object.keys(porModelo).length + ' modelo(s)</div>'
      + '</div>'
      + '<div class="agenda-cliente-badges">'
      + '<span class="expand-icon" id="icon-' + cardId + '">▶</span>'
      + '</div>'
      + '</div>'
      + '<div class="agenda-sessoes-wrap" id="' + cardId + '">';

    // Renderizar cada modelo separado
    Object.keys(porModelo).forEach(function(modNome) {
      var fichasModelo = porModelo[modNome];

      html += '<div style="background:var(--cream);border-radius:8px;padding:0.75rem 1rem;margin-bottom:0.75rem">'
        + '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dark);margin-bottom:0.75rem;font-weight:600">📋 ' + modNome + '</div>';

      // Descobrir todos os campos deste modelo
      var todosCampos = [];
      fichasModelo.forEach(function(f) {
        Object.keys(f.modelo_respostas || {}).forEach(function(campo) {
          if (todosCampos.indexOf(campo) < 0 && campo.indexOf('(detalhe)') < 0) {
            todosCampos.push(campo);
          }
        });
      });

      if (!todosCampos.length) {
        html += '<div style="font-size:12px;color:var(--text-light)">Sem campos registrados</div>';
      } else {
        // Tabela de evolução: linhas = campos, colunas = datas
        html += '<div style="overflow-x:auto"><table style="width:100%;font-size:12px;border-collapse:collapse">'
          + '<thead><tr>'
          + '<th style="text-align:left;padding:4px 8px;color:var(--text-light);font-size:10px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;background:white;border-bottom:1px solid var(--border)">Campo</th>';

        fichasModelo.forEach(function(f) {
          var dataLabel = f.dataCadastro || '—';
          html += '<th style="text-align:center;padding:4px 8px;color:var(--gold-dark);font-size:10px;white-space:nowrap;background:white;border-bottom:1px solid var(--border)">'
            + dataLabel
            + '<div style="font-size:9px;color:var(--text-light);font-weight:400">'
            + (f.assinatura ? '✍️' : '⏳')
            + '</div>'
            + '<div style="margin-top:2px">'
            + '<button onclick="verFichaCustom(\'' + f.id + '\')" style="background:var(--gold);color:white;border:none;border-radius:4px;padding:2px 6px;font-size:10px;cursor:pointer">Ver</button>'
            + '</div>'
            + '</th>';
        });

        html += '</tr></thead><tbody>';

        todosCampos.forEach(function(campo, ci) {
          var bgRow = ci % 2 === 0 ? 'white' : 'var(--cream)';
          html += '<tr style="background:' + bgRow + '">'
            + '<td style="padding:5px 8px;color:var(--text-mid);font-weight:500;min-width:120px;max-width:200px;white-space:normal;vertical-align:middle">' + campo + '</td>';

          fichasModelo.forEach(function(f) {
            var val = (f.modelo_respostas || {})[campo];
            var detalhe = (f.modelo_respostas || {})[campo + ' (detalhe)'];
            var displayVal = val !== undefined && val !== null && val !== '' ? val : '—';
            if (detalhe) displayVal += ' (' + detalhe + ')';

            // Colorir sim/não
            var style = 'padding:5px 8px;text-align:center;vertical-align:middle;';
            if (displayVal === 'sim') style += 'color:#C62828;font-weight:600';
            else if (displayVal === 'não') style += 'color:#388E3C;';
            else style += 'color:var(--text-dark)';

            html += '<td style="' + style + '">' + displayVal + '</td>';
          });

          html += '</tr>';
        });

        html += '</tbody></table></div>';
      }

      // Botão nova sessão/ficha deste modelo
      var modeloObj = (_modelosAnamnese || []).find(function(m) { return m.nome === modNome; });
      if (modeloObj) {
        html += '<div style="margin-top:0.75rem;text-align:right">'
          + '<button class="btn btn-primary btn-sm" onclick="_novaFichaCustomParaCliente(\'' + c.nome + '\',\'' + modeloObj.id + '\')" style="font-size:11px">+ Nova Sessão ' + modNome + '</button>'
          + '</div>';
      }

      html += '</div>'; // /modelo
    });

    html += '</div></div>'; // /sessoes-wrap + card
  });

  // Paginação
  if (totalPags > 1) {
    html += '<div style="display:flex;align-items:center;gap:0.5rem;padding:1rem;flex-wrap:wrap">';
    html += '<button onclick="_acompCustomPagina=Math.max(1,_acompCustomPagina-1);renderAcompFichasCustom()" '
      + (_acompCustomPagina === 1 ? 'disabled' : '')
      + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">‹</button>';
    for (var p = 1; p <= totalPags; p++) {
      var isAtiva = p === _acompCustomPagina;
      html += '<button onclick="_acompCustomPagina=' + p + ';renderAcompFichasCustom()" style="padding:4px 10px;border:1px solid '
        + (isAtiva ? '#D4A0A8' : 'var(--border)') + ';border-radius:6px;background:'
        + (isAtiva ? '#D4A0A8' : 'white') + ';color:' + (isAtiva ? 'white' : 'inherit')
        + ';cursor:pointer;font-size:12px">' + p + '</button>';
    }
    html += '<button onclick="_acompCustomPagina=Math.min(' + totalPags + ',_acompCustomPagina+1);renderAcompFichasCustom()" '
      + (_acompCustomPagina === totalPags ? 'disabled' : '')
      + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">›</button>';
    html += '<span style="font-size:11px;color:var(--text-light)">' + (inicio+1) + '-' + Math.min(inicio+POR_PAG, clientes.length) + ' de ' + clientes.length + '</span>';
    html += '</div>';
  }

  el.innerHTML = html;
}

function _parseDateBr(dataBr) {
  if (!dataBr) return '';
  var p = dataBr.split('/');
  return p.length === 3 ? p[2]+'-'+p[1]+'-'+p[0] : '';
}

function _toggleAcompCustomCard(cardId) {
  var wrap = document.getElementById(cardId);
  var icon = document.getElementById('icon-' + cardId);
  if (!wrap) return;
  var isOpen = wrap.classList.contains('open');
  // Fechar todos
  document.querySelectorAll('.agenda-sessoes-wrap.open').forEach(function(el) { el.classList.remove('open'); });
  document.querySelectorAll('.expand-icon.open').forEach(function(el) { el.classList.remove('open'); });
  if (!isOpen) {
    wrap.classList.add('open');
    if (icon) icon.classList.add('open');
  }
}

function _novaFichaCustomParaCliente(nomeCliente, modeloId) {
  // Pré-preencher com nome do cliente e modelo
  _fichaCustomEditId = null;
  _abrirModalFichaCustom(null);
  // Aguardar modal abrir
  setTimeout(function() {
    var nomeEl = document.getElementById('fc-nome');
    var modeloEl = document.getElementById('fc-modelo');
    if (nomeEl) nomeEl.value = nomeCliente;
    if (modeloEl) {
      modeloEl.value = modeloId;
      _carregarCamposModelo();
    }
    // Buscar telefone existente do cliente
    var fichaExist = db.anamneses.find(function(a) {
      return a.pessoais && a.pessoais.nome &&
             a.pessoais.nome.toLowerCase() === nomeCliente.toLowerCase() &&
             a.pessoais.telefone;
    });
    if (fichaExist) {
      var telEl = document.getElementById('fc-telefone');
      var idadeEl = document.getElementById('fc-idade');
      var cpfEl = document.getElementById('fc-cpf');
      if (telEl && fichaExist.pessoais.telefone) telEl.value = fichaExist.pessoais.telefone;
      if (idadeEl && fichaExist.pessoais.idade) idadeEl.value = fichaExist.pessoais.idade;
      if (cpfEl && fichaExist.pessoais.cpf) cpfEl.value = fichaExist.pessoais.cpf;
    }
  }, 150);
}

// ── Popular select de modelos no filtro ──
function _popularFiltroModelos() {
  var sel = document.getElementById('filtAcompCustomModelo');
  if (!sel) return;
  var modelos = [];
  db.anamneses.forEach(function(a) {
    if (a.modelo_nome && modelos.indexOf(a.modelo_nome) < 0) {
      modelos.push(a.modelo_nome);
    }
  });
  var html = '<option value="">Todos os modelos</option>';
  modelos.sort().forEach(function(m) {
    html += '<option value="' + m + '">' + m + '</option>';
  });
  sel.innerHTML = html;
}

// =====================================================================
// CLIENTES CONSOLIDADOS
// =====================================================================
var _clientePag = 1;
var _POR_PAG_CLI = 15;

function _consolidarClientes() {
  var mapa = {};
  db.anamneses.forEach(function(a) {
    var p = a.pessoais || {};
    if (!p.nome) return;
    var key = p.nome.toLowerCase().trim();
    if (!mapa[key]) mapa[key] = { nome: p.nome, pessoais: {}, anamneses: [], fichasCustom: [], agenda: [], atendimentos: [] };
    var cur = mapa[key].pessoais;
    if (!cur.telefone && p.telefone) cur.telefone = p.telefone;
    if (!cur.cpf && p.cpf) cur.cpf = p.cpf;
    if (!cur.idade && p.idade) cur.idade = p.idade;
    if (!cur.dataNasc && p.dataNasc) cur.dataNasc = p.dataNasc;
    if (!cur.genero && p.genero) cur.genero = p.genero;
    if (a.modelo_respostas && Object.keys(a.modelo_respostas).length > 0 && a.modelo_nome !== 'Anamnese') {
      mapa[key].fichasCustom.push(a);
    } else {
      mapa[key].anamneses.push(a);
    }
  });
  db.agenda.forEach(function(ag) {
    if (!ag.cliente) return;
    var key = _normNome(ag.cliente);
    if (!mapa[key]) mapa[key] = { nome: ag.cliente, pessoais: {}, anamneses: [], fichasCustom: [], agenda: [], atendimentos: [] };
    mapa[key].agenda.push(ag);
    if (!mapa[key].pessoais.telefone && ag.tel) mapa[key].pessoais.telefone = ag.tel;
  });
  db.atendimentos.forEach(function(a) {
    if (!a.cliente) return;
    var key = _normNome(a.cliente);
    if (!mapa[key]) mapa[key] = { nome: a.cliente, pessoais: {}, anamneses: [], fichasCustom: [], agenda: [], atendimentos: [] };
    mapa[key].atendimentos.push(a);
  });

  // ── Mesclar registros com mesmo CPF (nomes divergentes) ──
  var _cpfMapa2 = {};
  Object.keys(mapa).forEach(function(key) {
    var cpf = (mapa[key].pessoais.cpf || '').replace(/\D/g,'');
    if (!cpf) {
      // Tentar pegar CPF da agenda vinculada
      mapa[key].agenda.forEach(function(ag) {
        if (!cpf && ag.cpf) cpf = ag.cpf.replace(/\D/g,'');
      });
    }
    if (cpf) {
      if (!_cpfMapa2[cpf]) { _cpfMapa2[cpf] = key; }
      else {
        // Já existe outro registro com mesmo CPF — mesclar no de nome mais longo
        var existKey = _cpfMapa2[cpf];
        var masterKey = mapa[existKey].nome.length >= mapa[key].nome.length ? existKey : key;
        var dupeKey   = masterKey === existKey ? key : existKey;
        if (masterKey !== dupeKey && mapa[masterKey] && mapa[dupeKey]) {
          var m = mapa[masterKey], d = mapa[dupeKey];
          if (!m.pessoais.telefone && d.pessoais.telefone) m.pessoais.telefone = d.pessoais.telefone;
          if (!m.pessoais.cpf && d.pessoais.cpf) m.pessoais.cpf = d.pessoais.cpf;
          if (!m.pessoais.idade && d.pessoais.idade) m.pessoais.idade = d.pessoais.idade;
          if (!m.pessoais.dataNasc && d.pessoais.dataNasc) m.pessoais.dataNasc = d.pessoais.dataNasc;
          if (!m.pessoais.genero && d.pessoais.genero) m.pessoais.genero = d.pessoais.genero;
          m.anamneses   = m.anamneses.concat(d.anamneses);
          m.fichasCustom= m.fichasCustom.concat(d.fichasCustom);
          m.agenda      = m.agenda.concat(d.agenda);
          m.atendimentos= m.atendimentos.concat(d.atendimentos);
          delete mapa[dupeKey];
          _cpfMapa2[cpf] = masterKey;
        }
      }
    }
  });
  // ── Mesclar por telefone ──
  var _telMapa2 = {};
  Object.keys(mapa).forEach(function(key) {
    if (!mapa[key]) return;
    var tel = (mapa[key].pessoais.telefone || '').replace(/\D/g,'');
    if (!tel) return;
    if (!_telMapa2[tel]) { _telMapa2[tel] = key; }
    else {
      var existKey = _telMapa2[tel];
      if (existKey === key || !mapa[existKey] || !mapa[key]) return;
      var masterKey = mapa[existKey].nome.length >= mapa[key].nome.length ? existKey : key;
      var dupeKey   = masterKey === existKey ? key : existKey;
      if (masterKey !== dupeKey && mapa[masterKey] && mapa[dupeKey]) {
        var m = mapa[masterKey], d = mapa[dupeKey];
        if (!m.pessoais.cpf && d.pessoais.cpf) m.pessoais.cpf = d.pessoais.cpf;
        if (!m.pessoais.idade && d.pessoais.idade) m.pessoais.idade = d.pessoais.idade;
        if (!m.pessoais.dataNasc && d.pessoais.dataNasc) m.pessoais.dataNasc = d.pessoais.dataNasc;
        if (!m.pessoais.genero && d.pessoais.genero) m.pessoais.genero = d.pessoais.genero;
        m.anamneses    = m.anamneses.concat(d.anamneses);
        m.fichasCustom = m.fichasCustom.concat(d.fichasCustom);
        m.agenda       = m.agenda.concat(d.agenda);
        m.atendimentos = m.atendimentos.concat(d.atendimentos);
        delete mapa[dupeKey];
        _telMapa2[tel] = masterKey;
      }
    }
  });

  var _excl2 = db.clientesExcluidos || [];
  return Object.values(mapa).filter(function(c) {
    return _excl2.indexOf(c.nome.toLowerCase().trim()) < 0;
  }).sort(function(a, b) { return a.nome.localeCompare(b.nome); });
}

function renderClientes() {
  var el = document.getElementById('clientesLista');
  var resumoEl = document.getElementById('clientesResumo');
  if (!el) return;
  var busca = ((document.getElementById('filtClienteBusca')||{value:''}).value||'').toLowerCase().trim();
  var clientes = _consolidarClientes();
  if (busca) {
    clientes = clientes.filter(function(c) {
      var p = c.pessoais;
      var campos = [c.nome, p.telefone||'', p.cpf||'', p.idade||'', p.dataNasc||'', p.genero||''].join(' ').toLowerCase();
      var temAnamnese = c.anamneses.some(function(a){ return JSON.stringify(a).toLowerCase().indexOf(busca) >= 0; });
      return campos.indexOf(busca) >= 0 || temAnamnese;
    });
    _clientePag = 1;
  }
  var totalPags = Math.ceil(clientes.length / _POR_PAG_CLI);
  if (_clientePag > totalPags) _clientePag = 1;
  var _inicio = (_clientePag - 1) * _POR_PAG_CLI;
  var _pagina = clientes.slice(_inicio, _inicio + _POR_PAG_CLI);
  if (resumoEl) resumoEl.innerHTML = '<span style="font-size:12px;color:var(--text-light)">'+clientes.length+' cliente'+(clientes.length!==1?'s':'')+(busca?' encontrado'+(clientes.length!==1?'s':''):'')+' &nbsp;·&nbsp; página '+_clientePag+' de '+(totalPags||1)+'</span>';
  if (!clientes.length) { el.innerHTML = '<div class="empty-state" style="padding:3rem"><div class="empty-icon">👥</div><p>Nenhuma cliente encontrada</p></div>'; return; }

  var _htmlCli = _pagina.map(function(c) {
    var key = c.nome.toLowerCase().trim().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
    var p = c.pessoais;
    var totalSessoes=0, realizadas=0;
    c.agenda.forEach(function(ag){ totalSessoes+=ag.sessoes.length; realizadas+=ag.sessoes.filter(function(s){return s.status==='realizado';}).length; });
    var ultimoAtend = c.atendimentos.slice().sort(function(a,b){return b.data.localeCompare(a.data);})[0];
    var totalGasto = c.atendimentos.reduce(function(s,a){return s+(parseFloat(a.valor)||0);},0);
    var nomeEsc = c.nome.replace(/'/g,"\\'");
    return '<div class="agenda-cliente-card" style="margin-bottom:0.5rem" id="cli-card-'+key+'">'
      +'<div class="agenda-cliente-header" onclick="_toggleClienteCard(\''+key+'\')" style="cursor:pointer">'
      +'<div style="display:flex;align-items:center;gap:1rem">'
      +'<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#D4A0A8,#B07880);display:flex;align-items:center;justify-content:center;color:white;font-family:Cormorant Garamond,serif;font-size:20px;flex-shrink:0">'+c.nome.charAt(0).toUpperCase()+'</div>'
      +'<div><div class="agenda-cliente-nome">'+c.nome+'</div>'
      +'<div class="agenda-cliente-info" style="display:flex;gap:0.75rem;flex-wrap:wrap">'
      +(p.telefone?'<span>📱 '+p.telefone+'</span>':'')
      +(p.cpf?'<span>🪪 '+p.cpf+'</span>':'')
      +(totalSessoes?'<span>📅 '+realizadas+'/'+totalSessoes+' sessões</span>':'')
      +(ultimoAtend?'<span>💆 Último: '+fmtDate(ultimoAtend.data)+'</span>':'')
      +(totalGasto>0?'<span>💰 Total: '+fmtMoney(totalGasto)+'</span>':'')
      +'</div></div></div>'
      +'<div style="display:flex;align-items:center;gap:0.5rem">'
      +(p.telefone?'<button onclick="event.stopPropagation();var msg=_getMensagem(\'pos_atendimento\').replace(/{nome}/g,\''+c.nome.split(' ')[0]+'\').replace(/{servico}/g,\'\');window.open(\'https://wa.me/55'+((p.telefone||'').replace(/\D/g,''))+'?text=\'+encodeURIComponent(msg),\'_blank\')" style="background:#E7F7EE;border:1px solid #7DB87D;color:#276749;border-radius:8px;padding:5px 10px;font-size:11px;cursor:pointer">💬 WA</button>':'')
      +'<button onclick="event.stopPropagation();gerarLinkCliente(\''+nomeEsc+'\')" style="background:#EDF4FF;border:1px solid #90CAF9;color:#1565C0;border-radius:8px;padding:5px 10px;font-size:11px;cursor:pointer" title="Dashboard da cliente">🔗</button>'
      +'<button onclick="event.stopPropagation();_excluirCliente(this.dataset.nome)" data-nome="'+c.nome.replace(/"/g,'&quot;')+'" style="background:#FFEBEE;border:1px solid #FFCDD2;color:var(--danger);border-radius:8px;padding:5px 10px;font-size:11px;cursor:pointer" title="Excluir cliente">🗑</button>'
      +'<span class="expand-icon" id="icon-cli-'+key+'">▶</span>'
      +'</div></div>'
      +'<div class="agenda-sessoes-wrap" id="cli-body-'+key+'">'+_renderFichaCliente(c, key)+'</div>'
      +'</div>';
  }).join('');

  if (totalPags > 1) {
    _htmlCli += '<div style="display:flex;align-items:center;gap:0.5rem;padding:1rem;flex-wrap:wrap">';
    _htmlCli += '<button onclick="_clientePag=Math.max(1,_clientePag-1);renderClientes()" '+(_clientePag===1?'disabled':'')+' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">‹</button>';
    for (var _pp=1;_pp<=totalPags;_pp++){var _at=_pp===_clientePag;_htmlCli+='<button onclick="_clientePag='+_pp+';renderClientes()" style="padding:4px 10px;border:1px solid '+(_at?'#D4A0A8':'var(--border)')+';border-radius:6px;background:'+(_at?'#D4A0A8':'white')+';color:'+(_at?'white':'inherit')+';cursor:pointer;font-size:12px">'+_pp+'</button>';}
    _htmlCli += '<button onclick="_clientePag=Math.min('+totalPags+',_clientePag+1);renderClientes()" '+(_clientePag===totalPags?'disabled':'')+' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">›</button>';
    _htmlCli += '<span style="font-size:11px;color:var(--text-light)">'+(_inicio+1)+'-'+Math.min(_inicio+_POR_PAG_CLI,clientes.length)+' de '+clientes.length+'</span></div>';
  }
  el.innerHTML = _htmlCli;
}

function _dField(label, val) {
  return '<div class="detail-field"><label>'+label+'</label><span>'+(val||'—')+'</span></div>';
}

function _renderFichaCliente(c, key) {
  var abaAtiva = _clienteAbaAtiva[key] || 'pessoais';
  var abas = [
    {id:'pessoais',label:'👤 Dados'},
    {id:'financeiro',label:'💰 Financeiro'},
    {id:'agenda',label:'📅 Pacotes ('+c.agenda.length+')'},
    {id:'atendimentos',label:'💆 Atendimentos ('+c.atendimentos.length+')'},
    {id:'anamnese',label:'📋 Anamnese ('+c.anamneses.length+')'},
    {id:'fichas',label:'📝 Fichas Custom ('+c.fichasCustom.length+')'}
  ];
  var tabsHtml = '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:1rem;border-bottom:1px solid var(--border);padding-bottom:0.75rem">'
    +abas.map(function(a){
      var ativa=a.id===abaAtiva;
      return '<button onclick="event.stopPropagation();_clienteAbaAtiva[\''+key+'\']=\''+a.id+'\';document.getElementById(\'cli-content-'+key+'\').innerHTML=_renderClienteAba(\''+key+'\',\''+a.id+'\')" style="padding:5px 12px;border-radius:20px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid '+(ativa?'#D4A0A8':'var(--border)')+';background:'+(ativa?'#D4A0A8':'white')+';color:'+(ativa?'white':'var(--text-mid)')+'">'+a.label+'</button>';
    }).join('')+'</div>';
  return '<div style="padding:0.5rem 0">'+tabsHtml+'<div id="cli-content-'+key+'">'+_renderClienteAba(key, abaAtiva, c)+'</div></div>';
}

var _clienteAbaAtiva = {};

function _renderClienteAba(key, aba, c) {
  if (!c) { var todos=_consolidarClientes(); c=todos.find(function(x){return x.nome.toLowerCase().trim().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'')===key;}); if(!c) return ''; }
  var p = c.pessoais;

  if (aba==='pessoais') {
    var meses=['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    var aniv='';
    if(p.dataNasc){var parts=p.dataNasc.split('-');if(parts.length===3)aniv=parts[2]+'/'+meses[parseInt(parts[1])];}
    return '<div class="detail-box" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">'
      +_dField('Nome completo',c.nome)+_dField('Telefone',p.telefone||'—')+_dField('CPF',p.cpf||'—')
      +_dField('Idade',p.idade||'—')+_dField('Gênero',p.genero||'—')+_dField('Aniversário',aniv||'—')+'</div>';
  }

  if (aba==='financeiro') {
    var atsF=c.atendimentos.slice().sort(function(a,b){return b.data.localeCompare(a.data);});
    var totalF=atsF.reduce(function(s,a){return s+(parseFloat(a.valor)||0);},0);

    // Resumo financeiro dos pacotes da cliente
    var resumoPacote = '';
    if (c.agenda.length > 0) {
      c.agenda.forEach(function(ag) {
        // Calcular e mostrar por ciclo
        var cicloMapF = {}; var cicloOrderF = [];
        ag.sessoes.forEach(function(s){ var k=s.cor||'__original__'; if(!cicloMapF[k]){ cicloMapF[k]=[]; cicloOrderF.push(k); } cicloMapF[k].push(s); });
        cicloOrderF.forEach(function(cicloKey, ci) {
          var sessoesCiclo = cicloMapF[cicloKey];
          var isOriginal = cicloKey === '__original__';
          var corExibir = sessoesCiclo[0].cor || ag.cor || '#D4A0A8';
          var totalCiclo = 0;
          var sessaoComProt = sessoesCiclo.find(function(s){ return s.protocoloId && s.protocoloValor; });
          if(sessaoComProt){ totalCiclo = parseFloat(sessaoComProt.protocoloValor)||0; }
          else { var idsC={}; sessoesCiclo.forEach(function(s){ (s.servicoIds||[]).forEach(function(id){ if(idsC[id]) return; idsC[id]=true; var sv=_buscarServico(id); if(sv&&sv.preco) totalCiclo+=parseFloat(sv.preco)||0; }); }); }
          var _datasC3 = sessoesCiclo.map(function(s){return s.data;}).filter(Boolean).sort();
          var _dMinC3 = _datasC3[0]||''; var _dMaxC3 = _datasC3[_datasC3.length-1]||'';
          var _atSinalU = db.atendimentos.find(function(a){ return a.cliente&&a.cliente.toLowerCase().trim()===ag.cliente.toLowerCase().trim()&&a.pagto==='sinal'; });
          var _dSinalU = _atSinalU ? _atSinalU.data : null;
          var _sinalAquiU = _dSinalU && _dSinalU >= _dMinC3 && _dSinalU <= _dMaxC3;
          var sinalCiclo = _sinalAquiU ? (parseFloat(ag.sinal)||0) : (isOriginal&&!_dSinalU?(parseFloat(ag.sinal)||0):(!isOriginal?(sessoesCiclo[0]&&sessoesCiclo[0].sinalCiclo?parseFloat(sessoesCiclo[0].sinalCiclo):0):0));
          var datasC = sessoesCiclo.map(function(s){return s.data;}).filter(Boolean).sort();
          var dMinC = datasC[0]||''; var dMaxC = datasC[datasC.length-1]||'';
          var _temAgIdF = c.atendimentos.some(function(a){ return a.agendaId === ag.id; });
          var pagoCiclo = c.atendimentos.filter(function(a){
            if (a.pagto === 'sinal') return false;
            if (_temAgIdF) {
              if (a.agendaId !== ag.id) return false;
              if (a.corCiclo !== undefined) return isOriginal ? (!a.corCiclo) : (a.corCiclo === cicloKey);
              return (!dMinC||a.data>=dMinC) && (!dMaxC||a.data<=dMaxC);
            }
            return a.cliente && a.cliente.toLowerCase().trim()===ag.cliente.toLowerCase().trim()
              && (!dMinC||a.data>=dMinC) && (!dMaxC||a.data<=dMaxC);
          }).reduce(function(s,a){return s+(parseFloat(a.valor)||0);},0);
          var restCiclo = Math.max(0, totalCiclo - sinalCiclo - pagoCiclo);
          if(!totalCiclo && !sinalCiclo && !pagoCiclo) return;
          var labelCiclo = cicloOrderF.length > 1 ? '📦 Ciclo '+(ci+1)+' — ' : '📦 ';
          var nomeCiclo = sessaoComProt ? sessaoComProt.protocoloNome : _agServicos(ag);
          resumoPacote += '<div style="background:linear-gradient(135deg,#FFF8F9,#FFF0F5);border:1px solid #D4A0A8;border-left:4px solid '+corExibir+';border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem">'
            +'<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dark);margin-bottom:0.5rem;font-weight:600">'+labelCiclo+nomeCiclo+'</div>'
            +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:0.5rem">'
            +'<div style="text-align:center;background:white;border-radius:8px;padding:0.5rem"><div style="font-size:9px;color:var(--text-light);text-transform:uppercase;letter-spacing:1px">Total Pacote</div><div style="font-family:Cormorant Garamond,serif;font-size:16px;color:var(--text-dark)">'+fmtMoney(totalCiclo)+'</div></div>'
            +'<div style="text-align:center;background:white;border-radius:8px;padding:0.5rem"><div style="font-size:9px;color:var(--text-light);text-transform:uppercase;letter-spacing:1px">Sinal</div><div style="font-family:Cormorant Garamond,serif;font-size:16px;color:#276749">'+fmtMoney(sinalCiclo)+'</div></div>'
            +'<div style="text-align:center;background:white;border-radius:8px;padding:0.5rem"><div style="font-size:9px;color:var(--text-light);text-transform:uppercase;letter-spacing:1px">Já Pago</div><div style="font-family:Cormorant Garamond,serif;font-size:16px;color:#276749">'+fmtMoney(pagoCiclo)+'</div></div>'
            +'<div style="text-align:center;background:white;border-radius:8px;padding:0.5rem"><div style="font-size:9px;color:var(--text-light);text-transform:uppercase;letter-spacing:1px">Restante</div><div style="font-family:Cormorant Garamond,serif;font-size:16px;color:'+(restCiclo>0?'var(--danger)':'var(--success)')+'">'+fmtMoney(restCiclo)+'</div></div>'
            +'</div></div>';
        });
      });
    }

    var html = resumoPacote;
    if(!atsF.length) {
      html += '<div class="empty-state" style="padding:2rem"><div class="empty-icon">💰</div><p>Nenhum atendimento registrado</p></div>';
      return html;
    }
    html+='<div style="margin-bottom:0.75rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem"><span style="font-size:12px;color:var(--text-light)">'+atsF.length+' lançamento(s)</span><span style="font-family:Cormorant Garamond,serif;font-size:20px;color:var(--gold-dark)">Total pago: '+fmtMoney(totalF)+'</span></div>';
    html+='<div style="overflow-x:auto"><table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr>'
      +'<th style="text-align:left;padding:6px 8px;color:var(--text-light);font-size:10px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border)">Data</th>'
      +'<th style="text-align:left;padding:6px 8px;color:var(--text-light);font-size:10px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border)">Serviço</th>'
      +'<th style="text-align:left;padding:6px 8px;color:var(--text-light);font-size:10px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border)">Pagto</th>'
      +'<th style="text-align:right;padding:6px 8px;color:var(--text-light);font-size:10px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border)">Valor</th>'
      +'<th style="padding:6px 8px;border-bottom:1px solid var(--border)"></th></tr></thead><tbody>';
    atsF.forEach(function(a){
      var srvIds=a.servicoIds||[];
      var nomes=srvIds.map(function(id){var sv=db.servicos.find(function(x){return x.id===id;});return sv?sv.nome:id;}).join(' + ')||(a.servicoNomesCache||[]).join(' + ')||'—';
      html+='<tr>'
        +'<td style="padding:7px 8px;border-bottom:1px solid var(--border)"><span id="fin-valor-view-date-'+a.id+'">'+fmtDate(a.data)+'</span><input type="date" id="fedit-data-'+a.id+'" value="'+a.data+'" style="display:none;padding:3px 6px;border:1px solid var(--border);border-radius:4px;font-size:11px;width:120px"></td>'
        +'<td style="padding:7px 8px;border-bottom:1px solid var(--border);font-size:11px;color:var(--text-mid)">'+nomes+'</td>'
        +'<td style="padding:7px 8px;border-bottom:1px solid var(--border)"><span id="fin-pagto-view-'+a.id+'"><span class="badge-pill '+pagtoBadge(a.pagto)+'">'+pagtoLabel(a.pagto)+'</span></span>'
        +'<select id="fedit-pagto-'+a.id+'" style="display:none;padding:3px 6px;border:1px solid var(--border);border-radius:4px;font-size:11px">'
        +'<option value="pix" '+(a.pagto==='pix'?'selected':'')+'>PIX</option>'
        +'<option value="dinheiro" '+(a.pagto==='dinheiro'?'selected':'')+'>Dinheiro</option>'
        +'<option value="cartao_debito" '+(a.pagto==='cartao_debito'?'selected':'')+'>Cartão Débito</option>'
        +'<option value="cartao_credito" '+(a.pagto==='cartao_credito'?'selected':'')+'>Cartão Crédito</option>'
        +'<option value="sinal" '+(a.pagto==='sinal'?'selected':'')+'>Sinal/Entrada</option>'
        +'</select></td>'
        +'<td style="padding:7px 8px;border-bottom:1px solid var(--border);text-align:right"><span id="fin-valor-view-'+a.id+'" style="font-family:Cormorant Garamond,serif;font-size:16px;color:var(--gold-dark)">'+fmtMoney(a.valor)+'</span>'
        +'<input type="number" id="fedit-valor-'+a.id+'" value="'+parseFloat(a.valor||0).toFixed(2)+'" step="0.01" style="display:none;padding:3px 6px;border:1px solid var(--border);border-radius:4px;font-size:12px;width:80px;text-align:right"></td>'
        +'<td style="padding:7px 8px;border-bottom:1px solid var(--border);white-space:nowrap">'
        +'<button id="fin-btn-edit-'+a.id+'" onclick="_finEditarAtend(\''+a.id+'\')" style="background:var(--cream);border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:var(--gold-dark)">✏️</button>'
        +'<button id="fin-btn-save-'+a.id+'" onclick="_finSalvarAtend(\''+a.id+'\')" style="display:none;background:#E8F5E9;border:1px solid #7DB87D;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:#276749">✓</button>'
        +'<button id="fin-btn-cancel-'+a.id+'" onclick="_finCancelarAtend(\''+a.id+'\')" style="display:none;background:white;border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer">✕</button>'
        +'</td></tr>';
    });
    html+='</tbody></table></div>';
    return html;
  }

  if (aba==='agenda') {
    if(!c.agenda.length) return '<div class="empty-state" style="padding:2rem"><div class="empty-icon">📅</div><p>Nenhum pacote</p></div>';
    return c.agenda.map(function(ag){
      var real=ag.sessoes.filter(function(s){return s.status==='realizado';}).length;
      var saldo=_calcSaldoPacote(ag);
      return '<div style="background:var(--cream);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem;border-left:4px solid '+(ag.cor||'#D4A0A8')+'">'
        +'<div style="font-weight:600;font-size:13px;margin-bottom:4px">'+_agServicos(ag)+'</div>'
        +'<div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:12px;color:var(--text-mid)">'
        +'<span>📅 '+real+'/'+ag.sessoes.length+' sessões</span>'
        +(saldo.sinal>0?'<span>💰 Sinal: '+fmtMoney(saldo.sinal)+'</span>':'')
        +(saldo.totalPacote>0?'<span>Total: '+fmtMoney(saldo.totalPacote)+'</span>':'')
        +(saldo.totalPago>0?'<span>Pago: '+fmtMoney(saldo.totalPago)+'</span>':'')
        +(saldo.saldo>0?'<span style="color:var(--danger);font-weight:600">Restante: '+fmtMoney(saldo.saldo)+'</span>':'<span style="color:var(--success)">✓ Quitado</span>')
        +'</div></div>';
    }).join('');
  }

  if (aba==='atendimentos') {
    if(!c.atendimentos.length) return '<div class="empty-state" style="padding:2rem"><div class="empty-icon">💆</div><p>Nenhum atendimento</p></div>';
    var ats=c.atendimentos.slice().sort(function(a,b){return b.data.localeCompare(a.data);});
    return '<div class="table-wrap"><table style="width:100%;font-size:12px"><thead><tr><th>Data</th><th>Serviço</th><th>Pagamento</th><th>Valor</th></tr></thead><tbody>'
      +ats.map(function(a){
        var srvIds=a.servicoIds||[];
        var nomes=srvIds.map(function(id){var sv=db.servicos.find(function(x){return x.id===id;});return sv?sv.nome:id;}).join(' + ')||(a.servicoNomesCache||[]).join(' + ')||'—';
        return '<tr><td>'+fmtDate(a.data)+'</td><td style="font-size:11px">'+nomes+'</td><td><span class="badge-pill '+pagtoBadge(a.pagto)+'">'+pagtoLabel(a.pagto)+'</span></td><td><strong>'+fmtMoney(a.valor)+'</strong></td></tr>';
      }).join('')+'</tbody></table></div>';
  }

  if (aba==='anamnese') {
    if(!c.anamneses.length) return '<div class="empty-state" style="padding:2rem"><div class="empty-icon">📋</div><p>Nenhuma anamnese</p></div>';
    return c.anamneses.map(function(a){
      var p2=a.pessoais||{},s=a.saude||{},hb=a.habitos||{};
      return '<div style="background:var(--cream);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem">'
        +'<div style="font-size:10px;letter-spacing:2px;color:var(--gold-dark);text-transform:uppercase;margin-bottom:0.5rem">Ficha · '+(a.dataCadastro||'—')+'</div>'
        +'<div class="detail-box" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">'
        +_dField('Doença',s.doencaQual||s.doenca||'—')+_dField('Medicação',s.medicacaoQual||s.medicacao||'—')
        +_dField('Água/dia',hb.agua||'—')+_dField('Atividade',hb.atividadeQual||hb.atividade||'—')+_dField('Alimentação',hb.alimentacao||'—')
        +'</div>'
        +'<div style="margin-top:0.5rem;text-align:right"><button onclick="showSection(\'anamnese\');editarAnamnese(\''+a.id+'\')" class="btn btn-secondary btn-sm" style="font-size:11px">Ver ficha completa</button></div>'
        +'</div>';
    }).join('');
  }

  if (aba==='fichas') {
    if(!c.fichasCustom.length) return '<div class="empty-state" style="padding:2rem"><div class="empty-icon">📝</div><p>Nenhuma ficha custom</p></div>';
    return c.fichasCustom.map(function(f){
      return '<div style="background:var(--cream);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">'
        +'<div><div style="font-weight:600;font-size:13px">'+(f.modelo_nome||'Sem modelo')+'</div>'
        +'<div style="font-size:11px;color:var(--text-light)">'+(f.dataCadastro||'—')+(f.assinatura?' · ✍️ Assinada':' · ⏳ Pendente')+'</div></div>'
        +'<button onclick="verFichaCustom(\''+f.id+'\')" class="btn btn-primary btn-sm" style="font-size:11px">Ver ficha</button>'
        +'</div>';
    }).join('');
  }
  return '';
}

function _toggleClienteCard(key) {
  var wrap=document.getElementById('cli-body-'+key);
  var icon=document.getElementById('icon-cli-'+key);
  if(!wrap) return;
  var isOpen=wrap.classList.contains('open');
  document.querySelectorAll('.agenda-sessoes-wrap.open').forEach(function(el){el.classList.remove('open');});
  document.querySelectorAll('.expand-icon.open').forEach(function(el){el.classList.remove('open');});
  if(!isOpen){wrap.classList.add('open');if(icon)icon.classList.add('open');}
}

// ── Edição financeira inline ──
function _finEditarAtend(id) {
  ['fin-valor-view-date-','fin-pagto-view-','fin-valor-view-'].forEach(function(p){var el=document.getElementById(p+id);if(el)el.style.display='none';});
  ['fedit-data-','fedit-pagto-','fedit-valor-'].forEach(function(p){var el=document.getElementById(p+id);if(el)el.style.display='inline-block';});
  var eb=document.getElementById('fin-btn-edit-'+id);if(eb)eb.style.display='none';
  var sb=document.getElementById('fin-btn-save-'+id);if(sb)sb.style.display='inline-block';
  var cb=document.getElementById('fin-btn-cancel-'+id);if(cb)cb.style.display='inline-block';
}
function _finCancelarAtend(id) {
  ['fin-valor-view-date-','fin-pagto-view-','fin-valor-view-'].forEach(function(p){var el=document.getElementById(p+id);if(el)el.style.display='inline';});
  ['fedit-data-','fedit-pagto-','fedit-valor-'].forEach(function(p){var el=document.getElementById(p+id);if(el)el.style.display='none';});
  var eb=document.getElementById('fin-btn-edit-'+id);if(eb)eb.style.display='inline-block';
  var sb=document.getElementById('fin-btn-save-'+id);if(sb)sb.style.display='none';
  var cb=document.getElementById('fin-btn-cancel-'+id);if(cb)cb.style.display='none';
}
function _finSalvarAtend(id) {
  var a=db.atendimentos.find(function(x){return x.id===id;});
  if(!a) return;
  a.valor=parseFloat(document.getElementById('fedit-valor-'+id).value)||0;
  a.pagto=document.getElementById('fedit-pagto-'+id).value;
  var nd=document.getElementById('fedit-data-'+id).value;
  if(nd) a.data=nd;
  saveData();
  if(typeof _salvarAtendimento==='function') _salvarAtendimento(a);
  showToast('✅ Lançamento atualizado!');
  var dv=document.getElementById('fin-valor-view-date-'+id);if(dv)dv.textContent=fmtDate(a.data);
  var pv=document.getElementById('fin-pagto-view-'+id);if(pv)pv.innerHTML='<span class="badge-pill '+pagtoBadge(a.pagto)+'">'+pagtoLabel(a.pagto)+'</span>';
  var vv=document.getElementById('fin-valor-view-'+id);if(vv)vv.textContent=fmtMoney(a.valor);
  _finCancelarAtend(id);
}

// ── Gerar link dashboard cliente ──
async function gerarLinkCliente(nomeCliente) {
  var token = Math.random().toString(36).substr(2,9)+Math.random().toString(36).substr(2,9);
  var todos = _consolidarClientes();
  var cli = todos.find(function(c){ return _normNome(c.nome) === _normNome(nomeCliente); });
  var cpfLink = cli && cli.pessoais && cli.pessoais.cpf ? cli.pessoais.cpf.replace(/\D/g,'') : '';
  var nomesLink = [nomeCliente];
  if (cli) {
    cli.agenda.forEach(function(ag){ if(ag.cliente && nomesLink.indexOf(ag.cliente)<0) nomesLink.push(ag.cliente); });
    cli.atendimentos.forEach(function(a){ if(a.cliente && nomesLink.indexOf(a.cliente)<0) nomesLink.push(a.cliente); });
  }
  var resp = await fetch(SUPA_URL+'/rest/v1/links_clientes',{method:'POST',headers:{'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify({id:token,nome_cliente:nomeCliente,cpf_cliente:cpfLink,nomes_alternativos:nomesLink,ativo:true})});
  if(!resp.ok){showToast('Erro ao gerar link.');return;}
  var link='https://lizafigueiredoestetica-debug.github.io/cliente/cliente.html?id='+token;
  try{await navigator.clipboard.writeText(link);showToast('✅ Link copiado!');}catch(e){}
  _mostrarModalLink(nomeCliente,link);
}
function _mostrarModalLink(nome,link){
  var old=document.getElementById('modal-link-cliente');if(old)old.remove();
  var modal=document.createElement('div');
  modal.id='modal-link-cliente';
  modal.style.cssText='position:fixed;inset:0;background:rgba(28,28,30,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML='<div style="background:white;border-radius:16px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden">'
    +'<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);display:flex;justify-content:space-between;align-items:center">'
    +'<div style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">🔗 Link gerado!</div>'
    +'<button onclick="document.getElementById(\'modal-link-cliente\').remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer">✕</button></div>'
    +'<div style="padding:1.5rem">'
    +'<div style="font-size:12px;color:var(--text-light);margin-bottom:0.5rem">Dashboard exclusivo de <strong>'+nome+'</strong></div>'
    +'<div style="background:var(--cream);border-radius:8px;padding:0.75rem 1rem;font-size:12px;color:var(--text-mid);word-break:break-all;border:1px solid var(--border);margin-bottom:1rem">'+link+'</div>'
    +'<div style="display:flex;gap:0.75rem;flex-wrap:wrap">'
    +'<button onclick="navigator.clipboard.writeText(\''+link+'\');showToast(\'✅ Link copiado!\')" class="btn btn-primary" style="flex:1">📋 Copiar Link</button>'
    +'<button onclick="window.open(\'https://wa.me/?text=\'+encodeURIComponent(\'Olá! 🌸 Seu espaço exclusivo:\\n'+link+'\'),\'_blank\')" style="background:#25D366;color:white;border:none;border-radius:8px;padding:0.65rem 1.25rem;font-family:Jost,sans-serif;font-size:12px;font-weight:500;cursor:pointer;flex:1">💬 Enviar WhatsApp</button>'
    +'</div></div></div>';
  document.body.appendChild(modal);
  modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});
}

// ── Aniversariantes ──
var _anivMesAtual=new Date().getMonth()+1;
var _anivAnoAtual=new Date().getFullYear();
var _MESES_ANIV=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function anivMesAnterior(){_anivMesAtual--;if(_anivMesAtual<1){_anivMesAtual=12;_anivAnoAtual--;}renderAniversariantesAba();}
function anivMesProximo(){_anivMesAtual++;if(_anivMesAtual>12){_anivMesAtual=1;_anivAnoAtual++;}renderAniversariantesAba();}
function anivMesAtual(){var a=new Date();_anivMesAtual=a.getMonth()+1;_anivAnoAtual=a.getFullYear();renderAniversariantesAba();}
function renderAniversariantesAba(){
  var el=document.getElementById('anivListaCompleta');
  var titulo=document.getElementById('anivMesTitulo');
  var contador=document.getElementById('anivContador');
  if(!el)return;
  if(titulo)titulo.textContent=_MESES_ANIV[_anivMesAtual-1]+' '+_anivAnoAtual;
  var hoje=new Date();var mesHoje=hoje.getMonth()+1;var diaHoje=hoje.getDate();var anoHoje=hoje.getFullYear();
  var lista=[];
  db.anamneses.forEach(function(a){
    if(!a.pessoais||!a.pessoais.dataNasc)return;
    var partes=a.pessoais.dataNasc.split('-');if(partes.length<3)return;
    var anoNasc=parseInt(partes[0]);var mes=parseInt(partes[1]);var dia=parseInt(partes[2]);
    if(mes!==_anivMesAtual)return;
    var idade=_anivAnoAtual-anoNasc;
    var isHoje=(mes===mesHoje&&dia===diaHoje&&_anivAnoAtual===anoHoje);
    var jaPAssou=(_anivAnoAtual===anoHoje&&mes===mesHoje&&dia<diaHoje);
    var tel=a.pessoais.telefone?a.pessoais.telefone.replace(/\D/g,''):'';
    lista.push({nome:a.pessoais.nome||'—',dia:dia,mes:mes,idade:idade,tel:tel,isHoje:isHoje,jaPAssou:jaPAssou});
  });
  lista.sort(function(a,b){return a.dia-b.dia;});
  if(contador)contador.textContent=lista.length+(lista.length===1?' aniversariante':' aniversariantes');
  if(!lista.length){el.innerHTML='<div class="empty-state" style="padding:3rem"><div class="empty-icon">🎂</div><p>Nenhum aniversariante em '+_MESES_ANIV[_anivMesAtual-1]+'</p></div>';return;}
  el.innerHTML='<div style="display:flex;flex-direction:column;gap:0.5rem">'+lista.map(function(a){
    var msg=_getMensagem('aniversario').replace(/{nome}/g,a.nome.split(' ')[0]);
    var waUrl='https://wa.me/'+(a.tel?'55'+a.tel:'')+'?text='+encodeURIComponent(msg);
    var bgCard=a.isHoje?'background:linear-gradient(135deg,#FFF8F9,#FFF0F5);border:1px solid #D4A0A8':'background:white;border:1px solid var(--border)';
    var labelStatus=a.isHoje?'<span style="background:#D4A0A8;color:white;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600">🎂 Hoje!</span>':a.jaPAssou?'<span style="background:#F5F5F5;color:var(--text-light);padding:3px 10px;border-radius:20px;font-size:11px">✓ Passou</span>':'<span style="background:#EDF4FF;color:#1565C0;padding:3px 10px;border-radius:20px;font-size:11px">Dia '+String(a.dia).padStart(2,'0')+'</span>';
    return '<div style="'+bgCard+';border-radius:12px;padding:0.9rem 1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem">'
      +'<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">'
      +'<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#D4A0A8,#B07880);display:flex;align-items:center;justify-content:center;color:white;font-family:Cormorant Garamond,serif;font-size:18px;flex-shrink:0">'+a.nome.charAt(0).toUpperCase()+'</div>'
      +'<div><div style="font-weight:600;font-size:14px;color:var(--text-dark)">'+a.nome+'</div>'
      +'<div style="font-size:12px;color:var(--text-light);margin-top:2px">'+String(a.dia).padStart(2,'0')+'/'+String(a.mes).padStart(2,'0')+(a.idade>0?' &nbsp;·&nbsp; '+a.idade+' anos':'')+(a.tel?' &nbsp;·&nbsp; '+a.tel:'')+'</div></div>'
      +labelStatus+'</div>'
      +'<div>'+(a.tel?'<button onclick="window.open(\''+waUrl.replace(/'/g,"\\'")+'\')" style="background:#E7F7EE;border:1px solid #7DB87D;color:#276749;border-radius:8px;padding:6px 14px;font-size:12px;cursor:pointer">💬 Parabenizar</button>':'<span style="font-size:11px;color:var(--text-light)">Sem telefone</span>')+'</div>'
      +'</div>';
  }).join('')+'</div>';
}

// ── Check-ins ──
var _checkinPag=1;
var _POR_PAG_CK=20;
function _coletarCheckins(){
  var lista=[];
  db.agenda.forEach(function(ag){
    ag.sessoes.forEach(function(s,idx){
      if(!s.checkinData)return;
      var srvIds=s.servicoIds||[];
      var srvNome=srvIds.length?srvIds.map(function(id){var sv=db.servicos.find(function(x){return x.id===id;});return sv?sv.nome:id;}).join(' + '):(s.servico||_agServicos(ag)||'—');
      var partes=s.checkinData.split('/');
      var dataIso=partes.length===3?partes[2]+'-'+partes[1]+'-'+partes[0]:s.checkinData;
      lista.push({dataIso:dataIso,dataFmt:s.checkinData,hora:s.checkinHora||'—',nome:s.checkinNome||ag.cliente,servico:srvNome,sessao:idx+1,status:s.status});
    });
  });
  lista.sort(function(a,b){var c=b.dataIso.localeCompare(a.dataIso);return c!==0?c:b.hora.localeCompare(a.hora);});
  return lista;
}
function renderCheckins(){
  var tbody=document.getElementById('tbodyCheckins');
  var resumoEl=document.getElementById('checkinResumo');
  var pagEl=document.getElementById('pagCheckins');
  if(!tbody)return;
  var busca=((document.getElementById('filtCheckinNome')||{value:''}).value||'').toLowerCase().trim();
  var de=((document.getElementById('filtCheckinDe')||{value:''}).value||'');
  var ate=((document.getElementById('filtCheckinAte')||{value:''}).value||'');
  var lista=_coletarCheckins();
  if(busca)lista=lista.filter(function(c){return c.nome.toLowerCase().indexOf(busca)>=0;});
  if(de)lista=lista.filter(function(c){return c.dataIso>=de;});
  if(ate)lista=lista.filter(function(c){return c.dataIso<=ate;});
  if(resumoEl){var cu={};lista.forEach(function(c){cu[c.nome.toLowerCase()]=1;});resumoEl.innerHTML=lista.length?'<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:0.5rem"><span style="background:#E7F7EE;color:#276749;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500">✅ '+lista.length+' check-in'+(lista.length>1?'s':'')+'</span><span style="background:#EDF4FF;color:#1565C0;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500">👤 '+Object.keys(cu).length+' cliente'+(Object.keys(cu).length>1?'s':'')+'</span></div>':'';}
  if(!lista.length){tbody.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">✅</div><p>Nenhum check-in encontrado</p></div></td></tr>';if(pagEl)pagEl.innerHTML='';return;}
  var totalPags=Math.ceil(lista.length/_POR_PAG_CK);
  if(_checkinPag>totalPags)_checkinPag=1;
  var inicio=(_checkinPag-1)*_POR_PAG_CK;
  var pagina=lista.slice(inicio,inicio+_POR_PAG_CK);
  tbody.innerHTML=pagina.map(function(c){
    var statusBadge=c.status==='realizado'?'<span class="badge-realizado">✓ Realizado</span>':'<span class="badge-presente">✅ Presente</span>';
    return '<tr><td>'+c.dataFmt+'</td><td><strong style="color:var(--gold-dark)">'+c.hora+'</strong></td><td><strong>'+c.nome+'</strong></td><td style="font-size:12px;color:var(--text-mid)">'+c.servico+'</td><td style="font-size:12px;color:var(--text-light);text-align:center">Sessão '+c.sessao+'</td><td>'+statusBadge+'</td></tr>';
  }).join('');
  if(pagEl){
    if(totalPags<=1){pagEl.innerHTML='';return;}
    var ph='<div style="display:flex;align-items:center;gap:0.5rem;padding:1rem;flex-wrap:wrap">';
    ph+='<button onclick="_checkinPag=Math.max(1,_checkinPag-1);renderCheckins()" '+(_checkinPag===1?'disabled':'')+' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">‹</button>';
    for(var p2=1;p2<=totalPags;p2++){var at2=p2===_checkinPag;ph+='<button onclick="_checkinPag='+p2+';renderCheckins()" style="padding:4px 10px;border:1px solid '+(at2?'#D4A0A8':'var(--border)')+';border-radius:6px;background:'+(at2?'#D4A0A8':'white')+';color:'+(at2?'white':'inherit')+';cursor:pointer;font-size:12px">'+p2+'</button>';}
    ph+='<button onclick="_checkinPag=Math.min('+totalPags+',_checkinPag+1);renderCheckins()" '+(_checkinPag===totalPags?'disabled':'')+' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">›</button>';
    ph+='<span style="font-size:11px;color:var(--text-light)">'+(inicio+1)+'-'+Math.min(inicio+_POR_PAG_CK,lista.length)+' de '+lista.length+'</span></div>';
    pagEl.innerHTML=ph;
  }
}
function exportCheckinsCsv(){
  var busca=((document.getElementById('filtCheckinNome')||{value:''}).value||'').toLowerCase().trim();
  var de=((document.getElementById('filtCheckinDe')||{value:''}).value||'');
  var ate=((document.getElementById('filtCheckinAte')||{value:''}).value||'');
  var lista=_coletarCheckins();
  if(busca)lista=lista.filter(function(c){return c.nome.toLowerCase().indexOf(busca)>=0;});
  if(de)lista=lista.filter(function(c){return c.dataIso>=de;});
  if(ate)lista=lista.filter(function(c){return c.dataIso<=ate;});
  var csv='Data;Hora;Cliente;Serviço;Sessão;Status\n';
  lista.forEach(function(c){csv+=[c.dataFmt,c.hora,c.nome,c.servico,'Sessão '+c.sessao,c.status].map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(';')+'\n';});
  var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='checkins-'+_hoje()+'.csv';a.click();
  showToast('✅ CSV exportado!');
}

// ── Excluir cliente ──
function _excluirCliente(nome) {
  if (!confirm('⚠️ Excluir todos os dados de "' + nome + '"?\n\nIsso remove anamneses e dados do cliente.\nAgenda e atendimentos NÃO são removidos.\n\nTem certeza?')) return;
  // Remover anamneses
  var antes = db.anamneses.length;
  db.anamneses = db.anamneses.filter(function(a) {
    return !a.pessoais || !a.pessoais.nome || a.pessoais.nome.toLowerCase().trim() !== nome.toLowerCase().trim();
  });
  // Ocultar da aba Clientes mesmo que ainda exista na agenda/atendimentos
  if (!db.clientesExcluidos) db.clientesExcluidos = [];
  var nomeNorm = nome.toLowerCase().trim();
  if (db.clientesExcluidos.indexOf(nomeNorm) < 0) db.clientesExcluidos.push(nomeNorm);
  saveData();
  // Persistir exclusão na nuvem para sincronizar com outros dispositivos
  if (typeof _salvarClientesExcluidos === 'function') _salvarClientesExcluidos();
  showToast('✅ Cliente "' + nome + '" removido (' + (antes - db.anamneses.length) + ' ficha(s) excluída(s))');
  renderClientes();
}

