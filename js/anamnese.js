/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — anamnese.js
   renderAnamnese, editarAnamnese, salvarFicha, acomp
   ===================================================== */

// ===== ANAMNESE =====
// ===================== ANAMNESE =====================
var _anamneseAtualId = null;

function novaAnamnese() {
  _anamneseAtualId = null;
  limparFormAnamnese();
  document.getElementById('anamneseListaWrap').style.display = 'none';
  document.getElementById('anamneseFormWrap').style.display = 'block';
}

function fecharFormAnamnese() {
  document.getElementById('anamneseListaWrap').style.display = 'block';
  document.getElementById('anamneseFormWrap').style.display = 'none';
  renderAnamnese();
  renderAcomp();
  renderAcomp();
}

function limparFormAnamnese() {
  var ids = ['an-nome','an-idade','an-dataNasc','an-telefone','an-cpf','an-dataFilhos',
    'an-doencaQual','an-medicacaoQual','an-injetadoQual','an-cirurgiaQual','an-alergiaQual',
    'an-antiQual','an-agua','an-atividadeQual','an-atividadeFreq','an-incomoda',
    'an-peso','an-altura','an-imc','an-tratQual','an-striasArea','an-adicional','an-outrasQual',
    'an-circSupra','an-circUmb','an-circInfra','an-quadril','an-coxa',
    'an-bracoDireito','an-bracoEsquerdo','an-gorduraPerc'];
  ids.forEach(function(id) { var el=document.getElementById(id); if(el) el.value=''; });
  var selects = ['an-genero','an-filhos','an-doenca','an-medicacao','an-injetado','an-cirurgia',
    'an-alergia','an-marcapasso','an-circulatorio','an-hipertensao','an-diabetes',
    'an-ciclo','an-gravida','an-anti','an-alimentacao','an-atividade','an-alcool',
    'an-fuma','an-cinta','an-trat','an-flacidez','an-gordura','an-celulite',
    'an-celuliteGrau','an-estrias'];
  selects.forEach(function(id) { var el=document.getElementById(id); if(el) el.selectedIndex=0; });
  var checks = ['an-abdomen','an-bracos','an-coxas','an-gluteos','an-costas','an-outras',
    'an-diaSupra','an-diaUmb','an-diaInfra'];
  checks.forEach(function(id) { var el=document.getElementById(id); if(el) el.checked=false; });
}

function getAnVal(id) { var el=document.getElementById(id); return el?el.value.trim():''; }
function getAnSel(id) { var el=document.getElementById(id); return el?el.value:''; }
function getAnChk(id) { var el=document.getElementById(id); return el?el.checked:false; }

function salvarFichaAnamnese() {
  var nome = getAnVal('an-nome');
  if (!nome) { showToast('Preencha o nome da cliente!'); return; }
  var ficha = {
    id: _anamneseAtualId || uid(),
    dataCadastro: new Date().toLocaleDateString('pt-BR'),
    pessoais: { nome:nome, idade:getAnVal('an-idade'), genero:getAnSel('an-genero'),
      dataNasc:getAnVal('an-dataNasc'), telefone:getAnVal('an-telefone'), cpf:getAnVal('an-cpf'),
      filhos:getAnSel('an-filhos'), dataFilhos:getAnVal('an-dataFilhos') },
    saude: { doenca:getAnSel('an-doenca'), doencaQual:getAnVal('an-doencaQual'),
      medicacao:getAnSel('an-medicacao'), medicacaoQual:getAnVal('an-medicacaoQual'),
      injetado:getAnSel('an-injetado'), injetadoQual:getAnVal('an-injetadoQual'),
      cirurgia:getAnSel('an-cirurgia'), cirurgiaQual:getAnVal('an-cirurgiaQual'),
      alergia:getAnSel('an-alergia'), alergiaQual:getAnVal('an-alergiaQual'),
      marcapasso:getAnSel('an-marcapasso'), circulatorio:getAnSel('an-circulatorio'),
      hipertensao:getAnSel('an-hipertensao'), diabetes:getAnSel('an-diabetes') },
    hormonal: { ciclo:getAnSel('an-ciclo'), gravida:getAnSel('an-gravida'),
      anti:getAnSel('an-anti'), antiQual:getAnVal('an-antiQual') },
    habitos: { agua:getAnVal('an-agua'), alimentacao:getAnSel('an-alimentacao'),
      atividade:getAnSel('an-atividade'), atividadeQual:getAnVal('an-atividadeQual'),
      atividadeFreq:getAnVal('an-atividadeFreq'), alcool:getAnSel('an-alcool'),
      fuma:getAnSel('an-fuma'), cinta:getAnSel('an-cinta') },
    incomoda: getAnVal('an-incomoda'),
    avFisica: { peso:getAnVal('an-peso'), altura:getAnVal('an-altura'), imc:getAnVal('an-imc'),
      trat:getAnSel('an-trat'), tratQual:getAnVal('an-tratQual'),
      flacidez:getAnSel('an-flacidez'), gordura:getAnSel('an-gordura'),
      celulite:getAnSel('an-celulite'), celuliteGrau:getAnSel('an-celuliteGrau'),
      estrias:getAnSel('an-estrias'), striasArea:getAnVal('an-striasArea'),
      adicional:getAnVal('an-adicional') },
    avCorporal: {
      areas: { abdomen:getAnChk('an-abdomen'), bracos:getAnChk('an-bracos'),
        coxas:getAnChk('an-coxas'), gluteos:getAnChk('an-gluteos'),
        costas:getAnChk('an-costas'), outras:getAnChk('an-outras'), outrasQual:getAnVal('an-outrasQual') },
      diastase: { supra:getAnChk('an-diaSupra'), umbilical:getAnChk('an-diaUmb'), infra:getAnChk('an-diaInfra') },
      medidas: { circSupra:getAnVal('an-circSupra'), circUmb:getAnVal('an-circUmb'),
        circInfra:getAnVal('an-circInfra'), quadril:getAnVal('an-quadril'),
        coxa:getAnVal('an-coxa'), bracoDireito:getAnVal('an-bracoDireito'),
        bracoEsquerdo:getAnVal('an-bracoEsquerdo'), gorduraPerc:getAnVal('an-gorduraPerc') }
    }
  };
  if (_anamneseAtualId) {
    var idx = db.anamneses.findIndex(function(a){ return a.id===_anamneseAtualId; });
    if (idx >= 0) {
      // Preservar assinatura existente
      if (db.anamneses[idx].assinatura) ficha.assinatura = db.anamneses[idx].assinatura;
      if (db.anamneses[idx].dataAssinatura) ficha.dataAssinatura = db.anamneses[idx].dataAssinatura;
      db.anamneses[idx] = ficha;
    }
  } else {
    db.anamneses.push(ficha);
  }
  _anamneseAtualId = ficha.id;
  saveData(); renderAll();
  addLog('INFO', '📋 Ficha de anamnese salva — ' + nome);
  _salvarAnamnese(ficha);
  showToast('Ficha salva com sucesso!');
  _anamneseAtualId = null;
  limparFormAnamnese();
}

function importarAnamnese(e) {
  var file = e.target.files[0];
  if (!file) return;
  e.target.value = '';
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var dados = JSON.parse(ev.target.result);
      if (dados.tipo !== 'anamnese_cliente') { showToast('Arquivo inválido.'); return; }
      // Pre-fill form with client data
      novaAnamnese();
      var p = dados.informacoesPessoais || {};
      var setVal = function(id, v) { var el=document.getElementById(id); if(el&&v) el.value=v; };
      var setSel = function(id, v) { var el=document.getElementById(id); if(!el||!v) return;
        for(var i=0;i<el.options.length;i++){ if(el.options[i].value.toLowerCase()===v.toLowerCase()){ el.selectedIndex=i; return; } } };
      setVal('an-nome', p.nome); setVal('an-idade', p.idade);
      setSel('an-genero', p.genero); setVal('an-dataNasc', p.dataNascimento);
      setVal('an-telefone', p.telefone); setVal('an-cpf', p.cpf||''); setSel('an-filhos', p.temFilhos);
      setVal('an-dataFilhos', p.dataFilhos);
      var s = dados.historicoSaude || {};
      setSel('an-doenca', s.doencaDiagnosticada); setVal('an-doencaQual', s.doencaQual);
      setSel('an-medicacao', s.medicacaoContinua); setVal('an-medicacaoQual', s.medicacaoQual);
      setSel('an-injetado', s.produtoInjetado); setVal('an-injetadoQual', s.produtoQual);
      setSel('an-cirurgia', s.cirurgia); setVal('an-cirurgiaQual', s.cirurgiaQual);
      setSel('an-alergia', s.alergia); setVal('an-alergiaQual', s.alergiaQual);
      setSel('an-marcapasso', s.marcapasso); setSel('an-circulatorio', s.problemasCirculatorios);
      setSel('an-hipertensao', s.hipertensao); setSel('an-diabetes', s.diabetes);
      var h = dados.hormonal || {};
      setSel('an-ciclo', h.cicloMenstrual); setSel('an-gravida', h.gravidaAmamentando);
      setSel('an-anti', h.anticoncepcional); setVal('an-antiQual', h.antiQual);
      var hb = dados.habitos || {};
      setVal('an-agua', hb.aguaLitros); setSel('an-alimentacao', hb.alimentacao);
      setSel('an-atividade', hb.atividadeFisica); setVal('an-atividadeQual', hb.atividadeQual);
      setVal('an-atividadeFreq', hb.atividadeFrequencia); setSel('an-alcool', hb.bebidaAlcoolica);
      setSel('an-fuma', hb.fuma); setSel('an-cinta', hb.cintaModeladora);
      setVal('an-incomoda', dados.oQueIncomoda);
      showToast('Ficha importada! Complete a avaliação e salve.');
    } catch(err) { showToast('Erro ao importar arquivo.'); console.error(err); }
  };
  reader.readAsText(file);
}

function editarAnamnese(id) {
  var ficha = db.anamneses.find(function(a){ return a.id===id; });
  if (!ficha) return;
  _anamneseAtualId = id;
  limparFormAnamnese();
  // Fill form
  var setVal = function(eid, v) { var el=document.getElementById(eid); if(el&&v!=null) el.value=v; };
  var setChk = function(eid, v) { var el=document.getElementById(eid); if(el) el.checked=!!v; };
  var p=ficha.pessoais||{};
  setVal('an-nome',p.nome); setVal('an-idade',p.idade); setVal('an-genero',p.genero);
  setVal('an-dataNasc',p.dataNasc); setVal('an-telefone',p.telefone); setVal('an-cpf',p.cpf||'');
  setVal('an-filhos',p.filhos); setVal('an-dataFilhos',p.dataFilhos);
  var s=ficha.saude||{};
  setVal('an-doenca',s.doenca); setVal('an-doencaQual',s.doencaQual);
  setVal('an-medicacao',s.medicacao); setVal('an-medicacaoQual',s.medicacaoQual);
  setVal('an-injetado',s.injetado); setVal('an-injetadoQual',s.injetadoQual);
  setVal('an-cirurgia',s.cirurgia); setVal('an-cirurgiaQual',s.cirurgiaQual);
  setVal('an-alergia',s.alergia); setVal('an-alergiaQual',s.alergiaQual);
  setVal('an-marcapasso',s.marcapasso); setVal('an-circulatorio',s.circulatorio);
  setVal('an-hipertensao',s.hipertensao); setVal('an-diabetes',s.diabetes);
  var h=ficha.hormonal||{};
  setVal('an-ciclo',h.ciclo); setVal('an-gravida',h.gravida);
  setVal('an-anti',h.anti); setVal('an-antiQual',h.antiQual);
  var hb=ficha.habitos||{};
  setVal('an-agua',hb.agua); setVal('an-alimentacao',hb.alimentacao);
  setVal('an-atividade',hb.atividade); setVal('an-atividadeQual',hb.atividadeQual);
  setVal('an-atividadeFreq',hb.atividadeFreq); setVal('an-alcool',hb.alcool);
  setVal('an-fuma',hb.fuma); setVal('an-cinta',hb.cinta);
  setVal('an-incomoda',ficha.incomoda);
  var af=ficha.avFisica||{};
  setVal('an-peso',af.peso); setVal('an-altura',af.altura); setVal('an-imc',af.imc);
  setVal('an-trat',af.trat); setVal('an-tratQual',af.tratQual);
  setVal('an-flacidez',af.flacidez); setVal('an-gordura',af.gordura);
  setVal('an-celulite',af.celulite); setVal('an-celuliteGrau',af.celuliteGrau);
  setVal('an-estrias',af.estrias); setVal('an-striasArea',af.striasArea);
  setVal('an-adicional',af.adicional);
  var ac=ficha.avCorporal||{};
  var ar=ac.areas||{};
  setChk('an-abdomen',ar.abdomen); setChk('an-bracos',ar.bracos);
  setChk('an-coxas',ar.coxas); setChk('an-gluteos',ar.gluteos);
  setChk('an-costas',ar.costas); setChk('an-outras',ar.outras);
  setVal('an-outrasQual',ar.outrasQual);
  var di=ac.diastase||{};
  setChk('an-diaSupra',di.supra); setChk('an-diaUmb',di.umbilical); setChk('an-diaInfra',di.infra);
  var md=ac.medidas||{};
  setVal('an-circSupra',md.circSupra); setVal('an-circUmb',md.circUmb);
  setVal('an-circInfra',md.circInfra); setVal('an-quadril',md.quadril);
  setVal('an-coxa',md.coxa); setVal('an-bracoDireito',md.bracoDireito);
  setVal('an-bracoEsquerdo',md.bracoEsquerdo); setVal('an-gorduraPerc',md.gorduraPerc);

  document.getElementById('anamneseListaWrap').style.display = 'none';
  document.getElementById('anamneseFormWrap').style.display = 'block';
}

