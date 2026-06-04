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
  if (id === 'checkins') renderCheckins();
  if (id === 'clientes') renderClientes();
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
    var key = p.nome.toLowerCase().trim();
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
    var key = ag.cliente.toLowerCase().trim();
    if (!mapa[key]) mapa[key] = { nome: ag.cliente, pessoais: {}, anamneses: [], fichasCustom: [], agenda: [], atendimentos: [] };
    mapa[key].agenda.push(ag);
    // Telefone da agenda
    if (!mapa[key].pessoais.telefone && ag.tel) mapa[key].pessoais.telefone = ag.tel;
  });

  // Fonte 3: atendimentos
  db.atendimentos.forEach(function(a) {
    if (!a.cliente) return;
    var key = a.cliente.toLowerCase().trim();
    if (!mapa[key]) mapa[key] = { nome: a.cliente, pessoais: {}, anamneses: [], fichasCustom: [], agenda: [], atendimentos: [] };
    mapa[key].atendimentos.push(a);
  });

  return Object.values(mapa).sort(function(a, b) { return a.nome.localeCompare(b.nome); });
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

  if (resumoEl) {
    resumoEl.innerHTML = '<span style="font-size:12px;color:var(--text-light)">'
      + clientes.length + ' cliente' + (clientes.length !== 1 ? 's' : '') + (busca ? ' encontrado' + (clientes.length !== 1 ? 's' : '') : '') + '</span>';
  }

  if (!clientes.length) {
    el.innerHTML = '<div class="empty-state" style="padding:3rem"><div class="empty-icon">👥</div><p>Nenhuma cliente encontrada</p></div>';
    return;
  }

  el.innerHTML = clientes.map(function(c) {
    var key = c.nome.toLowerCase().trim().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
    var p = c.pessoais;
    var totalSessoes = 0, realizadas = 0;
    c.agenda.forEach(function(ag) {
      totalSessoes += ag.sessoes.length;
      realizadas += ag.sessoes.filter(function(s){ return s.status === 'realizado'; }).length;
    });
    var ultimoAtend = c.atendimentos.slice().sort(function(a,b){ return b.data.localeCompare(a.data); })[0];
    var totalGasto = c.atendimentos.reduce(function(s,a){ return s + (parseFloat(a.valor)||0); }, 0);

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
      + '<span class="expand-icon" id="icon-cli-'+key+'">▶</span>'
      + '</div>'
      + '</div>'
      // CONTEÚDO EXPANSÍVEL
      + '<div class="agenda-sessoes-wrap" id="cli-body-'+key+'">'
      + _renderFichaCliente(c, key)
      + '</div>'
      + '</div>';
  }).join('');
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
      var saldo = _calcSaldoPacote(ag);
      return '<div style="background:var(--cream);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.75rem;border-left:4px solid '+(ag.cor||'#D4A0A8')+'">'
        + '<div style="font-weight:600;font-size:13px;margin-bottom:4px">'+_agServicos(ag)+(ag.obs?' · <span style="font-weight:400;color:var(--text-light)">'+ag.obs+'</span>':'')+'</div>'
        + '<div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:12px;color:var(--text-mid)">'
        + '<span>📅 '+real+'/'+ag.sessoes.length+' sessões</span>'
        + (saldo.sinal>0?'<span>💰 Sinal: '+fmtMoney(saldo.sinal)+'</span>':'')
        + (saldo.totalPacote>0?'<span>Total: '+fmtMoney(saldo.totalPacote)+'</span>':'')
        + (saldo.totalPago>0?'<span>Pago: '+fmtMoney(saldo.totalPago)+'</span>':'')
        + (saldo.saldo>0?'<span style="color:var(--danger);font-weight:600">Restante: '+fmtMoney(saldo.saldo)+'</span>':'<span style="color:var(--success)">✓ Quitado</span>')
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
        + '<button onclick="abrirFichaAnamnese(\''+a.id+'\')" class="btn btn-secondary btn-sm" style="font-size:11px">Ver ficha completa</button>'
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
