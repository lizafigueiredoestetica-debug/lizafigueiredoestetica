/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — auth.js
   Usuários, login, logout, checkin, permissões
   ===================================================== */

// ===== SISTEMA DE USUÁRIOS =====
var _usuarioLogado = null;

function _getUsuarios() {
  var raw = localStorage.getItem('lizafig_usuarios');
  if (raw) { try { return JSON.parse(raw); } catch(e){} }
  // Usuários padrão
  var padrao = [
    { id: 'u1', nome: 'Liza Figueiredo', usuario: 'liza', senha: '1234', nivel: 'admin' },
    { id: 'u2', nome: 'Operador', usuario: 'operador', senha: '1234', nivel: 'operador' }
  ];
  localStorage.setItem('lizafig_usuarios', JSON.stringify(padrao));
  return padrao;
}

function _salvarUsuarios(lista) {
  localStorage.setItem('lizafig_usuarios', JSON.stringify(lista));
}

function fazerLogin() {
  var user = (document.getElementById('loginUser')||{value:''}).value.trim().toLowerCase();
  var pass = (document.getElementById('loginPass')||{value:''}).value;
  var usuarios = _getUsuarios();
  var encontrado = usuarios.find(function(u){ return u.usuario.toLowerCase()===user && u.senha===pass; });
  if (!encontrado) {
    var erro = document.getElementById('loginErro');
    if (erro) erro.style.display = 'block';
    return;
  }
  _usuarioLogado = encontrado;
  sessionStorage.setItem('lizafig_sessao', JSON.stringify(encontrado));
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('loginScreen').style.flexDirection = '';
  _aplicarNivelAcesso();
  var hu = document.getElementById('sidebarUserName');
  if (hu) hu.textContent = encontrado.nome; var av=document.getElementById('sidebarAvatarLetter'); if(av) av.textContent=encontrado.nome.charAt(0).toUpperCase();
  init();
}

function fazerLogout() {
  _usuarioLogado = null;
  sessionStorage.removeItem('lizafig_sessao');
  mostrarLoginScreen();
}

function mostrarLoginScreen() {
  var ls = document.getElementById('loginScreen');
  ls.style.display = 'flex';
  ls.style.flexDirection = 'column';
  var u = document.getElementById('loginUser');
  var p = document.getElementById('loginPass');
  var e = document.getElementById('loginErro');
  if(u) u.value = '';
  if(p) p.value = '';
  if(e) e.style.display = 'none';
  setTimeout(function(){ if(u) u.focus(); }, 100);
}

function _aplicarNivelAcesso() {
  var u = _usuarioLogado;
  if (!u) return;
  var isAdmin = u.nivel === 'admin';
  var perms = u.permissoes || [];
  document.querySelectorAll('.nav-tab[data-perm]').forEach(function(el) {
    var perm = el.getAttribute('data-perm');
    if (isAdmin) { el.style.display = ''; return; }
    // dashboard: mostrar se tiver 'dashboard' OU 'dashboard_financeiro'
    if (perm === 'dashboard') {
      el.style.display = (perms.indexOf('dashboard') >= 0 || perms.indexOf('dashboard_financeiro') >= 0) ? '' : 'none';
      return;
    }
    el.style.display = perms.indexOf(perm) >= 0 ? '' : 'none';
  });
  document.querySelectorAll('[data-perm]').forEach(function(el) {
    if (el.classList.contains('nav-tab')) return;
    var perm = el.getAttribute('data-perm');
    if (isAdmin) { el.style.display = ''; return; }
    el.style.display = perms.indexOf(perm) >= 0 ? '' : 'none';
  });
  var dashFin = document.getElementById('dashFinanceiro');
  if (dashFin) dashFin.style.display = (isAdmin || perms.indexOf('dashboard_financeiro') >= 0) ? '' : 'none';
}

var _TODAS_PERMS = [
  { id: 'agenda', label: '\u{1F4C5} Agenda' },
  { id: 'dashboard', label: '\u{1F4CA} Dashboard (resumo)' },
  { id: 'dashboard_financeiro', label: '\u{1F4B0} Dashboard Financeiro (receita/lucro)' },
  { id: 'atendimentos', label: '\u2728 Atendimentos' },
  { id: 'servicos', label: '\u{1F486} Servi\u00E7os' },
  { id: 'materiais', label: '\u{1F9F4} Materiais' },
  { id: 'despAdm', label: '\u{1F3E2} Despesas Adm.' },
  { id: 'despExtra', label: '\u{1F4B8} Despesas' },
  { id: 'categorias', label: '\u{1F3F7} Categorias' },
  { id: 'anamnese', label: '\u{1F4CB} Anamnese' },
  { id: 'acomp', label: '\u{1F4CA} Acompanhamento' },
  { id: 'exportar', label: '\u2B07 Exportar/Importar Backup' },
  { id: 'limpar', label: '\u{1F5D1} Limpar Dados' }
];

