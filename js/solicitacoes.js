/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — solicitacoes.js
   Painel de solicitações de agendamento público
   Aprovar, recusar, WhatsApp, notificações
   ===================================================== */

// ── Buscar solicitações pendentes do Supabase ──
async function _buscarSolicitacoes(status) {
  try {
    var url = SUPA_URL + '/rest/v1/solicitacoes?select=*&order=criado_em.desc&limit=50';
    if (status) url += '&status=eq.' + status;
    var resp = await fetch(url, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    });
    if (!resp.ok) return [];
    return await resp.json();
  } catch(e) { return []; }
}

// ── Atualizar status de uma solicitação ──
async function _atualizarSolicitacao(id, dados) {
  try {
    dados.atualizado_em = new Date().toISOString();
    var resp = await fetch(SUPA_URL + '/rest/v1/solicitacoes?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(dados)
    });
    return resp.ok;
  } catch(e) { return false; }
}

// ── Formatar data para exibição ──
function _fmtDataSolic(iso) {
  if (!iso) return '—';
  var d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
}

// ── Renderizar painel de solicitações no Dashboard ──
async function renderSolicitacoes() {
  var el = document.getElementById('painelSolicitacoes');
  if (!el) return;

  el.innerHTML = '<div style="padding:1rem;color:var(--text-light);font-size:13px">⏳ Carregando...</div>';

  var lista = await _buscarSolicitacoes('pendente');

  // Atualizar badge
  var badge = document.getElementById('badgeSolicitacoes');
  if (badge) badge.textContent = lista.length || '';

  if (!lista.length) {
    el.innerHTML = '<div class="empty-state" style="padding:2rem"><div class="empty-icon">📅</div><p>Nenhuma solicitação pendente</p></div>';
    return;
  }

  el.innerHTML = lista.map(function(s) {
    var dataFmt = _fmtDataSolic(s.data_preferida);
    var hora = s.hora_preferida ? ' às ' + s.hora_preferida : '';
    var criadoEm = s.criado_em ? new Date(s.criado_em).toLocaleString('pt-BR') : '';
    return '<div style="padding:1rem 1.5rem;border-bottom:1px solid var(--border)">'
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">'
      + '<div style="flex:1">'
      + '<div style="font-weight:600;font-size:14px;color:var(--text-dark)">👤 ' + s.nome + '</div>'
      + '<div style="font-size:12px;color:var(--text-light);margin-top:2px">📲 ' + _fmtTel(s.telefone) + ' · Solicitado em ' + criadoEm + '</div>'
      + '<div style="margin-top:0.5rem;font-size:12px;color:var(--text-mid)">📅 Data preferida: <strong>' + dataFmt + hora + '</strong></div>'
      + '<div style="margin-top:0.4rem;font-size:12px;color:var(--text-mid);background:var(--cream);border-radius:6px;padding:0.4rem 0.6rem">💬 ' + (s.observacao || '—') + '</div>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:0.5rem;flex-shrink:0">'
      + '<button class="btn btn-primary btn-sm" onclick="abrirModalAprovar(\'' + s.id + '\',\'' + s.nome.replace(/'/g,"\\'") + '\',\'' + (s.telefone||'') + '\',\'' + (s.data_preferida||'') + '\',\'' + (s.hora_preferida||'') + '\',\'' + (s.observacao||'').replace(/'/g,"\\'").replace(/\n/g,' ') + '\')" style="background:linear-gradient(135deg,#4CAF50,#388E3C)">✅ Aprovar</button>'
      + '<button class="btn btn-danger btn-sm" onclick="abrirModalRecusar(\'' + s.id + '\',\'' + s.nome.replace(/'/g,"\\'") + '\',\'' + (s.telefone||'') + '\')" style="font-size:11px">✗ Recusar</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
}

function _fmtTel(tel) {
  if (!tel) return '—';
  var v = tel.replace(/\D/g,'');
  if (v.length === 11) return '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
  if (v.length === 10) return '(' + v.slice(0,2) + ') ' + v.slice(2,6) + '-' + v.slice(6);
  return tel;
}

// ── Modal APROVAR ──
function abrirModalAprovar(id, nome, tel, dataPref, horaPref, obs) {
  var old = document.getElementById('modal-aprovar');
  if (old) old.remove();

  // Chips de serviços
  var chipsHtml = db.servicos.filter(function(s){ return s.status==='ativo'; }).map(function(s) {
    return '<span class="service-chip" style="font-size:12px;cursor:pointer" onclick="this.classList.toggle(\'selected\')" data-id="' + s.id + '" data-nome="' + s.nome.replace(/"/g,'&quot;') + '">' + s.nome + '</span>';
  }).join('');

  var modal = document.createElement('div');
  modal.id = 'modal-aprovar';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(44,26,34,0.7);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto';

  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    + '<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">'
    + '<span style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">✅ Aprovar Agendamento</span>'
    + '<button onclick="document.getElementById(\'modal-aprovar\').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="padding:1.5rem">'

    // Info da cliente
    + '<div style="background:var(--cream);border-radius:10px;padding:1rem;margin-bottom:1.25rem;font-size:13px">'
    + '<div><strong>👤 Cliente:</strong> ' + nome + '</div>'
    + '<div style="margin-top:4px"><strong>📅 Data preferida:</strong> ' + _fmtDataSolic(dataPref) + (horaPref ? ' às ' + horaPref : '') + '</div>'
    + (obs ? '<div style="margin-top:4px"><strong>💬 Observação:</strong> ' + obs + '</div>' : '')
    + '</div>'

    // Selecionar serviços
    + '<div style="margin-bottom:1rem">'
    + '<div style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;margin-bottom:6px">Serviços a realizar</div>'
    + '<input type="text" placeholder="🔍 Filtrar serviços..." oninput="(function(el){var v=el.value.toLowerCase();el.nextElementSibling.querySelectorAll(\'.service-chip\').forEach(function(c){c.style.display=c.textContent.toLowerCase().includes(v)?\'\':\' none\'});} )(this)" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:12px;font-family:Jost,sans-serif;outline:none;margin-bottom:8px">'
    + '<div id="chips-aprovar" style="display:flex;flex-wrap:wrap;gap:6px;border:1px solid var(--border);border-radius:8px;padding:0.5rem;background:var(--off-white);min-height:44px">'
    + (chipsHtml || '<span style="font-size:12px;color:var(--text-light)">Nenhum serviço ativo cadastrado</span>')
    + '</div>'
    + '</div>'

    // Cor na agenda
    + '<div style="margin-bottom:1rem">'
    + '<div style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;margin-bottom:8px">Cor na Agenda</div>'
    + '<input type="hidden" id="aprovar-cor" value="#D4A0A8">'
    + '<div style="display:flex;flex-wrap:wrap;gap:8px">'
    + '<span onclick="_selecionarCorAprovar(this)" data-cor="#D4A0A8" style="background:#D4A0A8;width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid #B07880;box-shadow:0 0 0 2px white,0 0 0 4px #B07880;transition:all 0.15s" title="Rosa"></span>'
    + '<span onclick="_selecionarCorAprovar(this)" data-cor="#5B9BD5" style="background:#5B9BD5;width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s" title="Azul"></span>'
    + '<span onclick="_selecionarCorAprovar(this)" data-cor="#70AD47" style="background:#70AD47;width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s" title="Verde"></span>'
    + '<span onclick="_selecionarCorAprovar(this)" data-cor="#FF4444" style="background:#FF4444;width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s" title="Vermelho"></span>'
    + '<span onclick="_selecionarCorAprovar(this)" data-cor="#FFC000" style="background:#FFC000;width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s" title="Amarelo"></span>'
    + '<span onclick="_selecionarCorAprovar(this)" data-cor="#9B59B6" style="background:#9B59B6;width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s" title="Lilás"></span>'
    + '<span onclick="_selecionarCorAprovar(this)" data-cor="#8B4513" style="background:#8B4513;width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s" title="Marrom"></span>'
    + '<span onclick="_selecionarCorAprovar(this)" data-cor="#FF8C00" style="background:#FF8C00;width:28px;height:28px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all 0.15s" title="Laranja"></span>'
    + '</div>'
    + '</div>'

    // Data e hora confirmadas

    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">'
    + '<div><div style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;margin-bottom:4px">Data confirmada</div>'
    + '<input type="date" id="aprovar-data" value="' + (dataPref||'') + '" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none"></div>'
    + '<div><div style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;margin-bottom:4px">Horário confirmado</div>'
    + '<input type="time" id="aprovar-hora" value="' + (horaPref||'') + '" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none"></div>'
    + '</div>'

    // Botões
    + '<div style="display:flex;gap:0.75rem;flex-wrap:wrap">'
    + '<button class="btn btn-primary" onclick="confirmarAprovacao(\'' + id + '\',\'' + nome.replace(/'/g,"\\'") + '\',\'' + tel + '\')" style="background:linear-gradient(135deg,#4CAF50,#388E3C)">✅ Confirmar e Agendar</button>'
    + '<button class="btn btn-secondary" onclick="wsMensagemAprovacao(\'' + nome.replace(/'/g,"\\'") + '\',\'' + tel + '\')" style="background:#E7F7EE;border-color:#7DB87D;color:#276749">💬 WhatsApp Confirmação</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'modal-aprovar\').remove()">Cancelar</button>'
    + '</div>'
    + '</div></div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

function _selecionarCorAprovar(el) {
  var cor = el.getAttribute('data-cor');
  if (!cor) return;
  var input = document.getElementById('aprovar-cor');
  if (input) input.value = cor;
  var modal = document.getElementById('modal-aprovar');
  if (modal) modal.querySelectorAll('[data-cor]').forEach(function(b) {
    b.style.border = '3px solid transparent';
    b.style.boxShadow = 'none';
  });
  var r = Math.max(0, parseInt(cor.slice(1,3),16)-50);
  var g = Math.max(0, parseInt(cor.slice(3,5),16)-50);
  var b2 = Math.max(0, parseInt(cor.slice(5,7),16)-50);
  var dark = '#' + [r,g,b2].map(function(v){ return v.toString(16).padStart(2,'0'); }).join('');
  el.style.border = '3px solid ' + dark;
  el.style.boxShadow = '0 0 0 2px white, 0 0 0 4px ' + dark;
}

async function confirmarAprovacao(solId, nome, tel) {
  var data = (document.getElementById('aprovar-data')||{value:''}).value;
  var hora = (document.getElementById('aprovar-hora')||{value:''}).value;

  if (!data) { showToast('Selecione a data confirmada!'); return; }

  // Coletar serviços selecionados
  var chips = document.querySelectorAll('#chips-aprovar .service-chip.selected');
  var servicoIds = [];
  var servicoNomes = [];
  chips.forEach(function(c) {
    servicoIds.push(c.dataset.id);
    servicoNomes.push(c.dataset.nome);
  });

  // Criar agendamento na agenda
  var novaAgenda = {
    id: uid(),
    cliente: nome,
    tel: tel,
    obs: 'Agendamento via solicitação pública',
    sinal: 0,
    sinalPago: false,
    cor: (document.getElementById('aprovar-cor')||{value:'#D4A0A8'}).value || '#D4A0A8',
    servicoIds: servicoIds,
    servicoNome: servicoNomes.join(' + ') || '—',
    sessoes: [{
      data: data,
      hora: hora,
      status: 'pendente',
      servicoIds: servicoIds,
      servico: servicoNomes.join(' + '),
      atendimentoId: null
    }]
  };

  db.agenda.push(novaAgenda);
  saveData();

  // Salvar no Supabase
  await _salvarAgenda(novaAgenda);

  // Marcar solicitação como aprovada
  await _atualizarSolicitacao(solId, { status: 'aprovada' });

  document.getElementById('modal-aprovar').remove();
  renderAll();
  renderSolicitacoes();

  showToast('✅ Agendamento criado para ' + nome + '!');

  // Abrir WhatsApp automaticamente
  wsMensagemAprovacao(nome, tel, data, hora, servicoNomes.join(' + '));
}

function wsMensagemAprovacao(nome, tel, data, hora, servico) {
  var primeiroNome = (nome||'').split(' ')[0];
  var dataFmt = data ? _fmtDataSolic(data) : 'data a combinar';
  var horaFmt = hora ? ' às ' + hora : '';
  var servicoFmt = servico ? '\n💆 Serviço: *' + servico + '*' : '';
  var msg = _getMensagem('aprovacao_agendamento').replace(/{nome}/g, primeiroNome).replace(/{data}/g, dataFmt).replace(/{hora}/g, horaFmt ? ' às ' + horaFmt : '').replace(/{servico}/g, servico||'');
  var telFmt = tel ? '55' + tel.replace(/\D/g,'') : '';
  window.open('https://wa.me/' + telFmt + '?text=' + encodeURIComponent(msg), '_blank');
}

// ── Modal RECUSAR ──
function abrirModalRecusar(id, nome, tel) {
  var old = document.getElementById('modal-recusar');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.id = 'modal-recusar';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(44,26,34,0.7);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem';

  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    + '<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">'
    + '<span style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">✗ Recusar Solicitação</span>'
    + '<button onclick="document.getElementById(\'modal-recusar\').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="padding:1.5rem">'
    + '<div style="background:var(--cream);border-radius:10px;padding:1rem;margin-bottom:1.25rem;font-size:13px">'
    + '<strong>👤 Cliente:</strong> ' + nome
    + '</div>'
    + '<div style="margin-bottom:1rem">'
    + '<div style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;margin-bottom:6px">Motivo (opcional — aparece na mensagem)</div>'
    + '<textarea id="recusar-motivo" rows="3" placeholder="Ex: Agenda cheia nesta data, sem horários disponíveis..." style="width:100%;padding:0.65rem 0.9rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none;resize:vertical"></textarea>'
    + '</div>'
    + '<div style="display:flex;gap:0.75rem;flex-wrap:wrap">'
    + '<button class="btn btn-danger" onclick="confirmarRecusa(\'' + id + '\',\'' + nome.replace(/'/g,"\\'") + '\',\'' + tel + '\')" style="background:#FF3B30;color:white;border:none">✗ Confirmar Recusa</button>'
    + '<button class="btn btn-secondary" onclick="wsMensagemRecusa(\'' + nome.replace(/'/g,"\\'") + '\',\'' + tel + '\')" style="background:#FFF3F3;border-color:#FFCDD2;color:#C62828">💬 WhatsApp Recusa</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'modal-recusar\').remove()">Cancelar</button>'
    + '</div>'
    + '</div></div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

async function confirmarRecusa(solId, nome, tel) {
  await _atualizarSolicitacao(solId, { status: 'recusada' });
  document.getElementById('modal-recusar').remove();
  renderSolicitacoes();
  showToast('Solicitação de ' + nome + ' recusada.');
  wsMensagemRecusa(nome, tel);
}

function wsMensagemRecusa(nome, tel) {
  var motivo = (document.getElementById('recusar-motivo')||{value:''}).value.trim();
  var primeiroNome = (nome||'').split(' ')[0];
  var msg = _getMensagem('recusa_agendamento').replace(/{nome}/g, primeiroNome).replace(/{motivo}/g, motivo ? '📌 ' + motivo : '');
  var telFmt = tel ? '55' + tel.replace(/\D/g,'') : '';
  window.open('https://wa.me/' + telFmt + '?text=' + encodeURIComponent(msg), '_blank');
}

// ── Notificação push ao chegar nova solicitação ──
var _ultimaContSolicitacoes = 0;

async function _verificarNovasSolicitacoes() {
  var lista = await _buscarSolicitacoes('pendente');
  var qtd = lista ? lista.length : 0;
  if (qtd > _ultimaContSolicitacoes && _ultimaContSolicitacoes > 0) {
    var novas = qtd - _ultimaContSolicitacoes;
    // Notificação push se permitido
    if (window.Notification && Notification.permission === 'granted') {
      new Notification('📅 Liza Figueiredo · Nova Solicitação', {
        body: novas + ' nova(s) solicitação(ões) de agendamento!',
        icon: 'https://lizafigueiredoestetica-debug.github.io/lizafigueiredoestetica/favicon.ico'
      });
    }
    // Toast no sistema
    showToast('📅 ' + novas + ' nova(s) solicitação(ões) de agendamento!');
    renderSolicitacoes();
  }
  _ultimaContSolicitacoes = qtd;

  // Atualizar badge
  var badge = document.getElementById('badgeSolicitacoes');
  if (badge) badge.textContent = qtd || '';
}

// ── Pedir permissão de notificação push ──
function _pedirPermissaoNotificacao() {
  if (window.Notification && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
