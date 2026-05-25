/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — supabase.js
   Todas as funções de comunicação com o Supabase
   ===================================================== */

// ── Headers padrão Supabase ──
function _supaHeaders(extra) {
  var h = {
    'Content-Type': 'application/json',
    'apikey': SUPA_KEY,
    'Authorization': 'Bearer ' + SUPA_KEY,
    'Prefer': 'resolution=merge-duplicates,return=minimal'
  };
  if (extra) Object.assign(h, extra);
  return h;
}

// ── Upsert individual em qualquer tabela ──
async function _supaUpsert(tabela, registro) {
  try {
    var resp = await fetch(SUPA_URL + '/rest/v1/' + tabela, {
      method: 'POST',
      headers: _supaHeaders(),
      body: JSON.stringify(registro)
    });
    if (!resp.ok) {
      var err = await resp.text();
      addLog('WARN', '⚠️ Upsert ' + tabela + ' falhou: ' + err);
      return false;
    }
    return true;
  } catch(e) {
    addLog('WARN', '⚠️ Upsert ' + tabela + ' erro: ' + e.message);
    return false;
  }
}

// ── Delete individual em qualquer tabela ──
async function _supaDelete(tabela, id) {
  try {
    var resp = await fetch(SUPA_URL + '/rest/v1/' + tabela + '?id=eq.' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: _supaHeaders()
    });
    return resp.ok;
  } catch(e) {
    addLog('WARN', '⚠️ Delete ' + tabela + ' erro: ' + e.message);
    return false;
  }
}