function gerenciarUsuarios() {
  var usuarios = _getUsuarios();
  var linhas = usuarios.map(function(u) {
    var nivelBadge = u.nivel==='admin'
      ? '<span style="background:#E8F5E9;color:#2E7D32;padding:2px 8px;border-radius:10px;font-size:11px">Admin</span>'
      : '<span style="background:#F5F8E8;color:#F57F17;padding:2px 8px;border-radius:10px;font-size:11px">Operador</span>';
    var permsTexto = u.nivel==='admin' ? '<span style="font-size:11px;color:#888">Acesso total</span>'
      : '<span style="font-size:11px;color:#888">'+(u.permissoes||[]).length+' permissões</span>';
    return '<tr style="border-bottom:1px solid #f0e8f0">'
      +'<td style="padding:8px;font-size:13px">'+u.nome+'</td>'
      +'<td style="padding:8px;font-size:13px">'+u.usuario+'</td>'
      +'<td style="padding:8px;font-size:13px">'+u.senha+'</td>'
      +'<td style="padding:8px">'+nivelBadge+'</td>'
      +'<td style="padding:8px">'+permsTexto+'</td>'
      +'<td style="padding:8px">'
      +'<button onclick="editarUsuario(\''+u.id+'\')" style="background:none;border:none;color:var(--rose);cursor:pointer;font-size:13px;margin-right:4px">✏️</button>'
      +(u.id!=='u1'?'<button onclick="excluirUsuario(\''+u.id+'\')" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:13px">✕</button>':'')
      +'</td></tr>';
  }).join('');

  var chksNovo = _TODAS_PERMS.map(function(p){
    return '<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;padding:4px 6px;border-radius:6px;border:1px solid #f0e8f0">'
      +'<input type="checkbox" id="nuperm_'+p.id+'" style="accent-color:#D4A0A8"> '+p.label+'</label>';
  }).join('');

  var modal = document.createElement('div');
  modal.id = 'modal-usuarios';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(44,26,34,0.7);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto';
  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    +'<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">'
    +'<span style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">👥 Gerenciar Usuários</span>'
    +'<button onclick="document.getElementById(\'modal-usuarios\').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">✕</button>'
    +'</div><div style="padding:1.5rem">'
    +'<table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem">'
    +'<thead><tr style="border-bottom:2px solid var(--border)">'
    +'<th style="padding:8px;font-size:10px;letter-spacing:1px;color:var(--text-light);text-align:left">NOME</th>'
    +'<th style="padding:8px;font-size:10px;letter-spacing:1px;color:var(--text-light);text-align:left">USUÁRIO</th>'
    +'<th style="padding:8px;font-size:10px;letter-spacing:1px;color:var(--text-light);text-align:left">SENHA</th>'
    +'<th style="padding:8px;font-size:10px;letter-spacing:1px;color:var(--text-light);text-align:left">NÍVEL</th>'
    +'<th style="padding:8px;font-size:10px;letter-spacing:1px;color:var(--text-light);text-align:left">PERMISSÕES</th>'
    +'<th></th></tr></thead><tbody>'+linhas+'</tbody></table>'
    +'<div style="border-top:1px solid var(--border);padding-top:1rem">'
    +'<div style="font-size:11px;letter-spacing:2px;color:var(--text-light);margin-bottom:0.75rem">NOVO USUÁRIO</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem">'
    +'<input id="nu-nome" placeholder="Nome completo" style="padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">'
    +'<input id="nu-user" placeholder="Usuário (login)" style="padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">'
    +'<input id="nu-pass" placeholder="Senha" style="padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">'
    +'<select id="nu-nivel" onchange="togglePermissoesNovo()" style="padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none;background:white">'
    +'<option value="operador">Operador</option><option value="admin">Admin</option></select>'
    +'</div>'
    +'<div id="nu-perms-wrap" style="margin-bottom:1rem">'
    +'<div style="font-size:10px;letter-spacing:1px;color:var(--text-light);margin-bottom:0.5rem;text-transform:uppercase">Permissões de acesso</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">'+chksNovo+'</div></div>'
    +'<div style="display:flex;gap:0.75rem">'
    +'<button class="btn btn-primary" onclick="adicionarUsuario()">+ Adicionar</button>'
    +'<button class="btn btn-secondary" onclick="document.getElementById(\'modal-usuarios\').remove()">Fechar</button>'
    +'</div></div></div></div>';
  document.body.appendChild(modal);
}

