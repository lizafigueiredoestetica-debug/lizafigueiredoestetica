/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — mensagens.js
   Gerenciamento de mensagens WhatsApp customizáveis
   Salvas no Supabase (tabela configuracoes)
   ===================================================== */

// ── Mensagens padrão do sistema ──
var _MENSAGENS_PADRAO = {
  aniversario: {
    nome: '🎂 Aniversário',
    descricao: 'Enviada automaticamente nos aniversários das clientes',
    variaveis: ['{nome}'],
    texto: 'Olá {nome}! 🎉\n\nDesejamos a você um feliz aniversário! Que este novo ciclo seja repleto de saúde, beleza e muitas realizações. 🌸\n\nCom carinho, equipe Liza Figueiredo Estética'
  },
  confirmar_sessao: {
    nome: '✅ Confirmar Sessão',
    descricao: 'Enviada para confirmar a presença da cliente na sessão',
    variaveis: ['{nome}', '{servico}', '{data}', '{hora}'],
    texto: 'Olá {nome}! 🌸\n\nPassando para confirmar sua sessão de *{servico}* no dia *{data}{hora}*.\n\nQualquer dúvida estou à disposição! ✨'
  },
  lembrete_amanha: {
    nome: '⏰ Lembrete de Amanhã',
    descricao: 'Enviada como lembrete de sessão no dia seguinte',
    variaveis: ['{nome}', '{servico}', '{hora}'],
    texto: 'Olá {nome}! 😊\n\nLembrando que *amanhã* você tem sua sessão de *{servico}*{hora}.\n\nTe esperamos! 🌸'
  },
  pos_atendimento: {
    nome: '💆 Pós-Atendimento',
    descricao: 'Enviada após a realização de uma sessão',
    variaveis: ['{nome}', '{servico}'],
    texto: 'Olá {nome}! 🌟\n\nFoi um prazer te atender hoje! Espero que tenha gostado da sessão de *{servico}*. 💆‍♀️\n\nQualquer dúvida ou para agendar sua próxima sessão, é só me chamar! 😊'
  },
  retorno: {
    nome: '💕 Retorno / Saudade',
    descricao: 'Enviada para clientes que estão sumidas',
    variaveis: ['{nome}', '{servico}'],
    texto: 'Olá {nome}! 🌸\n\nSentimos sua falta! Que tal agendar sua próxima sessão de *{servico}*?\n\nEstamos com horários disponíveis e adoraríamos te receber novamente! ✨'
  },
  proposta: {
    nome: '✨ Proposta de Tratamento',
    descricao: 'Enviada com a proposta de tratamento personalizada',
    variaveis: ['{nome}', '{servicos}', '{sessoes}', '{valor}'],
    texto: '✨ *PROPOSTA DE TRATAMENTO* ✨\n\nOlá {nome}! 🌸\n\nSegue sua proposta personalizada:\n\n💆 *Tratamento:* {servicos}\n📅 *Sessões:* {sessoes}\n💰 *Investimento:* {valor}\n\nQualquer dúvida estou à disposição! 😊'
  },
  anamnese: {
    nome: '📋 Ficha de Anamnese',
    descricao: 'Enviada com o link da ficha de anamnese',
    variaveis: ['{nome}'],
    texto: 'Olá {nome}! 🌸\n\nSeu agendamento foi confirmado na Liza Figueiredo Estética & Beleza!\n\nAntes de sua chegada, pedimos que preencha nossa ficha de anamnese:\n📋 https://lizafigueiredoestetica-debug.github.io/anamnese/\n\nLeva apenas 2 minutinhos e nos ajuda a preparar o melhor atendimento para você. 💆‍♀️\n\nQualquer dúvida, estamos à disposição! 😊'
  },
  aprovacao_agendamento: {
    nome: '✅ Aprovação de Agendamento',
    descricao: 'Enviada quando a Liza aprova uma solicitação de agendamento',
    variaveis: ['{nome}', '{data}', '{hora}', '{servico}'],
    texto: 'Olá {nome}! 🌸\n\n✅ Seu agendamento foi *confirmado*!\n\n📅 Data: *{data}{hora}*\n💆 Serviço: *{servico}*\n\nTe esperamos com muito carinho! 💆‍♀️✨\n\nQualquer dúvida, estou à disposição! 😊'
  },
  recusa_agendamento: {
    nome: '❌ Recusa de Agendamento',
    descricao: 'Enviada quando a Liza recusa uma solicitação de agendamento',
    variaveis: ['{nome}', '{motivo}'],
    texto: 'Olá {nome}! 🌸\n\nInfelizmente não conseguimos confirmar seu agendamento para a data solicitada. 😔\n\n{motivo}\n\nPor favor, entre em contato para verificarmos outra data disponível. Adoraríamos te atender! ✨\n\nQualquer dúvida, estou à disposição! 💆‍♀️'
  },
  reagendar: {
    nome: '📅 Falta / Reagendamento',
    descricao: 'Enviada quando a cliente não comparece à sessão',
    variaveis: ['{nome}', '{servico}'],
    texto: 'Olá {nome}! 🌸\n\nNotamos que você não compareceu à sua sessão de *{servico}* hoje. Tudo bem? 😊\n\nQuando quiser reagendar é só me avisar, tenho horários disponíveis! ✨'
  },
  orcamento: {
    nome: '💬 Solicitação de Orçamento',
    descricao: 'Enviada pela cliente ao solicitar orçamento na página de agendamento',
    variaveis: [],
    texto: 'Olá Liza! 🌸 Gostaria de solicitar um orçamento e tirar algumas dúvidas sobre os serviços disponíveis.'
  },
  radar_responder_duvida: {
    nome: '💬 Responder Dúvida (Radar)',
    descricao: 'Enviada para responder a primeira pergunta que o lead fez, continuando a conversa',
    variaveis: ['{nome}', '{pergunta}'],
    texto: 'Olá {nome}! 🌸\n\nVi sua mensagem sobre "{pergunta}" e fico feliz em te ajudar! 💆‍♀️\n\nMe conta um pouco mais sobre o que você está buscando, que eu te explico tudo com calma e já te passo as melhores opções. 😊'
  },
  radar_orcamento: {
    nome: '💰 Enviar Orçamento (Radar)',
    descricao: 'Enviada para apresentar valores e condições do serviço de interesse do lead',
    variaveis: ['{nome}'],
    texto: 'Olá {nome}! 🌸\n\nSeparei algumas informações para você sobre nossos tratamentos! ✨\n\nTrabalho com protocolos personalizados para garantir o melhor resultado. Posso te passar os valores e formas de pagamento certinho — me diga se prefere conversar por aqui ou já agendar uma avaliação gratuita!\n\nQualquer dúvida, estou à disposição! 💆‍♀️'
  },
  radar_reaquecer: {
    nome: '🔥 Reaquecer Lead (Radar)',
    descricao: 'Enviada para retomar contato com um lead que parou de responder',
    variaveis: ['{nome}'],
    texto: 'Olá {nome}! 🌸\n\nPassando para saber se ainda está com interesse em agendar seu horário. Separei um espaço especial pra você essa semana! ✨\n\nSe ainda tiver alguma dúvida, é só me chamar que te ajudo com todo carinho. 💕'
  },
  radar_convite_agendar: {
    nome: '📅 Convite para Agendar (Radar)',
    descricao: 'Enviada para convidar o lead a marcar o primeiro horário',
    variaveis: ['{nome}'],
    texto: 'Olá {nome}! 🌸\n\nQue tal já garantirmos seu horário? Tenho disponibilidade essa semana e adoraria te receber para começarmos seu tratamento! 💆‍♀️✨\n\nMe diga qual dia funciona melhor pra você que eu já confirmo tudo!'
  }
};

