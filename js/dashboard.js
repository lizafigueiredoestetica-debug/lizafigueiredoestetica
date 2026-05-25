/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — dashboard.js
   renderDashboard, renderAniversariantes, setPeriod, filterByPeriod
   ===================================================== */

// ===================== DASHBOARD =====================
function renderDashboard() {
  const atends = filterByPeriod(db.atendimentos, 'data');
  const despAdms = filterByPeriod(db.despAdm, 'data');
  const despExtras = filterByPeriod(db.despExtra, 'data');

  const receita = atends.reduce((s,a) => s + parseFloat(a.valor||0), 0);
  const custDespAdm = despAdms.reduce((s,d) => s + parseFloat(d.valor||0), 0);
  const custDespExtra = despExtras.reduce((s,d) => s + parseFloat(d.valor||0), 0);
  const totalCusto = custDespAdm + custDespExtra;
  const lucro = receita - totalCusto;

  var isAdmin = _usuarioLogado && _usuarioLogado.nivel === 'admin';
  var temFinanceiro = isAdmin || (_usuarioLogado && (_usuarioLogado.permissoes||[]).indexOf('dashboard_financeiro') >= 0);

  const cards = [
    {label:'Receita', value: fmtMoney(receita), sub: atends.length + ' atendimentos', cls:'gold', icon:'💰', fin:true},
    {label:'Custos', value: fmtMoney(totalCusto), sub: 'Mat + Desp.', cls:'red', icon:'📉', fin:true},
    {label:'Lucro Líquido', value: fmtMoney(lucro), sub: lucro>=0?'Positivo':'Atenção!', cls: lucro>=0?'green':'red', icon:'✨', fin:true},
    {label:'Atendimentos', value: atends.length, sub: 'no período', cls:'', icon:'👐', fin:false},
    {label:'Alerta Estoque', value: db.materiais.filter(m=>parseInt(m.qtd)<parseInt(m.min||0)).length, sub: 'produtos em baixa', cls:'red', icon:'⚠️', fin:false}
  ];

  renderAniversariantes();
  document.getElementById('dashCards').innerHTML = cards
    .filter(c => !c.fin || temFinanceiro)
    .map(c => `
    <div class="summary-card">
      <div class="card-icon">${c.icon}</div>
      <div class="card-label">${c.label}</div>
      <div class="card-value ${c.cls}">${c.value}</div>
      <div class="card-sub">${c.sub}</div>
    </div>
  `).join('');

  // TOP 5
  const contagem = {};
  atends.forEach(a => {
    const ids = a.servicoIds || (a.servicoId ? [a.servicoId] : []);
    ids.forEach(sid => { contagem[sid] = (contagem[sid]||0)+1; });
  });
  const top5 = Object.entries(contagem).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxCount = top5.length ? top5[0][1] : 1;
  document.getElementById('top5Panel').innerHTML = top5.length ? top5.map(([sid, cnt], i) => {
    const s = db.servicos.find(x=>x.id===sid);
    return `<div class="top5-item">
      <div class="top5-rank">${i+1}</div>
      <div class="top5-info"><div class="top5-name">${s?s.nome:'Serviço removido'}</div><div class="top5-cat">${s?s.categoria:''}</div></div>
      <div class="top5-bar-wrap"><div class="top5-bar"><div class="top5-bar-fill" style="width:${(cnt/maxCount*100)}%"></div></div></div>
      <div class="top5-count">${cnt}x</div>
    </div>`;
  }).join('') : '<div class="empty-state"><div class="empty-icon">💆</div><p>Nenhum atendimento no período</p></div>';

  // PAGAMENTOS
  const pagtos = {pix:0, dinheiro:0, cartao_debito:0, cartao_credito:0};
  atends.forEach(a => { if(a.pagto) pagtos[a.pagto] = (pagtos[a.pagto]||0) + parseFloat(a.valor||0); });
  const totalPagto = Object.values(pagtos).reduce((s,v)=>s+v,0);
  const cores = {pix:'#7DB87D', dinheiro:'#C9A84C', cartao_debito:'#6BA3D6', cartao_credito:'#C98890'};
  const labels = {pix:'PIX', dinheiro:'Dinheiro', cartao_debito:'Cartão Débito', cartao_credito:'Cartão Crédito'};
  const pagtoHtml = Object.entries(pagtos).filter(([k,v])=>v>0).map(([k,v]) => `
    <div class="pagto-item">
      <div class="pagto-dot" style="background:${cores[k]}"></div>
      <div class="pagto-label">${labels[k]}</div>
      <div class="pagto-value">${fmtMoney(v)}</div>
      <div class="pagto-pct">${totalPagto?Math.round(v/totalPagto*100):0}%</div>
    </div>
  `).join('');
  document.getElementById('pagtoPanel').innerHTML = pagtoHtml || '<div class="empty-state"><div class="empty-icon">💳</div><p>Nenhum pagamento no período</p></div>';

  // ESTOQUE BAIXO
  const baixo = db.materiais.filter(m => parseInt(m.qtd) < parseInt(m.min||0));
  document.getElementById('estoqueAlert').innerHTML = baixo.length ? baixo.map(m =>
    `<div class="alert-item"><div class="alert-name">${m.nome}</div><div class="alert-qty">Estoque: ${m.qtd} ${m.unidade} (mín: ${m.min})</div></div>`
  ).join('') : '<div class="empty-state"><div class="empty-icon">✅</div><p>Todos os materiais OK</p></div>';

  // ÚLTIMOS 5
  const ultimos = [...db.atendimentos].sort((a,b)=>b.data.localeCompare(a.data)).slice(0,5);
  document.getElementById('ultimosAtend').innerHTML = ultimos.length ? `<table style="width:100%"><thead><tr><th>Data</th><th>Cliente</th><th>Serviço</th><th>Valor</th></tr></thead><tbody>` +
    ultimos.map(a => {
      const ids2 = a.servicoIds || (a.servicoId ? [a.servicoId] : []);
      const sNomes = ids2.map(sid=>{const sv=db.servicos.find(x=>x.id===sid);return sv?sv.nome:'?'}).join(' + ')||'—';
      return `<tr class="data-row" style="cursor:default"><td>${fmtDate(a.data)}</td><td>${a.cliente}</td><td>${sNomes}</td><td>${fmtMoney(a.valor)}</td></tr>`;
    }).join('') + '</tbody></table>'
  : '<div class="empty-state" style="padding:2rem"><div class="empty-icon">📋</div><p>Nenhum atendimento</p></div>';

  // SESSOES HOJE
  var _h = _hoje();
  var _sl = [];
  for(var _i=0;_i<db.agenda.length;_i++){
    var _ag=db.agenda[_i];
    for(var _j=0;_j<_ag.sessoes.length;_j++){
      if(_ag.sessoes[_j].data===_h) _sl.push({ag:_ag,idx:_j,st:_ag.sessoes[_j].status});
    }
  }
  var _sp=document.getElementById('sessoesHojePanel');
  if(_sp){
    if(!_sl.length){
      _sp.innerHTML='<div class="empty-state" style="padding:2rem"><div class="empty-icon">📅</div><p>Nenhuma sessão hoje</p></div>';
    } else {
      var _rows='';
      for(var _k=0;_k<_sl.length;_k++){
        var _item=_sl[_k];
        var _badge=_item.st==='realizado'?'<span class="badge-pill badge-ativo" style="font-size:11px">✓ Realizado</span>':'<span style="background:var(--rose-light);color:var(--rose-dark);padding:3px 10px;border-radius:20px;font-size:11px">Pendente</span>';
        var _btn=_item.st!=='realizado'?'<button class="btn btn-primary btn-sm" onclick="realizarSessao(\''+_item.ag.id+'\','+_item.idx+')" style="font-size:11px;padding:4px 10px">✓ Realizar</button>':''
        _hora=_item.ag.sessoes[_item.idx]&&_item.ag.sessoes[_item.idx].hora?' <span style="color:var(--text-light);font-size:11px">'+_item.ag.sessoes[_item.idx].hora+'</span>':'';
        var _sessao=_item.ag.sessoes[_item.idx];
        var _srvIds=_sessao&&_sessao.servicoIds||[];
        var _srvNome=_srvIds.length
          ? _srvIds.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }).join(' + ')
          : (_sessao&&_sessao.servico ? _sessao.servico : _agServicos(_item.ag));
        _rows+='<tr><td><strong>'+_item.ag.cliente+'</strong>'+_hora+'</td><td>'+(_srvNome||'—')+'</td><td>'+_badge+'</td><td>'+_btn+'</td></tr>';
      }
      _sp.innerHTML='<table style="width:100%"><thead><tr><th>Cliente</th><th>Serviço</th><th>Status</th><th></th></tr></thead><tbody>'+_rows+'</tbody></table>';
    }
  }

  // Check-ins de hoje no Dashboard
  var _cp = document.getElementById('dashCheckinBody');
  if (_cp) {
    var _hojeCheck = _hoje();
    var _checkins = [];
    db.agenda.forEach(function(ag) {
      ag.sessoes.forEach(function(s, idx) {
        if ((s.status === 'presente' || s.status === 'realizado') && s.checkinData) {
          var dataCheck = s.checkinData.split('/').reverse().join('-');
          if (dataCheck === _hojeCheck) {
            var srvIds = s.servicoIds||[];
            var srvNome = srvIds.length
              ? srvIds.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }).join(' + ')
              : (s.servico||'—');
            _checkins.push({ hora: s.checkinHora||'—', nome: s.checkinNome||ag.cliente, servico: srvNome, sessao: idx+1 });
          }
        }
      });
    });
    _checkins.sort(function(a,b){ return a.hora.localeCompare(b.hora); });
    if (!_checkins.length) {
      _cp.innerHTML = '<div class="empty-state" style="padding:2rem"><div class="empty-icon">✅</div><p>Nenhum check-in hoje</p></div>';
    } else {
      var _crows = _checkins.map(function(c){
        return '<tr><td><strong>'+c.hora+'</strong></td><td>'+c.nome+'</td><td style="font-size:12px;color:#555">'+c.servico+'</td><td style="font-size:11px;color:#888">Sessão '+c.sessao+'</td></tr>';
      }).join('');
      _cp.innerHTML = '<table style="width:100%"><thead><tr><th>Hora</th><th>Cliente</th><th>Serviço</th><th>Sessão</th></tr></thead><tbody>'+_crows+'</tbody></table>';
    }
  }
}
function renderServiceChips() {
  const filtServicos = (document.getElementById('filtServicos')||{value:''}).value.toLowerCase().trim();
  const filtMateriais = (document.getElementById('filtMateriais')||{value:''}).value.toLowerCase().trim();

  const ativos = db.servicos.filter(s=>s.status==='ativo' && (!filtServicos || s.nome.toLowerCase().includes(filtServicos)));
  const scEl = document.getElementById('serviceChips');
  scEl.innerHTML = ativos.length ?
    ativos.map(s => `<div class="service-chip ${selectedServicos.includes(s.id)?'selected':''}" data-id="${s.id}">${s.nome}</div>`).join('') :
    '<div style="font-size:12px;color:var(--text-light);padding:0.5rem">Nenhum serviço encontrado</div>';
  scEl.querySelectorAll('.service-chip').forEach(el => {
    el.addEventListener('click', function() { toggleServico(this.dataset.id); });
  });

  const matFiltrados = db.materiais.filter(m => !filtMateriais || m.nome.toLowerCase().includes(filtMateriais));
  const mcEl = document.getElementById('materialChips');
  mcEl.innerHTML = matFiltrados.length ?
    matFiltrados.map(m => {
      const qtdUsada = selectedMateriais[m.id] || 0;
      return `<div class="material-chip ${qtdUsada>0?'selected':''}" data-id="${m.id}">${m.nome} (estoque: ${m.qtd} ${m.unidade})${qtdUsada>0?' ×'+qtdUsada:''}</div>`;
    }).join('') :
    '<div style="font-size:12px;color:var(--text-light);padding:4px">Nenhum material encontrado</div>';
  mcEl.querySelectorAll('.material-chip').forEach(el => {
    el.addEventListener('click', function() { toggleMaterial(this.dataset.id); });
  });
}