function excluirAnamnese(id) {
  if (!confirm('Excluir esta ficha de anamnese?')) return;
  db.anamneses = db.anamneses.filter(function(a){ return a.id!==id; });
  saveData(); renderAll();
  showToast('Ficha excluída.');
  _deletarAnamnese(id);
}

function limparFiltrosAnamnese() {
  var n=document.getElementById('filtAnamNome'); if(n) n.value='';
  var d=document.getElementById('filtAnamDe'); if(d) d.value='';
  var a=document.getElementById('filtAnamAte'); if(a) a.value='';
  renderAnamnese();
  renderAcomp();
  renderAcomp();
}

function renderAnamnese() {
  var tbody = document.getElementById('tbodyAnamnese');
  if (!tbody) return;

  var busca = (document.getElementById('filtAnamNome')||{value:''}).value.toLowerCase().trim();
  var de = (document.getElementById('filtAnamDe')||{value:''}).value;
  var ate = (document.getElementById('filtAnamAte')||{value:''}).value;

  var lista = db.anamneses.filter(function(a) {
    // Fichas customizadas ficam só na aba "Fichas Custom"
    // Mas o modelo padrão "Anamnese" fica aqui
    var isCustom = a.modelo_respostas && Object.keys(a.modelo_respostas).length > 0;
    var isModeloPadrao = !a.modelo_nome || a.modelo_nome === 'Anamnese' || a.modelo_id === 'modelo-anamnese-padrao';
    if (isCustom && !isModeloPadrao) return false;
    var nome = (a.pessoais && a.pessoais.nome)||'';
    if(busca && nome.toLowerCase().indexOf(busca) < 0) return false;
    if(de || ate) {
      // Convert date from dd/mm/yyyy to yyyy-mm-dd for comparison
      var dataBr = a.dataCadastro||'';
      var partes = dataBr.split('/');
      var dataComp = partes.length===3 ? partes[2]+'-'+partes[1]+'-'+partes[0] : '';
      if(de && dataComp && dataComp < de) return false;
      if(ate && dataComp && dataComp > ate) return false;
    }
    return true;
  });

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📋</div><p>'+(db.anamneses.length?'Nenhum resultado encontrado':'Nenhuma ficha cadastrada')+'</p></div></td></tr>';
    document.getElementById('pagAnamnese') && (document.getElementById('pagAnamnese').innerHTML='');
    return;
  }
  var _POR_PAG_AN = 10;
  var _totalAN = lista.length;
  var _totalPagsAN = Math.ceil(_totalAN/_POR_PAG_AN);
  if (!window._pagAnamnese || window._pagAnamnese > _totalPagsAN) window._pagAnamnese = 1;
  var _inicioAN = (window._pagAnamnese-1)*_POR_PAG_AN;
  var listaPage = lista.slice(_inicioAN, _inicioAN+_POR_PAG_AN);

  tbody.innerHTML = listaPage.map(function(a) {
    var nome = (a.pessoais && a.pessoais.nome) || '—';
    return '<tr>'
      + '<td><strong>'+nome+'</strong></td>'
      + '<td>'+(a.dataCadastro||'—')+'</td>'
      + '<td><span class="badge-pill badge-ativo" style="font-size:11px">Completa</span>'+(a.assinatura?' <span class="badge-pill" style="font-size:11px;background:#E8F5E9;color:#2E7D32">✍️ Assinada</span>':'')+'</td>'
      + '<td style="display:flex;gap:4px">'
      + '<button class="btn btn-edit btn-sm" onclick="editarAnamnese(\''+a.id+'\')">✏️</button>'
      + '<button class="btn btn-primary btn-sm" onclick="visualizarFichaId(\''+a.id+'\')" style="font-size:11px;padding:4px 8px">👁 Ver</button>'
      + '<button class="btn btn-danger btn-sm" onclick="excluirAnamnese(\''+a.id+'\')">✕</button>'
      + '</td></tr>';
  }).join('');

  var pagEl = document.getElementById('pagAnamnese');
  if (pagEl) pagEl.innerHTML = _totalPagsAN > 1 ? _buildPagHtml(window._pagAnamnese, _totalPagsAN, _totalAN, _POR_PAG_AN, 'window._pagAnamnese', 'renderAnamnese()') : '';
}

function visualizarFicha() {
  var nome = document.getElementById("an-nome") ? document.getElementById("an-nome").value.trim() : "";
  if (nome && !_anamneseAtualId) {
    salvarFichaAnamnese();
    var ficha2 = db.anamneses.find(function(a){ return a.pessoais && a.pessoais.nome === nome; });
    if (ficha2) { abrirModalAssinatura(ficha2, "anamnese"); }
    return;
  }
  var ficha = db.anamneses.find(function(a){ return a.id===_anamneseAtualId; });
  if (!ficha) { showToast("Salve a ficha primeiro!"); return; }
  abrirModalAssinatura(ficha, "anamnese");
}

function visualizarFichaId(id) {
  var ficha = db.anamneses.find(function(a){ return a.id===id; });
  if (!ficha) return;
  abrirModalAssinatura(ficha, "anamnese");
}