function togglePermissoesNovo() {
  var nivel = (document.getElementById('nu-nivel')||{value:'operador'}).value;
  var wrap = document.getElementById('nu-perms-wrap');
  if (wrap) wrap.style.display = nivel==='admin' ? 'none' : 'block';
}

function editarUsuario(id) {
  var u = _getUsuarios().find(function(x){ return x.id===id; });
  if (!u) return;
  var chksEditar = _TODAS_PERMS.map(function(p){
    var checked = (u.permissoes||[]).indexOf(p.id)>=0;
    return '<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;padding:4px 6px;border-radius:6px;border:1px solid #f0e8f0">'
      +'<input type="checkbox" id="euperm_'+p.id+'"'+(checked?' checked':'')+' style="accent-color:#D4A0A8"> '+p.label+'</label>';
  }).join('');
  var modal = document.createElement('div');
  modal.id = 'modal-editar-usuario';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(44,26,34,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto';
  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    +'<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">'
    +'<span style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">✏️ Editar · '+u.nome+'</span>'
    +'<button onclick="document.getElementById(\'modal-editar-usuario\').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">✕</button>'
    +'</div><div style="padding:1.5rem">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">'
    +'<div><label style="font-size:10px;letter-spacing:1px;color:var(--text-light);text-transform:uppercase">Nome</label>'
    +'<input id="eu-nome" value="'+u.nome+'" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none;box-sizing:border-box"></div>'
    +'<div><label style="font-size:10px;letter-spacing:1px;color:var(--text-light);text-transform:uppercase">Usuário</label>'
    +'<input id="eu-user" value="'+u.usuario+'" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none;box-sizing:border-box"></div>'
    +'<div><label style="font-size:10px;letter-spacing:1px;color:var(--text-light);text-transform:uppercase">Senha</label>'
    +'<input id="eu-pass" value="'+u.senha+'" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none;box-sizing:border-box"></div>'
    +(u.id==='u1'
      ? '<div><label style="font-size:10px;letter-spacing:1px;color:var(--text-light);text-transform:uppercase">Nível</label><input value="Admin" disabled style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-size:13px;background:#f5f5f5;box-sizing:border-box"><input type="hidden" id="eu-nivel" value="admin"></div>'
      : '<div><label style="font-size:10px;letter-spacing:1px;color:var(--text-light);text-transform:uppercase">Nível</label><select id="eu-nivel" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none;background:white;box-sizing:border-box"><option value="operador"'+(u.nivel==='operador'?' selected':'')+'>Operador</option><option value="admin"'+(u.nivel==='admin'?' selected':'')+'>Admin</option></select></div>'
    )
    +'</div>'
    +'<div style="margin-bottom:1rem">'
    +'<div style="font-size:10px;letter-spacing:1px;color:var(--text-light);margin-bottom:0.5rem;text-transform:uppercase">Permissões de acesso</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">'+chksEditar+'</div></div>'
    +'<div style="display:flex;gap:0.75rem">'
    +'<button class="btn btn-primary" onclick="salvarEdicaoUsuario(\''+id+'\')">✓ Salvar</button>'
    +'<button class="btn btn-secondary" onclick="document.getElementById(\'modal-editar-usuario\').remove()">Cancelar</button>'
    +'</div></div></div>';
  document.body.appendChild(modal);
}

function salvarEdicaoUsuario(id) {
  var usuarios = _getUsuarios();
  var u = usuarios.find(function(x){ return x.id===id; });
  if (!u) return;
  u.nome = document.getElementById('eu-nome').value.trim();
  u.usuario = document.getElementById('eu-user').value.trim().toLowerCase();
  u.senha = document.getElementById('eu-pass').value;
  u.nivel = document.getElementById('eu-nivel').value;
  u.permissoes = _TODAS_PERMS.filter(function(p){
    var el = document.getElementById('euperm_'+p.id);
    return el && el.checked;
  }).map(function(p){ return p.id; });
  _salvarUsuarios(usuarios);
  document.getElementById('modal-editar-usuario').remove();
  document.getElementById('modal-usuarios').remove();
  gerenciarUsuarios();
  showToast('✅ Usuário atualizado!');
}

function adicionarUsuario() {
  var nome = (document.getElementById('nu-nome')||{value:''}).value.trim();
  var user = (document.getElementById('nu-user')||{value:''}).value.trim().toLowerCase();
  var pass = (document.getElementById('nu-pass')||{value:''}).value;
  var nivel = (document.getElementById('nu-nivel')||{value:'operador'}).value;
  if (!nome||!user||!pass) { showToast('Preencha todos os campos!'); return; }
  var usuarios = _getUsuarios();
  if (usuarios.find(function(u){ return u.usuario===user; })) { showToast('Usuário já existe!'); return; }
  var perms = nivel==='admin' ? [] : _TODAS_PERMS.filter(function(p){
    var el = document.getElementById('nuperm_'+p.id);
    return el && el.checked;
  }).map(function(p){ return p.id; });
  usuarios.push({ id: uid(), nome: nome, usuario: user, senha: pass, nivel: nivel, permissoes: perms });
  _salvarUsuarios(usuarios);
  document.getElementById('modal-usuarios').remove();
  gerenciarUsuarios();
  showToast('✅ Usuário criado!');
}

function excluirUsuario(id) {
  if (!confirm('Excluir este usuário?')) return;
  var usuarios = _getUsuarios().filter(function(u){ return u.id!==id; });
  _salvarUsuarios(usuarios);
  document.getElementById('modal-usuarios').remove();
  gerenciarUsuarios();
  showToast('Usuário removido.');
}

function mascaraTel(el) {
  var v = el.value.replace(/\D/g,'').substring(0,11);
  if (v.length <= 10) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');
  else v = v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');
  el.value = v;
}
function mascaraCpf(el) {
  var v = el.value.replace(/\D/g,'').substring(0,11);
  if(v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/,'$1.$2.$3-$4');
  else if(v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/,'$1.$2.$3');
  else if(v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/,'$1.$2');
  el.value = v;
}

// ── Som de check-in ──
function _tocarSomCheckin() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    function _ding(freq, inicio, dur) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + inicio);
      gain.gain.setValueAtTime(0.4, ctx.currentTime + inicio);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + dur);
      osc.start(ctx.currentTime + inicio);
      osc.stop(ctx.currentTime + inicio + dur);
    }
    _ding(880, 0, 0.4);
    _ding(1100, 0.2, 0.5);
  } catch(e) {}
}

