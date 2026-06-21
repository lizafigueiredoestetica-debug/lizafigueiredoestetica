/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — agenda.js
   renderAgenda, calendar, sessoes, checkin, ICS, whatsapp
   ===================================================== */

var _agIdVinculadoGlobal = ''; // ID do agendamento vinculado ao próximo atendimento

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
  // Garantir campo de data padrão visível ao abrir a seção
  var qtd = parseInt((document.getElementById('ag-qtd')||{value:'0'}).value) || 0;
  var recorrencia = (document.getElementById('ag-recorrencia')||{value:''}).value;
  if (qtd < 1 && !recorrencia) gerarCamposDatas();
}

function gerarCamposDatas() {
  const qtd = parseInt(document.getElementById('ag-qtd').value) || 0;
  const wrap = document.getElementById('ag-datas-wrap');
  const campos = document.getElementById('ag-datas-campos');
  const recorrencia = (document.getElementById('ag-recorrencia')||{value:''}).value;

  // Se qtd=0 e sem recorrência: mostra 1 campo padrão com data de hoje
  if(qtd < 1 && !recorrencia) {
    wrap.style.display = 'block';
    // Só insere se ainda não tem nenhum campo
    if (!document.getElementById('ag-data-0')) {
      campos.innerHTML = '';
      campos.style.gridTemplateColumns = '1fr';
      var hoje = _hoje();
      // Criar elementos via DOM para evitar problema de aspas
      var div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:8px;flex-wrap:wrap';

      var lbl = document.createElement('span');
      lbl.style.cssText = 'font-size:11px;color:var(--text-light);min-width:60px;padding-top:6px';
      lbl.textContent = 'Sessão 1';

      var inpData = document.createElement('input');
      inpData.type = 'date'; inpData.id = 'ag-data-0'; inpData.value = hoje;
      inpData.style.cssText = 'padding:0.4rem 0.6rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none';

      // Grupo hora início
      var grpHora = document.createElement('div');
      grpHora.style.cssText = 'display:flex;flex-direction:column;gap:2px';
      var lblHora = document.createElement('label');
      lblHora.style.cssText = 'font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--text-light)';
      lblHora.textContent = 'Hora início';
      var inpHora = document.createElement('input');
      inpHora.type = 'time'; inpHora.id = 'ag-hora-0';
      inpHora.title = 'Horário de início';
      inpHora.style.cssText = 'width:100px;padding:0.4rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none';
      grpHora.appendChild(lblHora);
      grpHora.appendChild(inpHora);

      // Grupo hora fim
      var grpHoraFim = document.createElement('div');
      grpHoraFim.style.cssText = 'display:flex;flex-direction:column;gap:2px';
      var lblHoraFim = document.createElement('label');
      lblHoraFim.style.cssText = 'font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--text-light)';
      lblHoraFim.textContent = 'Hora fim';
      var inpHoraFim = document.createElement('input');
      inpHoraFim.type = 'time'; inpHoraFim.id = 'ag-horafim-0';
      inpHoraFim.title = 'Horário de término';
      inpHoraFim.style.cssText = 'width:100px;padding:0.4rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none';
      grpHoraFim.appendChild(lblHoraFim);
      grpHoraFim.appendChild(inpHoraFim);

      // Sessão única: data + hora início + hora fim com labels
      div.appendChild(lbl);
      div.appendChild(inpData);
      div.appendChild(grpHora);
      div.appendChild(grpHoraFim);
      campos.appendChild(div);
    }
    return;
  }

  if(qtd < 1) { wrap.style.display='none'; campos.innerHTML=''; return; }
  wrap.style.display='block';
  // Preservar datas e horas já preenchidas antes de limpar
  const existing = [];
  campos.querySelectorAll('input[type=date]').forEach(function(el){ existing.push(el.value); });
  const existingHora = [];
  campos.querySelectorAll('input[id^="ag-hora-"]:not([id*="fim"])').forEach(function(el){ existingHora.push(el.value); });
  const existingHoraFim = [];
  campos.querySelectorAll('input[id^="ag-horafim-"]').forEach(function(el){ existingHoraFim.push(el.value); });
  // Limpar SEMPRE antes de recriar — evita duplicatas
  campos.innerHTML = '';
  campos.style.gridTemplateColumns = '1fr';

  for(let i=0; i<qtd; i++) {
    const div = document.createElement('div');
    div.style.cssText = 'margin-bottom:12px;padding:10px 12px;background:var(--off-white);border-radius:10px;border:1px solid var(--border)';

    // ── Linha 1: label + data + hora início + até + hora fim ──
    const linha1 = document.createElement('div');
    linha1.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:8px;flex-wrap:wrap';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:11px;color:var(--text-light);min-width:65px;font-weight:500';
    lbl.textContent = 'Sessão ' + (i+1);

    const inpData = document.createElement('input');
    inpData.type = 'date'; inpData.id = 'ag-data-' + i;
    inpData.value = existing[i] || '';
    inpData.style.cssText = 'padding:0.4rem 0.6rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none';

    // Grupo hora início
    const grpHi = document.createElement('div');
    grpHi.style.cssText = 'display:flex;flex-direction:column;gap:2px';
    const lblHi = document.createElement('label');
    lblHi.style.cssText = 'font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--text-light)';
    lblHi.textContent = 'Hora início';
    const inpHora = document.createElement('input');
    inpHora.type = 'time'; inpHora.id = 'ag-hora-' + i;
    inpHora.title = 'Horário de início';
    inpHora.value = existingHora[i] || '';
    inpHora.style.cssText = 'width:100px;padding:0.4rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none';
    grpHi.appendChild(lblHi); grpHi.appendChild(inpHora);

    // Grupo hora fim
    const grpHf = document.createElement('div');
    grpHf.style.cssText = 'display:flex;flex-direction:column;gap:2px';
    const lblHf = document.createElement('label');
    lblHf.style.cssText = 'font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--text-light)';
    lblHf.textContent = 'Hora fim';
    const inpHoraFim = document.createElement('input');
    inpHoraFim.type = 'time'; inpHoraFim.id = 'ag-horafim-' + i;
    inpHoraFim.title = 'Horário de término';
    inpHoraFim.value = existingHoraFim[i] || '';
    inpHoraFim.style.cssText = 'width:100px;padding:0.4rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none';
    grpHf.appendChild(lblHf); grpHf.appendChild(inpHoraFim);

    linha1.appendChild(lbl);
    linha1.appendChild(inpData);
    linha1.appendChild(grpHi);
    linha1.appendChild(grpHf);

    // ── Linha 2: chips de serviço (cada sessão pode ter serviços diferentes) ──
    const chipsWrap = document.createElement('div');
    chipsWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px';

    const filtro = document.createElement('input');
    filtro.type = 'text';
    filtro.placeholder = '🔍 Filtrar serviços...';
    filtro.style.cssText = 'width:100%;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:Jost,sans-serif;outline:none;margin-bottom:4px';
    filtro.oninput = function() {
      var v = this.value.toLowerCase();
      chipsWrap.querySelectorAll('.service-chip').forEach(function(c){
        c.style.display = c.textContent.toLowerCase().includes(v) ? '' : 'none';
      });
    };
    chipsWrap.appendChild(filtro);

    db.servicos.filter(function(s){ return s.status === 'ativo'; }).forEach(function(s) {
      var chip = document.createElement('span');
      chip.className = 'service-chip';
      chip.id = 'agchip_' + i + '_' + s.id;
      chip.textContent = s.nome;
      chip.style.cssText = 'font-size:11px;padding:2px 8px;cursor:pointer';
      chip.onclick = function(){ this.classList.toggle('selected'); };
      chipsWrap.appendChild(chip);
    });

    // ── Chips de protocolo ──
    if (db.protocolos && db.protocolos.length) {
      var sepProt = document.createElement('div');
      sepProt.style.cssText = 'width:100%;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin:6px 0 2px;font-weight:500';
      sepProt.textContent = '📦 Protocolos';
      chipsWrap.appendChild(sepProt);
      db.protocolos.filter(function(p){ return p.status === 'ativo'; }).forEach(function(p) {
        var chip = document.createElement('span');
        chip.className = 'service-chip';
        chip.id = 'agprot_' + i + '_' + p.id;
        chip.textContent = '📦 ' + p.nome + ' — ' + fmtMoney(p.valor);
        chip.style.cssText = 'font-size:11px;padding:2px 8px;cursor:pointer;border-color:var(--gold-dark)';
        chip.setAttribute('data-protocolo-id', p.id);
        chip.onclick = (function(prot, idx) {
          return function() {
            var wasSelected = this.classList.contains('selected');
            // Desmarcar todos os outros protocolos desta sessão
            chipsWrap.querySelectorAll('[data-protocolo-id]').forEach(function(c){ c.classList.remove('selected'); });
            if (!wasSelected) {
              this.classList.add('selected');
              // Selecionar automaticamente os serviços do protocolo
              prot.servicoIds.forEach(function(sid) {
                var sc = document.getElementById('agchip_' + idx + '_' + sid);
                if (sc) sc.classList.add('selected');
              });
            } else {
              // Desmarcar os serviços do protocolo
              prot.servicoIds.forEach(function(sid) {
                var sc = document.getElementById('agchip_' + idx + '_' + sid);
                if (sc) sc.classList.remove('selected');
              });
            }
          };
        })(p, i);
        chipsWrap.appendChild(chip);
      });
    }

    div.appendChild(linha1);
    div.appendChild(chipsWrap);
    campos.appendChild(div);
  }
}