// ── Cache e localStorage ──
var _mensagensCache = null;
var _LS_KEY = 'lizafig_mensagens';

// ── Carregar mensagens do localStorage ──
async function _carregarMensagens() {
  try {
    var raw = localStorage.getItem(_LS_KEY);
    _mensagensCache = raw ? JSON.parse(raw) : {};
  } catch(e) {
    _mensagensCache = {};
  }
  return _mensagensCache;
}

// ── Obter texto de uma mensagem (customizada ou padrão) ──
function _getMensagem(chave) {
  if (_mensagensCache && _mensagensCache[chave]) return _mensagensCache[chave];
  return _MENSAGENS_PADRAO[chave] ? _MENSAGENS_PADRAO[chave].texto : '';
}

// ── Salvar mensagem no localStorage ──
async function _salvarMensagem(chave, texto) {
  try {
    if (!_mensagensCache) _mensagensCache = {};
    _mensagensCache[chave] = texto;
    localStorage.setItem(_LS_KEY, JSON.stringify(_mensagensCache));
    return true;
  } catch(e) { return false; }
}

// ── Restaurar padrão de uma mensagem ──
async function restaurarMensagemPadrao(chave) {
  if (!confirm('Restaurar a mensagem padrão do sistema? A sua versão personalizada será perdida.')) return;
  if (!_mensagensCache) _mensagensCache = {};
  delete _mensagensCache[chave];
  localStorage.setItem(_LS_KEY, JSON.stringify(_mensagensCache));
  showToast('✅ Mensagem restaurada para o padrão!');
  renderMensagens();
}