async function fazerCheckin() {
  var cpf = (document.getElementById('checkinCpf')||{value:''}).value.replace(/\D/g,'');
  var msg = document.getElementById('checkinMsg');
  if (!cpf || cpf.length < 11) {
    msg.style.display = 'block';
    msg.style.color = '#F48080';
    msg.innerHTML = 'Digite um CPF válido.';
    return;
  }

  // Garantir dados atualizados do Supabase antes de buscar
  msg.style.display = 'block';
  msg.style.color = '#FAF0F2';
  msg.innerHTML = 'Verificando...';
  await _carregarDaNuvem();

  // Buscar ficha pelo CPF
  var ficha = null;
  for (var i = 0; i < db.anamneses.length; i++) {
    var p = db.anamneses[i].pessoais || {};
    var cpfFicha = (p.cpf||'').replace(/\D/g,'');
    if (cpfFicha === cpf) { ficha = db.anamneses[i]; break; }
  }

  if (!ficha) {
    msg.style.display = 'block';
    msg.style.color = '#F48080';
    msg.innerHTML = 'CPF não encontrado.<br>Consulte a recepção.';
    return;
  }

  var nome = (ficha.pessoais||{}).nome || 'Cliente';
  var hoje = _hoje();

  // Buscar sessão do dia
  var hoje = _hoje();
  var sessaoEncontrada = null;
  var agEncontrado = null;
  var nomeNorm = nome.toLowerCase().trim();
  for (var a = 0; a < db.agenda.length; a++) {
    var ag = db.agenda[a];
    var agNome = (ag.cliente||'').toLowerCase().trim();
    // Comparar nome exato OU nome contido (para variações de escrita)
    var nomeOk = agNome === nomeNorm ||
                 agNome.includes(nomeNorm) ||
                 nomeNorm.includes(agNome) ||
                 agNome.split(' ')[0] === nomeNorm.split(' ')[0];
    if (!nomeOk) continue;
    for (var s = 0; s < ag.sessoes.length; s++) {
      var sData = ag.sessoes[s].data;
      var sStatus = ag.sessoes[s].status;
      // Aceitar sessão de hoje ou de ontem (UTC-3 às vezes pega ontem)
      var eHoje = sData === hoje;
      if (eHoje && sStatus !== 'realizado') {
        sessaoEncontrada = ag.sessoes[s];
        agEncontrado = ag;
        break;
      }
    }
    if (sessaoEncontrada) break;
  }

  if (!sessaoEncontrada) {
    msg.style.display = 'block';
    msg.style.color = '#FAF0F2';
    msg.innerHTML = 'Olá, <strong style="color:#8A9A5A">' + nome.split(' ')[0] + '</strong>!<br>Nenhuma sessão agendada para hoje.';
    return;
  }

  // Marcar como presente e registrar hora
  var agora = new Date();
  var horaCheckin = agora.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  var dataCheckin = agora.toLocaleDateString('pt-BR');
  sessaoEncontrada.status = 'presente';
  sessaoEncontrada.checkinHora = horaCheckin;
  sessaoEncontrada.checkinData = dataCheckin;
  sessaoEncontrada.checkinNome = nome;
  saveData();
  _tocarSomCheckin();
  // Salvar sessão individualmente no Supabase
  if (agEncontrado) _salvarSessoes(agEncontrado.id, agEncontrado.sessoes);
  addLog('INFO', '✅ Check-in — ' + nome + ' | ' + servico + (sessaoEncontrada.hora?' às '+sessaoEncontrada.hora:'') + ' | ' + sessaoEncontrada.checkinHora);
  if (typeof renderAgenda === 'function') renderAgenda();

  var servico = sessaoEncontrada.servico || _agServicos(agEncontrado);
  var hora = sessaoEncontrada.hora ? ' às ' + sessaoEncontrada.hora : '';

  // Mostrar tela de boas-vindas
  mostrarBoasVindas(nome, servico, sessaoEncontrada.hora, 7000);
}