function salvarAgendamento() {
  const cliente = document.getElementById('ag-cliente').value.trim();
  const qtd = parseInt(document.getElementById('ag-qtd').value);
  const obs = document.getElementById('ag-obs').value;

  if(!cliente) {
    showToast('Preencha o nome do cliente!');
    return;
  }

  const recorrencia = (document.getElementById('ag-recorrencia')||{value:''}).value || '';

  const sessoes = [];

  // Modo padrão (qtd=0, sem recorrência): ler apenas ag-data-0
  if ((!qtd || qtd < 1) && !recorrencia) {
    const dataEl0 = document.getElementById('ag-data-0');
    if (!dataEl0 || !dataEl0.value) {
      showToast('Preencha a data da sessão!');
      return;
    }
    const horaEl0 = document.getElementById('ag-hora-0');
    const horaFimEl0 = document.getElementById('ag-horafim-0');
    sessoes.push({
      data: dataEl0.value,
      hora: horaEl0 ? horaEl0.value : '',
      horaFim: horaFimEl0 ? horaFimEl0.value : '',
      status: 'pendente', atendimentoId: null,
      servicoIds: [], servico: ''
    });
  } else {
    // Modo com qtd definida: iterar pelos campos
    for(let i=0; i<qtd; i++) {
      const dataEl = document.getElementById('ag-data-'+i);
      if(!dataEl || !dataEl.value) {
        if (!recorrencia) {
          showToast('Preencha a data da sessão ' + (i+1) + '!');
          return;
        }
        continue;
      }
      const horaEl = document.getElementById('ag-hora-'+i);
      const horaFimEl = document.getElementById('ag-horafim-'+i);
      const srvIds = db.servicos.filter(function(s){
        const el = document.getElementById('agchip_'+i+'_'+s.id);
        return el && el.classList.contains('selected');
      }).map(function(s){ return s.id; });
      // Capturar protocolo selecionado para esta sessão
      var protSel = null;
      var allProtChips = document.querySelectorAll('[id^="agprot_' + i + '_"].selected');
      if (allProtChips.length) {
        var pid = allProtChips[0].getAttribute('data-protocolo-id');
        var pObj = db.protocolos.find(function(p){ return p.id === pid; });
        if (pObj) protSel = { id: pObj.id, nome: pObj.nome, valor: pObj.valor };
      }
      var sessaoObj = { data: dataEl.value, hora: horaEl ? horaEl.value : '', horaFim: horaFimEl ? horaFimEl.value : '', status: 'pendente', atendimentoId: null, servicoIds: srvIds, servico: srvIds.map(function(id){ const sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:''; }).join(' + ') };
      if (protSel) { sessaoObj.protocoloId = protSel.id; sessaoObj.protocoloNome = protSel.nome; sessaoObj.protocoloValor = protSel.valor; }
      sessoes.push(sessaoObj);
    }
  }

  // Validar: sem recorrência exige pelo menos 1 sessão
  if (!recorrencia && sessoes.length === 0) {
    showToast('Preencha pelo menos uma data de sessão!');
    return;
  }

  // Com recorrência, exige data de início e data até
  if (recorrencia) {
    var inicioRec = (document.getElementById('ag-recorr-inicio')||{value:''}).value;
    var ateRec = (document.getElementById('ag-recorr-ate')||{value:''}).value;
    if (!inicioRec || !ateRec) {
      showToast('Preencha a data de início e "até quando" da recorrência!');
      return;
    }
  }

  const tel = (document.getElementById('ag-tel')||{value:''}).value.trim();
  const cpfAg = (document.getElementById('ag-cpf')||{value:''}).value.replace(/\D/g,'');
  const sinal = parseFloat((document.getElementById('ag-sinal')||{value:'0'}).value) || 0;
  const cor = (document.getElementById('ag-cor')||{value:'#D4A0A8'}).value || '#D4A0A8';

  // Gerar sessões recorrentes se necessário
  var sessoesFinais = sessoes;
  if (recorrencia && recorrencia !== '') {
    sessoesFinais = _gerarSessoesRecorrentes(sessoes, recorrencia);
    if (!sessoesFinais || sessoesFinais.length === 0) {
      showToast('Recorrência não gerou sessões. Verifique as datas!');
      return;
    }
  }

  // Validação de conflito de horário
  var conflitos = [];
  sessoesFinais.forEach(function(nova) {
    if (!nova.data || !nova.hora) return;
    var hIniNova = parseInt(nova.hora.split(':')[0])*60 + parseInt(nova.hora.split(':')[1]||0);
    var hFimNova = nova.horaFim ? parseInt(nova.horaFim.split(':')[0])*60 + parseInt(nova.horaFim.split(':')[1]||0) : hIniNova + 1;
    db.agenda.forEach(function(ag) {
      ag.sessoes.forEach(function(s) {
        if (s.data !== nova.data || !s.hora) return;
        if (s.status === 'realizado' || s.status === 'falta') return;
        var hIniEx = parseInt(s.hora.split(':')[0])*60 + parseInt(s.hora.split(':')[1]||0);
        var hFimEx = s.horaFim ? parseInt(s.horaFim.split(':')[0])*60 + parseInt(s.horaFim.split(':')[1]||0) : hIniEx + 1;
        if (hIniNova < hFimEx && hFimNova > hIniEx) {
          conflitos.push(ag.cliente + ' — ' + fmtDate(s.data) + ' ' + s.hora + (s.horaFim ? '–' + s.horaFim : ''));
        }
      });
    });
  });
  if (conflitos.length > 0) {
    var msg = '⚠️ Conflito de horário!\n\nJá existe agendamento:\n' + conflitos.slice(0,3).join('\n');
    if (conflitos.length > 3) msg += '\n... e mais ' + (conflitos.length-3) + ' conflito(s).';
    msg += '\n\nAgendar mesmo assim?';
    if (!confirm(msg)) return;
  }

  db.agenda.push({
    id: uid(),
    cliente,
    tel,
    cpf: cpfAg || '',
    sinal,
    sinalPago: sinal > 0,
    servicoId: '',
    servicoIds: [],
    servicoNome: '—',
    obs,
    cor,
    recorrencia,
    sessoes: sessoesFinais
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
  var _modeloId = (document.getElementById('ag-modelo-anamnese')||{value:''}).value||'';
  _btnAnam.onclick = function(){ waEnviarAnamnese(cliente, _tel||'', _modeloId); };
  var t = document.getElementById('toast');
  t.innerHTML = '📅 Agendamento salvo! ';
  t.appendChild(_btnAnam);
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); t.innerHTML=''; limparFormAgenda(); }, 7000);
}

