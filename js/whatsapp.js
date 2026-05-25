/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — whatsapp.js
   WhatsApp helpers, agenda principal, ICS import
   ===================================================== */

// ===================== WHATSAPP =====================
function _waTelefone(nome) {
  // 1. Buscar telefone salvo diretamente no agendamento
  var ag = db.agenda.find(function(a){
    return a.cliente && a.cliente.toLowerCase().trim() === nome.toLowerCase().trim() && a.tel && a.tel.trim();
  });
  if (ag && ag.tel) return ag.tel.replace(/\D/g,'');

  // 2. Buscar na anamnese pelo nome
  var ficha = db.anamneses.find(function(a){
    var p = a.pessoais || {};
    return p.nome && p.nome.toLowerCase().trim() === nome.toLowerCase().trim();
  });
  if (ficha && ficha.pessoais && ficha.pessoais.telefone) {
    return ficha.pessoais.telefone.replace(/\D/g,'');
  }
  return null;
}

function waConfirmarAgendamento(agId, sessaoIdx) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var s = ag.sessoes[sessaoIdx];
  if (!s) return;
  var servico = (function(){
    var ids = s.servicoIds||[];
    if(ids.length) return ids.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }).join(' + ');
    return s.servico || _agServicos(ag);
  })();
  var hora = s.hora ? ' às ' + s.hora : '';
  var msg = 'Olá ' + ag.cliente + '! 🌸\n\nPassando para confirmar sua sessão de *' + servico + '* no dia *' + fmtDate(s.data) + hora + '*.\n\nQualquer dúvida estou à disposição! ✨';
  var tel = _waTelefone(ag.cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}

function waLembrete(agId, sessaoIdx) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var s = ag.sessoes[sessaoIdx];
  if (!s) return;
  var servico = (function(){
    var ids = s.servicoIds||[];
    if(ids.length) return ids.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }).join(' + ');
    return s.servico || _agServicos(ag);
  })();
  var hora = s.hora ? ' às ' + s.hora : '';
  var msg = 'Olá ' + ag.cliente + '! 😊\n\nLembrando que *amanhã* você tem sua sessão de *' + servico + '*' + hora + '.\n\nTe esperamos! 🌸';
  var tel = _waTelefone(ag.cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}