function mudaPagSessao(agKey, pag) {
  if (!window._acompSessaoPag) window._acompSessaoPag = {};
  window._acompSessaoPag[agKey] = pag;
  renderAcomp();
}

function _buildPagHtml(pag, totalPags, total, porPag, varName, renderFn) {
  var inicio = (pag-1)*porPag+1;
  var fim = Math.min(pag*porPag, total);
  var html = '<div style="display:flex;align-items:center;gap:0.4rem;padding:0.75rem 0;flex-wrap:wrap">';
  html += '<button onclick="'+varName+'=Math.max(1,'+varName+'-1);'+renderFn+'" '+(pag===1?'disabled':'')+' class="btn btn-secondary btn-sm">‹ Anterior</button>';
  for (var p=1; p<=totalPags; p++) {
    html += '<button onclick="'+varName+'='+p+';'+renderFn+'" style="padding:4px 10px;border:1px solid '+(p===pag?'var(--rose)':'var(--border)')+';border-radius:6px;background:'+(p===pag?'var(--rose)':'white')+';color:'+(p===pag?'white':'inherit')+';cursor:pointer;font-size:12px">'+p+'</button>';
  }
  html += '<button onclick="'+varName+'=Math.min('+totalPags+','+varName+'+1);'+renderFn+'" '+(pag===totalPags?'disabled':'')+' class="btn btn-secondary btn-sm">Próximo ›</button>';
  html += '<span style="font-size:11px;color:var(--text-light);margin-left:4px">'+inicio+'-'+fim+' de '+total+'</span>';
  html += '</div>';
  return html;
}

function setFiltSessao(agKey, tipo, valor) {
  if (!window._filtSessao) window._filtSessao = {};
  if (!window._acompSessaoPag) window._acompSessaoPag = {};
  window._filtSessao['filtS_'+tipo+'_'+agKey] = valor;
  window._acompSessaoPag[agKey] = 1;
  renderAcomp();
}

function limparFiltSessao(agKey) {
  if (!window._filtSessao) window._filtSessao = {};
  if (!window._acompSessaoPag) window._acompSessaoPag = {};
  window._filtSessao['filtS_de_'+agKey] = '';
  window._filtSessao['filtS_ate_'+agKey] = '';
  window._acompSessaoPag[agKey] = 1;
  renderAcomp();
}

function toggleSidebar() {
  var sb = document.getElementById('appSidebar');
  var ac = document.querySelector('.app-content');
  if (!sb || !ac) return;
  sb.classList.toggle('mini');
  ac.classList.toggle('mini');
  // Salvar estado
  localStorage.setItem('lizafig_sidebar_mini', sb.classList.contains('mini') ? '1' : '0');
}

// START
updateHeaderDate();
setInterval(updateHeaderDate, 1000);
// Restaurar estado da sidebar
if (localStorage.getItem('lizafig_sidebar_mini') === '1') {
  var _sb = document.getElementById('appSidebar');
  var _ac = document.querySelector('.app-content');
  if (_sb) _sb.classList.add('mini');
  if (_ac) _ac.classList.add('mini');
}