function toggleServico(id) {
  if(selectedServicos.includes(id)) {
    selectedServicos = selectedServicos.filter(x=>x!==id);
  } else {
    selectedServicos.push(id);
  }
  // Auto-sum prices of all selected services
  const total = selectedServicos.reduce((sum, sid) => {
    const s = db.servicos.find(x=>x.id===sid);
    return sum + (s ? parseFloat(s.preco) : 0);
  }, 0);
  if(total > 0) document.getElementById('atend-valor').value = total.toFixed(2);
  renderServiceChips();
}

function toggleMaterial(id) {
  const m = db.materiais.find(x=>x.id===id);
  if(!m) return;
  if(selectedMateriais[id]) {
    const novaQtd = prompt('Quantidade utilizada de "' + m.nome + '":\n(Digite 0 para remover)', selectedMateriais[id]);
    if(novaQtd === null) return;
    const qtd = parseInt(novaQtd);
    if(isNaN(qtd) || qtd <= 0) {
      delete selectedMateriais[id];
    } else if(qtd > parseInt(m.qtd)) {
      showToast('Estoque insuficiente! Disponível: ' + m.qtd + ' ' + m.unidade);
      return;
    } else {
      selectedMateriais[id] = qtd;
    }
  } else {
    const qtdStr = prompt('Quantas unidades de "' + m.nome + '" foram utilizadas?\n(Disponível: ' + m.qtd + ' ' + m.unidade + ')', '1');
    if(qtdStr === null) return;
    const qtd = parseInt(qtdStr);
    if(isNaN(qtd) || qtd <= 0) return;
    if(qtd > parseInt(m.qtd)) {
      showToast('Estoque insuficiente! Disponível: ' + m.qtd + ' ' + m.unidade);
      return;
    }
    selectedMateriais[id] = qtd;
  }
  renderServiceChips();
}