function waPosAtendimento(cliente, servico) {
  var msg = 'Olá ' + cliente + '! 🌟\n\nFoi um prazer te atender hoje! Espero que tenha gostado da sessão de *' + servico + '*. 💆‍♀️\n\nQualquer dúvida ou para agendar sua próxima sessão, é só me chamar! 😊';
  var tel = _waTelefone(cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}

function waRetorno(agId) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var msg = 'Olá ' + ag.cliente + '! 🌸\n\nSentimos sua falta! Que tal agendar sua próxima sessão de *' + _agServicos(ag) + '*?\n\nEstamos com horários disponíveis e adoraríamos te receber novamente! ✨';
  var tel = _waTelefone(ag.cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}

// ===================== AGENDA =====================
let agendaFiltro = 'hoje';

function setAgendaFiltro(filtro, btn) {
  agendaFiltro = filtro;
  document.querySelectorAll('.agenda-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  renderAgenda();
}

function populateAgendaServico() {
  var container = document.getElementById('ag-servico-chips');
  if (!container) return;
  var ativos = db.servicos.filter(function(s){ return s.status==='ativo'; });
  container.innerHTML = ativos.length
    ? ativos.map(function(s){ return '<span class="service-chip" style="font-size:12px;cursor:pointer" data-id="'+s.id+'" onclick="this.classList.toggle(\'selected\')">'+s.nome+'</span>'; }).join('')
    : '<span style="font-size:12px;color:var(--text-light)">Cadastre serviços primeiro</span>';
}

function gerarCamposDatas() {
  const qtd = parseInt(document.getElementById('ag-qtd').value) || 0;
  const wrap = document.getElementById('ag-datas-wrap');
  const campos = document.getElementById('ag-datas-campos');
  if(qtd < 1) { wrap.style.display='none'; campos.innerHTML=''; return; }
  wrap.style.display='block';
  // Keep existing values
  const existing = [];
  campos.querySelectorAll('input[type=date]').forEach(i => existing.push(i.value));
  const existingHora = [];
  campos.querySelectorAll('input[type=time]').forEach(t => existingHora.push(t.value));
  // Mudar grid para layout em lista com chips
  campos.style.gridTemplateColumns = '1fr';
  for(let i=0; i<qtd; i++) {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:8px;flex-wrap:wrap';
    const chipsHtml = db.servicos.filter(s=>s.status==='ativo').map(s=>`<span class="service-chip" style="font-size:11px;padding:2px 8px;cursor:pointer" id="agchip_${i}_${s.id}" onclick="this.classList.toggle('selected')">${s.nome}</span>`).join('');
    div.innerHTML = `
      <span style="font-size:11px;color:var(--text-light);min-width:60px">Sessão ${i+1}</span>
      <input type="date" id="ag-data-${i}" style="padding:0.4rem 0.6rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none" value="${existing[i]||''}">
      <input type="time" id="ag-hora-${i}" style="width:90px;padding:0.4rem 0.4rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none" value="${existingHora[i]||''}">
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        <input type="text" placeholder="🔍 Filtrar serviços..." oninput="(function(el){var v=el.value.toLowerCase();el.parentElement.querySelectorAll('.service-chip').forEach(function(c){c.style.display=c.textContent.toLowerCase().includes(v)?'':'none';});})(this)" style="width:100%;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:Jost,sans-serif;outline:none;margin-bottom:4px">
        ${chipsHtml}
      </div>`;
    campos.appendChild(div);
  }
}

function salvarAgendamento() {
  const cliente = document.getElementById('ag-cliente').value.trim();
  const qtd = parseInt(document.getElementById('ag-qtd').value);
  const obs = document.getElementById('ag-obs').value;

  if(!cliente || !qtd) {
    showToast('Preencha cliente e quantidade de sessões!');
    return;
  }

  const sessoes = [];
  for(let i=0; i<qtd; i++) {
    const dataEl = document.getElementById('ag-data-'+i);
    if(!dataEl || !dataEl.value) {
      showToast(`Preencha a data da sessão ${i+1}!`);
      return;
    }
    const horaEl = document.getElementById('ag-hora-'+i);
    const srvIds = db.servicos.filter(function(s){
      const el = document.getElementById('agchip_'+i+'_'+s.id);
      return el && el.classList.contains('selected');
    }).map(function(s){ return s.id; });
    sessoes.push({ data: dataEl.value, hora: horaEl ? horaEl.value : '', status: 'pendente', atendimentoId: null, servicoIds: srvIds, servico: srvIds.map(function(id){ const sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:''; }).join(' + ') });
  }

  const tel = (document.getElementById('ag-tel')||{value:''}).value.trim();
  const sinal = parseFloat((document.getElementById('ag-sinal')||{value:'0'}).value) || 0;
  db.agenda.push({
    id: uid(),
    cliente,
    tel,
    sinal,
    sinalPago: sinal > 0,
    servicoId: '',
    servicoIds: [],
    servicoNome: '—',
    obs,
    sessoes
  });

  var novaAgenda = db.agenda[db.agenda.length-1];
  saveData(); renderAll();
  addLog('INFO', '📅 Agendamento criado — Cliente: ' + cliente + ' | Sessões: ' + sessoes.length);
  _salvarAgenda(novaAgenda);

  // Toast com botão de enviar link da anamnese
  var _tel = _waTelefone(cliente);
  var _btnAnam = document.createElement('button');
  _btnAnam.textContent = '📲 Enviar Anamnese no WhatsApp';
  _btnAnam.style.cssText = 'background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:white;border-radius:6px;padding:2px 10px;font-size:11px;cursor:pointer;margin-left:4px';
  _btnAnam.onclick = function(){ waEnviarAnamnese(cliente, _tel||''); };
  var t = document.getElementById('toast');
  t.innerHTML = '📅 Agendamento salvo! ';
  t.appendChild(_btnAnam);
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); t.innerHTML=''; limparFormAgenda(); }, 7000);
}