function limparFormAgenda() {
  // Reset bolinhas de cor
  var ciReset = document.getElementById('ag-cor'); if(ciReset) ciReset.value='#D4A0A8';
  document.querySelectorAll('#ag-cor-bolinhas .cor-bolinha').forEach(function(b){ b.style.border='3px solid transparent'; b.style.boxShadow='none'; });
  var corPadrao = document.querySelector('#ag-cor-bolinhas .cor-bolinha[data-cor="#D4A0A8"]');
  if(corPadrao){ corPadrao.style.border='3px solid #B07880'; corPadrao.style.boxShadow='0 0 0 2px white, 0 0 0 4px #B07880'; }
  const recEl=document.getElementById('ag-recorrencia'); if(recEl) recEl.value='';
  const rcEl=document.getElementById('ag-recorr-config'); if(rcEl) rcEl.style.display='none';
  ['ag-cliente','ag-qtd','ag-obs','ag-tel','ag-sinal','ag-cpf'].forEach(id => {
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
  // Popular autocomplete de clientes
  var dl = document.getElementById('ag-cliente-list');
  if (dl) {
    var nomes = {};
    db.agenda.forEach(function(ag){ if(ag.cliente) nomes[ag.cliente] = true; });
    dl.innerHTML = Object.keys(nomes).sort().map(function(n){ return '<option value="' + n + '">'; }).join('');
  }
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
    <div class="agenda-cliente-card" id="agcard-${ag.id}" style="border-left:4px solid ${ag.cor||'#D4A0A8'}">
      <div class="agenda-cliente-header" id="agheader-${ag.id}" onclick="toggleAgendaCliente('${ag.id}')">
        <div>
          <div class="agenda-cliente-nome">👤 ${ag.cliente}</div>
          <div class="agenda-cliente-info">${_agServicos(ag)}${ag.obs?' · '+ag.obs:''}</div>
        </div>
        <div class="agenda-cliente-badges"><span title="${ag.cor||'#D4A0A8'}" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${ag.cor||'#D4A0A8'};flex-shrink:0"></span>
          ${temHoje ? '<span class="badge-hoje">Hoje</span>' : ''}
          ${ag.sinal > 0 ? '<span style="background:#E7F7EE;color:#276749;border-radius:12px;padding:2px 8px;font-size:10px;font-weight:500">💰 Sinal R$'+parseFloat(ag.sinal).toFixed(2).replace('.',',')+'</span>' : ''}
          <button onclick="event.stopPropagation();_editarSinalRapido('${ag.id}')" style="background:#FFF8E7;border:1px solid #F6C94E;color:#7A5C00;border-radius:8px;padding:2px 8px;font-size:10px;cursor:pointer" title="Editar sinal">✏️ Sinal</button>
          ${(function(){
            var cicloMap = {}; var cicloOrder = [];
            ag.sessoes.forEach(function(s){ var k=s.cor||'__original__'; if(!cicloMap[k]){ cicloMap[k]=[]; cicloOrder.push(k); } cicloMap[k].push(s); });
            if(cicloOrder.length === 0) return '';
            return cicloOrder.map(function(cicloKey, ci){
              var sessoesCiclo = cicloMap[cicloKey];
              var isOriginal = cicloKey === '__original__';
              var corExibir = sessoesCiclo[0].cor || ag.cor || '#D4A0A8';
              // Total do ciclo
              var totalCiclo = 0;
              var sessaoComProt = sessoesCiclo.find(function(s){ return s.protocoloId && s.protocoloValor; });
              if(sessaoComProt){ totalCiclo = parseFloat(sessaoComProt.protocoloValor)||0; }
              else { var idsC={}; sessoesCiclo.forEach(function(s){ (s.servicoIds||[]).forEach(function(id){ if(idsC[id]) return; idsC[id]=true; var sv=_buscarServico(id); if(sv&&sv.preco) totalCiclo+=parseFloat(sv.preco)||0; }); }); }
              // Sinal do ciclo — pela data do atendimento de sinal
              var datasC = sessoesCiclo.map(function(s){return s.data;}).filter(Boolean).sort();
              var dMinC = datasC[0]||''; var dMaxC = datasC[datasC.length-1]||'';
              var _atSinal = db.atendimentos.find(function(a){ return a.cliente&&a.cliente.toLowerCase().trim()===ag.cliente.toLowerCase().trim()&&a.pagto==='sinal'; });
              var _dSinal = _atSinal ? _atSinal.data : null;
              var _sinalAqui = _dSinal && _dSinal >= dMinC && _dSinal <= dMaxC;
              var sinalCiclo = _sinalAqui ? (parseFloat(ag.sinal)||0) : (isOriginal&&!_dSinal ? (parseFloat(ag.sinal)||0) : (!isOriginal?(sessoesCiclo[0]&&sessoesCiclo[0].sinalCiclo?parseFloat(sessoesCiclo[0].sinalCiclo):0):0));
              var pagoCiclo = db.atendimentos.filter(function(a){
                return a.cliente && a.cliente.toLowerCase().trim()===ag.cliente.toLowerCase().trim()
                  && a.pagto!=='sinal'
                  && (!dMinC||a.data>=dMinC) && (!dMaxC||a.data<=dMaxC);
              }).reduce(function(s,a){return s+(parseFloat(a.valor)||0);},0);
              var restCiclo = totalCiclo - sinalCiclo - pagoCiclo;
              if(!totalCiclo && !sinalCiclo) return '';
              var label = cicloOrder.length > 1 ? 'Ciclo '+(ci+1)+': ' : '';
              var cor = restCiclo <= 0 ? '#276749' : '#1565C0';
              var bg  = restCiclo <= 0 ? '#E7F7EE' : '#EDF4FF';
              var txt = restCiclo <= 0 ? '✓ Quitado' : '💳 Restante: R$'+Math.abs(restCiclo).toFixed(2).replace('.',',');
              return '<span style="background:'+bg+';color:'+cor+';border-radius:12px;padding:2px 10px;font-size:10px;font-weight:500;letter-spacing:0.5px;border-left:3px solid '+corExibir+'" title="Total: R$'+totalCiclo.toFixed(2)+' | Sinal: R$'+sinalCiclo.toFixed(2)+' | Pago: R$'+pagoCiclo.toFixed(2)+'">'+label+txt+'</span>';
            }).join('');
          })()}
          <span class="badge-pill badge-ativo">${realizados}/${total} sessões</span>
          ${pendentes > 0 ? `<span class="badge-pendente">${pendentes} pendente${pendentes>1?'s':''}</span>` : '<span class="badge-realizado">Concluído</span>'}
          <button class="btn btn-edit btn-sm" onclick="event.stopPropagation();editarAgenda('${ag.id}')" style="margin-left:0.5rem;font-size:11px;padding:4px 10px">✏️ Editar</button>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();novoCiclo('${ag.id}')" style="font-size:11px" title="Adicionar novas sessões para esta cliente">🔄 Novo Ciclo</button>
          ${(function(){ var _coresSet=[]; ag.sessoes.forEach(function(s){ var c=s.cor||'__original__'; if(_coresSet.indexOf(c)<0) _coresSet.push(c); }); if(_coresSet.length<=1) return ''; return '<button class="btn btn-sm" onclick="event.stopPropagation();excluirCiclo(\''+ag.id+'\')" style="font-size:11px;background:#FFF5F5;border:1px solid #FFCDD2;color:#C62828" title="Excluir um ciclo">🗑 Ciclo</button>'; })()}
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
          <div class="agenda-sessao-row ${cls}" style="${s.cor ? 'border-left:3px solid '+s.cor+';' : ''}">
            <div class="agenda-sessao-data">${fmtDate(s.data)}${s.hora?' &middot; '+s.hora+(s.horaFim?' – '+s.horaFim:''):''}</div>
            <div class="agenda-sessao-servico">${(function(s,ag){ var ids=s.servicoIds||[]; if(ids.length){ var nomes=ids.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }); return nomes.join(' + '); } return s.servico||_agServicos(ag); })(s,ag)} · Sessão ${i+1}${s.protocoloNome ? ' <span style="background:#EDD5D8;color:#B07880;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600;margin-left:4px">📦 '+s.protocoloNome+' — '+fmtMoney(s.protocoloValor)+'</span>' : ''}</div>
            <div class="agenda-sessao-status" style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
              ${badge}
              ${(s.status !== 'realizado' && s.status !== 'falta') ? `<button class="btn btn-primary btn-sm" onclick="realizarSessao('${ag.id}',${i})" style="font-size:11px;padding:4px 10px">✓ Realizar</button>` : ''}
              ${s.status === 'realizado' ? `<button onclick="desfazerSessao('${ag.id}',${i})" style="background:#FFF5F5;border:1px solid #FFCDD2;color:#C62828;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer" title="Desfazer realização">↩ Desfazer</button>` : ''}
              ${(s.status !== 'realizado' && s.status !== 'falta') ? `<button onclick="waConfirmarAgendamento('${ag.id}',${i})" style="background:#E7F7EE;border:1px solid #7DB87D;color:#276749;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer" title="Confirmar sessão pelo WhatsApp">📲 Confirmar</button>` : ''}
              ${(s.status !== 'realizado' && s.status !== 'falta') ? `<button onclick="waLembrete('${ag.id}',${i})" style="background:#FFF8E7;border:1px solid #F6C94E;color:#7A5C00;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer" title="Enviar lembrete pelo WhatsApp">⏰ Lembrete</button>` : ''}
              ${(s.status !== 'realizado' && s.status !== 'falta') ? `<button onclick="waReagendar('${ag.id}',${i})" style="background:#F3E8FF;border:1px solid #C084FC;color:#7C3AED;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer" title="Reagendar pelo WhatsApp">🔄 Reagendar</button>` : ''}
              ${(s.status !== 'realizado' && s.status !== 'falta') ? `<button onclick="event.stopPropagation();event.preventDefault();setTimeout(function(){abrirModalFalta('${ag.id}',${i});},10)" style="background:#FFF0F0;border:1px solid #FFCDD2;color:#C62828;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer" title="Marcar falta">❌ Falta</button>` : ''}
              ${s.status === 'falta' ? `<span style="background:#FFEBEE;color:#C62828;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600">❌ Faltou</span><button onclick="event.stopPropagation();event.preventDefault();setTimeout(function(){abrirModalReagendar('${ag.id}',${i});},10)" style="background:#FFF3E0;border:1px solid #FFB74D;color:#E65100;border-radius:8px;padding:4px 8px;font-size:11px;cursor:pointer;margin-left:4px">📅 Reagendar</button>` : ''}
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


// ── Calcular saldo financeiro do pacote ──
function _calcSaldoPacote(ag) {
  // Agrupar sessoes por ciclo (cor)
  var cicloMap = {};
  var cicloOrder = [];
  ag.sessoes.forEach(function(s) {
    var cicloKey = s.cor || '__original__';
    if (!cicloMap[cicloKey]) { cicloMap[cicloKey] = []; cicloOrder.push(cicloKey); }
    cicloMap[cicloKey].push(s);
  });

  // Calcular saldo de cada ciclo independentemente
  var totalPacote = 0, sinal = 0, totalPago = 0;

  cicloOrder.forEach(function(cicloKey) {
    var sessoesCiclo = cicloMap[cicloKey];
    var isOriginal = cicloKey === '__original__';

    // Total do ciclo — protocolo ou soma de servicos
    var totalCiclo = 0;
    var sessaoComProt = sessoesCiclo.find(function(s){ return s.protocoloValor; });
    if (sessaoComProt) {
      totalCiclo = parseFloat(sessaoComProt.protocoloValor) || 0;
    } else {
      var idsContados = {};
      sessoesCiclo.forEach(function(s) {
        (s.servicoIds || []).forEach(function(id) {
          if (idsContados[id]) return;
          idsContados[id] = true;
          var sv = _buscarServico(id);
          if (sv && sv.preco) totalCiclo += parseFloat(sv.preco) || 0;
        });
      });
    }

    // Sinal do ciclo:
    // - Ciclo original: usa ag.sinal (campo global do agendamento)
    // - Ciclos novos: usa sinalCiclo da primeira sessao do ciclo (salvo no novo ciclo)
    var sinalCiclo = 0;
    if (isOriginal) {
      sinalCiclo = parseFloat(ag.sinal) || 0;
    } else {
      var primSessao = sessoesCiclo[0];
      sinalCiclo = primSessao && primSessao.sinalCiclo ? parseFloat(primSessao.sinalCiclo) : 0;
    }

    // Atendimentos deste ciclo — por agendaId + corCiclo (permite ciclos com mesmas datas)
    var datasC = sessoesCiclo.map(function(s){ return s.data; }).filter(Boolean).sort();
    var dMinC = datasC[0] || '';
    var dMaxC = datasC[datasC.length-1] || '';
    var _temAgId = db.atendimentos.some(function(a){ return a.agendaId === ag.id; });
    var pagoCiclo = db.atendimentos
      .filter(function(a) {
        if (a.pagto === 'sinal') return false;
        if (_temAgId) {
          if (a.agendaId !== ag.id) return false;
          // Se tem corCiclo definido, usar para separar ciclos com mesmas datas
          if (a.corCiclo !== undefined) {
            return isOriginal ? (!a.corCiclo) : (a.corCiclo === cicloKey);
          }
          // Fallback: usar janela de datas
          return (!dMinC || a.data >= dMinC) && (!dMaxC || a.data <= dMaxC);
        }
        return a.cliente && a.cliente.toLowerCase().trim() === ag.cliente.toLowerCase().trim()
          && (!dMinC || a.data >= dMinC)
          && (!dMaxC || a.data <= dMaxC);
      })
      .reduce(function(sum, a){ return sum + (parseFloat(a.valor)||0); }, 0);

    totalPacote += totalCiclo;
    sinal       += sinalCiclo;
    totalPago   += pagoCiclo;
  });

  // Saldo = total - sinal - atendimentos
  var saldo = totalPacote - sinal - totalPago;

  return {
    totalPacote: totalPacote,
    sinal: sinal,
    totalPago: totalPago,
    saldo: Math.max(0, saldo)
  };
}

function excluirCiclo(agId) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;

  // Identificar ciclos distintos por cor — sessões sem cor = ciclo original
  var ciclos = [];
  ag.sessoes.forEach(function(s) {
    var cor = s.cor || '__original__';
    var ciclo = ciclos.find(function(c){ return c.cor === cor; });
    if (!ciclo) {
      ciclo = { cor: cor, corExibir: s.cor || ag.cor || '#D4A0A8', sessoes: [], temRealizado: false };
      ciclos.push(ciclo);
    }
    ciclo.sessoes.push(s);
    if (s.status === 'realizado') ciclo.temRealizado = true;
  });

  if (ciclos.length <= 1) {
    showToast('Este pacote tem apenas um ciclo. Use o botão ✕ para excluir o pacote inteiro.');
    return;
  }

  var old = document.getElementById('excluir-ciclo-modal');
  if (old) old.remove();

  window._ciclosExcluir = ciclos;
  window._agIdExcluir = agId;

  var modal = document.createElement('div');
  modal.id = 'excluir-ciclo-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(28,28,30,0.6);z-index:9997;display:flex;align-items:center;justify-content:center;padding:1rem';

  var box = document.createElement('div');
  box.style.cssText = 'background:white;border-radius:16px;max-width:460px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)';

  // Header
  var header = document.createElement('div');
  header.style.cssText = 'padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center';
  header.innerHTML = '<span style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">🗑 Excluir Ciclo</span>';
  var btnFechar = document.createElement('button');
  btnFechar.textContent = '✕';
  btnFechar.style.cssText = 'background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer';
  btnFechar.onclick = function(){ document.getElementById('excluir-ciclo-modal').remove(); };
  header.appendChild(btnFechar);
  box.appendChild(header);

  // Body
  var body = document.createElement('div');
  body.style.cssText = 'padding:1.5rem';
  var desc = document.createElement('div');
  desc.style.cssText = 'font-size:12px;color:var(--text-light);margin-bottom:1rem';
  desc.textContent = 'Selecione qual ciclo deseja excluir:';
  body.appendChild(desc);

  ciclos.forEach(function(c, idx) {
    var primData = c.sessoes.map(function(s){ return s.data; }).sort()[0];
    var ultData  = c.sessoes.map(function(s){ return s.data; }).sort().reverse()[0];
    var label = fmtDate(primData) + (ultData !== primData ? ' – ' + fmtDate(ultData) : '');

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0.8rem;border:1px solid var(--border);border-radius:8px;margin-bottom:6px';

    var left = document.createElement('div');
    left.style.cssText = 'display:flex;align-items:center;gap:8px';
    var bolinha = document.createElement('span');
    bolinha.style.cssText = 'width:14px;height:14px;border-radius:50%;background:' + c.corExibir + ';display:inline-block;flex-shrink:0';
    var texto = document.createElement('span');
    texto.style.cssText = 'font-size:13px';
    texto.textContent = label + ' · ' + c.sessoes.length + ' sessão(ões)';
    if (c.temRealizado) {
      var aviso = document.createElement('span');
      aviso.style.cssText = 'font-size:10px;color:#C62828;margin-left:6px';
      aviso.textContent = '⚠️ tem sessão realizada';
      texto.appendChild(aviso);
    }
    left.appendChild(bolinha);
    left.appendChild(texto);

    var btnExcl = document.createElement('button');
    btnExcl.textContent = '🗑 Excluir';
    btnExcl.style.cssText = 'background:#FFEBEE;border:1px solid #FFCDD2;color:#C62828;border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer';
    btnExcl.onclick = (function(i){ return function(){ confirmarExcluirCiclo(agId, i); }; })(idx);

    row.appendChild(left);
    row.appendChild(btnExcl);
    body.appendChild(row);
  });

  var btnCancel = document.createElement('button');
  btnCancel.className = 'btn btn-secondary btn-sm';
  btnCancel.textContent = 'Cancelar';
  btnCancel.style.marginTop = '0.5rem';
  btnCancel.onclick = function(){ document.getElementById('excluir-ciclo-modal').remove(); };
  body.appendChild(btnCancel);

  box.appendChild(body);
  modal.appendChild(box);
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

function confirmarExcluirCiclo(agId, cicloIdx) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var ciclos = window._ciclosExcluir;
  if (!ciclos || !ciclos[cicloIdx]) return;
  var ciclo = ciclos[cicloIdx];

  var msg = 'Excluir ' + ciclo.sessoes.length + ' sessão(ões) deste ciclo?';
  if (ciclo.temRealizado) msg += '\n\n⚠️ Atenção: este ciclo tem sessões já realizadas!';
  if (!confirm(msg)) return;

  // Remover sessões deste ciclo
  ag.sessoes = ag.sessoes.filter(function(s) {
    return (s.cor || '__original__') !== ciclo.cor;
  });

  document.getElementById('excluir-ciclo-modal').remove();
  saveData();
  renderAll();
  showToast('✅ Ciclo excluído com sucesso!');
  _salvarAgenda(ag);
}

