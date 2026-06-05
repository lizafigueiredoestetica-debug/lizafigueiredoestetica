/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — financeiro.js
   despAdm, despExtra, categorias, excluir, editHelpers, toggleDetail
   ===================================================== */

// ===================== DESP ADM =====================
function salvarDespAdm(){
  const desc=document.getElementById('dadm-desc').value.trim();
  const valor=document.getElementById('dadm-valor').value;
  const data=document.getElementById('dadm-data').value;
  const recorrencia=document.getElementById('dadm-recorrencia').value;
  const cat=document.getElementById('dadm-cat').value;
  if(!desc||!valor||!data){showToast('Preencha descrição, valor e data!');return;}

  if(recorrencia==='mensal'){
    // Perguntar se quer criar para o ano todo
    var partes=data.split('-');
    var anoBase=parseInt(partes[0]);
    var mesBase=parseInt(partes[1]);
    var diaBase=parseInt(partes[2]);
    var criarAnoTodo=confirm('Despesa recorrente mensal detectada!\n\nDeseja criar automaticamente os 12 lançamentos do ano ' + anoBase + '?\n\nOK = Criar ano todo\nCancelar = Criar só este mês');
    if(criarAnoTodo){
      var criados=0;
      for(var m=1;m<=12;m++){
        // Ajustar dia para meses com menos dias
        var ultimoDia=new Date(anoBase,m,0).getDate();
        var dia=Math.min(diaBase,ultimoDia);
        var mesStr=String(m).padStart(2,'0');
        var diaStr=String(dia).padStart(2,'0');
        var dataLanc=anoBase+'-'+mesStr+'-'+diaStr;
        db.despAdm.push({id:uid(),desc,cat,valor:parseFloat(valor),data:dataLanc,recorrencia:'mensal'});
        criados++;
      }
      saveData();renderAll();limparFormDespAdm();
      showToast('✅ '+criados+' lançamentos criados para o ano '+anoBase+'!');
      return;
    }
  }

  var novaDespAdm = {id:uid(),desc,cat,valor:parseFloat(valor),data,recorrencia};
  db.despAdm.push(novaDespAdm);
  saveData();renderAll();limparFormDespAdm();showToast('Despesa administrativa salva!');
  _salvarDespAdm(novaDespAdm);
}
function limparFormDespAdm(){['dadm-desc','dadm-valor'].forEach(id=>document.getElementById(id).value='');document.getElementById('dadm-cat').value='';document.getElementById('dadm-recorrencia').value='unica';setToday();}
function renderDespAdm(){
  const busca=(document.getElementById('filtDespAdmDesc').value||'').toLowerCase();
  const cat=document.getElementById('filtDespAdmCat').value;
  const de=(document.getElementById('filtDespAdmDe')||{value:''}).value;
  const ate=(document.getElementById('filtDespAdmAte')||{value:''}).value;
  let items=[...db.despAdm].sort((a,b)=>b.data.localeCompare(a.data));
  if(busca) items=items.filter(d=>d.desc.toLowerCase().includes(busca));
  if(cat) items=items.filter(d=>d.cat===cat);
  if(de) items=items.filter(d=>d.data>=de);
  if(ate) items=items.filter(d=>d.data<=ate);
  const total=items.reduce((s,d)=>s+parseFloat(d.valor||0),0);
  const tEl=document.getElementById('totalDespAdm');
  if(tEl) tEl.textContent=fmtMoney(total);
  const tbody=document.getElementById('tbodyDespAdm');
  if(!items.length){tbody.innerHTML=`<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🏢</div><p>Nenhuma despesa cadastrada</p></div></td></tr>`;return;}
  tbody.innerHTML=items.map(d=>`
    <tr class="data-row" onclick="toggleDetail('dadm-${d.id}',this)">
      <td><span class="expand-icon" id="icon-dadm-${d.id}">▶</span></td>
      <td><strong>${d.desc}</strong></td>
      <td>${d.cat||'—'}</td>
      <td>${d.recorrencia==='mensal'?'<span class="badge-pill badge-ativo">Mensal</span>':'Única'}</td>
      <td>${fmtDate(d.data)}</td>
      <td>${fmtMoney(d.valor)}</td>
      <td style="display:flex;gap:4px">
        <button class="btn btn-edit" onclick="event.stopPropagation();editItem('dadm','${d.id}')">✏️</button>
        <button class="btn btn-danger" onclick="event.stopPropagation();excluir('despAdm','${d.id}')">✕</button>
      </td>
    </tr>
    <tr class="detail-row" id="dadm-${d.id}">
      <td colspan="7">
        <div id="dadm-view-${d.id}">
          <div class="detail-box">
            <div class="detail-field"><label>Descrição</label><span>${d.desc}</span></div>
            <div class="detail-field"><label>Categoria</label><span>${d.cat||'—'}</span></div>
            <div class="detail-field"><label>Valor</label><span>${fmtMoney(d.valor)}</span></div>
            <div class="detail-field"><label>Data</label><span>${fmtDate(d.data)}</span></div>
            <div class="detail-field"><label>Recorrência</label><span>${d.recorrencia}</span></div>
          </div>
        </div>
        <div id="dadm-edit-${d.id}" style="display:none;padding:1rem">
          <div class="edit-form-row">
            <div class="form-grid">
              <div class="form-group"><label>Descrição</label><input type="text" id="edadm-desc-${d.id}" value="${d.desc}"></div>
              <div class="form-group"><label>Categoria</label>
                <select id="edadm-cat-${d.id}">
                  ${['Aluguel','Energia Elétrica','Água','Internet','Telefone','Salários','Contabilidade','Software','Outros'].map(c=>`<option value="${c}" ${d.cat===c?'selected':''}>${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label>Valor (R$)</label><input type="number" id="edadm-valor-${d.id}" value="${d.valor}" step="0.01"></div>
              <div class="form-group"><label>Data</label><input type="date" id="edadm-data-${d.id}" value="${d.data}"></div>
              <div class="form-group"><label>Recorrência</label>
                <select id="edadm-rec-${d.id}">
                  <option value="unica" ${d.recorrencia==='unica'?'selected':''}>Única</option>
                  <option value="mensal" ${d.recorrencia==='mensal'?'selected':''}>Mensal</option>
                </select>
              </div>
            </div>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-primary btn-sm" onclick="salvarEditDespAdm('${d.id}')">✓ Salvar</button>
              <button class="btn btn-secondary btn-sm" onclick="cancelEdit('dadm','${d.id}')">Cancelar</button>
            </div>
          </div>
        </div>
      </td>
    </tr>`).join('');
}

// ===================== DESP EXTRA =====================
function salvarDespExtra(){
  const desc=document.getElementById('dext-desc').value.trim();
  const valor=document.getElementById('dext-valor').value;
  const data=document.getElementById('dext-data').value;
  if(!desc||!valor||!data){showToast('Preencha descrição, valor e data!');return;}
  var novaDespExtra = {id:uid(),desc,valor:parseFloat(valor),data,obs:document.getElementById('dext-obs').value};
  db.despExtra.push(novaDespExtra);
  saveData();renderAll();limparFormDespExtra();showToast('Despesa extra salva!');
  _salvarDespExtra(novaDespExtra);
}
function limparFormDespExtra(){['dext-desc','dext-valor','dext-obs'].forEach(id=>document.getElementById(id).value='');setToday();}
function renderDespExtra(){
  const busca=(document.getElementById('filtDespExtraDesc').value||'').toLowerCase();
  const de=document.getElementById('filtDespExtraDe').value;
  const ate=document.getElementById('filtDespExtraAte').value;
  let items=[...db.despExtra].sort((a,b)=>b.data.localeCompare(a.data));
  if(busca) items=items.filter(d=>d.desc.toLowerCase().includes(busca));
  if(de) items=items.filter(d=>d.data>=de);
  if(ate) items=items.filter(d=>d.data<=ate);
  const total=items.reduce((s,d)=>s+parseFloat(d.valor||0),0);
  const tEl=document.getElementById('totalDespExtra');
  if(tEl) tEl.textContent=fmtMoney(total);
  const tbody=document.getElementById('tbodyDespExtra');
  if(!items.length){tbody.innerHTML=`<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">💸</div><p>Nenhuma despesa extra</p></div></td></tr>`;return;}
  tbody.innerHTML=items.map(d=>`
    <tr class="data-row" onclick="toggleDetail('dext-${d.id}',this)">
      <td><span class="expand-icon" id="icon-dext-${d.id}">▶</span></td>
      <td><strong>${d.desc}</strong></td>
      <td>${fmtDate(d.data)}</td>
      <td>${d.obs||'—'}</td>
      <td>${fmtMoney(d.valor)}</td>
      <td style="display:flex;gap:4px">
        <button class="btn btn-edit" onclick="event.stopPropagation();editItem('dext','${d.id}')">✏️</button>
        <button class="btn btn-danger" onclick="event.stopPropagation();excluir('despExtra','${d.id}')">✕</button>
      </td>
    </tr>
    <tr class="detail-row" id="dext-${d.id}">
      <td colspan="6">
        <div id="dext-view-${d.id}">
          <div class="detail-box">
            <div class="detail-field"><label>Descrição</label><span>${d.desc}</span></div>
            <div class="detail-field"><label>Data</label><span>${fmtDate(d.data)}</span></div>
            <div class="detail-field"><label>Valor</label><span>${fmtMoney(d.valor)}</span></div>
            <div class="detail-field"><label>Observação</label><span>${d.obs||'—'}</span></div>
          </div>
        </div>
        <div id="dext-edit-${d.id}" style="display:none;padding:1rem">
          <div class="edit-form-row">
            <div class="form-grid">
              <div class="form-group"><label>Descrição</label><input type="text" id="edext-desc-${d.id}" value="${d.desc}"></div>
              <div class="form-group"><label>Valor (R$)</label><input type="number" id="edext-valor-${d.id}" value="${d.valor}" step="0.01"></div>
              <div class="form-group"><label>Data</label><input type="date" id="edext-data-${d.id}" value="${d.data}"></div>
              <div class="form-group"><label>Observação</label><input type="text" id="edext-obs-${d.id}" value="${d.obs||''}"></div>
            </div>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-primary btn-sm" onclick="salvarEditDespExtra('${d.id}')">✓ Salvar</button>
              <button class="btn btn-secondary btn-sm" onclick="cancelEdit('dext','${d.id}')">Cancelar</button>
            </div>
          </div>
        </div>
      </td>
    </tr>`).join('');
}

// ===================== TOGGLE DETAIL =====================
var _lastOpenDetail = null;
function toggleDetail(id, row) {
  const detail = document.getElementById(id);
  const icon = document.getElementById('icon-' + id);
  if (!detail) return;
  const isOpen = detail.classList.contains('open');
  document.querySelectorAll('.detail-row.open').forEach(r=>r.classList.remove('open'));
  document.querySelectorAll('.expand-icon.open').forEach(i=>i.classList.remove('open'));
  if(!isOpen) {
    detail.classList.add('open');
    if(icon) icon.classList.add('open');
    _lastOpenDetail = id;
  } else {
    _lastOpenDetail = null;
  }
}

// ===================== EDIT HELPERS =====================
function editItem(prefix, id) {
  // Open the detail row first
  const detailRow = document.getElementById(prefix + '-' + id);
  if(detailRow) {
    document.querySelectorAll('.detail-row.open').forEach(r => r.classList.remove('open'));
    document.querySelectorAll('.expand-icon.open').forEach(i => i.classList.remove('open'));
    detailRow.classList.add('open');
    const icon = document.getElementById('icon-' + prefix + '-' + id);
    if(icon) icon.classList.add('open');
  }
  const view = document.getElementById(prefix + '-view-' + id);
  const edit = document.getElementById(prefix + '-edit-' + id);
  if(view && edit) { view.style.display='none'; edit.style.display='block'; }
}

function editAtend(id) {
  const detailRow = document.getElementById('atend-' + id);
  if(detailRow) {
    document.querySelectorAll('.detail-row.open').forEach(r => r.classList.remove('open'));
    document.querySelectorAll('.expand-icon.open').forEach(i => i.classList.remove('open'));
    detailRow.classList.add('open');
    const icon = document.getElementById('icon-atend-' + id);
    if(icon) icon.classList.add('open');
  }
  const view = document.getElementById('atend-view-' + id);
  const edit = document.getElementById('atend-edit-' + id);
  if(view && edit) { view.style.display='none'; edit.style.display='block'; }
}

function cancelEdit(prefix, id) {
  const view = document.getElementById(prefix + '-view-' + id);
  const edit = document.getElementById(prefix + '-edit-' + id);
  if(view && edit) { view.style.display='block'; edit.style.display='none'; }
}

function salvarEditAtend(id) {
  const a = db.atendimentos.find(x=>x.id===id);
  if(!a) return;
  a.data = document.getElementById('eatend-data-'+id).value;
  a.cliente = document.getElementById('eatend-cliente-'+id).value.trim();
  a.valor = parseFloat(document.getElementById('eatend-valor-'+id).value);
  a.pagto = document.getElementById('eatend-pagto-'+id).value;
  a.obs = document.getElementById('eatend-obs-'+id).value;

  // Salvar serviços selecionados
  const srvContainer = document.getElementById('eatend-srv-'+id);
  if (srvContainer) {
    const srvIds = [];
    srvContainer.querySelectorAll('.service-chip.selected').forEach(function(el){
      const sv = db.servicos.find(x=>x.nome===el.textContent.trim());
      if(sv) srvIds.push(sv.id);
    });
    a.servicoIds = srvIds;
    a.servicoNomes = srvIds.map(sid=>{ const sv=db.servicos.find(x=>x.id===sid); return sv?sv.nome:''; }).join(' + ');
  }

  // Salvar materiais selecionados
  const matContainer = document.getElementById('eatend-mat-'+id);
  if (matContainer) {
    const mats = {};
    matContainer.querySelectorAll('.material-chip.selected').forEach(function(el){
      const nome = el.textContent.split('(')[0].trim();
      const mat = db.materiais.find(x=>x.nome===nome);
      if(mat) mats[mat.id] = 1;
    });
    a.materiais = mats;
  }

  saveData(); renderAll();
  if (typeof _salvarAtendimento === 'function') _salvarAtendimento(a);
  showToast('Atendimento atualizado!');
}

function salvarEditServ(id) {
  const s = db.servicos.find(x=>x.id===id);
  if(!s) return;
  s.nome = document.getElementById('eserv-nome-'+id).value.trim();
  s.categoria = document.getElementById('eserv-cat-'+id).value;
  s.duracao = document.getElementById('eserv-dur-'+id).value;
  s.preco = parseFloat(document.getElementById('eserv-preco-'+id).value);
  s.status = document.getElementById('eserv-status-'+id).value;
  saveData(); renderAll(); showToast('Serviço atualizado!');
  _salvarServico(s);
}

function salvarEditMat(id) {
  const m = db.materiais.find(x=>x.id===id);
  if(!m) return;
  m.nome = document.getElementById('emat-nome-'+id).value.trim();
  m.fornecedor = document.getElementById('emat-forn-'+id).value;
  m.custo = parseFloat(document.getElementById('emat-custo-'+id).value);
  m.qtd = document.getElementById('emat-qtd-'+id).value;
  m.min = document.getElementById('emat-min-'+id).value;
  m.unidade = document.getElementById('emat-un-'+id).value;
  saveData(); renderAll(); showToast('Material atualizado!');
  _salvarMaterial(m);
}

function salvarEditDespAdm(id) {
  const d = db.despAdm.find(x=>x.id===id);
  if(!d) return;
  d.desc = document.getElementById('edadm-desc-'+id).value.trim();
  d.cat = document.getElementById('edadm-cat-'+id).value;
  d.valor = parseFloat(document.getElementById('edadm-valor-'+id).value);
  d.data = document.getElementById('edadm-data-'+id).value;
  d.recorrencia = document.getElementById('edadm-rec-'+id).value;
  saveData(); renderAll(); showToast('Despesa atualizada!');
}

function salvarEditDespExtra(id) {
  const d = db.despExtra.find(x=>x.id===id);
  if(!d) return;
  d.desc = document.getElementById('edext-desc-'+id).value.trim();
  d.valor = parseFloat(document.getElementById('edext-valor-'+id).value);
  d.data = document.getElementById('edext-data-'+id).value;
  d.obs = document.getElementById('edext-obs-'+id).value;
  saveData(); renderAll(); showToast('Despesa atualizada!');
}

// ===================== CATEGORIAS =====================
function getCatOptions(selectedVal) {
  return '<option value="">Selecione...</option>' +
    db.categorias.map(c => `<option value="${c.nome}" ${selectedVal===c.nome?'selected':''}>${c.nome}</option>`).join('');
}

function populateCatSelects() {
  // Main form
  const sc = document.getElementById('serv-cat');
  if(sc) { const v=sc.value; sc.innerHTML=getCatOptions(v); }
  // Filter
  const fc = document.getElementById('filtServCat');
  if(fc) {
    const v=fc.value;
    fc.innerHTML='<option value="">Todas categorias</option>'+db.categorias.map(c=>`<option value="${c.nome}" ${v===c.nome?'selected':''}>${c.nome}</option>`).join('');
  }
}

function salvarCategoria() {
  const nome = document.getElementById('cat-nome').value.trim();
  if(!nome) { showToast('Digite um nome para a categoria!'); return; }
  if(db.categorias.find(c=>c.nome.toLowerCase()===nome.toLowerCase())) {
    showToast('Categoria já existe!'); return;
  }
  var novaCat = {id: uid(), nome};
  db.categorias.push(novaCat);
  document.getElementById('cat-nome').value = '';
  saveData(); renderAll();
  _salvarCategoria(novaCat);
  showToast('Categoria salva!');
}

function renderCategorias() {
  populateCatSelects();
  const tbody = document.getElementById('tbodyCat');
  if(!tbody) return;
  if(!db.categorias.length) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">🏷️</div><p>Nenhuma categoria cadastrada</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = db.categorias.map(c => {
    const vinc = db.servicos.filter(s=>s.categoria===c.nome).length;
    return `
    <tr>
      <td id="cat-view-name-${c.id}">
        <strong>${c.nome}</strong>
        <div id="cat-edit-${c.id}" style="display:none;margin-top:6px">
          <div style="display:flex;gap:0.5rem;align-items:center">
            <input type="text" id="cat-edit-input-${c.id}" value="${c.nome}" style="padding:0.4rem 0.7rem;border:1px solid var(--gold);border-radius:6px;font-family:Jost,sans-serif;font-size:13px;outline:none">
            <button class="btn btn-primary btn-sm" onclick="salvarEditCat('${c.id}')">✓</button>
            <button class="btn btn-secondary btn-sm" onclick="cancelEditCat('${c.id}')">✕</button>
          </div>
        </div>
      </td>
      <td>
        ${vinc > 0
          ? `<span class="badge-pill badge-ativo">${vinc} serviço${vinc>1?'s':''}</span>`
          : `<span style="color:var(--text-light);font-size:12px">Nenhum serviço</span>`}
      </td>
      <td style="display:flex;gap:4px">
        <button class="btn btn-edit" onclick="startEditCat('${c.id}')">✏️</button>
        <button class="btn btn-danger" onclick="excluirCategoria('${c.id}')">✕</button>
      </td>
    </tr>`;
  }).join('');
}