function limparFormAgenda() {
  ['ag-cliente','ag-qtd','ag-obs','ag-tel','ag-sinal'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const chips = document.getElementById('ag-servico-chips');
  if(chips) chips.querySelectorAll('.service-chip.selected').forEach(function(el){ el.classList.remove('selected'); });
  const wrap = document.getElementById('ag-datas-wrap');
  if(wrap) wrap.style.display = 'none';
  const campos = document.getElementById('ag-datas-campos');
  if(campos) campos.innerHTML = '';
}

function _agServicos(ag) {
  var todos = {};
  (ag.sessoes||[]).forEach(function(s){
    (s.servicoIds||[]).forEach(function(id){
      var sv = db.servicos.find(function(x){ return x.id===id; });
      var nome = sv ? sv.nome : id;
      todos[nome] = true;
    });
    if(s.servico && !(s.servicoIds&&s.servicoIds.length)) todos[s.servico]=true;
  });
  var nomes = Object.keys(todos);
  if(nomes.length) return nomes.join(' + ');
  return ag.servicoNome || '—';
}

function renderAgenda() {
  populateAgendaServico();
  renderCalendario();

  // Atualizar painel Check-ins
  var hojeStr = _hoje();
  var filtCiDe = (document.getElementById('filtCheckinDe')||{value:''}).value;
  var filtCiAte = (document.getElementById('filtCheckinAte')||{value:''}).value;
  // Se sem filtro, mostrar hoje
  var ciDe = filtCiDe || hojeStr;
  var ciAte = filtCiAte || hojeStr;
  var checkins = [];
  db.agenda.forEach(function(ag) {
    ag.sessoes.forEach(function(s, idx) {
      if ((s.status === 'presente' || s.status === 'realizado') && s.checkinData && s.checkinHora) {
        var dataCheck = s.checkinData.split('/').reverse().join('-');
        if (dataCheck >= ciDe && dataCheck <= ciAte) {
          var srvIds = s.servicoIds||[];
          var srvNome = srvIds.length
            ? srvIds.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }).join(' + ')
            : (s.servico || ag.servicoNome || '—');
          checkins.push({ data: s.checkinData, hora: s.checkinHora, nome: s.checkinNome||ag.cliente, servico: srvNome, sessao: idx+1 });
        }
      }
    });
  });
  checkins.sort(function(a,b){ return (a.data+a.hora).localeCompare(b.data+b.hora); });
  var painel = document.getElementById('checkinPainel');
  var body = document.getElementById('checkinTabelaBody');
  var count = document.getElementById('checkinCount');
  if (painel && body && count) {
    if (checkins.length) {
      painel.style.display = 'block';
      count.textContent = checkins.length + (checkins.length===1?' check-in':' check-ins');
      body.innerHTML = checkins.map(function(c){
        return '<tr style="border-bottom:1px solid rgba(144,202,249,0.3)">'
          +'<td style="padding:6px 8px;font-size:12px;color:#555">'+c.data+'</td>'
          +'<td style="padding:6px 8px;font-size:13px;font-weight:600;color:#1565C0">'+c.hora+'</td>'
          +'<td style="padding:6px 8px;font-size:13px">'+c.nome+'</td>'
          +'<td style="padding:6px 8px;font-size:12px;color:#555">'+c.servico+'</td>'
          +'<td style="padding:6px 8px;font-size:12px;color:#888">Sessão '+c.sessao+'</td>'
          +'</tr>';
      }).join('');
    } else {
      painel.style.display = 'block';
      count.textContent = '0 check-ins';
      body.innerHTML = '<tr><td colspan="5" style="padding:12px 8px;font-size:12px;color:#888;text-align:center">Nenhum check-in no período</td></tr>';
    }
  }

  const lista = document.getElementById('agendaLista');
  if(!lista) return;

  const hoje = _hoje();
  const now = new Date();

  // Verificar se há busca ativa por nome ou data
  const buscaCliente = (document.getElementById('agBuscaCliente')||{value:''}).value.toLowerCase().trim();
  const buscaData = (document.getElementById('agBuscaData')||{value:''}).value;
  const buscaDataAte = (document.getElementById('agBuscaDataAte')||{value:''}).value;
  const temBusca = buscaCliente || buscaData || buscaDataAte;

  // Se há busca ativa, ignorar botões de período e filtrar por nome/data diretamente
  // Se não há busca, aplicar filtro do botão selecionado
  const agFiltrados = db.agenda.filter(ag => {
    if (temBusca) {
      // Modo busca: independente dos botões
      if (buscaCliente && !ag.cliente.toLowerCase().includes(buscaCliente)) return false;
      if (buscaData || buscaDataAte) {
        return ag.sessoes.some(s => {
          if (buscaData && s.data < buscaData) return false;
          if (buscaDataAte && s.data > buscaDataAte) return false;
          return true;
        });
      }
      return true;
    } else {
      // Modo período: obedecer botões
      return ag.sessoes.some(s => {
        if(agendaFiltro === 'hoje') return s.data === hoje;
        if(agendaFiltro === 'semana') {
          var d7 = new Date();
          var utc7 = d7.getTime() + d7.getTimezoneOffset()*60000;
          var br7 = new Date(utc7 - 3*3600000 + 7*86400000);
          var fimSemana = br7.getFullYear()+'-'+String(br7.getMonth()+1).padStart(2,'0')+'-'+String(br7.getDate()).padStart(2,'0');
          return s.data >= hoje && s.data <= fimSemana;
        }
        if(agendaFiltro === 'mes') return s.data.startsWith(hoje.substring(0,7));
        if(agendaFiltro === 'tudo') return true;
        return true;
      });
    }
  });

  const agBuscados = agFiltrados;

  if(!agBuscados.length) {
    lista.innerHTML = `<div class="empty-state"><div class="empty-icon">${temBusca ? '🔍' : '📅'}</div><p>${temBusca ? 'Nenhum resultado encontrado' : 'Nenhum agendamento para este período'}</p></div>`;
    return;
  }

  const agParaRender = agBuscados.length ? agBuscados : agFiltrados;

  // Sort by nearest session date
  agParaRender.sort((a,b) => {
    const dA = a.sessoes.filter(s=>s.status!=='realizado').map(s=>s.data).sort()[0]||'9999';
    const dB = b.sessoes.filter(s=>s.status!=='realizado').map(s=>s.data).sort()[0]||'9999';
    return dA.localeCompare(dB);
  });

  lista.innerHTML = agParaRender.map(ag => {
    const total = ag.sessoes.length;
    const realizados = ag.sessoes.filter(s=>s.status==='realizado').length;
    const pendentes = total - realizados;
    const proxima = ag.sessoes.filter(s=>s.status!=='realizado').map(s=>s.data).sort()[0];
    const temHoje = ag.sessoes.some(s=>s.data===hoje && s.status!=='realizado');

    return `
    <div class="agenda-cliente-card" id="agcard-${ag.id}">
      <div class="agenda-cliente-header" id="agheader-${ag.id}" onclick="toggleAgendaCliente('${ag.id}')">
        <div>
          <div class="agenda-cliente-nome">👤 ${ag.cliente}</div>
          <div class="agenda-cliente-info">${_agServicos(ag)}${ag.obs?' · '+ag.obs:''}</div>
        </div>
        <div class="agenda-cliente-badges">
          ${temHoje ? '<span class="badge-hoje">Hoje</span>' : ''}
          ${ag.sinal > 0 ? '<span style="background:#E7F7EE;color:#276749;border-radius:12px;padding:2px 8px;font-size:10px;font-weight:500;letter-spacing:0.5px">💰 Sinal R$'+parseFloat(ag.sinal).toFixed(2).replace('.',',')+'</span>' : ''}
          <span class="badge-pill badge-ativo">${realizados}/${total} sessões</span>
          ${pendentes > 0 ? `<span class="badge-pendente">${pendentes} pendente${pendentes>1?'s':''}</span>` : '<span class="badge-realizado">Concluído</span>'}
          <button class="btn btn-edit btn-sm" onclick="event.stopPropagation();editarAgenda('${ag.id}')" style="margin-left:0.5rem;font-size:11px;padding:4px 10px">✏️ Editar</button>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();novoCiclo('${ag.id}')" style="font-size:11px" title="Adicionar novas sessões para esta cliente">🔄 Novo Ciclo</button>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();waRetorno('${ag.id}')" style="font-size:11px;background:#E7F7EE;border-color:#7DB87D;color:#276749" title="Mensagem de retorno no WhatsApp">💬</button>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();waOrcamento('${ag.id}')" style="font-size:11px;background:#FFF8E7;border-color:#F6C94E;color:#7A5C00" title="Enviar orçamento no WhatsApp">💰</button>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();excluirAgenda('${ag.id}')">✕</button>
        </div>
      </div>
      <div class="agenda-sessoes-wrap" id="agsessoes-${ag.id}">
        <div style="margin-bottom:0.75rem;font-size:11px;color:var(--text-light);letter-spacing:1px;text-transform:uppercase">Sessões do Pacote</div>
        ${ag.sessoes.map((s,i) => {
          const isHoje = s.data === hoje;
          const isAtrasado = s.data < hoje && s.status !== 'realizado';
          let cls = '';
          if(s.status==='realizado') cls='realizado';
          else if(isHoje) cls='hoje';
          else if(isAtrasado) cls='atrasado';
          let badge = '';
          if(s.status==='realizado') badge='<span class="badge-realizado">✓ Realizado</span>';
          else if(s.status==='presente') badge='<span class="badge-presente">✅ Presente</span>';
          else if(isHoje) badge='<span class="badge-hoje">Hoje</span>';
          else if(isAtrasado) badge='<span class="badge-atrasado">Não compareceu</span>';
          else badge='<span class="badge-pendente">Pendente</span>';
          return `
          <div class="agenda-sessao-row ${cls}">
            <div class="agenda-sessao-data">${fmtDate(s.data)}${s.hora?' &middot; '+s.hora:''}</div>
            <div class="agenda-sessao-servico">${(function(s,ag){ var ids=s.servicoIds||[]; if(ids.length){ var nomes=ids.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }); return nomes.join(' + '); } return s.servico||_agServicos(ag); })(s,ag)} · Sessão ${i+1}</div>
            <div class="agenda-sessao-status" style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
              ${badge}
              ${s.status !== 'realizado' ? `<button class="btn btn-primary btn-sm" onclick="realizarSessao('${ag.id}',${i})" style="font-size:11px;padding:4px 10px">✓ Realizar</button>` : ''}
              ${s.status !== 'realizado' ? `<button onclick="waConfirmarAgendamento('${ag.id}',${i})" style="background:#E7F7EE;border:1px solid #7DB87D;color:#276749;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer" title="Confirmar sessão pelo WhatsApp">📲 Confirmar</button>` : ''}
              ${s.status !== 'realizado' ? `<button onclick="waLembrete('${ag.id}',${i})" style="background:#FFF8E7;border:1px solid #F6C94E;color:#7A5C00;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer" title="Enviar lembrete pelo WhatsApp">⏰ Lembrete</button>` : ''}
              ${s.status !== 'realizado' ? `<button onclick="waReagendar('${ag.id}',${i})" style="background:#F3E8FF;border:1px solid #C084FC;color:#7C3AED;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer" title="Reagendar pelo WhatsApp">🔄 Reagendar</button>` : ''}
              ${(s.status !== 'realizado' && s.data < hoje) ? `<button onclick="event.stopPropagation();editarAgenda('${ag.id}')" style="background:#FFF0F5;border:1px solid #D4A0A8;color:#B07880;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer" title="Editar agendamento">📅 Remarcar</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleAgendaCliente(agId) {
  const sessoes = document.getElementById('agsessoes-'+agId);
  const header = document.getElementById('agheader-'+agId);
  if(!sessoes) return;
  const isOpen = sessoes.classList.contains('open');
  // Close all
  document.querySelectorAll('.agenda-sessoes-wrap').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.agenda-cliente-header').forEach(el => el.classList.remove('open'));
  if(!isOpen) {
    sessoes.classList.add('open');
    if(header) header.classList.add('open');
  }
}

function realizarSessao(agId, sessaoIdx) {
  const ag = db.agenda.find(x=>x.id===agId);
  if(!ag) return;
  const sessao = ag.sessoes[sessaoIdx];
  if(!sessao) return;

  // Mark as realizado
  sessao.status = 'realizado';
  saveData();
  renderAll();
  // Salvar sessão individualmente no Supabase
  var _agRealiz = db.agenda.find(function(x){return x.id===agId;});
  if (_agRealiz) _salvarSessoes(agId, _agRealiz.sessoes);

  // Activate atendimentos section manually
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const secEl = document.getElementById('sec-atendimentos');
  if(secEl) secEl.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => {
    if(t.getAttribute('onclick') && t.getAttribute('onclick').includes("'atendimentos'"))
      t.classList.add('active');
  });

  // Pre-fill form
  selectedServicos = [];
  selectedMateriais = {};
  renderServiceChips();

  const clienteEl = document.getElementById('atend-cliente');
  if(clienteEl) clienteEl.value = ag.cliente;

  const dataEl = document.getElementById('atend-data');
  if(dataEl) dataEl.value = sessao.data;

  // Pré-selecionar serviços da sessão específica
  const srvIds = sessao.servicoIds && sessao.servicoIds.length
    ? sessao.servicoIds
    : (ag.servicoId ? [ag.servicoId] : []);

  selectedServicos = [...srvIds];
  renderServiceChips();

  // Calcular valor total dos serviços selecionados
  const total = srvIds.reduce(function(sum, id) {
    const sv = db.servicos.find(x => x.id === id);
    return sum + (sv ? parseFloat(sv.preco) || 0 : 0);
  }, 0);
  const valorEl = document.getElementById('atend-valor');
  // Descontar sinal pago se existir
  var sinalPago = parseFloat(ag.sinal) || 0;
  var valorFinal = total > 0 ? Math.max(0, total - sinalPago) : 0;
  if(valorEl) {
    if(total > 0) {
      valorEl.value = valorFinal.toFixed(2);
      if(sinalPago > 0) {
        // Mostrar painel informativo do sinal
        var painelSinal = document.getElementById('painel-sinal');
        if(!painelSinal) {
          painelSinal = document.createElement('div');
          painelSinal.id = 'painel-sinal';
          painelSinal.style.cssText = 'background:#E7F7EE;border:1px solid #7DB87D;border-radius:10px;padding:0.75rem 1rem;margin-bottom:1rem;font-size:13px;color:#276749';
          var formSection = document.querySelector('#sec-atendimentos .form-section');
          if(formSection) formSection.parentNode.insertBefore(painelSinal, formSection);
        }
        painelSinal.innerHTML = '💰 <strong>Sinal registrado:</strong> R$ ' + sinalPago.toFixed(2).replace('.',',')
          + ' &nbsp;|&nbsp; <strong>Valor do serviço:</strong> R$ ' + total.toFixed(2).replace('.',',')
          + ' &nbsp;|&nbsp; <strong>Restante a pagar:</strong> R$ ' + valorFinal.toFixed(2).replace('.',',');
      }
    }
  }

  // Scroll to top
  window.scrollTo(0, 0);

  // Mostrar observações anteriores da cliente
  var obsAnt = _obsHistorico(ag.cliente, 3);
  if (obsAnt.length) {
    var obsHtml = obsAnt.map(function(a) {
      var sn = (a.servicoIds||[]).map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:''; }).filter(Boolean).join(' + ')||'—';
      return '<div style="padding:6px 10px;border-left:3px solid var(--gold);background:#FFFBF8;border-radius:0 6px 6px 0;margin-bottom:5px">'
        + '<div style="font-size:10px;color:var(--text-light);margin-bottom:2px">' + sn + ' · ' + fmtDate(a.data) + '</div>'
        + '<div style="font-size:12px;color:var(--text-dark)">' + a.obs + '</div>'
        + '</div>';
    }).join('');
    var painelObs = document.getElementById('obs-historico-painel');
    if (!painelObs) {
      painelObs = document.createElement('div');
      painelObs.id = 'obs-historico-painel';
      painelObs.style.cssText = 'background:#FFF8F0;border:1px solid #F0C87A;border-radius:10px;padding:0.85rem 1rem;margin-bottom:1rem';
      var formSection = document.querySelector('#sec-atendimentos .form-section');
      if (formSection) formSection.parentNode.insertBefore(painelObs, formSection);
    }
    painelObs.innerHTML = '<div style="font-size:10px;letter-spacing:2px;color:#7A5C00;text-transform:uppercase;margin-bottom:0.5rem">📝 Observações de ' + ag.cliente + '</div>' + obsHtml;
  } else {
    var p = document.getElementById('obs-historico-painel');
    if (p) p.remove();
  }

  // Verificar se foi a última sessão do ciclo
  var _totalSessoes = ag.sessoes.length;
  var _realizadas = ag.sessoes.filter(function(s){ return s.status === 'realizado'; }).length;
  if (_realizadas === _totalSessoes) {
    var t2 = document.getElementById('toast');
    t2.innerHTML = '🎉 Ciclo completo! &nbsp;<button onclick="waPosCirclo(\'' + agId + '\')" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:white;border-radius:6px;padding:2px 10px;font-size:11px;cursor:pointer;margin-left:4px">🏆 Parabenizar no WhatsApp</button>';
    t2.classList.add('show');
    setTimeout(function(){ t2.classList.remove('show'); t2.innerHTML=''; }, 8000);
  } else {
    showToast('✓ Sessão realizada! Preencha pagamento e registre o atendimento.');
  }
}

function excluirAgenda(agId) {
  const ag = db.agenda.find(x=>x.id===agId);
  if(!ag) return;
  if(!confirm(`Excluir agendamento de "${ag.cliente}"?
Todas as ${ag.sessoes.length} sessões serão removidas.`)) return;
  db.agenda = db.agenda.filter(x=>x.id!==agId);
  saveData(); renderAll();
  showToast('Agendamento excluído.');
  _deletarAgenda(agId);
}