// ===== ACOMPANHAMENTO =====
function limparFiltrosAcomp() {
  ['filtAcompNome','filtAcompDe','filtAcompAte'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  // Limpar também filtros individuais de sessão de cada card
  window._filtSessao = {};
  window._acompSessaoPag = {};
  _acompPagina = 1;
  renderAcomp();
}

function limparFiltrosCheckin() {
  var d = document.getElementById('filtCheckinDe');
  var a = document.getElementById('filtCheckinAte');
  if(d) d.value = '';
  if(a) a.value = '';
  renderAgenda();
}

var _acompPagina = 1;
var _ACOMP_POR_PAG = 5;

// ── Match anamnese → agenda: CPF primeiro, fallback por nome ──
function _matchAnamnese(agCpf, agCliente) {
  var cpf = (agCpf || '').replace(/\D/g, '');
  var matches = db.anamneses.filter(function(a) {
    if (!a.pessoais) return false;
    var aCpf = (a.pessoais.cpf || '').replace(/\D/g, '');
    if (cpf && aCpf && cpf === aCpf) return true;
    return a.pessoais.nome && a.pessoais.nome.toLowerCase() === agCliente.toLowerCase();
  });
  return matches.length ? matches[matches.length - 1] : undefined;
}

function renderAcomp() {
  var el = document.getElementById('acompLista');
  if (!el) return;
  var busca = (document.getElementById('filtAcompNome')||{value:''}).value.toLowerCase().trim();
  var de = (document.getElementById('filtAcompDe')||{value:''}).value;
  var ate = (document.getElementById('filtAcompAte')||{value:''}).value;

  // Salvar filtros individuais de sessão antes de recriar
  if (!window._filtSessao) window._filtSessao = {};
  el.querySelectorAll('[id^="filtS_de_"],[id^="filtS_ate_"]').forEach(function(inp){
    window._filtSessao[inp.id] = inp.value;
  });

  var pacotes = db.agenda.filter(function(ag) {
    if (busca && ag.cliente.toLowerCase().indexOf(busca) < 0) return false;
    if (de || ate) {
      var temSessao = ag.sessoes.some(function(s) {
        if (de && s.data < de) return false;
        if (ate && s.data > ate) return false;
        return true;
      });
      if (!temSessao) return false;
    }
    return true;
  });

  if (!pacotes.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Nenhum cliente encontrado</p></div>';
    return;
  }

  // Paginação
  var total = pacotes.length;
  var totalPags = Math.ceil(total / _ACOMP_POR_PAG);
  if (_acompPagina > totalPags) _acompPagina = 1;
  var inicio = (_acompPagina - 1) * _ACOMP_POR_PAG;
  var paginados = pacotes.slice(inicio, inicio + _ACOMP_POR_PAG);

  el.innerHTML = paginados.map(function(ag) {
    var anamnese = _matchAnamnese(ag.cpf, ag.cliente);
    var realizadas = ag.sessoes.filter(function(s){ return s.status==='realizado'; }).length;
    var total = ag.sessoes.length;
    var pct = total ? Math.round((realizadas/total)*100) : 0;
    var hoje = _hoje();
    var agKey = 'k'+ag.id.replace(/[^a-z0-9]/gi,'');
    var _PAG_S = 10;
    if (!window._acompSessaoPag) window._acompSessaoPag = {};
    var pagAtual = window._acompSessaoPag[agKey] || 1;

    // Filtros individuais do card — lidos de _filtSessao para persistir entre renders
    var filtSde = (window._filtSessao && window._filtSessao['filtS_de_'+agKey]) || '';
    var filtSate = (window._filtSessao && window._filtSessao['filtS_ate_'+agKey]) || '';

    var sessoesFiltradas = ag.sessoes.filter(function(s){
      var dF = filtSde || de;
      var aF = filtSate || ate;
      if (dF && s.data < dF) return false;
      if (aF && s.data > aF) return false;
      return true;
    });

    var totalSessoes = sessoesFiltradas.length;
    var totalPagsSessoes = Math.ceil(totalSessoes / _PAG_S) || 1;
    if (pagAtual > totalPagsSessoes) pagAtual = 1;
    window._acompSessaoPag[agKey] = pagAtual;
    var inicioS = (pagAtual - 1) * _PAG_S;
    var sessoesPag = sessoesFiltradas.slice(inicioS, inicioS + _PAG_S);

    var sessoesHtml = sessoesPag.map(function(s) {
      var idxReal = ag.sessoes.indexOf(s);
      var cls = s.status==='realizado' ? 'badge-ativo' : s.status==='presente' ? 'badge-presente' : s.data < hoje ? 'badge-danger' : 'badge-pendente';
      var lbl = s.status==='realizado' ? '✓ Realizado' : s.status==='presente' ? '✅ Presente' : s.data < hoje ? 'Não compareceu' : 'Pendente';
      var sid = ag.id+'_s'+idxReal;
      var selecionados = s.servicoIds || (s.servico ? [s.servico] : []);
      var nomesSelec = db.servicos.filter(function(sv){ return selecionados.indexOf(sv.nome)>=0 || selecionados.indexOf(sv.id)>=0; }).map(function(sv){ return sv.nome; });
      var textoServico = nomesSelec.length ? nomesSelec.join(' + ') : (s.servico || '—');
      var fotoRowId = 'fotorow_'+sid;
      return '<tr>'
        +'<td style="font-size:12px;vertical-align:middle;padding:6px 4px">Sessão '+(idxReal+1)+'</td>'
        +'<td style="font-size:12px;vertical-align:middle;padding:6px 4px">'+fmtDate(s.data)+(s.hora?' · '+s.hora:'')+'</td>'
        +'<td style="vertical-align:middle;padding:6px 4px">'
        +'<span style="font-size:12px;color:var(--text-mid)">'+textoServico+'</span> '
        +'<button class="btn btn-secondary btn-sm _btn-serv-sessao" style="font-size:10px;padding:2px 7px;margin-left:4px" data-agid="'+ag.id.replace(/"/g,'&quot;')+'" data-idx="'+idxReal+'">✏️</button>'
        +'<button class="btn btn-secondary btn-sm _btn-foto-sessao" style="font-size:10px;padding:2px 7px;margin-left:2px" data-fotoid="'+fotoRowId+'" data-agid="'+ag.id.replace(/"/g,'&quot;')+'" data-data="'+s.data+'" data-servico="'+textoServico.replace(/"/g,'&quot;')+'">📷</button>'
        +'</td>'
        +'<td style="vertical-align:middle;padding:6px 4px"><span class="badge-pill '+cls+'" style="font-size:11px">'+lbl+'</span></td>'
        +'<td style="vertical-align:middle;padding:6px 4px"><button class="btn btn-secondary btn-sm _btn-salv-sessao" style="font-size:10px;padding:2px 8px" data-agid="'+ag.id.replace(/"/g,'&quot;')+'" data-idx="'+idxReal+'" data-sid="'+sid+'">💾</button></td>'
        +'</tr>'
        +'<tr id="'+fotoRowId+'" style="display:none">'
        +'<td colspan="5" style="padding:0.75rem 1rem;background:var(--off-white);border-radius:8px">'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.5rem">'
        +'<div><label style="font-size:10px;letter-spacing:1.5px;color:var(--text-light);text-transform:uppercase;display:block;margin-bottom:4px">Foto Antes</label>'
        +'<label for="fp_antes_'+sid+'" id="fp_antes_'+sid+'_lbl" style="display:flex;flex-direction:column;align-items:center;justify-content:center;border:1.5px dashed var(--border);border-radius:8px;padding:0.75rem;cursor:pointer;background:white;transition:all 0.15s">'
        +'<span style="font-size:20px">📷</span><span style="font-size:11px;color:var(--text-light);margin-top:4px">Selecionar</span></label>'
        +'<input type="file" id="fp_antes_'+sid+'" accept="image/*" style="display:none" data-sid="'+sid+'" data-tipo="antes"></div>'
        +'<div><label style="font-size:10px;letter-spacing:1.5px;color:var(--text-light);text-transform:uppercase;display:block;margin-bottom:4px">Foto Depois</label>'
        +'<label for="fp_depois_'+sid+'" id="fp_depois_'+sid+'_lbl" style="display:flex;flex-direction:column;align-items:center;justify-content:center;border:1.5px dashed var(--border);border-radius:8px;padding:0.75rem;cursor:pointer;background:white;transition:all 0.15s">'
        +'<span style="font-size:20px">📷</span><span style="font-size:11px;color:var(--text-light);margin-top:4px">Selecionar</span></label>'
        +'<input type="file" id="fp_depois_'+sid+'" accept="image/*" style="display:none" data-sid="'+sid+'" data-tipo="depois"></div>'
        +'</div>'
        +'<input type="text" id="fp_obs_'+sid+'" placeholder="Observação..." style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:12px;font-family:Jost,sans-serif;outline:none;margin-bottom:0.5rem;box-sizing:border-box">'
        +'<div style="display:flex;gap:0.5rem">'
        +'<button class="btn btn-primary btn-sm _btn-salv-foto" style="font-size:11px" data-agid="'+ag.id.replace(/"/g,'&quot;')+'" data-sid="'+sid+'" data-data="'+s.data+'" data-servico="'+textoServico.replace(/"/g,'&quot;')+'">✓ Salvar</button>'
        +'<button class="btn btn-secondary btn-sm _btn-fecha-foto" style="font-size:11px" data-fotoid="'+fotoRowId+'">Cancelar</button>'
        +'</div>'
        +'</td></tr>';
    }).join('');

    // Controles de paginação das sessões
    var pagHtml = '';
    if (totalPagsSessoes > 1) {
      pagHtml = '<div style="display:flex;align-items:center;gap:0.4rem;margin-top:0.75rem;flex-wrap:wrap">';
      pagHtml += '<button onclick="mudaPagSessao(\''+agKey+'\','+Math.max(1,pagAtual-1)+')" '+(pagAtual===1?'disabled':'')+' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">‹</button>';
      for (var pp=1; pp<=totalPagsSessoes; pp++) {
        pagHtml += '<button onclick="mudaPagSessao(\''+agKey+'\','+pp+')" style="padding:4px 10px;border:1px solid '+(pp===pagAtual?'var(--rose)':'var(--border)')+';border-radius:6px;background:'+(pp===pagAtual?'var(--rose)':'white')+';color:'+(pp===pagAtual?'white':'inherit')+';cursor:pointer;font-size:12px">'+pp+'</button>';
      }
      pagHtml += '<button onclick="mudaPagSessao(\''+agKey+'\','+Math.min(totalPagsSessoes,pagAtual+1)+')" '+(pagAtual===totalPagsSessoes?'disabled':'')+' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">›</button>';
      pagHtml += '<span style="font-size:11px;color:var(--text-light);margin-left:4px">'+(inicioS+1)+'-'+Math.min(inicioS+_PAG_S,totalSessoes)+' de '+totalSessoes+'</span>';
      pagHtml += '</div>';
    }

    var anamHtml = _buildAnamHtml(ag, anamnese);

    return '<div class="agenda-cliente-card" style="margin-bottom:1.5rem">'
      +'<div class="agenda-card-header" style="cursor:default">'
      +'<div><div style="font-weight:600;font-size:15px">👤 '+ag.cliente+'</div>'
      +'<div style="font-size:12px;color:var(--text-light);margin-top:2px">'+_agServicos(ag)+(ag.obs?' · '+ag.obs:'')+'</div></div>'
      +'<div style="display:flex;align-items:center;gap:0.5rem">'
      +'<span class="badge-pill badge-ativo" style="font-size:11px">'+realizadas+'/'+total+' sessões</span>'
      +'<span style="font-size:11px;color:var(--text-light)">'+pct+'%</span>'
      +'</div></div>'
      +'<div style="height:4px;background:#E5E5EA;border-radius:2px;margin:0 1rem 0.75rem">'
      +'<div style="height:4px;background:var(--rose);border-radius:2px;width:'+pct+'%"></div></div>'
      +'<div style="padding:0 1rem 1rem">'
      + anamHtml
      + _buildObsHtml(ag.cliente)
      +'<div style="margin-top:1rem">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:6px">'
      +'<div style="font-size:10px;letter-spacing:2px;color:var(--text-light)">SESSÕES DO PACOTE</div>'
      +'<div style="display:flex;gap:0.4rem;align-items:center">'
      +'<input type="date" id="filtS_de_'+agKey+'" value="'+filtSde+'" oninput="setFiltSessao(\''+agKey+'\',\'de\',this.value)" style="padding:2px 6px;border:1px solid var(--border);border-radius:6px;font-size:11px;outline:none" title="De">'
      +'<input type="date" id="filtS_ate_'+agKey+'" value="'+filtSate+'" oninput="setFiltSessao(\''+agKey+'\',\'ate\',this.value)" style="padding:2px 6px;border:1px solid var(--border);border-radius:6px;font-size:11px;outline:none" title="Até">'
      +'</div></div>'
      +'<table style="width:100%"><thead><tr><th style="font-size:10px">Sessão</th><th style="font-size:10px">Data</th><th style="font-size:10px">Serviço</th><th style="font-size:10px">Status</th><th></th></tr></thead>'
      +'<tbody>'+sessoesHtml+'</tbody></table>'
      +pagHtml
      +'</div>'
      +'</div>'
      + _buildFotologHtml(ag.id)
      +'</div>';
  }).join('');

  // Paginação
  if (totalPags > 1) {
    var paginacaoHtml = '<div style="display:flex;align-items:center;justify-content:center;gap:0.5rem;margin-top:1rem;padding:0.75rem">';
    paginacaoHtml += '<button onclick="_acompPagina=Math.max(1,_acompPagina-1);renderAcomp()" '+((_acompPagina===1)?'disabled':'')+' style="padding:6px 14px;border:1px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:13px">‹ Anterior</button>';
    for (var p=1; p<=totalPags; p++) {
      paginacaoHtml += '<button onclick="_acompPagina='+p+';renderAcomp()" style="padding:6px 12px;border:1px solid '+(p===_acompPagina?'var(--rose)':'var(--border)')+';border-radius:8px;background:'+(p===_acompPagina?'var(--rose)':'white')+';color:'+(p===_acompPagina?'white':'inherit')+';cursor:pointer;font-size:13px">'+p+'</button>';
    }
    paginacaoHtml += '<button onclick="_acompPagina=Math.min(totalPags,_acompPagina+1);renderAcomp()" '+((_acompPagina===totalPags)?'disabled':'')+' style="padding:6px 14px;border:1px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:13px">Próximo ›</button>';
    paginacaoHtml += '<span style="font-size:12px;color:var(--text-light);margin-left:0.5rem">'+inicio+1+' - '+Math.min(inicio+_ACOMP_POR_PAG,total)+' de '+total+'</span>';
    paginacaoHtml += '</div>';
    el.innerHTML += paginacaoHtml;
  }
}

function _buildAnamHtml(ag, anamnese) {
  var aid = anamnese ? anamnese.id : '';
  var p=anamnese?(anamnese.pessoais||{}):{}, s=anamnese?(anamnese.saude||{}):{};
  var h=anamnese?(anamnese.hormonal||{}):{}, hb=anamnese?(anamnese.habitos||{}):{};
  var af=anamnese?(anamnese.avFisica||{}):{}, ac=anamnese?(anamnese.avCorporal||{}):{};
  var md=ac.medidas||{}, ar=ac.areas||{}, di=ac.diastase||{};
  var pid = aid ? aid.replace(/-/g,'') : ('new_'+ag.cliente.replace(/\s/g,'_'));

  function inp(id, val, placeholder) {
    return '<input class="form-input" id="ac_'+pid+'_'+id+'" value="'+(val||'')+'" placeholder="'+(placeholder||'')+'" style="font-size:13px">';
  }
  function sel(id, val, opts) {
    return '<select class="form-input" id="ac_'+pid+'_'+id+'" style="font-size:13px">'
      + opts.map(function(o){ return '<option value="'+o+'"'+(val===o?' selected':'')+'>'+o+'</option>'; }).join('')
      + '</select>';
  }
  function chk(id, checked, label) {
    return '<label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">'
      +'<input type="checkbox" id="ac_'+pid+'_'+id+'"'+(checked?' checked':'')+' style="width:14px;height:14px"> '+label+'</label>';
  }
  function row(fields) {
    return '<div class="form-grid" style="margin-bottom:0.5rem">'
      +fields.map(function(f){ return f ? '<div class="form-group"><label style="font-size:11px">'+f[0]+'</label>'+f[1]+'</div>' : ''; }).join('')
      +'</div>';
  }
  function sec(title) {
    return '<div style="background:linear-gradient(135deg,#1C1C1E,#2C2C2E);color:#FAF0F2;padding:0.4rem 0.8rem;border-radius:6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin:1rem 0 0.5rem">'+title+'</div>';
  }
  var simNao = ['','sim','não'];
  var generos = ['','Feminino','Masculino','Outro'];
  var ciclos = ['','Regular','Irregular','Menopausa','Não se aplica'];

  var html = '';
  if (!anamnese) {
    html += '<div style="background:var(--cream);border-radius:8px;padding:0.75rem;font-size:12px;color:var(--text-light);margin-bottom:0.75rem">⚠️ Sem ficha de anamnese — preencha abaixo para criar uma nova ficha para esta cliente.</div>';
  }

  html += '<div id="ac_form_'+pid+'">'
    + sec('👤 Informações Pessoais')
    + row([
        ['Nome', inp('nome', p.nome)],
        ['Idade', inp('idade', p.idade)],
        ['Gênero', sel('genero', p.genero, generos)],
        ['Nascimento', inp('dataNasc', p.dataNasc, 'AAAA-MM-DD')],
        ['Telefone', inp('telefone', p.telefone)],
        ['CPF', inp('cpf', p.cpf)],
        ['Filhos?', sel('filhos', p.filhos, simNao)]
      ])
    + sec('🏥 Histórico de Saúde')
    + row([
        ['Doença diagnosticada?', sel('doenca', s.doenca, simNao)],
        ['Qual doença?', inp('doencaQual', s.doencaQual)],
        ['Medicação contínua?', sel('medicacao', s.medicacao, simNao)],
        ['Qual medicação?', inp('medicacaoQual', s.medicacaoQual)]
      ])
    + row([
        ['Produto injetado?', sel('injetado', s.injetado, simNao)],
        ['Qual produto?', inp('injetadoQual', s.injetadoQual)],
        ['Cirurgia?', sel('cirurgia', s.cirurgia, simNao)],
        ['Qual/Quando?', inp('cirurgiaQual', s.cirurgiaQual)]
      ])
    + row([
        ['Alergia?', sel('alergia', s.alergia, simNao)],
        ['Qual alergia?', inp('alergiaQual', s.alergiaQual)],
        ['Marcapasso/Prótese?', sel('marcapasso', s.marcapasso, simNao)],
        ['Prob. circulatórios?', sel('circulatorio', s.circulatorio, simNao)]
      ])
    + row([
        ['Hipertensão?', sel('hipertensao', s.hipertensao, simNao)],
        ['Diabetes?', sel('diabetes', s.diabetes, simNao)]
      ])
    + sec('🌸 Hormonal')
    + row([
        ['Ciclo menstrual', sel('ciclo', h.ciclo, ciclos)],
        ['Grávida/Amamentando?', sel('gravida', h.gravida, simNao)],
        ['Anticoncepcional?', sel('anti', h.anti, simNao)],
        ['Qual?', inp('antiQual', h.antiQual)]
      ])
    + sec('🥗 Hábitos')
    + row([
        ['Água (litros/dia)', inp('agua', hb.agua)],
        ['Alimentação', inp('alimentacao', hb.alimentacao)],
        ['Atividade física?', sel('atividade', hb.atividade, simNao)],
        ['Qual atividade?', inp('atividadeQual', hb.atividadeQual)]
      ])
    + row([
        ['Frequência', inp('atividadeFreq', hb.atividadeFreq)],
        ['Bebida alcoólica?', sel('alcool', hb.alcool, simNao)],
        ['Fuma?', sel('fuma', hb.fuma, simNao)],
        ['Cinta modeladora?', sel('cinta', hb.cinta, simNao)]
      ])
    + '<div class="form-group"><label style="font-size:11px">O que mais te incomoda?</label>'
      + '<textarea class="form-input" id="ac_'+pid+'_incomoda" rows="2" style="font-size:13px;resize:vertical">'+(anamnese&&anamnese.incomoda?anamnese.incomoda:'')+'</textarea></div>'
    + sec('📏 Avaliação Física')
    + row([
        ['Peso (kg)', inp('peso', af.peso)],
        ['Altura (cm)', inp('altura', af.altura)],
        ['IMC', inp('imc', af.imc)],
        ['Tratamentos anteriores?', sel('trat', af.trat, simNao)],
        ['Quais?', inp('tratQual', af.tratQual)]
      ])
    + row([
        ['Flacidez?', sel('flacidez', af.flacidez, simNao)],
        ['Gordura localizada?', sel('gordura', af.gordura, simNao)],
        ['Celulite?', sel('celulite', af.celulite, simNao)],
        ['Grau', inp('celuliteGrau', af.celuliteGrau)],
        ['Estrias?', sel('estrias', af.estrias, simNao)],
        ['Área', inp('striasArea', af.striasArea)]
      ])
    + '<div class="form-group"><label style="font-size:11px">Informações adicionais</label>'
      + '<textarea class="form-input" id="ac_'+pid+'_adicional" rows="2" style="font-size:13px;resize:vertical">'+(af.adicional||'')+'</textarea></div>'
    + sec('📐 Avaliação Corporal')
    + '<div class="form-group"><label style="font-size:11px">Áreas a tratar</label>'
      + '<div style="display:flex;flex-wrap:wrap;gap:0.75rem;padding:0.5rem">'
      + chk('abdomen', ar.abdomen, 'Abdômen')
      + chk('bracos', ar.bracos, 'Braços')
      + chk('coxas', ar.coxas, 'Coxas')
      + chk('gluteos', ar.gluteos, 'Glúteos')
      + chk('costas', ar.costas, 'Costas')
      + chk('outras', ar.outras, 'Outras:')
      + inp('outrasQual', ar.outrasQual, 'especifique')
      + '</div></div>'
    + '<div class="form-group"><label style="font-size:11px">Diástase</label>'
      + '<div style="display:flex;gap:1rem;padding:0.5rem">'
      + chk('diaSupra', di.supra, 'Supra')
      + chk('diaUmb', di.umbilical, 'Umbilical')
      + chk('diaInfra', di.infra, 'Infraumbilical')
      + '</div></div>'
    + row([
        ['Circ. Supra (cm)', inp('circSupra', md.circSupra)],
        ['Circ. Umbilical (cm)', inp('circUmb', md.circUmb)],
        ['Circ. Infra (cm)', inp('circInfra', md.circInfra)],
        ['Quadril (cm)', inp('quadril', md.quadril)]
      ])
    + row([
        ['Coxa (cm)', inp('coxa', md.coxa)],
        ['Braço Direito (cm)', inp('bracoDireito', md.bracoDireito)],
        ['Braço Esquerdo (cm)', inp('bracoEsquerdo', md.bracoEsquerdo)],
        ['% Gordura', inp('gorduraPerc', md.gorduraPerc)]
      ])
    + '<div style="margin-top:1rem;display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:flex-end">'
      + '<button class="btn btn-primary" onclick="salvarFichaAcomp(\''+pid+'\',\''+ag.cliente+'\',\''+aid+'\',\''+(ag.cpf||'')+'\''+')" style="padding:0.5rem 1.5rem">💾 Salvar Ficha</button>'
      + '<button class="btn btn-secondary" onclick="visualizarFichaAcomp(\''+pid+'\',\''+ag.cliente+'\',\''+aid+'\',\''+(ag.cpf||'')+'\''+')" >👁 Visualizar para Assinar</button>'
      + '<button class="btn btn-secondary" onclick="renderAcomp()">Cancelar</button>'
      + '</div>'
    + '</div>';

  return html;
}

function visualizarFichaAcomp(pid, clienteNome, anamId, agCpf) {
  salvarFichaAcomp(pid, clienteNome, anamId, agCpf);
  var ficha = anamId
    ? db.anamneses.find(function(a){ return a.id===anamId; })
    : _matchAnamnese(agCpf, clienteNome);
  if (!ficha) { showToast('Salve a ficha primeiro!'); return; }
  abrirModalAssinatura(ficha, 'acomp');
}

function salvarFichaAcomp(pid, clienteNome, anamId, agCpf) {
  function g(k) { var el=document.getElementById('ac_'+pid+'_'+k); return el ? el.value.trim() : ''; }
  function gc(k) { var el=document.getElementById('ac_'+pid+'_'+k); return el ? el.checked : false; }

  var dadosPessoais = { nome:g('nome'), idade:g('idade'), genero:g('genero'), dataNasc:g('dataNasc'), telefone:g('telefone'), cpf:g('cpf'), filhos:g('filhos') };
  var saude = { doenca:g('doenca'), doencaQual:g('doencaQual'), medicacao:g('medicacao'), medicacaoQual:g('medicacaoQual'),
    injetado:g('injetado'), injetadoQual:g('injetadoQual'), cirurgia:g('cirurgia'), cirurgiaQual:g('cirurgiaQual'),
    alergia:g('alergia'), alergiaQual:g('alergiaQual'), marcapasso:g('marcapasso'), circulatorio:g('circulatorio'),
    hipertensao:g('hipertensao'), diabetes:g('diabetes') };
  var hormonal = { ciclo:g('ciclo'), gravida:g('gravida'), anti:g('anti'), antiQual:g('antiQual') };
  var habitos = { agua:g('agua'), alimentacao:g('alimentacao'), atividade:g('atividade'), atividadeQual:g('atividadeQual'),
    atividadeFreq:g('atividadeFreq'), alcool:g('alcool'), fuma:g('fuma'), cinta:g('cinta') };
  var avFisica = { peso:g('peso'), altura:g('altura'), imc:g('imc'), trat:g('trat'), tratQual:g('tratQual'),
    flacidez:g('flacidez'), gordura:g('gordura'), celulite:g('celulite'), celuliteGrau:g('celuliteGrau'),
    estrias:g('estrias'), striasArea:g('striasArea'), adicional:g('adicional') };
  var areas = { abdomen:gc('abdomen'), bracos:gc('bracos'), coxas:gc('coxas'), gluteos:gc('gluteos'),
    costas:gc('costas'), outras:gc('outras'), outrasQual:g('outrasQual') };
  var diastase = { supra:gc('diaSupra'), umbilical:gc('diaUmb'), infra:gc('diaInfra') };
  var medidas = { circSupra:g('circSupra'), circUmb:g('circUmb'), circInfra:g('circInfra'), quadril:g('quadril'),
    coxa:g('coxa'), bracoDireito:g('bracoDireito'), bracoEsquerdo:g('bracoEsquerdo'), gorduraPerc:g('gorduraPerc') };
  var incomoda = g('incomoda');

  if (anamId) {
    var ficha = db.anamneses.find(function(a){ return a.id===anamId; });
    if (ficha) {
      ficha.pessoais = dadosPessoais; ficha.saude = saude; ficha.hormonal = hormonal;
      ficha.habitos = habitos; ficha.avFisica = avFisica;
      ficha.avCorporal = { areas: areas, diastase: diastase, medidas: medidas };
      ficha.incomoda = incomoda;
    }
  } else {
    var novaFicha = {
      id: 'a_' + Date.now(),
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
      pessoais: dadosPessoais, saude: saude, hormonal: hormonal,
      habitos: habitos, avFisica: avFisica, incomoda: incomoda,
      avCorporal: { areas: areas, diastase: diastase, medidas: medidas }
    };
    if (!db.anamneses) db.anamneses = [];
    db.anamneses.push(novaFicha);
  }
  saveData();
  renderAnamnese();
  renderAcomp();
  showToast('✅ Ficha de ' + clienteNome + ' salva!');
  var _fichaAtual = anamId ? db.anamneses.find(function(a){return a.id===anamId;}) : _matchAnamnese(agCpf, clienteNome);
  if (_fichaAtual) _salvarAnamnese(_fichaAtual);
}

function _acompField(label, val) {
  if (!val) return '';
  return '<div class="form-group" style="min-width:120px">'
    +'<label style="font-size:10px;color:var(--text-light)">'+label+'</label>'
    +'<div style="font-size:13px;font-weight:500;border-bottom:1px solid var(--border);padding-bottom:2px">'+val+'</div>'
    +'</div>';
}


function toggleServicoSessao(agId, sessaoIdx, nomeServico, el) {
  el.classList.toggle('selected');
}

function salvarServicoSessao(agId, sessaoIdx, sid) {
  var ag = db.agenda.find(function(a){ return a.id===agId; });
  if (!ag || !ag.sessoes[sessaoIdx]) return;
  var container = document.getElementById('chips_'+sid);
  if (!container) return;
  var selecionados = [];
  container.querySelectorAll('.service-chip.selected').forEach(function(el){
    selecionados.push(el.textContent.trim());
  });
  ag.sessoes[sessaoIdx].servicoIds = selecionados;
  ag.sessoes[sessaoIdx].servico = selecionados.join(' + ');
  saveData();
  if (typeof renderAcomp === 'function') renderAcomp();
  showToast('Serviços da sessão '+(sessaoIdx+1)+' salvos!');
}

// ===== MODAL ASSINATURA =====
var _fichaAssinaturaAtual = null;

function _buildFichaHtml(ficha, tipo) {
  var p=ficha.pessoais||{}, s=ficha.saude||{}, h=ficha.hormonal||{};
  var hb=ficha.habitos||{}, af=ficha.avFisica||{}, ac=ficha.avCorporal||{};
  var ar=ac.areas||{}, di=ac.diastase||{}, md=ac.medidas||{};
  var yn = function(v){ return v==='sim'?'<b>(X) Sim</b>  ( ) Não':'( ) Sim  <b>(X) Não</b>'; };
  var sec = function(t){ return '<div style="background:#1C1C1E;color:#FAF0F2;padding:4px 10px;border-radius:4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:1rem 0 0.5rem">'+t+'</div>'; };
  var row = function(fields){ return '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:6px">'+fields.map(function(f){ return f?'<div style="flex:1;min-width:140px"><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px">'+f[0]+'</div><div style="font-size:13px;font-weight:500;border-bottom:1px solid #ddd;padding-bottom:2px">'+f[1]+'</div></div>':''; }).join('')+'</div>'; };
  var q = function(t){ return '<div style="font-size:12px;margin-bottom:5px">• '+t+'</div>'; };
  var areas = [ar.abdomen?'Abdômen':'',ar.bracos?'Braços':'',ar.coxas?'Coxas':'',ar.gluteos?'Glúteos':'',ar.costas?'Costas':'',ar.outras?ar.outrasQual:''].filter(Boolean).join(', ')||'—';
  var diastase = [di.supra?'Supra':'',di.umbilical?'Umbilical':'',di.infra?'Infraumbilical':''].filter(Boolean).join(', ')||'—';

  var html = '<div style="text-align:center;margin-bottom:1rem"><div style="font-size:14px;font-weight:700;color:#1C1C1E;letter-spacing:2px">LIZA FIGUEIREDO ESTÉTICA</div>'
    +'<div style="font-size:10px;color:#888;letter-spacing:1px">'+(tipo==='acomp'?'FICHA DE ACOMPANHAMENTO':'FICHA DE ANAMNESE CORPORAL')+' · '+(ficha.dataCadastro||'')+'</div></div>';

  html += sec('Informações Pessoais')
    + row([['Nome',p.nome||''],['Idade',p.idade||''],['Gênero',p.genero||'']])
    + row([['Nascimento',p.dataNasc||''],['Telefone',p.telefone||''],['Filhos',p.filhos||'']])
    + sec('Histórico de Saúde')
    + q('Doença diagnosticada? '+yn(s.doenca)+' &nbsp; Qual: '+(s.doencaQual||'—'))
    + q('Medicação contínua? '+yn(s.medicacao)+' &nbsp; Qual: '+(s.medicacaoQual||'—'))
    + q('Produto injetado? '+yn(s.injetado)+' &nbsp; Cirurgia? '+yn(s.cirurgia)+' &nbsp; Qual/Quando: '+(s.cirurgiaQual||'—'))
    + q('Alergia? '+yn(s.alergia)+' &nbsp; Qual: '+(s.alergiaQual||'—'))
    + q('Marcapasso/Prótese? '+yn(s.marcapasso)+' &nbsp; Prob. circulatórios? '+yn(s.circulatorio))
    + q('Hipertensão? '+yn(s.hipertensao)+' &nbsp; Diabetes? '+yn(s.diabetes))
    + sec('Hormonal')
    + q('Ciclo menstrual: ( '+(h.ciclo==='Regular'?'X':' ')+' ) Regular &nbsp; ( '+(h.ciclo==='Irregular'?'X':' ')+' ) Irregular &nbsp; ( '+(h.ciclo==='Menopausa'?'X':' ')+' ) Menopausa')
    + q('Grávida/Amamentando? '+yn(h.gravida)+' &nbsp; Anticoncepcional? '+yn(h.anti)+' Qual: '+(h.antiQual||'—'))
    + sec('Hábitos')
    + q('Água: '+(hb.agua||'—')+' l/dia &nbsp; Alimentação: '+(hb.alimentacao||'—')+' &nbsp; Atividade: '+yn(hb.atividade)+' '+(hb.atividadeQual||'')+' Freq: '+(hb.atividadeFreq||'—'))
    + q('Álcool? '+yn(hb.alcool)+' &nbsp; Fuma? '+yn(hb.fuma)+' &nbsp; Cinta modeladora? '+yn(hb.cinta))
    + (ficha.incomoda ? q('O que mais te incomoda: '+ficha.incomoda) : '');

  if (tipo === 'acomp') {
    html += sec('Avaliação Física')
      + row([['Peso (kg)',af.peso||''],['Altura (cm)',af.altura||''],['IMC',af.imc||''],['Flacidez',af.flacidez||''],['Gordura loc.',af.gordura||'']])
      + row([['Celulite',af.celulite||''],['Grau',af.celuliteGrau||''],['Estrias',af.estrias||''],['Área',af.striasArea||'']])
      + sec('Avaliação Corporal')
      + q('Áreas: '+areas+' &nbsp; Diástase: '+diastase)
      + row([['Circ. Supra',md.circSupra||''],['Circ. Umbilical',md.circUmb||''],['Circ. Infra',md.circInfra||''],['Quadril',md.quadril||'']])
      + row([['Coxa',md.coxa||''],['Braço Dir.',md.bracoDireito||''],['Braço Esq.',md.bracoEsquerdo||''],['% Gordura',md.gorduraPerc||'']]);
  }

  html += '<div style="background:#F5F8E8;border-radius:6px;padding:0.75rem;font-size:11px;color:#555;margin-top:1rem">TERMO DE RESPONSABILIDADE: Declaro que as afirmações acima são verdadeiras, não cabendo ao profissional qualquer responsabilidade por informações omitidas ou incorretas.</div>';

  if (ficha.assinatura) {
    html += '<div style="margin-top:1rem;text-align:center"><div style="font-size:10px;color:#888;margin-bottom:4px">ASSINATURA DA CLIENTE</div>'
      +'<img src="'+ficha.assinatura+'" style="max-width:280px;border-bottom:1px solid #333;display:block;margin:0 auto">'
      +'<div style="font-size:11px;color:#555;margin-top:4px">'+( p.nome||'')+'</div></div>';
  }
  return html;
}

function abrirModalAssinatura(ficha, tipo) {
  _fichaAssinaturaAtual = { ficha: ficha, tipo: tipo };
  var p = ficha.pessoais||{};
  document.getElementById('modalAnamTitulo').textContent = (p.nome||'Cliente') + (tipo==='acomp'?' · Acompanhamento':' · Anamnese');
  document.getElementById('modalAnamConteudo').innerHTML = _buildFichaHtml(ficha, tipo);
  document.getElementById('modalAssinatura').style.display = 'block';
  document.body.style.overflow = 'hidden';
  var jaAssinado = !!(ficha.assinatura && ficha.assinatura !== 'signed');
  setTimeout(function(){ _setAssinBloqueado(jaAssinado); }, 150);

  // Inicializar canvas após modal estar visível (setTimeout garante dimensões corretas no iPad)
  setTimeout(function() {
    // Clonar canvas para remover listeners antigos
    var old = document.getElementById('canvasAssinatura');
    var c = old.cloneNode(false);
    old.parentNode.replaceChild(c, old);

    // Definir tamanho real em pixels
    var rect = c.parentNode.getBoundingClientRect();
    c.width = rect.width || 600;
    c.height = 180;
    c.style.width = '100%';
    c.style.height = '180px';
    c.style.touchAction = 'none';
    c.style.cursor = 'crosshair';
    c.style.display = 'block';
    c.style.borderRadius = '8px';

    var ctx = c.getContext('2d');
    ctx.fillStyle = '#FFFBF8';
    ctx.fillRect(0, 0, c.width, c.height);

    // Se já tem assinatura, mostrar
    if (ficha.assinatura && ficha.assinatura !== 'signed') {
      var img = new Image();
      img.onload = function(){ ctx.drawImage(img, 0, 0, c.width, c.height); };
      img.src = ficha.assinatura;
      document.getElementById('canvasHint').style.display = 'none';
    } else {
      document.getElementById('canvasHint').style.display = 'flex';
    }

    var drawing = false;
    var lastX = 0, lastY = 0;

    function getPos(e) {
      var rect = c.getBoundingClientRect();
      var scaleX = c.width / rect.width;
      var scaleY = c.height / rect.height;
      var src = e.touches ? e.touches[0] : e;
      return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
    }
    function startDraw(e) {
      e.preventDefault();
      e.stopPropagation();
      drawing = true;
      var pos = getPos(e);
      lastX = pos.x; lastY = pos.y;
      document.getElementById('canvasHint').style.display = 'none';
    }
    function draw(e) {
      if (!drawing) return;
      e.preventDefault();
      e.stopPropagation();
      var pos = getPos(e);
      ctx.beginPath();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastX = pos.x; lastY = pos.y;
    }
    function endDraw(e) { drawing = false; }

    c.addEventListener('mousedown', startDraw);
    c.addEventListener('mousemove', draw);
    c.addEventListener('mouseup', endDraw);
    c.addEventListener('mouseleave', endDraw);
    c.addEventListener('touchstart', startDraw, {passive:false});
    c.addEventListener('touchmove', draw, {passive:false});
    c.addEventListener('touchend', endDraw, {passive:false});
  }, 100);
}

function fecharModalAssinatura() {
  document.getElementById('modalAssinatura').style.display = 'none';
  document.body.style.overflow = '';
  _fichaAssinaturaAtual = null;
}

function limparAssinatura() {
  var c = document.getElementById('canvasAssinatura');
  var ctx = c.getContext('2d');
  ctx.fillStyle = '#FFFBF8';
  ctx.fillRect(0,0,c.width,c.height);
  document.getElementById('canvasHint').style.display = 'flex';
}

function salvarAssinatura() {
  addLog('INFO', 'salvarAssinatura chamada. _fichaAssinaturaAtual=' + (_fichaAssinaturaAtual ? 'OK' : 'NULL'));
  var c = document.getElementById('canvasAssinatura');
  if (!c) { addLog('ERROR', 'Canvas não encontrado!'); return; }
  if (!_fichaAssinaturaAtual) { addLog('ERROR', 'Ficha atual nula'); showToast('Erro: ficha não identificada.'); return; }

  // Buscar referência REAL no db pelo id — evita salvar em cópia
  var fichaRef = db.anamneses.find(function(a){ return a.id === _fichaAssinaturaAtual.ficha.id; });
  if (!fichaRef) { addLog('ERROR', 'Ficha não encontrada no db!'); showToast('Erro: ficha não encontrada.'); return; }
  addLog('INFO', 'Salvando para: ' + (fichaRef.pessoais ? fichaRef.pessoais.nome : '?') + ' id=' + fichaRef.id);

  var tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = 900;
  tmpCanvas.height = 280;
  var ctx = tmpCanvas.getContext('2d');
  ctx.fillStyle = '#FFFBF8';
  ctx.fillRect(0,0,900,280);
  ctx.drawImage(c, 0, 0, 900, 280);
  var dataUrl = tmpCanvas.toDataURL('image/png');
  addLog('INFO', 'dataUrl: ' + Math.round(dataUrl.length/1024) + 'KB');

  fichaRef.assinatura = dataUrl;
  fichaRef.dataAssinatura = new Date().toLocaleDateString('pt-BR');

  try {
    saveData();
    addLog('INFO', 'saveData ok');
    _salvarAnamnese(fichaRef);
  } catch(e) {
    addLog('ERROR', 'saveData falhou: ' + e.message);
    fichaRef.assinatura = 'signed';
    saveData();
  }

  renderAnamnese();
  if (typeof renderAcomp === 'function') renderAcomp();
  _setAssinBloqueado(true);
  fecharModalAssinatura();
  showToast('✍️ Assinatura de ' + (fichaRef.pessoais ? fichaRef.pessoais.nome : '') + ' salva!');
}

function configurarSenhaAssinatura() {
  var atual = localStorage.getItem('lizafig_signin_pwd') || '1234';
  var nova = prompt('Senha atual: ' + atual + '\n\nDigite a nova senha para bloqueio de assinatura:');
  if (nova === null) return;
  if (!nova.trim()) { showToast('Senha não pode ser vazia!'); return; }
  localStorage.setItem('lizafig_signin_pwd', nova.trim());
  showToast('🔑 Senha atualizada com sucesso!');
}

function _setAssinBloqueado(bloqueado) {
  var bar = document.getElementById('assinBloqueioBar');
  var bots = document.getElementById('assinBotoes');
  var canvas = document.getElementById('canvasAssinatura');
  if (!bar || !bots || !canvas) return;
  if (bloqueado) {
    bar.style.display = 'block';
    bots.style.display = 'none';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.85';
  } else {
    bar.style.display = 'none';
    bots.style.display = 'flex';
    canvas.style.pointerEvents = 'auto';
    canvas.style.opacity = '1';
  }
}

function desbloquearAssinatura() {
  var senha = prompt('Digite a senha para editar a assinatura:');
  var senhaSalva = localStorage.getItem('lizafig_signin_pwd') || '1234';
  if (senha === senhaSalva) {
    _setAssinBloqueado(false);
    showToast('🔓 Assinatura desbloqueada!');
  } else {
    showToast('❌ Senha incorreta!');
  }
}

function novoCiclo(agId) {
  const ag = db.agenda.find(x => x.id === agId);
  if (!ag) return;

  const modal = document.createElement('div');
  modal.id = 'novo-ciclo-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(44,26,34,0.65);z-index:9997;display:flex;align-items:center;justify-content:center;padding:1rem';

  const chipsHtml = db.servicos.filter(s=>s.status==='ativo').map(s =>
    `<span class="service-chip" style="font-size:12px;cursor:pointer" onclick="this.classList.toggle('selected')">${s.nome}</span>`
  ).join('');

  modal.innerHTML = `
    <div style="background:white;border-radius:16px;max-width:520px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
      <div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:'Cormorant Garamond',serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">🔄 Novo Ciclo · ${ag.cliente}</span>
        <button onclick="document.getElementById('novo-ciclo-modal').remove()" style="background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer">✕</button>
      </div>
      <div style="padding:1.5rem;max-height:80vh;overflow-y:auto">
        <div style="font-size:12px;color:var(--text-light);margin-bottom:1rem">Adiciona novas sessões à ficha existente da cliente, sem perder o histórico.</div>
        <div style="margin-bottom:1rem">
          <div style="font-size:10px;letter-spacing:2px;color:var(--text-light);margin-bottom:8px">COR NA AGENDA</div>
          <input type="hidden" id="nc-cor" value="${ag.cor||'#D4A0A8'}">
          <div id="nc-cor-wrap" style="display:flex;flex-wrap:wrap;gap:8px">
            ${_renderCorBolinhas('nc', ag.cor||'#D4A0A8')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1rem">
          <div>
            <div style="font-size:10px;letter-spacing:2px;color:var(--text-light);margin-bottom:4px">QTD DE SESSÕES</div>
            <input type="number" id="nc-qtd" min="1" max="30" value="1"
              style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none"
              oninput="gerarCamposNovoCiclo('${agId}')">
          </div>
          <div>
            <div style="font-size:10px;letter-spacing:2px;color:var(--text-light);margin-bottom:4px">SINAL / ENTRADA (R$)</div>
            <input type="number" id="nc-sinal" placeholder="0,00" step="0.01" min="0"
              style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">
          </div>
          <div>
            <div style="font-size:10px;letter-spacing:2px;color:var(--text-light);margin-bottom:4px">OBSERVAÇÃO</div>
            <input type="text" id="nc-obs" placeholder="Ex: Pacote renovado"
              style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">
          </div>
        </div>
        <div id="nc-sessoes" style="margin-bottom:1rem"></div>
        <div style="display:flex;gap:0.75rem">
          <button class="btn btn-primary" onclick="salvarNovoCiclo('${agId}')">✓ Adicionar Sessões</button>
          <button class="btn btn-secondary" onclick="document.getElementById('novo-ciclo-modal').remove()">Cancelar</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  gerarCamposNovoCiclo(agId);
}

function gerarCamposNovoCiclo(agId) {
  const qtd = parseInt(document.getElementById('nc-qtd').value) || 1;
  const container = document.getElementById('nc-sessoes');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < qtd; i++) {
    const chipsHtml = db.servicos.filter(s=>s.status==='ativo').map(s =>
      `<span class="service-chip" style="font-size:11px;padding:2px 8px;cursor:pointer" id="ncchip_${i}_${s.id}" onclick="this.classList.toggle('selected')">${s.nome}</span>`
    ).join('');
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:8px;flex-wrap:wrap';
    div.innerHTML = `
      <span style="font-size:11px;color:var(--text-light);min-width:60px">Sessão ${i+1}</span>
      <input type="date" id="nc-data-${i}" style="padding:0.4rem 0.6rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">
      <input type="time" id="nc-hora-${i}" placeholder="Início" title="Horário de início" style="width:90px;padding:0.4rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">
      <span style="font-size:11px;color:var(--text-light)">até</span>
      <input type="time" id="nc-horafim-${i}" placeholder="Fim" title="Horário de término" style="width:90px;padding:0.4rem;border:1px solid var(--border);border-radius:8px;font-family:Jost,sans-serif;font-size:13px;outline:none">
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        <input type="text" placeholder="🔍 Filtrar serviços..." oninput="(function(el){var v=el.value.toLowerCase();el.parentElement.querySelectorAll('.service-chip').forEach(function(c){c.style.display=c.textContent.toLowerCase().includes(v)?'':'none';});})(this)" style="width:100%;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:Jost,sans-serif;outline:none;margin-bottom:4px">
        ${chipsHtml}
      </div>`;
    container.appendChild(div);
  }
}

function salvarNovoCiclo(agId) {
  const ag = db.agenda.find(x => x.id === agId);
  if (!ag) return;
  const qtd = parseInt(document.getElementById('nc-qtd').value) || 1;
  const obs = document.getElementById('nc-obs').value;

  const novasSessoes = [];
  for (let i = 0; i < qtd; i++) {
    const dataEl = document.getElementById('nc-data-'+i);
    if (!dataEl || !dataEl.value) { showToast(`Preencha a data da sessão ${i+1}!`); return; }
    const horaEl = document.getElementById('nc-hora-'+i);
    const srvIds = db.servicos.filter(function(s){
      const el = document.getElementById('ncchip_'+i+'_'+s.id);
      return el && el.classList.contains('selected');
    }).map(s => s.id);
    const horaFimEl = document.getElementById('nc-horafim-'+i);
    novasSessoes.push({
      data: dataEl.value,
      hora: horaEl ? horaEl.value : '',
      horaFim: horaFimEl ? horaFimEl.value : '',
      status: 'pendente',
      atendimentoId: null,
      servicoIds: srvIds,
      servico: srvIds.map(id=>{ const sv=db.servicos.find(x=>x.id===id); return sv?sv.nome:''; }).join(' + ')
    });
  }

  novasSessoes.sort((a,b) => a.data.localeCompare(b.data));

  // Validação de conflito de horário
  var conflitosNC = [];
  novasSessoes.forEach(function(nova) {
    if (!nova.data || !nova.hora) return;
    var hIniNova = parseInt(nova.hora.split(':')[0])*60 + parseInt(nova.hora.split(':')[1]||0);
    var hFimNova = nova.horaFim ? parseInt(nova.horaFim.split(':')[0])*60 + parseInt(nova.horaFim.split(':')[1]||0) : hIniNova + 1;
    db.agenda.forEach(function(agCheck) {
      agCheck.sessoes.forEach(function(s) {
        if (s.data !== nova.data || !s.hora) return;
        if (s.status === 'realizado' || s.status === 'falta') return;
        var hIniEx = parseInt(s.hora.split(':')[0])*60 + parseInt(s.hora.split(':')[1]||0);
        var hFimEx = s.horaFim ? parseInt(s.horaFim.split(':')[0])*60 + parseInt(s.horaFim.split(':')[1]||0) : hIniEx + 1;
        if (hIniNova < hFimEx && hFimNova > hIniEx) {
          conflitosNC.push(agCheck.cliente + ' — ' + fmtDate(s.data) + ' ' + s.hora + (s.horaFim ? '–' + s.horaFim : ''));
        }
      });
    });
  });
  if (conflitosNC.length > 0) {
    var msgNC = '⚠️ Conflito de horário!\n\nJá existe agendamento:\n' + conflitosNC.slice(0,3).join('\n');
    if (conflitosNC.length > 3) msgNC += '\n... e mais ' + (conflitosNC.length-3) + ' conflito(s).';
    msgNC += '\n\nAgendar mesmo assim?';
    if (!confirm(msgNC)) return;
  }

  const ncCor = (document.getElementById('nc-cor')||{value:''}).value || ag.cor || '#D4A0A8';
  const ncSinal = parseFloat((document.getElementById('nc-sinal')||{value:'0'}).value) || 0;

  // Salvar cor do ciclo em cada nova sessão individualmente — não toca em ag.cor
  novasSessoes.forEach(function(s){ s.cor = ncCor; });

  // Concatenar novas sessões no agendamento existente, preservando histórico e cor original
  ag.sessoes = ag.sessoes.concat(novasSessoes);
  if (obs) ag.obs = obs;
  if (ncSinal > 0) { ag.sinal = ncSinal; ag.sinalPago = true; }
  saveData(); renderAll();
  document.getElementById('novo-ciclo-modal').remove();
  showToast('✅ ' + novasSessoes.length + ' nova(s) sessão(ões) adicionada(s) para ' + ag.cliente + '!');
  _salvarAgenda(ag);
}


// ══════════════════════════════════════════════════════
//  FICHAS CUSTOMIZADAS — aba separada, sem tocar na anamnese
// ══════════════════════════════════════════════════════

function renderFichasCustom() {
  var tbody = document.getElementById('tbodyFichasCustom');
  if (!tbody) return;

  var busca = (document.getElementById('filtFichaCustomNome')||{value:''}).value.toLowerCase().trim();
  var de = (document.getElementById('filtFichaCustomDe')||{value:''}).value;
  var ate = (document.getElementById('filtFichaCustomAte')||{value:''}).value;

  // Filtrar só fichas com modelo_respostas preenchido
  var lista = db.anamneses.filter(function(a) {
    if (!a.modelo_respostas || Object.keys(a.modelo_respostas).length === 0) return false;
    var nome = (a.pessoais && a.pessoais.nome) || '';
    if (busca && nome.toLowerCase().indexOf(busca) < 0) return false;
    if (de || ate) {
      var dataBr = a.dataCadastro || '';
      var partes = dataBr.split('/');
      var dataComp = partes.length === 3 ? partes[2] + '-' + partes[1] + '-' + partes[0] : '';
      if (de && dataComp && dataComp < de) return false;
      if (ate && dataComp && dataComp > ate) return false;
    }
    return true;
  });

  // Atualizar badge
  var badge = document.getElementById('badgeFichasCustom');
  if (badge) badge.textContent = lista.length;

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📝</div><p>Nenhuma ficha customizada encontrada</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(function(a) {
    var nome = (a.pessoais && a.pessoais.nome) || '—';
    var modelo = a.modelo_nome || '—';
    var data = a.dataCadastro || '—';
    var assinatura = a.assinatura
      ? '<span class="badge-pill" style="background:#E8F5E9;color:#2E7D32;font-size:11px">✍️ Assinada</span>'
      : '<span class="badge-pill badge-pendente" style="font-size:11px">Pendente</span>';
    return '<tr>'
      + '<td><strong>' + nome + '</strong></td>'
      + '<td><span style="background:#EDD5D8;color:#B07880;padding:2px 8px;border-radius:12px;font-size:11px">' + modelo + '</span></td>'
      + '<td>' + data + '</td>'
      + '<td>' + assinatura + '</td>'
      + '<td style="display:flex;gap:4px"><button class="btn btn-edit btn-sm" onclick="editarFichaCustom(\'' + a.id + '\')" style="font-size:11px">✏️</button><button class="btn btn-primary btn-sm" onclick="verFichaCustom(\'' + a.id + '\')" style="font-size:11px;padding:4px 8px">👁 Ver</button></td>'
      + '</tr>';
  }).join('');
}

function verFichaCustom(id) {
  var ficha = db.anamneses.find(function(a) { return a.id === id; });
  if (!ficha) return;

  var p = ficha.pessoais || {};
  var mr = ficha.modelo_respostas || {};
  var sec = function(t) { return '<div style="background:#1C1C1E;color:#FAF0F2;padding:4px 10px;border-radius:4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:1rem 0 0.5rem">' + t + '</div>'; };
  var row = function(fields) { return '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:6px">' + fields.map(function(f) { return f ? '<div style="flex:1;min-width:140px"><div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px">' + f[0] + '</div><div style="font-size:13px;font-weight:500;border-bottom:1px solid #ddd;padding-bottom:2px">' + (f[1]||'—') + '</div></div>' : ''; }).join('') + '</div>'; };
  var q = function(t) { return '<div style="font-size:12px;margin-bottom:5px">• ' + t + '</div>'; };

  var html = '<div style="text-align:center;margin-bottom:1rem">'
    + '<div style="font-size:14px;font-weight:700;color:#1C1C1E;letter-spacing:2px">LIZA FIGUEIREDO ESTÉTICA</div>'
    + '<div style="font-size:10px;color:#888;letter-spacing:1px">FICHA: ' + (ficha.modelo_nome || 'CUSTOMIZADA') + ' · ' + (ficha.dataCadastro || '') + '</div>'
    + '</div>';

  html += sec('Informações Pessoais')
    + row([['Nome', p.nome], ['Idade', p.idade], ['Gênero', p.genero]])
    + row([['Nascimento', p.dataNasc], ['Telefone', p.telefone], ['CPF', p.cpf]]);

  if (Object.keys(mr).length > 0) {
    html += sec(ficha.modelo_nome || 'Respostas');
    Object.keys(mr).forEach(function(campo) {
      var valor = mr[campo];
      if (valor !== null && valor !== undefined && valor !== '') {
        html += q('<strong>' + campo + ':</strong> ' + valor);
      }
    });
  }

  html += '<div style="background:#F5F8E8;border-radius:6px;padding:0.75rem;font-size:11px;color:#555;margin-top:1rem">TERMO DE RESPONSABILIDADE: Declaro que as afirmações acima são verdadeiras, não cabendo ao profissional qualquer responsabilidade por informações omitidas ou incorretas.</div>';

  if (ficha.assinatura) {
    html += '<div style="margin-top:1rem;text-align:center">'
      + '<div style="font-size:10px;color:#888;margin-bottom:4px">ASSINATURA DA CLIENTE</div>'
      + '<img src="' + ficha.assinatura + '" style="max-width:280px;border-bottom:1px solid #333;display:block;margin:0 auto">'
      + '<div style="font-size:11px;color:#555;margin-top:4px">' + (p.nome || '') + '</div>'
      + '</div>';
  }

  // Reusar o modal de assinatura existente
  _fichaAssinaturaAtual = { ficha: ficha, tipo: 'anamnese' };
  document.getElementById('modalAnamTitulo').textContent = (p.nome || 'Cliente') + ' · ' + (ficha.modelo_nome || 'Ficha Custom');
  document.getElementById('modalAnamConteudo').innerHTML = html;
  document.getElementById('modalAssinatura').style.display = 'block';
  document.body.style.overflow = 'hidden';

  var jaAssinado = !!(ficha.assinatura && ficha.assinatura !== 'signed');
  setTimeout(function() { _setAssinBloqueado(jaAssinado); }, 150);
  setTimeout(function() {
    var old = document.getElementById('canvasAssinatura');
    var c = old.cloneNode(false);
    old.parentNode.replaceChild(c, old);
    var rect = c.parentNode.getBoundingClientRect();
    c.width = rect.width || 600;
    c.height = 180;
    c.style.cssText = 'width:100%;height:180px;touch-action:none;cursor:crosshair;display:block;border-radius:8px';
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#FFFBF8';
    ctx.fillRect(0, 0, c.width, c.height);
    if (ficha.assinatura && ficha.assinatura !== 'signed') {
      var img = new Image();
      img.onload = function() { ctx.drawImage(img, 0, 0, c.width, c.height); };
      img.src = ficha.assinatura;
      document.getElementById('canvasHint').style.display = 'none';
    } else {
      document.getElementById('canvasHint').style.display = 'flex';
    }
  }, 200);
}

// ── Modal Nova/Editar Ficha Custom ──
var _fichaCustomEditId = null;

function abrirNovaFichaCustom() {
  _fichaCustomEditId = null;
  _abrirModalFichaCustom(null);
}

function editarFichaCustom(id) {
  var ficha = db.anamneses.find(function(a) { return a.id === id; });
  if (!ficha) return;
  _fichaCustomEditId = id;
  _abrirModalFichaCustom(ficha);
}

function _abrirModalFichaCustom(ficha) {
  var old = document.getElementById('modal-ficha-custom');
  if (old) old.remove();

  var modelos = (_modelosAnamnese || []).filter(function(m) { return m.ativo; });
  var p = ficha ? (ficha.pessoais || {}) : {};
  var modeloAtual = ficha ? (ficha.modelo_id || '') : '';
  var mr = ficha ? (ficha.modelo_respostas || {}) : {};

  var modal = document.createElement('div');
  modal.id = 'modal-ficha-custom';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(28,28,30,0.6);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto';

  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    + '<div style="padding:1.2rem 1.5rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">'
    + '<div style="font-family:Cormorant Garamond,serif;font-size:18px;color:#FAF0F2;letter-spacing:2px">📝 ' + (ficha ? 'Editar Ficha' : 'Nova Ficha Manual') + '</div>'
    + '<button onclick="document.getElementById(\'modal-ficha-custom\').remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="padding:1.5rem">'
    // Modelo
    + '<div class="form-group" style="margin-bottom:1rem"><label>Modelo de Ficha</label>'
    + '<select id="fc-modelo" onchange="_carregarCamposModelo()" style="width:100%;padding:0.65rem 0.9rem;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:13px">'
    + '<option value="">— Selecione um modelo —</option>'
    + modelos.map(function(m) { return '<option value="' + m.id + '" ' + (modeloAtual === m.id ? 'selected' : '') + '>' + m.nome + '</option>'; }).join('')
    + '</select></div>'
    // Dados pessoais
    + '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);margin-bottom:0.75rem">Dados Pessoais</div>'
    + '<div class="form-grid" style="margin-bottom:1rem">'
    + '<div class="form-group"><label>Nome Completo *</label><input type="text" id="fc-nome" value="' + (p.nome||'') + '" placeholder="Nome completo"></div>'
    + '<div class="form-group"><label>Telefone (WhatsApp) *</label><input type="text" id="fc-telefone" value="' + (p.telefone||'') + '" placeholder="(xx) xxxxx-xxxx"></div>'
    + '<div class="form-group"><label>Idade</label><input type="text" id="fc-idade" value="' + (p.idade||'') + '"></div>'
    + '<div class="form-group"><label>Gênero</label><select id="fc-genero"><option value="">-</option><option value="Feminino" ' + (p.genero==='Feminino'?'selected':'') + '>Feminino</option><option value="Masculino" ' + (p.genero==='Masculino'?'selected':'') + '>Masculino</option><option value="Outro" ' + (p.genero==='Outro'?'selected':'') + '>Outro</option></select></div>'
    + '<div class="form-group"><label>CPF</label><input type="text" id="fc-cpf" value="' + (p.cpf||'') + '"></div>'
    + '<div class="form-group"><label>Data de Nascimento</label><input type="date" id="fc-dataNasc" value="' + (p.dataNasc||'') + '"></div>'
    + '</div>'
    // Campos do modelo
    + '<div id="fc-campos-wrap"></div>'
    + '<div style="display:flex;gap:0.75rem;margin-top:1.25rem">'
    + '<button class="btn btn-primary" onclick="salvarFichaCustom()">💾 Salvar Ficha</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'modal-ficha-custom\').remove()">Cancelar</button>'
    + '</div>'
    + '</div></div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });

  // Guardar respostas existentes para preencher depois
  window._fcRespostasExistentes = mr;

  // Se já tem modelo selecionado, carregar campos
  if (modeloAtual) {
    setTimeout(_carregarCamposModelo, 100);
  }
}

function _carregarCamposModelo() {
  var modeloId = (document.getElementById('fc-modelo')||{value:''}).value;
  var wrap = document.getElementById('fc-campos-wrap');
  if (!wrap) return;

  if (!modeloId) { wrap.innerHTML = ''; return; }

  var modelo = (_modelosAnamnese || []).find(function(m) { return m.id === modeloId; });
  if (!modelo) { wrap.innerHTML = ''; return; }

  var mr = window._fcRespostasExistentes || {};
  var campos = modelo.campos || [];

  var html = '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);margin-bottom:0.75rem">' + modelo.nome + '</div>';

  campos.forEach(function(c, i) {
    var val = mr[c.label] || '';
    var detalhe = mr[c.label + ' (detalhe)'] || '';
    html += '<div style="background:var(--cream);border-radius:8px;padding:0.75rem 1rem;margin-bottom:0.5rem">'
      + '<div style="font-size:13px;font-weight:500;margin-bottom:0.5rem">• ' + c.label + '</div>';

    if (c.tipo === 'sim_nao' || c.tipo === 'sim_nao_qual') {
      html += '<div style="display:flex;gap:1rem">'
        + '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="fcc_' + i + '" value="sim" ' + (val==='sim'?'checked':'') + '> Sim</label>'
        + '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="fcc_' + i + '" value="não" ' + (val==='não'?'checked':'') + '> Não</label>'
        + '</div>';
      if (c.tipo === 'sim_nao_qual') {
        html += '<div style="margin-top:0.5rem"><input type="text" id="fcc_qual_' + i + '" value="' + detalhe.replace(/"/g,'&quot;') + '" placeholder="Qual?" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:13px"></div>';
      }
    } else if (c.tipo === 'texto') {
      html += '<textarea id="fcc_texto_' + i + '" rows="3" placeholder="Descreva..." style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:13px;resize:vertical">' + val + '</textarea>';
    } else if (c.tipo === 'numero') {
      html += '<input type="number" id="fcc_num_' + i + '" value="' + val + '" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:13px">';
    } else if (c.tipo === 'data') {
      html += '<input type="date" id="fcc_data_' + i + '" value="' + val + '" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:13px">';
    } else if (c.tipo === 'multipla') {
      var selecionados = val ? val.split(', ') : [];
      html += '<div style="display:flex;flex-wrap:wrap;gap:0.5rem">';
      (c.opcoes||[]).forEach(function(op, oi) {
        html += '<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="fcc_mult_' + i + '_' + oi + '" value="' + op + '" ' + (selecionados.indexOf(op)>=0?'checked':'') + '> ' + op + '</label>';
      });
      html += '</div>';
    }
    html += '</div>';
  });

  wrap.innerHTML = html;
  // Guardar referência ao modelo atual
  wrap.dataset.modeloId = modeloId;
  wrap.dataset.modeloNome = modelo.nome;
  wrap.dataset.totalCampos = campos.length;
  window._fcCamposAtual = campos;
}

function salvarFichaCustom() {
  var nome = (document.getElementById('fc-nome')||{value:''}).value.trim();
  var telefone = (document.getElementById('fc-telefone')||{value:''}).value.trim();
  var modeloId = (document.getElementById('fc-modelo')||{value:''}).value;

  if (!nome) { showToast('⚠️ Preencha o nome!'); return; }
  if (!telefone) { showToast('⚠️ Preencha o telefone!'); return; }
  if (!modeloId) { showToast('⚠️ Selecione um modelo!'); return; }

  var wrap = document.getElementById('fc-campos-wrap');
  var campos = window._fcCamposAtual || [];
  var respostas = {};

  campos.forEach(function(c, i) {
    if (c.tipo === 'sim_nao' || c.tipo === 'sim_nao_qual') {
      var el = document.querySelector('input[name="fcc_' + i + '"]:checked');
      respostas[c.label] = el ? el.value : '';
      if (c.tipo === 'sim_nao_qual') {
        var qual = document.getElementById('fcc_qual_' + i);
        if (qual && qual.value) respostas[c.label + ' (detalhe)'] = qual.value;
      }
    } else if (c.tipo === 'texto') {
      var t = document.getElementById('fcc_texto_' + i);
      respostas[c.label] = t ? t.value : '';
    } else if (c.tipo === 'numero') {
      var n = document.getElementById('fcc_num_' + i);
      respostas[c.label] = n ? n.value : '';
    } else if (c.tipo === 'data') {
      var d = document.getElementById('fcc_data_' + i);
      respostas[c.label] = d ? d.value : '';
    } else if (c.tipo === 'multipla') {
      var sel = [];
      (c.opcoes||[]).forEach(function(op, oi) {
        var cb = document.getElementById('fcc_mult_' + i + '_' + oi);
        if (cb && cb.checked) sel.push(op);
      });
      respostas[c.label] = sel.join(', ');
    }
  });

  var modelo = (_modelosAnamnese||[]).find(function(m){ return m.id === modeloId; });

  var ficha = {
    id: _fichaCustomEditId || uid(),
    dataCadastro: new Date().toLocaleDateString('pt-BR'),
    pessoais: {
      nome: nome,
      telefone: telefone,
      idade: (document.getElementById('fc-idade')||{value:''}).value,
      genero: (document.getElementById('fc-genero')||{value:''}).value,
      cpf: (document.getElementById('fc-cpf')||{value:''}).value,
      dataNasc: (document.getElementById('fc-dataNasc')||{value:''}).value
    },
    saude: {}, hormonal: {}, habitos: {},
    av_fisica: {}, av_corporal: {},
    incomoda: '',
    modelo_id: modeloId,
    modelo_nome: modelo ? modelo.nome : '',
    modelo_respostas: respostas,
    atualizado_em: new Date().toISOString()
  };

  if (_fichaCustomEditId) {
    var idx = db.anamneses.findIndex(function(a) { return a.id === _fichaCustomEditId; });
    if (idx >= 0) db.anamneses[idx] = ficha;
  } else {
    db.anamneses.push(ficha);
  }

  saveData();
  _salvarAnamnese(ficha);
  renderFichasCustom();
  _atualizarBadges();
  document.getElementById('modal-ficha-custom').remove();
  showToast('✅ Ficha salva com sucesso!');
}

// =====================================================================
// ACOMPANHAMENTO DE FICHAS CUSTOM
// =====================================================================

var _acompCustomPagina = 1;

function renderAcompFichasCustom() {
  var el = document.getElementById('acompCustomLista');
  if (!el) return;

  var busca = ((document.getElementById('filtAcompCustomNome') || {value:''}).value || '').toLowerCase().trim();
  var filtModelo = ((document.getElementById('filtAcompCustomModelo') || {value:''}).value || '');
  var de = ((document.getElementById('filtAcompCustomDe') || {value:''}).value || '');
  var ate = ((document.getElementById('filtAcompCustomAte') || {value:''}).value || '');

  var fichas = db.anamneses.filter(function(a) {
    return a.modelo_respostas && Object.keys(a.modelo_respostas).length > 0;
  });

  var porCliente = {};
  fichas.forEach(function(a) {
    var nome = (a.pessoais && a.pessoais.nome) ? a.pessoais.nome.trim() : '—';
    var key = nome.toLowerCase();
    if (!porCliente[key]) porCliente[key] = { nome: nome, fichas: [] };
    porCliente[key].fichas.push(a);
  });

  var clientes = Object.values(porCliente).sort(function(a, b) {
    return a.nome.localeCompare(b.nome);
  });

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

  var POR_PAG = 10;
  var totalPags = Math.ceil(clientes.length / POR_PAG);
  if (_acompCustomPagina > totalPags) _acompCustomPagina = 1;
  var inicio = (_acompCustomPagina - 1) * POR_PAG;
  var pagClientes = clientes.slice(inicio, inicio + POR_PAG);

  var html = '';

  pagClientes.forEach(function(c) {
    var fichasOrd = c.fichas.slice().sort(function(a, b) {
      var da = _parseDateBrCustom(a.dataCadastro);
      var db2 = _parseDateBrCustom(b.dataCadastro);
      return db2.localeCompare(da);
    });

    var porModelo = {};
    fichasOrd.forEach(function(f) {
      var mod = f.modelo_nome || 'Sem modelo';
      if (!porModelo[mod]) porModelo[mod] = [];
      porModelo[mod].push(f);
    });

    var cardId = 'acomp-custom-' + c.nome.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,'');

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

    Object.keys(porModelo).forEach(function(modNome) {
      var fichasModelo = porModelo[modNome];

      html += '<div style="background:var(--cream);border-radius:8px;padding:0.75rem 1rem;margin-bottom:0.75rem">'
        + '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dark);margin-bottom:0.75rem;font-weight:600">📋 ' + modNome + '</div>';

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
        html += '<div style="overflow-x:auto"><table style="width:100%;font-size:12px;border-collapse:collapse">'
          + '<thead><tr>'
          + '<th style="text-align:left;padding:4px 8px;color:var(--text-light);font-size:10px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;background:white;border-bottom:1px solid var(--border)">Campo</th>';

        fichasModelo.forEach(function(f) {
          html += '<th style="text-align:center;padding:4px 8px;color:var(--gold-dark);font-size:10px;white-space:nowrap;background:white;border-bottom:1px solid var(--border)">'
            + (f.dataCadastro || '—')
            + '<div style="font-size:9px;color:var(--text-light);font-weight:400">' + (f.assinatura ? '✍️' : '⏳') + '</div>'
            + '<div style="margin-top:2px"><button onclick="verFichaCustom(\'' + f.id + '\')" style="background:var(--gold);color:white;border:none;border-radius:4px;padding:2px 6px;font-size:10px;cursor:pointer">Ver</button></div>'
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
            var displayVal = (val !== undefined && val !== null && val !== '') ? val : '—';
            if (detalhe) displayVal += ' (' + detalhe + ')';

            var cor = '';
            if (displayVal === 'sim') cor = 'color:#C62828;font-weight:600';
            else if (displayVal === 'não') cor = 'color:#388E3C';

            html += '<td style="padding:5px 8px;text-align:center;vertical-align:middle;' + cor + '">' + displayVal + '</td>';
          });

          html += '</tr>';
        });

        html += '</tbody></table></div>';
      }

      var modeloObj = (_modelosAnamnese || []).find(function(m) { return m.nome === modNome; });
      if (modeloObj) {
        html += '<div style="margin-top:0.75rem;text-align:right">'
          + '<button class="btn btn-primary btn-sm" onclick="_novaFichaCustomParaCliente(\'' + c.nome.replace(/'/g,"\\'") + '\',\'' + modeloObj.id + '\')" style="font-size:11px">+ Nova Sessão ' + modNome + '</button>'
          + '</div>';
      }

      html += '</div>';
    });

    html += '</div></div>';
  });

  if (totalPags > 1) {
    html += '<div style="display:flex;align-items:center;gap:0.5rem;padding:1rem;flex-wrap:wrap">';
    html += '<button onclick="_acompCustomPagina=Math.max(1,_acompCustomPagina-1);renderAcompFichasCustom()" ' + (_acompCustomPagina===1?'disabled':'') + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">‹</button>';
    for (var _p = 1; _p <= totalPags; _p++) {
      var _isAtiva = _p === _acompCustomPagina;
      html += '<button onclick="_acompCustomPagina=' + _p + ';renderAcompFichasCustom()" style="padding:4px 10px;border:1px solid ' + (_isAtiva?'#D4A0A8':'var(--border)') + ';border-radius:6px;background:' + (_isAtiva?'#D4A0A8':'white') + ';color:' + (_isAtiva?'white':'inherit') + ';cursor:pointer;font-size:12px">' + _p + '</button>';
    }
    html += '<button onclick="_acompCustomPagina=Math.min(' + totalPags + ',_acompCustomPagina+1);renderAcompFichasCustom()" ' + (_acompCustomPagina===totalPags?'disabled':'') + ' style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:white;cursor:pointer;font-size:12px">›</button>';
    html += '<span style="font-size:11px;color:var(--text-light)">' + (inicio+1) + '-' + Math.min(inicio+POR_PAG,clientes.length) + ' de ' + clientes.length + '</span>';
    html += '</div>';
  }

  el.innerHTML = html;
}

function _parseDateBrCustom(dataBr) {
  if (!dataBr) return '';
  var p = dataBr.split('/');
  return p.length === 3 ? p[2]+'-'+p[1]+'-'+p[0] : '';
}

function _toggleAcompCustomCard(cardId) {
  var wrap = document.getElementById(cardId);
  var icon = document.getElementById('icon-' + cardId);
  if (!wrap) return;
  var isOpen = wrap.classList.contains('open');
  document.querySelectorAll('.agenda-sessoes-wrap.open').forEach(function(el) { el.classList.remove('open'); });
  document.querySelectorAll('.expand-icon.open').forEach(function(el) { el.classList.remove('open'); });
  if (!isOpen) {
    wrap.classList.add('open');
    if (icon) icon.classList.add('open');
  }
}

function _novaFichaCustomParaCliente(nomeCliente, modeloId) {
  _fichaCustomEditId = null;
  _abrirModalFichaCustom(null);
  setTimeout(function() {
    var nomeEl = document.getElementById('fc-nome');
    var modeloEl = document.getElementById('fc-modelo');
    if (nomeEl) nomeEl.value = nomeCliente;
    if (modeloEl) { modeloEl.value = modeloId; _carregarCamposModelo(); }
    var fichaExist = db.anamneses.find(function(a) {
      return a.pessoais && a.pessoais.nome &&
             a.pessoais.nome.toLowerCase() === nomeCliente.toLowerCase() && a.pessoais.telefone;
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

function _popularFiltroModelos() {
  var sel = document.getElementById('filtAcompCustomModelo');
  if (!sel) return;
  var modelos = [];
  db.anamneses.forEach(function(a) {
    if (a.modelo_nome && modelos.indexOf(a.modelo_nome) < 0) modelos.push(a.modelo_nome);
  });
  var html = '<option value="">Todos os modelos</option>';
  modelos.sort().forEach(function(m) { html += '<option value="' + m + '">' + m + '</option>'; });
  sel.innerHTML = html;
}