// ── Renderizar seção de mensagens ──
async function renderMensagens() {
  var el = document.getElementById('mensagensLista');
  if (!el) return;
  el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-light)">⏳ Carregando mensagens...</div>';

  var customizadas = await _carregarMensagens();

  el.innerHTML = Object.keys(_MENSAGENS_PADRAO).map(function(chave) {
    var padrao = _MENSAGENS_PADRAO[chave];
    var textoAtual = customizadas[chave] || padrao.texto;
    var isCustom = !!customizadas[chave];
    var varsHtml = padrao.variaveis.map(function(v) {
      return '<span style="background:#EDD5D8;color:#B07880;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">' + v + '</span>';
    }).join(' ');

    return '<div class="panel" style="margin-bottom:1rem" id="msg-card-' + chave + '">'
      + '<div class="panel-header">'
      + '<div>'
      + '<div class="panel-title">' + padrao.nome + (isCustom ? ' <span style="background:#E8F5E9;color:#388E3C;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;margin-left:6px">Personalizada</span>' : '') + '</div>'
      + '<div style="font-size:11px;color:var(--text-light);margin-top:2px">' + padrao.descricao + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:0.5rem">'
      + (isCustom ? '<button class="btn btn-secondary btn-sm" onclick="restaurarMensagemPadrao(\'' + chave + '\')" style="font-size:11px">↩ Padrão</button>' : '')
      + '<button class="btn btn-primary btn-sm" onclick="abrirEditorMensagem(\'' + chave + '\')">✏️ Editar</button>'
      + '</div>'
      + '</div>'
      + '<div style="padding:1rem 1.5rem">'
      + (padrao.variaveis.length ? '<div style="margin-bottom:0.75rem;display:flex;flex-wrap:wrap;gap:0.4rem;align-items:center"><span style="font-size:11px;color:var(--text-light);margin-right:4px">Variáveis:</span>' + varsHtml + '</div>' : '')
      + '<div style="background:var(--cream);border-radius:8px;padding:0.75rem 1rem;font-size:13px;color:var(--text-mid);white-space:pre-wrap;line-height:1.6;border-left:3px solid var(--gold)">' + textoAtual + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
}

// ── Abrir editor de mensagem ──
function abrirEditorMensagem(chave) {
  var padrao = _MENSAGENS_PADRAO[chave];
  var textoAtual = _getMensagem(chave);
  var old = document.getElementById('modal-editor-msg');
  if (old) old.remove();

  var varsHtml = padrao.variaveis.length
    ? '<div style="margin-bottom:1rem"><div style="font-size:11px;color:var(--text-light);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Variáveis disponíveis — clique para inserir:</div><div style="display:flex;flex-wrap:wrap;gap:0.5rem">'
      + padrao.variaveis.map(function(v) {
          return '<button onclick="inserirVariavel(\'' + v + '\')" style="background:#EDD5D8;color:#B07880;border:none;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;cursor:pointer">' + v + '</button>';
        }).join('')
      + '</div></div>'
    : '';

  var modal = document.createElement('div');
  modal.id = 'modal-editor-msg';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(28,28,30,0.6);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem';

  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    + '<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">'
    + '<div><div style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">✏️ ' + padrao.nome + '</div>'
    + '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">' + padrao.descricao + '</div></div>'
    + '<button onclick="document.getElementById(\'modal-editor-msg\').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="padding:1.5rem">'
    + varsHtml
    + '<div style="font-size:11px;color:var(--text-light);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Texto da mensagem</div>'
    + '<textarea id="editor-msg-textarea" rows="10" style="width:100%;padding:0.75rem 1rem;border:1.5px solid var(--border);border-radius:10px;font-family:Jost,sans-serif;font-size:13px;outline:none;resize:vertical;line-height:1.6;color:var(--text-dark)">' + textoAtual + '</textarea>'
    + '<div style="font-size:11px;color:var(--text-light);margin-top:6px">Use *texto* para negrito no WhatsApp</div>'
    + '<div style="display:flex;gap:0.75rem;margin-top:1.25rem;flex-wrap:wrap">'
    + '<button class="btn btn-primary" onclick="salvarEdicaoMensagem(\'' + chave + '\')">💾 Salvar Mensagem</button>'
    + '<button class="btn btn-secondary" onclick="previewMensagem(\'' + chave + '\')">👁 Preview</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'modal-editor-msg\').remove()">Cancelar</button>'
    + '</div>'
    + '</div></div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });

  // Foco no textarea
  setTimeout(function(){ document.getElementById('editor-msg-textarea').focus(); }, 100);
}

function inserirVariavel(variavel) {
  var ta = document.getElementById('editor-msg-textarea');
  if (!ta) return;
  var pos = ta.selectionStart;
  var texto = ta.value;
  ta.value = texto.slice(0, pos) + variavel + texto.slice(pos);
  ta.selectionStart = ta.selectionEnd = pos + variavel.length;
  ta.focus();
}

function previewMensagem(chave) {
  var texto = document.getElementById('editor-msg-textarea').value;
  // Substituir variáveis por exemplos
  texto = texto
    .replace(/{nome}/g, 'Maria Silva')
    .replace(/{servico}/g, 'Drenagem Linfática')
    .replace(/{servicos}/g, 'Drenagem + Ultrassom')
    .replace(/{data}/g, '26/05/2026')
    .replace(/{hora}/g, ' às 10:00')
    .replace(/{sessoes}/g, '10 sessões')
    .replace(/{valor}/g, 'R$ 1.500,00')
    .replace(/{motivo}/g, 'Agenda cheia nesta data.');

  var old = document.getElementById('modal-preview-msg');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.id = 'modal-preview-msg';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(28,28,30,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    + '<div style="padding:1rem 1.5rem;background:#075E54;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">'
    + '<span style="color:white;font-size:14px;font-weight:500">💬 Preview WhatsApp</span>'
    + '<button onclick="document.getElementById(\'modal-preview-msg\').remove()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="background:#ECE5DD;padding:1.5rem;border-radius:0 0 16px 16px">'
    + '<div style="background:white;border-radius:12px 12px 12px 0;padding:0.75rem 1rem;max-width:85%;box-shadow:0 1px 2px rgba(0,0,0,0.1);font-size:13px;line-height:1.6;white-space:pre-wrap;color:#111">' + texto.replace(/\*(.*?)\*/g, '<strong>$1</strong>') + '</div>'
    + '<div style="font-size:10px;color:#888;margin-top:4px;margin-left:4px">' + new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) + '</div>'
    + '</div>'
    + '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

async function salvarEdicaoMensagem(chave) {
  var texto = document.getElementById('editor-msg-textarea').value.trim();
  if (!texto) { showToast('O texto não pode estar vazio!'); return; }

  var btn = event.target;
  btn.disabled = true;
  btn.textContent = '⏳ Salvando...';

  var ok = await _salvarMensagem(chave, texto);
  if (ok) {
    showToast('✅ Mensagem salva com sucesso!');
    document.getElementById('modal-editor-msg').remove();
    renderMensagens();
  } else {
    showToast('❌ Erro ao salvar. Tente novamente.');
    btn.disabled = false;
    btn.textContent = '💾 Salvar Mensagem';
  }
}

// ── Inicializar cache de mensagens ao carregar o sistema ──
async function _inicializarMensagens() {
  await _carregarMensagens();
}