function startEditCat(id) {
  document.querySelectorAll('[id^="cat-edit-"]').forEach(el => {
    if(el.id !== 'cat-edit-input-'+id) el.style.display='none';
  });
  document.getElementById('cat-edit-'+id).style.display='block';
  document.getElementById('cat-edit-input-'+id).focus();
}

function cancelEditCat(id) {
  document.getElementById('cat-edit-'+id).style.display='none';
}

function salvarEditCat(id) {
  const novoNome = document.getElementById('cat-edit-input-'+id).value.trim();
  if(!novoNome) { showToast('Nome não pode ser vazio!'); return; }
  const cat = db.categorias.find(c=>c.id===id);
  if(!cat) return;
  const nomeAntigo = cat.nome;
  // Update categoria name
  cat.nome = novoNome;
  // Update all servicos that used old name
  db.servicos.forEach(s => { if(s.categoria===nomeAntigo) s.categoria=novoNome; });
  saveData(); renderAll();
  showToast('Categoria atualizada!');
  _salvarCategoria(cat);
}

function excluirCategoria(id) {
  const cat = db.categorias.find(c=>c.id===id);
  if(!cat) return;
  const vinc = db.servicos.filter(s=>s.categoria===cat.nome).length;
  if(vinc > 0) {
    if(!confirm(`A categoria "${cat.nome}" está vinculada a ${vinc} serviço(s). Deseja excluir mesmo assim?`)) return;
  } else {
    if(!confirm(`Excluir categoria "${cat.nome}"?`)) return;
  }
  db.categorias = db.categorias.filter(c=>c.id!==id);
  saveData(); renderAll();
  showToast('Categoria excluída.');
  _deletarCategoria(id);
}

// ===================== EXCLUIR =====================
function excluir(colecao, id) {
  if(!confirm('Deseja excluir este item?')) return;
  db[colecao] = db[colecao].filter(x=>x.id!==id);
  saveData(); renderAll();
  showToast('Item excluído.');
  var mapa = { servicos: _deletarServico, materiais: _deletarMaterial, atendimentos: _deletarAtendimento, despAdm: _deletarDespAdm, despExtra: _deletarDespExtra };
  if (mapa[colecao]) mapa[colecao](id);
}

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