function desfazerSessao(agId, sessaoIdx) {
  if (!confirm('Desfazer a realização desta sessão? O status voltará para pendente.')) return;
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var s = ag.sessoes[sessaoIdx];
  if (!s) return;
  s.status = 'pendente';
  s.atendimentoId = null;
  saveData();
  renderAll();
  showToast('Sessão revertida para pendente.');
  _salvarAgenda(ag);
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
  // Gravar agendaId para que salvarAtendimento saiba a qual agenda pertence
  var _agIdInput = document.getElementById('atend-agenda-id');
  if (!_agIdInput) {
    _agIdInput = document.createElement('input');
    _agIdInput.type = 'hidden';
    _agIdInput.id = 'atend-agenda-id';
    var _formBody = document.querySelector('#sec-atendimentos .form-body');
    if (_formBody) _formBody.appendChild(_agIdInput);
  }
  if (_agIdInput) _agIdInput.value = agId;
  _agIdVinculadoGlobal = agId; // Garantir vínculo mesmo se campo hidden não estiver no DOM correto

  const dataEl = document.getElementById('atend-data');
  if(dataEl) dataEl.value = sessao.data;

  // Pré-selecionar serviços da sessão específica
  const srvIds = sessao.servicoIds && sessao.servicoIds.length
    ? sessao.servicoIds
    : (ag.servicoId ? [ag.servicoId] : []);

  selectedServicos = [...srvIds];
  renderServiceChips();

  // Calcular valor total — usar protocolo se existir, senão soma dos serviços
  var totalProtocolo = sessao.protocoloValor ? parseFloat(sessao.protocoloValor) : 0;
  const total = totalProtocolo > 0 ? totalProtocolo : srvIds.reduce(function(sum, id) {
    const sv = _buscarServico(id);
    return sum + (sv ? parseFloat(sv.preco) || 0 : 0);
  }, 0);
  const valorEl = document.getElementById('atend-valor');
  // Descontar sinal pago se existir
  var sinalPago = parseFloat(ag.sinal) || 0;
  var valorFinal = total > 0 ? Math.max(0, total - sinalPago) : 0;
  if(valorEl) {
    if(total > 0) {
      valorEl.value = valorFinal.toFixed(2);
      var _totalPacoteCheck = _calcSaldoPacote(ag).totalPacote;
      if(sinalPago > 0 || _totalPacoteCheck > 0) {
        // Mostrar painel informativo do saldo
        var painelSinal = document.getElementById('painel-sinal');
        if(!painelSinal) {
          painelSinal = document.createElement('div');
          painelSinal.id = 'painel-sinal';
          painelSinal.style.cssText = 'background:#E7F7EE;border:1px solid #7DB87D;border-radius:10px;padding:0.75rem 1rem;margin-bottom:1rem;font-size:13px;color:#276749';
          var formSection = document.querySelector('#sec-atendimentos .form-section');
          if(formSection) formSection.parentNode.insertBefore(painelSinal, formSection);
        }
        var _saldo = _calcSaldoPacote(ag);
        painelSinal.innerHTML = '💰 <strong>Total do pacote:</strong> R$ ' + _saldo.totalPacote.toFixed(2).replace('.',',')
          + ' &nbsp;|&nbsp; <strong>Sinal:</strong> R$ ' + _saldo.sinal.toFixed(2).replace('.',',')
          + ' &nbsp;|&nbsp; <strong>Já pago:</strong> R$ ' + _saldo.totalPago.toFixed(2).replace('.',',')
          + ' &nbsp;|&nbsp; <strong style="color:#C62828">Restante: R$ ' + _saldo.saldo.toFixed(2).replace('.',',') + '</strong>';
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

  var temRecorrencia = (ag.recorrencia && ag.recorrencia !== '') || ag.sessoes.length > 1;

  if (!temRecorrencia) {
    // Sem recorrência — confirmação simples
    if (!confirm('Excluir agendamento de "' + ag.cliente + '"?\nTodas as ' + ag.sessoes.length + ' sessões serão removidas.')) return;
    db.agenda = db.agenda.filter(x=>x.id!==agId);
    saveData(); renderAll();
    showToast('Agendamento excluído.');
    _deletarAgenda(agId);
    return;
  }

  // Com recorrência — modal com 3 opções (usando createElement para evitar problema de aspas)
  var oldM = document.getElementById('modal-excluir-ag');
  if (oldM) oldM.remove();

  var modal = document.createElement('div');
  modal.id = 'modal-excluir-ag';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(28,28,30,0.65);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem';

  var box = document.createElement('div');
  box.style.cssText = 'background:white;border-radius:16px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden';

  // Header
  var header = document.createElement('div');
  header.style.cssText = 'padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);display:flex;justify-content:space-between;align-items:center';
  var titulo = document.createElement('div');
  titulo.style.cssText = 'font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px';
  titulo.textContent = '🗑️ Excluir Agendamento';
  var btnFechar = document.createElement('button');
  btnFechar.style.cssText = 'background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer';
  btnFechar.textContent = '✕';
  btnFechar.onclick = function(){ modal.remove(); };
  header.appendChild(titulo);
  header.appendChild(btnFechar);

  // Body
  var body = document.createElement('div');
  body.style.cssText = 'padding:1.5rem';

  var aviso = document.createElement('div');
  aviso.style.cssText = 'background:#FFF0F0;border:1px solid #FFCDD2;border-radius:10px;padding:1rem;margin-bottom:1.25rem;font-size:13px;color:#C62828';
  aviso.innerHTML = '⚠️ <strong>' + ag.cliente + '</strong> tem recorrência ativa com <strong>' + ag.sessoes.length + ' sessões</strong>. O que deseja excluir?';

  var btns = document.createElement('div');
  btns.style.cssText = 'display:flex;flex-direction:column;gap:0.75rem';

  var btnTudo = document.createElement('button');
  btnTudo.style.cssText = 'background:#FFEBEE;border:1px solid #EF9A9A;color:#C62828;border-radius:10px;padding:0.85rem 1rem;font-size:13px;font-weight:500;cursor:pointer;text-align:left;font-family:Jost,sans-serif';
  btnTudo.innerHTML = '🗑️ <strong>Excluir TUDO</strong> — remove o agendamento e todas as ' + ag.sessoes.length + ' sessões';
  btnTudo.onclick = function(){ modal.remove(); _excluirTodasSessoes(agId); };

  var btnPendentes = document.createElement('button');
  btnPendentes.style.cssText = 'background:#FFF3E0;border:1px solid #FFCC80;color:#E65100;border-radius:10px;padding:0.85rem 1rem;font-size:13px;font-weight:500;cursor:pointer;text-align:left;font-family:Jost,sans-serif';
  btnPendentes.innerHTML = '✂️ <strong>Excluir só as pendentes</strong> — mantém as sessões já realizadas';
  btnPendentes.onclick = function(){ modal.remove(); _excluirSessoesPendentes(agId); };

  var btnCancelar = document.createElement('button');
  btnCancelar.style.cssText = 'background:var(--cream);border:1px solid var(--border);color:var(--text-mid);border-radius:10px;padding:0.75rem 1rem;font-size:13px;cursor:pointer;font-family:Jost,sans-serif';
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.onclick = function(){ modal.remove(); };

  btns.appendChild(btnTudo);
  btns.appendChild(btnPendentes);
  btns.appendChild(btnCancelar);
  body.appendChild(aviso);
  body.appendChild(btns);
  box.appendChild(header);
  box.appendChild(body);
  modal.appendChild(box);
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

function _excluirTodasSessoes(agId) {
  db.agenda = db.agenda.filter(x=>x.id!==agId);
  saveData(); renderAll();
  showToast('Agendamento excluído completamente.');
  _deletarAgenda(agId);
}

function _excluirSessoesPendentes(agId) {
  var ag = db.agenda.find(x=>x.id===agId);
  if (!ag) return;
  var realizadas = ag.sessoes.filter(function(s){ return s.status === 'realizado'; });
  if (!realizadas.length) {
    // Sem nenhuma realizada — excluir tudo
    _excluirTodasSessoes(agId);
    return;
  }
  ag.sessoes = realizadas;
  ag.recorrencia = ''; // remove recorrência
  saveData(); renderAll();
  showToast('Sessões pendentes removidas. ' + realizadas.length + ' sessão(ões) realizada(s) mantida(s).');
  _salvarAgenda(ag);
}

// ===================== LOG =====================
function toggleLog() {
  var p = document.getElementById('log-panel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}
function addLog(type, msg) {
  var el = document.getElementById('log-entries');
  if (!el) return;
  var d = document.createElement('div');
  var color = type === 'ERROR' ? '#ff6b6b' : type === 'WARN' ? '#ffd93d' : '#a8d8a8';
  var time = new Date().toLocaleTimeString('pt-BR');
  d.style.cssText = 'padding:2px 0;border-bottom:1px solid #1C1C1E;color:'+color;
  d.textContent = '['+time+'] '+type+': '+msg;
  el.appendChild(d);
  el.scrollTop = el.scrollHeight;
  // Auto-show panel on error
  if (type === 'ERROR') {
    document.getElementById('log-panel').style.display = 'block';
  }
}
// Intercept global errors
window.onerror = function(msg, src, line, col, err) {
  addLog('ERROR', msg + ' (linha ' + line + ')');
  return false;
};
// Intercept unhandled promise rejections
window.onunhandledrejection = function(e) {
  addLog('ERROR', 'Promise: ' + (e.reason || e));
};
// Wrap console
(function() {
  var origError = console.error.bind(console);
  var origWarn = console.warn.bind(console);
  var origLog = console.log.bind(console);
  console.error = function() {
    addLog('ERROR', Array.prototype.join.call(arguments, ' '));
    origError.apply(console, arguments);
  };
  console.warn = function() {
    addLog('WARN', Array.prototype.join.call(arguments, ' '));
    origWarn.apply(console, arguments);
  };
  console.log = function() {
    addLog('INFO', Array.prototype.join.call(arguments, ' '));
    origLog.apply(console, arguments);
  };
})();
addLog('INFO', 'Sistema iniciando...');

// ===== AGENDA FILTERS =====
function limparFiltrosAgenda() {
  const c = document.getElementById('agBuscaCliente');
  const d = document.getElementById('agBuscaData');
  const dAte = document.getElementById('agBuscaDataAte');
  if(c) c.value = '';
  if(d) d.value = '';
  if(dAte) dAte.value = '';
  renderAgenda();
}

// ===== AGENDA EDIT =====
function editarAgenda(agId) {
  const ag = db.agenda.find(x => x.id === agId);
  if (!ag) return;

  // Build session rows with multi-service chips
  const sessaoRows = ag.sessoes.map((s, i) => {
    const selecionados = s.servicoIds || (s.servico ? [s.servico] : []);
    const chipsHtml = db.servicos.filter(sv=>sv.status==='ativo').map(sv => {
      const sel = selecionados.includes(sv.nome) || selecionados.includes(sv.id);
      return `<span class="service-chip${sel?' selected':''}" style="font-size:11px;padding:2px 8px;cursor:pointer" onclick="this.classList.toggle('selected')">${sv.nome}</span>`;
    }).join('');
    return `
    <div id="agedit-sessao-${agId}-${i}" style="display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:8px;flex-wrap:wrap">
      <span style="font-size:11px;color:var(--text-light);min-width:55px;padding-top:4px">Sessão ${i+1}</span>
      <input type="date" id="agedit-data-${agId}-${i}" value="${s.data}"
        style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none;${s.status==='realizado'?'opacity:0.5;pointer-events:none':''}">
      <div style="display:flex;flex-direction:column;gap:2px">
        <label style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--text-light)">Hora início</label>
        <input type="time" id="agedit-hora-${agId}-${i}" value="${s.hora||''}"
          style="width:100px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none;${s.status==='realizado'?'opacity:0.5;pointer-events:none':''}">
      </div>
      <div style="display:flex;flex-direction:column;gap:2px">
        <label style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--text-light)">Hora fim</label>
        <input type="time" id="agedit-horafim-${agId}-${i}" value="${s.horaFim||''}"
          style="width:100px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none;${s.status==='realizado'?'opacity:0.5;pointer-events:none':''}">
      </div>
      <div id="agedit-chips-${agId}-${i}" style="display:flex;flex-wrap:wrap;gap:4px">
        <input type="text" placeholder="🔍 Filtrar serviços..." oninput="(function(el){var v=el.value.toLowerCase();el.parentElement.querySelectorAll('.service-chip').forEach(function(c){c.style.display=c.textContent.toLowerCase().includes(v)?'':'none';});})(this)" style="width:100%;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:Jost,sans-serif;outline:none;margin-bottom:4px">
        ${chipsHtml}
      </div>
      <span class="badge-pill ${s.status==='realizado'?'badge-ativo':'badge-pendente'}" style="font-size:10px;align-self:center">${s.status==='realizado'?'✓ Realizado':'Pendente'}</span>
      ${s.status !== 'realizado' ? `<button onclick="removerSessaoEdit('${agId}',${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:14px;padding:0 4px;align-self:center">✕</button>` : ''}
    </div>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'agenda-edit-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(44,26,34,0.65);z-index:9997;display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML = `
    <div style="background:white;border-radius:16px;max-width:600px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
      <div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:'Cormorant Garamond',serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">✏️ Editar Agendamento</span>
        <button onclick="document.getElementById('agenda-edit-modal').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">✕</button>
      </div>
      <div style="padding:1.5rem">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
          <div>
            <div style="font-size:10px;letter-spacing:2px;color:var(--text-light);margin-bottom:4px">CLIENTE</div>
            <input type="text" id="agedit-cliente-${agId}" value="${ag.cliente}"
              style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">
          </div>
        </div>
        <div style="margin-bottom:1rem">
          <div style="font-size:10px;letter-spacing:2px;color:var(--text-light);margin-bottom:4px">OBSERVAÇÃO</div>
          <input type="text" id="agedit-obs-${agId}" value="${ag.obs||''}"
            style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">
        </div>
        <div style="margin-bottom:1rem">
          <div style="font-size:10px;letter-spacing:2px;color:var(--text-light);margin-bottom:8px">COR NA AGENDA</div>
          <input type="hidden" id="agedit-cor-hidden-${agId}" value="${ag.cor||'#D4A0A8'}">
          <div id="agedit-cor-wrap-${agId}" style="display:flex;flex-wrap:wrap;gap:8px">
            ${_renderCorBolinhas(agId, ag.cor||'#D4A0A8')}
          </div>
        </div>
        <div style="margin-bottom:1rem">
          <div style="font-size:10px;letter-spacing:2px;color:var(--text-light);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
            <span>SESSÕES</span>
            <button onclick="adicionarSessaoEdit('${agId}')" class="btn btn-secondary btn-sm" style="font-size:11px">+ Adicionar Sessão</button>
          </div>
          <div id="agedit-sessoes-${agId}" style="background:var(--off-white);border-radius:8px;padding:0.75rem">
            ${sessaoRows}
          </div>
        </div>
        <div style="display:flex;gap:0.75rem">
          <button class="btn btn-primary" onclick="salvarEdicaoAgenda('${agId}')">✓ Salvar</button>
          <button class="btn btn-secondary" onclick="document.getElementById('agenda-edit-modal').remove()">Cancelar</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function adicionarSessaoEdit(agId) {
  const ag = db.agenda.find(x => x.id === agId);
  if (!ag) return;
  const container = document.getElementById('agedit-sessoes-' + agId);
  if (!container) return;
  const hoje = _hoje();
  const i = container.querySelectorAll('[id^="agedit-sessao-"]').length;
  const div = document.createElement('div');
  div.id = `agedit-sessao-${agId}-${i}`;
  div.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:6px;flex-wrap:wrap';
  const chipsNova = db.servicos.filter(s=>s.status==='ativo').map(s=>`<span class="service-chip" style="font-size:11px;padding:2px 8px;cursor:pointer" onclick="this.classList.toggle('selected')">${s.nome}</span>`).join('');
  div.innerHTML = `
    <span style="font-size:11px;color:var(--text-light);min-width:55px;padding-top:4px">Sessão ${i+1}</span>
    <input type="date" id="agedit-data-${agId}-${i}" value="${hoje}"
      style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none">
    <div style="display:flex;flex-direction:column;gap:2px">
      <label style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--text-light)">Hora início</label>
      <input type="time" id="agedit-hora-${agId}-${i}" value=""
        style="width:100px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none">
    </div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <label style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--text-light)">Hora fim</label>
      <input type="time" id="agedit-horafim-${agId}-${i}" value=""
        style="width:100px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none">
    </div>
    <div id="agedit-chips-${agId}-${i}" style="display:flex;flex-wrap:wrap;gap:4px">
      <input type="text" placeholder="🔍 Filtrar serviços..." oninput="(function(el){var v=el.value.toLowerCase();el.parentElement.querySelectorAll('.service-chip').forEach(function(c){c.style.display=c.textContent.toLowerCase().includes(v)?'':'none';});})(this)" style="width:100%;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:Jost,sans-serif;outline:none;margin-bottom:4px">
      ${chipsNova}
    </div>
    <span class="badge-pill badge-pendente" style="font-size:10px;align-self:center">Pendente</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:14px;padding:0 4px;align-self:center">✕</button>`;
  container.appendChild(div);
}

function removerSessaoEdit(agId, idx) {
  const el = document.getElementById(`agedit-sessao-${agId}-${idx}`);
  if (el) el.remove();
}

function salvarEdicaoAgenda(agId) {
  const ag = db.agenda.find(x => x.id === agId);
  if (!ag) return;

  const novoCliente = (document.getElementById('agedit-cliente-' + agId) || {value: ag.cliente}).value.trim();
  const novaObs = (document.getElementById('agedit-obs-' + agId) || {value: ''}).value;

  ag.cliente = novoCliente || ag.cliente;
  ag.obs = novaObs;
  var corEditEl = document.getElementById('agedit-cor-hidden-' + agId);
  if (corEditEl && corEditEl.value) ag.cor = corEditEl.value;

  // Rebuild sessions from edit form
  const container = document.getElementById('agedit-sessoes-' + agId);
  if (container) {
    const novasSessoes = [];
    const rows = container.querySelectorAll('[id^="agedit-sessao-"]');
    rows.forEach((row, i) => {
      const dateInput = row.querySelector('input[type=date]');
      if (!dateInput || !dateInput.value) return;
      // Check if session was already realizado
      const oldSessao = ag.sessoes[i];
      const status = (oldSessao && oldSessao.status === 'realizado') ? 'realizado' : 'pendente';
      const chipsContainer = document.getElementById(`agedit-chips-${agId}-${i}`);
      const srvSelecionados = [];
      if (chipsContainer) {
        chipsContainer.querySelectorAll('.service-chip.selected').forEach(function(el){ srvSelecionados.push(el.textContent.trim()); });
      }
      const sess = { data: dateInput.value, hora: (document.getElementById(`agedit-hora-${agId}-${i}`)||{value:''}).value, horaFim: (document.getElementById(`agedit-horafim-${agId}-${i}`)||{value:''}).value, status: status, atendimentoId: null };
      if (srvSelecionados.length) { sess.servicoIds = srvSelecionados; sess.servico = srvSelecionados.join(' + '); }
      else if (oldSessao && oldSessao.servico) { sess.servico = oldSessao.servico; sess.servicoIds = oldSessao.servicoIds||[]; }
      if (oldSessao && oldSessao.checkinData) { sess.checkinData = oldSessao.checkinData; sess.checkinHora = oldSessao.checkinHora; sess.checkinNome = oldSessao.checkinNome; }
      novasSessoes.push(sess);
    });
    if (novasSessoes.length) {
      novasSessoes.sort((a, b) => a.data.localeCompare(b.data));
      ag.sessoes = novasSessoes;
    }
  }

  document.getElementById('agenda-edit-modal').remove();
  saveData(); renderAll();
  showToast('Agendamento atualizado!');
  _salvarAgenda(ag);
}

// ===== ICS =====
function importarICS(e) {
  var file = e.target.files[0];
  if (!file) return;
  e.target.value = '';
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var eventos = parseICS(ev.target.result);
      if (!eventos.length) { showToast('Nenhum evento futuro encontrado.'); return; }
      window._icsEv = eventos;
      abrirModalICS(eventos);
    } catch(err) {
      console.error('ICS parse error: ' + err.message);
      showToast('Erro ao ler o arquivo.');
    }
  };
  reader.readAsText(file);
}

function parseICS(text) {
  var hoje = _hoje();
  var raw = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
  var lines = [];
  for (var i = 0; i < raw.length; i++) {
    if ((raw[i][0] === ' ' || raw[i][0] === '\t') && lines.length) {
      lines[lines.length-1] += raw[i].slice(1);
    } else {
      lines.push(raw[i]);
    }
  }

  var rawEvents = [];
  var cur = null;
  for (var j = 0; j < lines.length; j++) {
    var ln = lines[j];
    if (ln === 'BEGIN:VEVENT') { cur = {}; continue; }
    if (ln === 'END:VEVENT') {
      if (cur && cur.dataInicio && cur.titulo) rawEvents.push(cur);
      cur = null; continue;
    }
    if (!cur) continue;
    if (ln.indexOf('SUMMARY') === 0) cur.titulo = ln.split(':').slice(1).join(':').trim();
    if (ln.indexOf('DTSTART') === 0) {
      var dtRaw = ln.split(':').slice(1).join(':');
      var vDate = dtRaw.replace(/T[\s\S]*/,'').replace(/[^0-9]/g,'');
      if (vDate.length >= 8) cur.dataInicio = vDate.slice(0,4)+'-'+vDate.slice(4,6)+'-'+vDate.slice(6,8);
      var tMatch = dtRaw.match(/T(\d{2})(\d{2})/);
      if (tMatch) cur.hora = tMatch[1]+':'+tMatch[2];
    }
    if (ln.indexOf('RRULE') === 0) cur.rrule = ln.split(':').slice(1).join(':').trim();
    if (ln.indexOf('RECURRENCE-ID') === 0) cur.isException = true;
    if (ln.indexOf('DESCRIPTION') === 0) cur.desc = ln.split(':').slice(1).join(':').trim().replace(/\\n/g,' ').replace(/\\,/g,',');
  }

  // FIX 1: Skip RECURRENCE-ID exceptions
  var baseEvents = [];
  for (var k = 0; k < rawEvents.length; k++) {
    if (!rawEvents[k].isException) baseEvents.push(rawEvents[k]);
  }

  // Group by client name
  var grupos = {};
  for (var b = 0; b < baseEvents.length; b++) {
    var ev = baseEvents[b];
    var key = ev.titulo.toLowerCase().trim();
    if (!grupos[key]) grupos[key] = { titulo: ev.titulo, desc: ev.desc || '', sessoes: [] };
    // Update desc if newer
    if (ev.desc) grupos[key].desc = ev.desc;

    var datas = [];
    if (ev.rrule && ev.rrule.indexOf('FREQ=DAILY') >= 0) {
      datas = expandirDiario(ev.dataInicio, ev.rrule);
    } else if (ev.rrule && ev.rrule.indexOf('FREQ=WEEKLY') >= 0) {
      // FIX 2: Handle weekly recurrence
      datas = expandirSemanal(ev.dataInicio, ev.rrule);
    } else {
      datas = [ev.dataInicio];
    }

    for (var s = 0; s < datas.length; s++) {
      if (datas[s] >= hoje) {
        grupos[key].sessoes.push({ data: datas[s], hora: ev.hora||'', status: 'pendente', atendimentoId: null });
      }
    }
  }

  // Sort, deduplicate, skip empty
  var eventos = [];
  for (var g in grupos) {
    var grp = grupos[g];
    if (!grp.sessoes.length) continue;
    grp.sessoes.sort(function(a,b){ return a.data.localeCompare(b.data); });
    var seen = {};
    var unique = [];
    for (var u = 0; u < grp.sessoes.length; u++) {
      if (!seen[grp.sessoes[u].data]) {
        seen[grp.sessoes[u].data] = true;
        unique.push(grp.sessoes[u]);
      }
    }
    grp.sessoes = unique;
    eventos.push(grp);
  }

  console.log('ICS parsed: ' + eventos.length + ' cliente(s)');
  return eventos;
}

function expandirDiario(dataInicio, rrule) {
  var datas = [];
  var parts = rrule.split(';');
  var until = null;
  var count = 0;
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].indexOf('UNTIL=') === 0) {
      var u = parts[i].replace('UNTIL=','').replace(/T[\s\S]*/,'').replace(/[^0-9]/g,'');
      if (u.length >= 8) until = u.slice(0,4)+'-'+u.slice(4,6)+'-'+u.slice(6,8);
    }
    if (parts[i].indexOf('COUNT=') === 0) count = parseInt(parts[i].replace('COUNT=','')) || 0;
  }
  var current = new Date(dataInicio + 'T12:00:00');
  var maxLoop = count > 0 ? count : 365;
  var n = 0;
  while (n < maxLoop) {
    var y = current.getFullYear();
    var m = String(current.getMonth()+1).padStart(2,'0');
    var d = String(current.getDate()).padStart(2,'0');
    var dateStr = y+'-'+m+'-'+d;
    if (until && dateStr >= until) break;
    datas.push(dateStr);
    n++;
    current.setDate(current.getDate() + 1);
  }
  return datas;
}

function expandirSemanal(dataInicio, rrule) {
  var datas = [];
  var parts = rrule.split(';');
  var until = null;
  var count = 0;
  var byDay = [];
  // Day name to JS day index (0=Sun)
  var dayMap = { SU:0, MO:1, TU:2, WE:3, TH:4, FR:5, SA:6 };

  for (var i = 0; i < parts.length; i++) {
    if (parts[i].indexOf('UNTIL=') === 0) {
      var u = parts[i].replace('UNTIL=','').replace(/T[\s\S]*/,'').replace(/[^0-9]/g,'');
      if (u.length >= 8) until = u.slice(0,4)+'-'+u.slice(4,6)+'-'+u.slice(6,8);
    }
    if (parts[i].indexOf('COUNT=') === 0) count = parseInt(parts[i].replace('COUNT=','')) || 0;
    if (parts[i].indexOf('BYDAY=') === 0) {
      var days = parts[i].replace('BYDAY=','').split(',');
      for (var d = 0; d < days.length; d++) {
        var dayCode = days[d].replace(/[^A-Z]/g,'');
        if (dayMap[dayCode] !== undefined) byDay.push(dayMap[dayCode]);
      }
    }
  }

  // If no BYDAY, use day of week from dataInicio
  if (!byDay.length) {
    var startDate = new Date(dataInicio + 'T12:00:00');
    byDay.push(startDate.getDay());
  }

  // Limit: 6 months ahead if no UNTIL/COUNT
  var hoje = new Date();
  var limitDate = new Date(hoje);
  if (!until && !count) {
    limitDate.setMonth(limitDate.getMonth() + 6);
    until = limitDate.getFullYear()+'-'+String(limitDate.getMonth()+1).padStart(2,'0')+'-'+String(limitDate.getDate()).padStart(2,'0');
  }

  var maxLoop = count > 0 ? count * 7 : 365;
  var current = new Date(dataInicio + 'T12:00:00');
  var found = 0;
  var maxCount = count > 0 ? count : 999;
  var n = 0;

  while (n < maxLoop && found < maxCount) {
    var y = current.getFullYear();
    var mo = String(current.getMonth()+1).padStart(2,'0');
    var dy = String(current.getDate()).padStart(2,'0');
    var dateStr = y+'-'+mo+'-'+dy;
    if (until && dateStr > until) break;
    if (byDay.indexOf(current.getDay()) >= 0) {
      datas.push(dateStr);
      found++;
    }
    n++;
    current.setDate(current.getDate() + 1);
  }
  return datas;
}

function _getStatusSessao(clienteNome, data, servicoId) {
  var nomeNorm = clienteNome.toLowerCase().trim();
  for (var i = 0; i < db.agenda.length; i++) {
    var ag = db.agenda[i];
    if (ag.cliente.toLowerCase().trim() !== nomeNorm) continue;
    for (var s = 0; s < ag.sessoes.length; s++) {
      if (ag.sessoes[s].data === data) {
        if (servicoId && ag.servicoId === servicoId) return 'duplicado';
        return 'atualizacao';
      }
    }
  }
  return 'novo';
}

function abrirModalICS(eventos) {
  var old = document.getElementById('ics-modal');
  if (old) old.remove();
  var opts = '';
  for (var k = 0; k < db.servicos.length; k++) {
    if (db.servicos[k].status === 'ativo') {
      opts += '<option value="' + db.servicos[k].id + '">' + db.servicos[k].nome + '</option>';
    }
  }
  var rows = '';
  for (var i = 0; i < eventos.length; i++) {
    var ev = eventos[i];
    var qtd = ev.sessoes.length;
    var datasHtml = '';
    for (var s = 0; s < ev.sessoes.length; s++) {
      var st = _getStatusSessao(ev.titulo, ev.sessoes[s].data, '');
      var badge = '';
      if (st === 'duplicado') badge = '<span style="font-size:10px;background:#F0F0F0;color:#999;padding:2px 7px;border-radius:10px;margin-left:6px">Ja existe</span>';
      else if (st === 'atualizacao') badge = '<span style="font-size:10px;background:#F5F8E8;color:#F57F17;padding:2px 7px;border-radius:10px;margin-left:6px">Atualizacao</span>';
      else badge = '<span style="font-size:10px;background:#E8F5E9;color:#388E3C;padding:2px 7px;border-radius:10px;margin-left:6px">Novo</span>';
      var chipsICS = db.servicos.filter(function(sv){return sv.status==='ativo';}).map(function(sv){
        return '<span class="service-chip" style="font-size:10px;padding:2px 6px;cursor:pointer" id="icchip_'+i+'_'+s+'_'+sv.id+'" onclick="this.classList.toggle(\'selected\')">'+sv.nome+'</span>';
      }).join('');
      datasHtml += '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:6px;flex-wrap:wrap">'
        + '<span style="font-size:11px;color:#98989D;min-width:60px">Sessao '+(s+1)+'</span>'
        + '<input type="date" id="icdate_'+i+'_'+s+'" value="'+ev.sessoes[s].data+'" '
        + 'style="padding:3px 6px;border:1px solid #E5E5EA;border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none">'
        + '<input type="time" id="ichora_'+i+'_'+s+'" value="'+(ev.sessoes[s].hora||'')+'" '
        + 'style="width:80px;padding:3px 4px;border:1px solid #E5E5EA;border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none">'
        + '<div style="display:flex;flex-wrap:wrap;gap:3px">'+chipsICS+'</div>'
        + badge + '</div>';
    }
    rows += '<div style="border:1px solid #E5E5EA;border-radius:8px;padding:0.8rem;margin-bottom:0.75rem;background:#FAFAFA">'
      + '<div style="display:flex;gap:0.75rem;align-items:flex-start">'
      + '<input type="checkbox" id="ic'+i+'" checked style="margin-top:3px;accent-color:#D4A0A8">'
      + '<div style="flex:1">'
      + '<div style="font-weight:600;font-size:13px;margin-bottom:8px">'+ev.titulo
      + ' <span style="font-weight:400;color:#98989D;font-size:12px">('+qtd+' sessao(oes))</span></div>'
      + '<div style="display:grid;grid-template-columns:1fr 80px;gap:0.5rem;margin-bottom:8px">'
      + '<div><div style="font-size:10px;color:#98989D;margin-bottom:2px;letter-spacing:1px">CLIENTE</div>'
      + '<input type="text" id="icl'+i+'" value="'+ev.titulo+'" style="width:100%;padding:0.4rem 0.6rem;border:1px solid #E5E5EA;border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none"></div>'
      + '<div><div style="font-size:10px;color:#98989D;margin-bottom:2px;letter-spacing:1px">SESSOES</div>'
      + '<input type="number" id="icqtd'+i+'" value="'+qtd+'" min="1" max="200" '
      + 'style="width:100%;padding:0.4rem 0.6rem;border:1px solid #E5E5EA;border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none" '
      + 'onchange="atualizarDatasICS('+i+',this.value)"></div>'
      + '</div>'
      + '<div id="icdatas'+i+'" style="background:#F5F5F7;border-radius:6px;padding:0.5rem;max-height:200px;overflow-y:auto">'
      + datasHtml + '</div>'
      + '</div></div></div>';
  }
  var d = document.createElement('div');
  d.id = 'ics-modal';
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(44,26,34,0.65);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem';
  d.innerHTML = '<div style="background:white;border-radius:16px;max-width:680px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    + '<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">'
    + '<span style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">Importar Google Agenda</span>'
    + '<button onclick="document.getElementById(\'ics-modal\').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">x</button>'
    + '</div>'
    + '<div style="padding:0.75rem 1.5rem;background:#FAFAFA;border-bottom:1px solid #E5E5EA;display:flex;gap:1rem;font-size:11px;flex-wrap:wrap">'
    + '<span><span style="background:#E8F5E9;color:#388E3C;padding:2px 7px;border-radius:10px">Novo</span> sera adicionado</span>'
    + '<span><span style="background:#F5F8E8;color:#F57F17;padding:2px 7px;border-radius:10px">Atualizacao</span> atualizara existente</span>'
    + '<span><span style="background:#F0F0F0;color:#999;padding:2px 7px;border-radius:10px">Ja existe</span> sera ignorado</span>'
    + '</div>'
    + '<div style="padding:1.5rem">'
    + '<p style="font-size:12px;color:#98989D;margin-bottom:1rem">'+eventos.length+' cliente(s) com sessoes de hoje em diante.</p>'
    + rows
    + '<div style="display:flex;gap:0.75rem;margin-top:1rem">'
    + '<button class="btn btn-primary" onclick="confirmarICS('+eventos.length+')">Importar Selecionados</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'ics-modal\').remove()">Cancelar</button>'
    + '</div></div></div>';
  document.body.appendChild(d);
}

function atualizarBadgesICS(evIdx) {
  var ev = window._icsEv[evIdx];
  var servicoId = (document.getElementById('icv'+evIdx)||{value:''}).value;
  var cliente = (document.getElementById('icl'+evIdx)||{value:ev.titulo}).value;
  var container = document.getElementById('icdatas'+evIdx);
  if (!container) return;
  var rows = container.querySelectorAll('div');
  var inputs = container.querySelectorAll('input[type=date]');
  for (var s = 0; s < inputs.length; s++) {
    var data = inputs[s].value;
    var st = _getStatusSessao(cliente, data, servicoId);
    var span = inputs[s].nextSibling;
    if (span && span.style) {
      if (st === 'duplicado') { span.style.background='#F0F0F0'; span.style.color='#999'; span.textContent='Ja existe'; }
      else if (st === 'atualizacao') { span.style.background='#F5F8E8'; span.style.color='#F57F17'; span.textContent='Atualizacao'; }
      else { span.style.background='#E8F5E9'; span.style.color='#388E3C'; span.textContent='Novo'; }
    }
  }
}

function atualizarDatasICS(evIdx, novaQtd) {
  var qtd = parseInt(novaQtd) || 1;
  var ev = window._icsEv[evIdx];
  var container = document.getElementById('icdatas'+evIdx);
  if (!container) return;
  var inputs = container.querySelectorAll('input[type=date]');
  var existing = [];
  for (var i = 0; i < inputs.length; i++) existing.push(inputs[i].value);
  var html = '';
  for (var s = 0; s < qtd; s++) {
    var val = existing[s] || (ev.sessoes[s] ? ev.sessoes[s].data : ev.sessoes[0].data);
    var st = _getStatusSessao(ev.titulo, val, '');
    var badge = '';
    if (st === 'duplicado') badge = '<span style="font-size:10px;background:#F0F0F0;color:#999;padding:2px 7px;border-radius:10px;margin-left:6px">Ja existe</span>';
    else if (st === 'atualizacao') badge = '<span style="font-size:10px;background:#F5F8E8;color:#F57F17;padding:2px 7px;border-radius:10px;margin-left:6px">Atualizacao</span>';
    else badge = '<span style="font-size:10px;background:#E8F5E9;color:#388E3C;padding:2px 7px;border-radius:10px;margin-left:6px">Novo</span>';
    html += '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:4px">'
      + '<span style="font-size:11px;color:#98989D;min-width:60px">Sessao '+(s+1)+'</span>'
      + '<input type="date" id="icdate_'+evIdx+'_'+s+'" value="'+val+'" '
      + 'style="padding:3px 6px;border:1px solid #E5E5EA;border-radius:6px;font-size:12px;font-family:Jost,sans-serif;outline:none">'
      + badge + '</div>';
  }
  container.innerHTML = html;
}

function confirmarICS(total) {
  var count = 0;
  for (var i = 0; i < total; i++) {
    var chk = document.getElementById('ic'+i);
    if (!chk || !chk.checked) continue;
    var cliente = (document.getElementById('icl'+i)||{value:''}).value.trim();
    var servicoIds = [];
    var servicoId = '';
    var servicoNomes = [];
    var qtd = parseInt((document.getElementById('icqtd'+i)||{value:'1'}).value) || 1;
    var ev = window._icsEv[i];
    // Build sessions - skip exact duplicates
    var sessoes = [];
    for (var s = 0; s < qtd; s++) {
      var dateEl = document.getElementById('icdate_'+i+'_'+s);
      var data = dateEl ? dateEl.value : (ev.sessoes[s] ? ev.sessoes[s].data : '');
      if (!data) continue;
      var st = _getStatusSessao(cliente, data, servicoId);
      if (st === 'duplicado') continue;
      var horaICSEl = document.getElementById('ichora_'+i+'_'+s);
      var horaICS = horaICSEl ? horaICSEl.value : (ev.sessoes[s] ? ev.sessoes[s].hora||'' : '');
      var srvIds = db.servicos.filter(function(sv){
        var el = document.getElementById('icchip_'+i+'_'+s+'_'+sv.id);
        return el && el.classList.contains('selected');
      }).map(function(sv){ return sv.id; });
      sessoes.push({ data: data, hora: horaICS, status: 'pendente', atendimentoId: null,
        servicoIds: srvIds, servico: srvIds.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:''; }).join(' + ') });
    }

    var nomeNorm = cliente.toLowerCase().trim();
    var existingIdx = -1;
    for (var a = 0; a < db.agenda.length; a++) {
      if (db.agenda[a].cliente.toLowerCase().trim() === nomeNorm) { existingIdx = a; break; }
    }

    if (existingIdx >= 0) {
      // FIX 3: Update existing - update name, obs, service AND merge sessions
      db.agenda[existingIdx].cliente = cliente;
      if (ev.desc) db.agenda[existingIdx].obs = ev.desc;
      if (servicoId) { db.agenda[existingIdx].servicoId = servicoId; db.agenda[existingIdx].servicoIds = servicoIds; }
      if (servicoNomes.length) db.agenda[existingIdx].servicoNome = servicoNomes.join(' + ');
      // Remove sessions that will be replaced, add new ones
      if (sessoes.length) {
        var replaceDates = {};
        for (var ns = 0; ns < sessoes.length; ns++) replaceDates[sessoes[ns].data] = true;
        db.agenda[existingIdx].sessoes = db.agenda[existingIdx].sessoes.filter(function(s2) {
          return !replaceDates[s2.data];
        });
        for (var ns2 = 0; ns2 < sessoes.length; ns2++) db.agenda[existingIdx].sessoes.push(sessoes[ns2]);
        db.agenda[existingIdx].sessoes.sort(function(a2,b2){ return a2.data.localeCompare(b2.data); });
      }
      count++;
    } else if (sessoes.length) {
      // New client
      db.agenda.push({
        id: uid(),
        cliente: cliente || ev.titulo,
        servicoId: servicoId,
        servicoIds: servicoIds,
        servicoNome: servicoNomes.length ? servicoNomes.join(' + ') : '(sem servico)',
        obs: ev.desc || 'Importado do Google Agenda',
        sessoes: sessoes
      });
      count++;
    }
  }
  document.getElementById('ics-modal').remove();
  saveData(); renderAll();
  showToast(count + ' agendamento(s) processado(s)!');
  console.log('ICS importado: ' + count);
}

// ===== ANAMNESE HELPERS =====
function toggleColarTexto() {
  var wrap = document.getElementById('colarTextoWrap');
  if(!wrap) return;
  wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
  if(wrap.style.display === 'block') {
    var ta = document.getElementById('textoFichaCliente');
    if(ta) { ta.value=''; ta.focus(); }
  }
}

function importarTextoFicha() {
  var ta = document.getElementById('textoFichaCliente');
  if(!ta || !ta.value.trim()) { showToast('Cole o texto da ficha primeiro!'); return; }
  var txt = ta.value;

  function extrai(label, txt) {
    var re = new RegExp(label + '[:\\s]+([^\\n]+)', 'i');
    var m = txt.match(re);
    return m ? m[1].trim().replace(/^[\*_]+|[\*_]+$/g,'').trim() : '';
  }
  function extraiSimNao(label, txt) {
    var val = extrai(label, txt);
    if(!val) return '';
    if(/^sim/i.test(val)) return 'sim';
    if(/^n/i.test(val)) return 'não';
    return val;
  }
  function extraiDetalhe(label, txt) {
    var val = extrai(label, txt);
    if(!val) return {resp:'', detalhe:''};
    var parts = val.split(/[-·]/);
    return {
      resp: parts[0].trim().toLowerCase(),
      detalhe: parts.slice(1).join('-').trim()
    };
  }

  // Parse fields
  var nome = extrai('Nome', txt);
  if(!nome) { showToast('Não consegui ler o nome. Verifique o texto!'); return; }

  var doencaD = extraiDetalhe('Doen[cç]a[^:]*', txt);
  var medD = extraiDetalhe('Medica[cç][aã]o[^:]*', txt);
  var injD = extraiDetalhe('Produto injetado', txt);
  var cirD = extraiDetalhe('Cirurgia', txt);
  var aleD = extraiDetalhe('Alergia', txt);
  var antiD = extraiDetalhe('Anticoncepcional', txt);

  // Build dados object matching existing format
  var dados = {
    tipo: 'anamnese_cliente',
    versao: '1.0',
    dataPreenchimento: extrai('Data', txt),
    informacoesPessoais: {
      nome: nome,
      idade: extrai('Idade', txt).split(/[|·]/)[0].trim(),
      genero: extrai('G[eê]nero', txt),

      dataNascimento: (function(){ var n=extrai('Nascimento', txt); if(!n) return ''; var p=n.split('/'); return p.length===3?p[2]+'-'+p[1]+'-'+p[0]:''; })(),
      telefone: extrai('Telefone', txt),
      cpf: extrai('CPF', txt),
      temFilhos: extraiSimNao('Filhos', txt),
      dataFilhos: ''
    },
    historicoSaude: {
      doencaDiagnosticada: doencaD.resp,
      doencaQual: doencaD.detalhe,
      medicacaoContinua: medD.resp,
      medicacaoQual: medD.detalhe,
      produtoInjetado: injD.resp,
      produtoQual: injD.detalhe,
      cirurgia: cirD.resp,
      cirurgiaQual: cirD.detalhe,
      alergia: aleD.resp,
      alergiaQual: aleD.detalhe,
      marcapasso: extraiSimNao('Marcapasso[^:]*', txt),
      problemasCirculatorios: extraiSimNao('(?:Prob[^:]*circulat|circulat)[^:]*', txt),
      hipertensao: extraiSimNao('Hipertens[aã]o', txt),
      diabetes: extraiSimNao('Diabetes', txt)
    },
    hormonal: {
      cicloMenstrual: extrai('Ciclo menstrual', txt),
      gravidaAmamentando: extraiSimNao('Gr[aá]vida[^:]*', txt),
      anticoncepcional: antiD.resp,
      antiQual: antiD.detalhe
    }
  };

  // Use existing importarAnamnese logic - call with parsed dados
  var setVal = function(id, v) { var el=document.getElementById(id); if(el&&v) el.value=v; };
  var setSel = function(id, v) { var el=document.getElementById(id); if(!el||!v) return;
    for(var i=0;i<el.options.length;i++){ if(el.options[i].value.toLowerCase()===v.toLowerCase()){ el.selectedIndex=i; return; } }
  };

  novaAnamnese();
  var p = dados.informacoesPessoais;
  setVal('an-nome', p.nome); setVal('an-idade', p.idade);
  setSel('an-genero', p.genero); setVal('an-dataNasc', p.dataNascimento);
  setVal('an-telefone', p.telefone); setVal('an-cpf', p.cpf||''); setSel('an-filhos', p.temFilhos);

  var s = dados.historicoSaude;
  setSel('an-doenca', s.doencaDiagnosticada); setVal('an-doencaQual', s.doencaQual);
  setSel('an-medicacao', s.medicacaoContinua); setVal('an-medicacaoQual', s.medicacaoQual);
  setSel('an-injetado', s.produtoInjetado); setVal('an-injetadoQual', s.produtoQual);
  setSel('an-cirurgia', s.cirurgia); setVal('an-cirurgiaQual', s.cirurgiaQual);
  setSel('an-alergia', s.alergia); setVal('an-alergiaQual', s.alergiaQual);
  setSel('an-marcapasso', s.marcapasso); setSel('an-circulatorio', s.problemasCirculatorios);
  setSel('an-hipertensao', s.hipertensao); setSel('an-diabetes', s.diabetes);

  var h = dados.hormonal;
  setSel('an-ciclo', h.cicloMenstrual); setSel('an-gravida', h.gravidaAmamentando);
  setSel('an-anti', h.anticoncepcional); setVal('an-antiQual', h.antiQual);

  document.getElementById('colarTextoWrap').style.display = 'none';
  showToast('✓ Ficha importada! Complete a avaliação e salve.');
}


// ===================== FALTA E REAGENDAMENTO =====================

function abrirModalFalta(agId, sessaoIdx) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var s = ag.sessoes[sessaoIdx];
  if (!s) return;
  var servico = (function(){
    var ids = s.servicoIds || [];
    if (ids.length) return ids.map(function(id){ var sv = db.servicos.find(function(x){ return x.id === id; }); return sv ? sv.nome : id; }).join(' + ');
    return s.servico || _agServicos(ag);
  })();

  var old = document.getElementById('modal-falta');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.id = 'modal-falta';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(28,28,30,0.6);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem';

  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden">'
    + '<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);display:flex;justify-content:space-between;align-items:center">'
    + '<div><div style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">❌ Marcar Falta</div>'
    + '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">' + ag.cliente + ' · Sessão ' + (sessaoIdx + 1) + ' · ' + fmtDate(s.data) + (s.hora ? ' às ' + s.hora : '') + '</div></div>'
    + '<button onclick="document.getElementById(\'modal-falta\').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="padding:1.5rem">'
    + '<div style="background:#FFF0F0;border:1px solid #FFCDD2;border-radius:10px;padding:1rem;margin-bottom:1.25rem;font-size:13px;color:#C62828">'
    + '⚠️ A sessão de <strong>' + servico + '</strong> será marcada como falta. O horário será liberado automaticamente.'
    + '</div>'

    // Opção de já reagendar
    + '<div style="margin-bottom:1.25rem">'
    + '<label style="display:flex;align-items:center;gap:0.75rem;cursor:pointer;font-size:14px;color:var(--text-dark)">'
    + '<input type="checkbox" id="falta-reagendar-agora" onchange="toggleReagendarAgora()" style="width:18px;height:18px;accent-color:#C4708A;cursor:pointer">'
    + 'Já sei a nova data — reagendar agora'
    + '</label>'
    + '</div>'

    // Form de nova data (oculto por padrão)
    + '<div id="falta-nova-data" style="display:none;background:var(--cream);border-radius:10px;padding:1rem;margin-bottom:1.25rem">'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">'
    + '<div><div style="font-size:10px;letter-spacing:1.5px;color:var(--text-light);text-transform:uppercase;margin-bottom:4px">Nova data</div>'
    + '<input type="date" id="falta-data" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none"></div>'
    + '<div><div style="font-size:10px;letter-spacing:1.5px;color:var(--text-light);text-transform:uppercase;margin-bottom:4px">Novo horário</div>'
    + '<input type="time" id="falta-hora" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none"></div>'
    + '</div></div>'

    // Botões
    + '<div style="display:flex;gap:0.75rem;flex-wrap:wrap">'
    + '<button class="btn btn-danger" onclick="confirmarFalta(\'' + agId + '\',' + sessaoIdx + ')" style="background:#C62828;color:white;border:none">❌ Confirmar Falta</button>'
    + '<button onclick="waMensagemFalta(\'' + ag.cliente + '\',\'' + _waTelefone(ag.cliente) + '\',\'' + servico.replace(/'/g, "\\'") + '\')" style="background:#E7F7EE;border:1px solid #7DB87D;color:#276749;border-radius:8px;padding:0.5rem 1rem;font-size:12px;cursor:pointer">💬 Avisar no WhatsApp</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'modal-falta\').remove()">Cancelar</button>'
    + '</div>'
    + '</div></div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

function toggleReagendarAgora() {
  var cb = document.getElementById('falta-reagendar-agora');
  var div = document.getElementById('falta-nova-data');
  if (div) div.style.display = cb && cb.checked ? 'block' : 'none';
}

async function confirmarFalta(agId, sessaoIdx) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var s = ag.sessoes[sessaoIdx];
  if (!s) return;

  // Marcar como falta — libera o horário
  s.status = 'falta';
  s._dataOriginal = s.data;
  s._horaOriginal = s.hora;

  // Se vai reagendar agora, adiciona nova sessão
  var reagendarAgora = document.getElementById('falta-reagendar-agora');
  if (reagendarAgora && reagendarAgora.checked) {
    var novaData = (document.getElementById('falta-data') || {value:''}).value;
    var novaHora = (document.getElementById('falta-hora') || {value:''}).value;
    if (!novaData) { showToast('Selecione a nova data!'); return; }

    // Adiciona nova sessão no final do pacote
    var novaServico = (function(){
      var ids = s.servicoIds || [];
      if (ids.length) return ids.map(function(id){ var sv = db.servicos.find(function(x){ return x.id === id; }); return sv ? sv.nome : id; }).join(' + ');
      return s.servico || _agServicos(ag);
    })();
    ag.sessoes.push({
      data: novaData,
      hora: novaHora,
      status: 'pendente',
      servicoIds: s.servicoIds || [],
      servico: s.servico || '',
      checkinData: null, checkinHora: null, checkinNome: null, atendimentoId: null
    });
    showToast('✅ Falta registrada e nova sessão agendada para ' + fmtDate(novaData) + '!');
  } else {
    showToast('✅ Falta registrada. Horário liberado!');
  }

  saveData();
  await _salvarAgenda(ag);
  renderAll();
  document.getElementById('modal-falta').remove();
}

// Modal reagendar (quando já está como falta)
function abrirModalReagendar(agId, sessaoIdx) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var s = ag.sessoes[sessaoIdx];
  if (!s) return;

  var old = document.getElementById('modal-reagendar');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.id = 'modal-reagendar';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(28,28,30,0.6);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem';

  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden">'
    + '<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);display:flex;justify-content:space-between;align-items:center">'
    + '<div style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">📅 Reagendar Sessão</div>'
    + '<button onclick="document.getElementById(\'modal-reagendar\').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="padding:1.5rem">'
    + '<div style="background:var(--cream);border-radius:10px;padding:0.75rem 1rem;margin-bottom:1.25rem;font-size:13px;color:var(--text-mid)">'
    + '👤 <strong>' + ag.cliente + '</strong> · Sessão ' + (sessaoIdx + 1)
    + (s._dataOriginal ? ' · Faltou em ' + fmtDate(s._dataOriginal) : '') + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem">'
    + '<div><div style="font-size:10px;letter-spacing:1.5px;color:var(--text-light);text-transform:uppercase;margin-bottom:4px">Nova data</div>'
    + '<input type="date" id="reagend-data" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none"></div>'
    + '<div><div style="font-size:10px;letter-spacing:1.5px;color:var(--text-light);text-transform:uppercase;margin-bottom:4px">Novo horário</div>'
    + '<input type="time" id="reagend-hora" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none"></div>'
    + '</div>'
    + '<div style="display:flex;gap:0.75rem;flex-wrap:wrap">'
    + '<button class="btn btn-primary" onclick="confirmarReagendamento(\'' + agId + '\',' + sessaoIdx + ')">📅 Confirmar Reagendamento</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'modal-reagendar\').remove()">Cancelar</button>'
    + '</div>'
    + '</div></div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

async function confirmarReagendamento(agId, sessaoIdx) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var s = ag.sessoes[sessaoIdx];
  if (!s) return;

  var novaData = (document.getElementById('reagend-data') || {value:''}).value;
  var novaHora = (document.getElementById('reagend-hora') || {value:''}).value;
  if (!novaData) { showToast('Selecione a nova data!'); return; }

  // Adiciona nova sessão mantendo a falta no histórico
  ag.sessoes.push({
    data: novaData,
    hora: novaHora,
    status: 'pendente',
    servicoIds: s.servicoIds || [],
    servico: s.servico || '',
    checkinData: null, checkinHora: null, checkinNome: null, atendimentoId: null
  });

  saveData();
  await _salvarAgenda(ag);
  renderAll();
  document.getElementById('modal-reagendar').remove();
  showToast('✅ Nova sessão agendada para ' + fmtDate(novaData) + '!');
}

function waMensagemFalta(cliente, tel, servico) {
  var msg = _getMensagem ? _getMensagem('reagendar') || '' : '';
  if (!msg) {
    msg = 'Olá ' + cliente.split(' ')[0] + '! 🌸\n\n'
      + 'Notamos que você não compareceu à sua sessão de *' + servico + '* hoje. Tudo bem? 😊\n\n'
      + 'Quando quiser reagendar é só me avisar, tenho horários disponíveis! ✨';
  }
  var telFmt = tel ? '55' + tel.replace(/\D/g,'') : '';
  window.open('https://wa.me/' + telFmt + '?text=' + encodeURIComponent(msg), '_blank');
}

// ===================== CORES E RECORRÊNCIA =====================

// ── Seletor de cor via bolinhas ──
function selecionarCorAg(el) {
  var cor = el.getAttribute('data-cor');
  if (!cor) return;
  // Atualiza input hidden
  var input = document.getElementById('ag-cor');
  if (input) input.value = cor;
  // Visual: remove seleção de todas e marca a clicada
  document.querySelectorAll('#ag-cor-bolinhas .cor-bolinha').forEach(function(b) {
    b.style.border = '3px solid transparent';
    b.style.boxShadow = 'none';
  });
  var darken = _darkenCor(cor);
  el.style.border = '3px solid ' + darken;
  el.style.boxShadow = '0 0 0 2px white, 0 0 0 4px ' + darken;
}

// ── Escurecer cor hex para borda de seleção ──
function _darkenCor(hex) {
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  r = Math.max(0, r-50); g = Math.max(0, g-50); b = Math.max(0, b-50);
  return '#' + [r,g,b].map(function(v){ return v.toString(16).padStart(2,'0'); }).join('');
}

// ── Bolinhas no modal de edição ──
function _renderCorBolinhas(containerId, corAtual) {
  var cores = [
    {hex:'#D4A0A8', label:'Rosa'},
    {hex:'#5B9BD5', label:'Azul'},
    {hex:'#70AD47', label:'Verde'},
    {hex:'#FF4444', label:'Vermelho'},
    {hex:'#FFC000', label:'Amarelo'},
    {hex:'#9B59B6', label:'Lilás'},
    {hex:'#8B4513', label:'Marrom'},
    {hex:'#FF8C00', label:'Laranja'}
  ];
  var sel = corAtual || '#D4A0A8';
  return cores.map(function(c) {
    var darken = _darkenCor(c.hex);
    var ativo = (c.hex === sel);
    var borderStyle = ativo ? ('3px solid ' + darken) : '3px solid transparent';
    var shadowStyle = ativo ? ('0 0 0 2px white, 0 0 0 4px ' + darken) : 'none';
    return '<span class="cor-bolinha-edit" data-cor="' + c.hex + '" title="' + c.label + '" '
      + 'onclick="selecionarCorEdit(this,\'' + containerId + '\')" '
      + 'style="display:inline-block;background:' + c.hex + ';width:26px;height:26px;border-radius:50%;'
      + 'cursor:pointer;border:' + borderStyle + ';box-shadow:' + shadowStyle + ';transition:all 0.15s">'
      + '</span>';
  }).join('');
}

function selecionarCorEdit(el, containerId) {
  var cor = el.getAttribute('data-cor');
  if (!cor) return;
  // Suporte ao novo ciclo: containerId='nc' usa 'nc-cor', outros usam 'agedit-cor-hidden-xxx'
  var inputId = containerId === 'nc' ? 'nc-cor' : 'agedit-cor-hidden-' + containerId;
  var input = document.getElementById(inputId);
  if (input) input.value = cor;
  var wrapId = containerId === 'nc' ? 'nc-cor-wrap' : 'agedit-cor-wrap-' + containerId;
  var container = document.getElementById(wrapId);
  if (container) {
    container.querySelectorAll('.cor-bolinha-edit').forEach(function(b) {
      b.style.border = '3px solid transparent';
      b.style.boxShadow = 'none';
    });
  }
  var darken = _darkenCor(cor);
  el.style.border = '3px solid ' + darken;
  el.style.boxShadow = '0 0 0 2px white, 0 0 0 4px ' + darken;
}

function toggleRecorrencia() {
  var sel = document.getElementById('ag-recorrencia');
  var cfg = document.getElementById('ag-recorr-config');
  var dias = document.getElementById('ag-recorr-dias');
  if (!sel || !cfg) return;
  if (sel.value === '') {
    cfg.style.display = 'none';
    // Sem recorrência: garantir que o campo de data padrão aparece
    var qtd = parseInt((document.getElementById('ag-qtd')||{value:'0'}).value) || 0;
    if (qtd < 1) {
      var campos = document.getElementById('ag-datas-campos');
      if (campos) campos.innerHTML = ''; // limpa para recriar
    }
    gerarCamposDatas();
  } else {
    cfg.style.display = 'block';
    if (dias) dias.style.display = sel.value === 'personalizado' ? 'block' : 'none';
    // Com recorrência: esconder campo padrão se qtd=0
    var qtdRec = parseInt((document.getElementById('ag-qtd')||{value:'0'}).value) || 0;
    if (qtdRec < 1) {
      var wrap = document.getElementById('ag-datas-wrap');
      var campos2 = document.getElementById('ag-datas-campos');
      if (wrap) wrap.style.display = 'none';
      if (campos2) campos2.innerHTML = '';
    }
  }
}

function _gerarSessoesRecorrentes(sessoesBase, recorrencia) {
  var ate = (document.getElementById('ag-recorr-ate') || {value:''}).value;
  var horaFixa = (document.getElementById('ag-recorr-hora') || {value:''}).value;
  var horaFimFixa = (document.getElementById('ag-recorr-horafim') || {value:''}).value;
  var dataInicioStr = (document.getElementById('ag-recorr-inicio') || {value:''}).value;

  if (!ate) return sessoesBase || [];

  // Se não tem sessões manuais, usa data de início do campo de recorrência
  var primeira = (sessoesBase && sessoesBase.length && sessoesBase[0].data)
    ? sessoesBase[0]
    : { data: dataInicioStr, hora: horaFixa, servicoIds: [], servico: '' };

  var inicioStr = primeira.data || dataInicioStr;
  if (!inicioStr) return sessoesBase || [];

  // ─── Função segura para formatar data sem bug de fuso horário ───
  function _fmtDataLocal(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  }

  // Usar T12:00:00 para evitar problema de meia-noite com fuso
  var dataInicio = new Date(inicioStr + 'T12:00:00');
  var dataFim = new Date(ate + 'T12:00:00');
  var hora = horaFixa || primeira.hora || '';
  var sessoes = [];
  var atual = new Date(dataInicio);

  // Limite de segurança: máx 500 sessões
  var limite = 500;

  if (recorrencia === 'semanal') {
    while (atual <= dataFim && sessoes.length < limite) {
      sessoes.push({
        data: _fmtDataLocal(atual),
        hora: hora, horaFim: horaFimFixa, status: 'pendente', atendimentoId: null,
        servicoIds: primeira.servicoIds || [], servico: primeira.servico || ''
      });
      atual.setDate(atual.getDate() + 7);
    }
  } else if (recorrencia === 'quinzenal') {
    while (atual <= dataFim && sessoes.length < limite) {
      sessoes.push({
        data: _fmtDataLocal(atual),
        hora: hora, horaFim: horaFimFixa, status: 'pendente', atendimentoId: null,
        servicoIds: primeira.servicoIds || [], servico: primeira.servico || ''
      });
      atual.setDate(atual.getDate() + 14);
    }
  } else if (recorrencia === 'mensal') {
    while (atual <= dataFim && sessoes.length < limite) {
      sessoes.push({
        data: _fmtDataLocal(atual),
        hora: hora, horaFim: horaFimFixa, status: 'pendente', atendimentoId: null,
        servicoIds: primeira.servicoIds || [], servico: primeira.servico || ''
      });
      atual.setMonth(atual.getMonth() + 1);
    }
  } else if (recorrencia === 'personalizado') {
    var diasCheck = document.querySelectorAll('.ag-dia-check:checked');
    var diasSemana = Array.from(diasCheck).map(function(c){ return parseInt(c.value); });
    if (!diasSemana.length) return sessoesBase && sessoesBase.length ? sessoesBase : [];
    var d = new Date(dataInicio);
    while (d <= dataFim && sessoes.length < limite) {
      if (diasSemana.indexOf(d.getDay()) >= 0) {
        sessoes.push({
          data: _fmtDataLocal(d),
          hora: hora, horaFim: horaFimFixa, status: 'pendente', atendimentoId: null,
          servicoIds: primeira.servicoIds || [], servico: primeira.servico || ''
        });
      }
      d.setDate(d.getDate() + 1);
    }
  }

  return sessoes.length > 0 ? sessoes : (sessoesBase && sessoesBase.length ? sessoesBase : []);
}


// ── Edição rápida do sinal ──
function _editarSinalRapido(agId) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var novoSinal = prompt('Editar sinal de ' + ag.cliente + ':\n(Valor atual: R$ ' + parseFloat(ag.sinal||0).toFixed(2) + ')', parseFloat(ag.sinal||0).toFixed(2));
  if (novoSinal === null) return;
  var val = parseFloat(novoSinal.replace(',','.'));
  if (isNaN(val) || val < 0) { showToast('Valor inválido!'); return; }
  ag.sinal = val;
  saveData();
  _salvarAgenda(ag);
  renderAll();
  showToast('✅ Sinal atualizado: R$ ' + val.toFixed(2).replace('.',','));
}