// ── Buscar todos os registros de uma tabela ──
async function _supaGetAll(tabela) {
  try {
    var resp = await fetch(SUPA_URL + '/rest/v1/' + tabela + '?select=*&limit=1000', {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch(e) {
    return null;
  }
}

// ── Buscar registros novos desde um timestamp ──
async function _supaGetNovos(tabela, desde) {
  try {
    var url = SUPA_URL + '/rest/v1/' + tabela + '?select=*&atualizado_em=gt.' + encodeURIComponent(desde) + '&limit=500';
    var resp = await fetch(url, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch(e) {
    return null;
  }
}

// ── Salvar sessões de um agendamento ──
async function _salvarSessoes(agId, sessoes) {
  try {
    await fetch(SUPA_URL + '/rest/v1/sessoes?agenda_id=eq.' + encodeURIComponent(agId), {
      method: 'DELETE',
      headers: _supaHeaders()
    });
  } catch(e) {}
  for (var i = 0; i < sessoes.length; i++) {
    var s = sessoes[i];
    await _supaUpsert('sessoes', {
      id: agId + '_s' + i,
      agenda_id: agId,
      indice: i,
      data: s.data || null,
      hora: s.hora || '',
      status: s.status || 'pendente',
      servico_ids: s.servicoIds || [],
      servico: s.servico || '',
      checkin_data: s.checkinData || null,
      checkin_hora: s.checkinHora || null,
      checkin_nome: s.checkinNome || null,
      atualizado_em: new Date().toISOString()
    });
  }
}

// ── Salvar registro específico no Supabase ──
async function _salvarServico(s) {
  return _supaUpsert('servicos', { id: s.id, nome: s.nome, categoria: s.categoria, duracao: s.duracao, preco: s.preco, status: s.status, atualizado_em: new Date().toISOString() });
}
async function _salvarCategoria(c) {
  return _supaUpsert('categorias', { id: c.id, nome: c.nome });
}
async function _salvarMaterial(m) {
  return _supaUpsert('materiais', { id: m.id, nome: m.nome, fornecedor: m.fornecedor, custo: m.custo, qtd: m.qtd, min: m.min, unidade: m.unidade, atualizado_em: new Date().toISOString() });
}
async function _salvarAnamnese(a) {
  return _supaUpsert('anamneses', { id: a.id, data_cadastro: a.dataCadastro, pessoais: a.pessoais, saude: a.saude, hormonal: a.hormonal, habitos: a.habitos, av_fisica: a.avFisica, av_corporal: a.avCorporal, incomoda: a.incomoda, assinatura: a.assinatura, data_assinatura: a.dataAssinatura, atualizado_em: new Date().toISOString() });
}
async function _salvarAtendimento(a) {
  return _supaUpsert('atendimentos', { id: a.id, data: a.data, cliente: a.cliente, valor: a.valor, pagto: a.pagto, servico_ids: a.servicoIds || [], materiais: a.materiais || [], obs: a.obs, atualizado_em: new Date().toISOString() });
}
async function _salvarAgenda(ag) {
  await _supaUpsert('agenda', { id: ag.id, cliente: ag.cliente, tel: ag.tel, obs: ag.obs, sinal: ag.sinal, sinal_pago: ag.sinalPago, atualizado_em: new Date().toISOString() });
  await _salvarSessoes(ag.id, ag.sessoes || []);
}
async function _salvarDespAdm(d) {
  return _supaUpsert('desp_adm', { id: d.id, descricao: d.desc, cat: d.cat, valor: d.valor, data: d.data, recorrencia: d.recorrencia });
}
async function _salvarDespExtra(d) {
  return _supaUpsert('desp_extra', { id: d.id, descricao: d.desc, valor: d.valor, data: d.data, obs: d.obs });
}

// ── Delete por entidade ──
async function _deletarServico(id) { return _supaDelete('servicos', id); }
async function _deletarMaterial(id) { return _supaDelete('materiais', id); }
async function _deletarAtendimento(id) { return _supaDelete('atendimentos', id); }
async function _deletarAgenda(id) {
  await fetch(SUPA_URL + '/rest/v1/sessoes?agenda_id=eq.' + encodeURIComponent(id), { method: 'DELETE', headers: _supaHeaders() });
  return _supaDelete('agenda', id);
}
async function _deletarAnamnese(id) { return _supaDelete('anamneses', id); }
async function _deletarCategoria(id) { return _supaDelete('categorias', id); }
async function _deletarDespAdm(id) { return _supaDelete('desp_adm', id); }
async function _deletarDespExtra(id) { return _supaDelete('desp_extra', id); }

// ── Carregar todos os dados do Supabase ──
async function _carregarDaNuvem() {
  try {
    _atualizarStatusSync('carregando');
    var [
      servicos, categorias, materiais, anamneses,
      agenda, sessoes, atendimentos, despAdm, despExtra
    ] = await Promise.all([
      _supaGetAll('servicos'),
      _supaGetAll('categorias'),
      _supaGetAll('materiais'),
      _supaGetAll('anamneses'),
      _supaGetAll('agenda'),
      _supaGetAll('sessoes'),
      _supaGetAll('atendimentos'),
      _supaGetAll('desp_adm'),
      _supaGetAll('desp_extra')
    ]);

    if (!servicos && !agenda && !atendimentos) {
      return await _carregarDaNuvemLegado();
    }

    db.servicos = (servicos || []).map(function(s) {
      return { id: s.id, nome: s.nome, categoria: s.categoria, duracao: s.duracao, preco: s.preco, status: s.status };
    });
    db.categorias = (categorias || []).map(function(c) {
      return { id: c.id, nome: c.nome };
    });
    db.materiais = (materiais || []).map(function(m) {
      return { id: m.id, nome: m.nome, fornecedor: m.fornecedor, custo: m.custo, qtd: m.qtd, min: m.min, unidade: m.unidade };
    });
    db.anamneses = (anamneses || []).map(function(a) {
      return {
        id: a.id, dataCadastro: a.data_cadastro,
        pessoais: a.pessoais || {}, saude: a.saude || {},
        hormonal: a.hormonal || {}, habitos: a.habitos || {},
        avFisica: a.av_fisica || {}, avCorporal: a.av_corporal || {},
        incomoda: a.incomoda, assinatura: a.assinatura, dataAssinatura: a.data_assinatura
      };
    });
    db.atendimentos = (atendimentos || []).map(function(a) {
      return {
        id: a.id, data: a.data, cliente: a.cliente, valor: a.valor,
        pagto: a.pagto, servicoIds: a.servico_ids || [], materiais: a.materiais || [], obs: a.obs
      };
    });
    db.despAdm = (despAdm || []).map(function(d) {
      return { id: d.id, desc: d.descricao, cat: d.cat, valor: d.valor, data: d.data, recorrencia: d.recorrencia };
    });
    db.despExtra = (despExtra || []).map(function(d) {
      return { id: d.id, desc: d.descricao, valor: d.valor, data: d.data, obs: d.obs };
    });

    var sessoesMap = {};
    (sessoes || []).forEach(function(s) {
      if (!sessoesMap[s.agenda_id]) sessoesMap[s.agenda_id] = [];
      sessoesMap[s.agenda_id].push(s);
    });
    db.agenda = (agenda || []).map(function(ag) {
      var sess = (sessoesMap[ag.id] || []).sort(function(a,b){ return a.indice - b.indice; });
      return {
        id: ag.id, cliente: ag.cliente, tel: ag.tel, obs: ag.obs,
        sinal: ag.sinal, sinalPago: ag.sinal_pago, servicoIds: [], servicoNome: '—',
        sessoes: sess.map(function(s) {
          return {
            data: s.data, hora: s.hora || '', status: s.status,
            servicoIds: s.servico_ids || [], servico: s.servico || '',
            checkinData: s.checkin_data, checkinHora: s.checkin_hora,
            checkinNome: s.checkin_nome, atendimentoId: s.atendimento_id
          };
        })
      };
    });

    if(!db.acomp) db.acomp = [];
    if(!db.entradaEstoque) db.entradaEstoque = [];

    localStorage.setItem('lizafig_db', JSON.stringify(db));
    var now = new Date().toLocaleString('pt-BR');
    localStorage.setItem('lizafig_lastsync', now);
    _atualizarStatusSync('ok', now);
    addLog('INFO', '☁️ Dados carregados — ' + db.atendimentos.length + ' atend, ' + db.agenda.length + ' agend, ' + db.anamneses.length + ' anam');
    return true;
  } catch(e) {
    addLog('WARN', '⚠️ Erro ao carregar: ' + e.message);
    _atualizarStatusSync('offline');
    return false;
  }
}

// ── Fallback: carregar do JSON legado (tabela dados) ──
async function _carregarDaNuvemLegado() {
  try {
    var resp = await fetch(SUPA_URL + '/rest/v1/dados?id=eq.principal&select=conteudo,atualizado_em', {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    });
    if (!resp.ok) return false;
    var rows = await resp.json();
    if (!rows || !rows.length || !rows[0].conteudo) return false;
    var dados = rows[0].conteudo;
    if (typeof dados === 'string') dados = JSON.parse(dados);
    if (!dados || typeof dados !== 'object') return false;
    db = dados;
    if(!db.categorias) db.categorias = [];
    if(!db.agenda) db.agenda = [];
    if(!db.anamneses) db.anamneses = [];
    if(!db.acomp) db.acomp = [];
    if(!db.entradaEstoque) db.entradaEstoque = [];
    if(!db.servicos) db.servicos = [];
    if(!db.materiais) db.materiais = [];
    if(!db.atendimentos) db.atendimentos = [];
    if(!db.despAdm) db.despAdm = [];
    if(!db.despExtra) db.despExtra = [];
    addLog('INFO', '☁️ Dados carregados (legado) — migrando para novas tabelas...');
    await _migrarParaNovaArquitetura();
    return true;
  } catch(e) {
    addLog('WARN', '⚠️ Fallback falhou: ' + e.message);
    return false;
  }
}

// ── Migrar dados do JSON legado para tabelas individuais ──
async function _migrarParaNovaArquitetura() {
  addLog('INFO', '🔄 Iniciando migração para novas tabelas...');
  try {
    for (var i = 0; i < db.servicos.length; i++) {
      var s = db.servicos[i];
      await _supaUpsert('servicos', { id: s.id, nome: s.nome, categoria: s.categoria, duracao: s.duracao, preco: s.preco, status: s.status, atualizado_em: new Date().toISOString() });
    }
    for (var i = 0; i < db.categorias.length; i++) {
      var c = db.categorias[i];
      await _supaUpsert('categorias', { id: c.id, nome: c.nome });
    }
    for (var i = 0; i < db.materiais.length; i++) {
      var m = db.materiais[i];
      await _supaUpsert('materiais', { id: m.id, nome: m.nome, fornecedor: m.fornecedor, custo: m.custo, qtd: m.qtd, min: m.min, unidade: m.unidade, atualizado_em: new Date().toISOString() });
    }
    for (var i = 0; i < db.anamneses.length; i++) {
      var a = db.anamneses[i];
      await _supaUpsert('anamneses', { id: a.id, data_cadastro: a.dataCadastro, pessoais: a.pessoais, saude: a.saude, hormonal: a.hormonal, habitos: a.habitos, av_fisica: a.avFisica, av_corporal: a.avCorporal, incomoda: a.incomoda, assinatura: a.assinatura, data_assinatura: a.dataAssinatura, atualizado_em: new Date().toISOString() });
    }
    for (var i = 0; i < db.atendimentos.length; i++) {
      var at = db.atendimentos[i];
      await _supaUpsert('atendimentos', { id: at.id, data: at.data, cliente: at.cliente, valor: at.valor, pagto: at.pagto, servico_ids: at.servicoIds || [], materiais: at.materiais || [], obs: at.obs, atualizado_em: new Date().toISOString() });
    }
    for (var i = 0; i < db.despAdm.length; i++) {
      var d = db.despAdm[i];
      await _supaUpsert('desp_adm', { id: d.id, descricao: d.desc, cat: d.cat, valor: d.valor, data: d.data, recorrencia: d.recorrencia });
    }
    for (var i = 0; i < db.despExtra.length; i++) {
      var de = db.despExtra[i];
      await _supaUpsert('desp_extra', { id: de.id, descricao: de.desc, valor: de.valor, data: de.data, obs: de.obs });
    }
    for (var i = 0; i < db.agenda.length; i++) {
      var ag = db.agenda[i];
      await _supaUpsert('agenda', { id: ag.id, cliente: ag.cliente, tel: ag.tel, obs: ag.obs, sinal: ag.sinal, sinal_pago: ag.sinalPago, atualizado_em: new Date().toISOString() });
      await _salvarSessoes(ag.id, ag.sessoes || []);
    }
    localStorage.setItem('lizafig_migrado', '1');
    addLog('INFO', '✅ Migração concluída!');
    showToast('✅ Dados migrados para nova estrutura!');
  } catch(e) {
    addLog('WARN', '⚠️ Migração falhou: ' + e.message);
  }
}

// ── Polling: buscar apenas registros novos ──
var _ultimoSync = new Date(0).toISOString();

async function _pollingNovos() {
  if (_inicializando || _sincronizando) return;
  try {
    var desde = _ultimoSync;
    var agora = new Date().toISOString();
    var [novosAtend, novasSessoes, novosServ, novasMat, novasAnam, novosAdm, novosExtra, novaCat, novaAgenda] = await Promise.all([
      _supaGetNovos('atendimentos', desde),
      _supaGetNovos('sessoes', desde),
      _supaGetNovos('servicos', desde),
      _supaGetNovos('materiais', desde),
      _supaGetNovos('anamneses', desde),
      _supaGetNovos('desp_adm', desde),
      _supaGetNovos('desp_extra', desde),
      _supaGetNovos('categorias', desde),
      _supaGetNovos('agenda', desde)
    ]);

    var houveMudanca = false;

    if (novosAtend && novosAtend.length) {
      novosAtend.forEach(function(a) {
        var idx = db.atendimentos.findIndex(function(x){ return x.id === a.id; });
        var obj = { id: a.id, data: a.data, cliente: a.cliente, valor: a.valor, pagto: a.pagto, servicoIds: a.servico_ids || [], materiais: a.materiais || [], obs: a.obs };
        if (idx >= 0) db.atendimentos[idx] = obj; else db.atendimentos.push(obj);
      });
      houveMudanca = true;
    }
    if (novasSessoes && novasSessoes.length) {
      novasSessoes.forEach(function(s) {
        var ag = db.agenda.find(function(x){ return x.id === s.agenda_id; });
        if (ag) {
          var obj = { data: s.data, hora: s.hora || '', status: s.status, servicoIds: s.servico_ids || [], servico: s.servico || '', checkinData: s.checkin_data, checkinHora: s.checkin_hora, checkinNome: s.checkin_nome, atendimentoId: s.atendimento_id };
          ag.sessoes[s.indice] = obj;
        }
      });
      houveMudanca = true;
    }
    if (novosServ && novosServ.length) {
      novosServ.forEach(function(s) {
        var idx = db.servicos.findIndex(function(x){ return x.id === s.id; });
        var obj = { id: s.id, nome: s.nome, categoria: s.categoria, duracao: s.duracao, preco: s.preco, status: s.status };
        if (idx >= 0) db.servicos[idx] = obj; else db.servicos.push(obj);
      });
      houveMudanca = true;
    }
    if (novasMat && novasMat.length) {
      novasMat.forEach(function(m) {
        var idx = db.materiais.findIndex(function(x){ return x.id === m.id; });
        var obj = { id: m.id, nome: m.nome, fornecedor: m.fornecedor, custo: m.custo, qtd: m.qtd, min: m.min, unidade: m.unidade };
        if (idx >= 0) db.materiais[idx] = obj; else db.materiais.push(obj);
      });
      houveMudanca = true;
    }
    if (novasAnam && novasAnam.length) {
      novasAnam.forEach(function(a) {
        var idx = db.anamneses.findIndex(function(x){ return x.id === a.id; });
        var obj = { id: a.id, dataCadastro: a.data_cadastro, pessoais: a.pessoais || {}, saude: a.saude || {}, hormonal: a.hormonal || {}, habitos: a.habitos || {}, avFisica: a.av_fisica || {}, avCorporal: a.av_corporal || {}, incomoda: a.incomoda, assinatura: a.assinatura, dataAssinatura: a.data_assinatura };
        if (idx >= 0) db.anamneses[idx] = obj; else db.anamneses.push(obj);
      });
      houveMudanca = true;
    }
    if (novaCat && novaCat.length) {
      novaCat.forEach(function(c) {
        var idx = db.categorias.findIndex(function(x){ return x.id === c.id; });
        var obj = { id: c.id, nome: c.nome };
        if (idx >= 0) db.categorias[idx] = obj; else db.categorias.push(obj);
      });
      houveMudanca = true;
    }
    if (novaAgenda && novaAgenda.length) {
      novaAgenda.forEach(function(ag) {
        var idx = db.agenda.findIndex(function(x){ return x.id === ag.id; });
        var obj = { id: ag.id, cliente: ag.cliente, tel: ag.tel, obs: ag.obs, sinal: ag.sinal, sinalPago: ag.sinal_pago, servicoIds: [], servicoNome: '—', sessoes: idx >= 0 ? db.agenda[idx].sessoes : [] };
        if (idx >= 0) db.agenda[idx] = obj; else db.agenda.push(obj);
      });
      houveMudanca = true;
    }

    if (houveMudanca) {
      _ultimoSync = agora;
      localStorage.setItem('lizafig_db', JSON.stringify(db));
      _atualizarStatusSync('ok', new Date().toLocaleString('pt-BR'));
      addLog('INFO', '🔄 Atualizado do Supabase');
      renderAll();
    }
  } catch(e) {
    addLog('WARN', '⚠️ Polling falhou: ' + e.message);
  }
}

// ── Sincronizar manualmente ──
async function sincronizarAgora() {
  var btn = document.getElementById('btnSincronizar');
  if (btn) { btn.textContent = '⏳'; btn.disabled = true; }
  try {
    var carregou = await _carregarDaNuvem();
    if (carregou) {
      renderAll();
      if (btn) { btn.textContent = '✅'; btn.disabled = false; }
      setTimeout(function(){ if(btn) btn.textContent = '🔄'; }, 2000);
    } else {
      if (btn) { btn.textContent = '🔄'; btn.disabled = false; }
      showToast('Nenhum dado novo encontrado.');
    }
  } catch(e) {
    if (btn) { btn.textContent = '🔄'; btn.disabled = false; }
  }
}

// ── Legados / stubs ──
function configurarSheets() { showToast("Sistema agora usa Supabase — dados seguros na nuvem! ☁️"); }
async function salvarConfSheets() {}
async function migrarLocalParaSheets() { showToast("Dados agora são gerenciados pelo Supabase automaticamente."); }
