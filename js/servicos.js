/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — servicos.js
   salvarServico, renderServicos, limparFormServ
   ===================================================== */

// ===================== SERVIÇOS =====================
function salvarServico() {
  const nome = document.getElementById('serv-nome').value.trim();
  const cat = document.getElementById('serv-cat').value;
  const dur = document.getElementById('serv-duracao').value;
  const preco = document.getElementById('serv-preco').value;
  if(!nome||!cat||!preco) { showToast('Preencha nome, categoria e preço!'); return; }
  var novoServ = { id:uid(), nome, categoria:cat, duracao:dur, preco:parseFloat(preco), status:document.getElementById('serv-status').value };
  db.servicos.push(novoServ);
  saveData(); renderAll(); limparFormServ();
  _salvarServico(novoServ);
  showToast('Serviço cadastrado!');
}
function limparFormServ() {
  ['serv-nome','serv-duracao','serv-preco'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('serv-cat').value='';
  document.getElementById('serv-status').value='ativo';
}
function renderServicos() {
  const busca=(document.getElementById('filtServNome').value||'').toLowerCase();
  const cat=document.getElementById('filtServCat').value;
  const status=document.getElementById('filtServStatus').value;
  let items=[...db.servicos];
  if(busca) items=items.filter(s=>s.nome.toLowerCase().includes(busca));
  if(cat) items=items.filter(s=>s.categoria===cat);
  if(status) items=items.filter(s=>s.status===status);
  const tbody=document.getElementById('tbodyServ');
  if(!items.length){tbody.innerHTML=`<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">💆</div><p>Nenhum serviço cadastrado</p></div></td></tr>`;return;}
  tbody.innerHTML=items.map(s=>`
    <tr class="data-row" onclick="toggleDetail('serv-${s.id}',this)">
      <td><span class="expand-icon" id="icon-serv-${s.id}">▶</span></td>
      <td><strong>${s.nome}</strong></td>
      <td>${s.categoria}</td>
      <td>${s.duracao?s.duracao+' min':'—'}</td>
      <td>${fmtMoney(s.preco)}</td>
      <td><span class="badge-pill ${s.status==='ativo'?'badge-ativo':'badge-inativo'}">${s.status}</span></td>
      <td style="display:flex;gap:4px">
        <button class="btn btn-edit" onclick="event.stopPropagation();editItem('serv','${s.id}')">✏️</button>
        <button class="btn btn-danger" onclick="event.stopPropagation();excluir('servicos','${s.id}')">✕</button>
      </td>
    </tr>
    <tr class="detail-row" id="serv-${s.id}">
      <td colspan="7">
        <div id="serv-view-${s.id}">
          <div class="detail-box">
            <div class="detail-field"><label>Nome</label><span>${s.nome}</span></div>
            <div class="detail-field"><label>Categoria</label><span>${s.categoria}</span></div>
            <div class="detail-field"><label>Duração</label><span>${s.duracao?s.duracao+' min':'—'}</span></div>
            <div class="detail-field"><label>Preço</label><span>${fmtMoney(s.preco)}</span></div>
            <div class="detail-field"><label>Status</label><span>${s.status}</span></div>
          </div>
        </div>
        <div id="serv-edit-${s.id}" style="display:none;padding:1rem">
          <div class="edit-form-row">
            <div class="form-grid">
              <div class="form-group"><label>Nome</label><input type="text" id="eserv-nome-${s.id}" value="${s.nome}"></div>
              <div class="form-group"><label>Categoria</label>
                <select id="eserv-cat-${s.id}">
                  <option value="">Selecione...</option>
                  ${db.categorias.map(c=>`<option value="${c.nome}" ${s.categoria===c.nome?'selected':''}>${c.nome}</option>`).join('')}
                  ${s.categoria && !db.categorias.find(c=>c.nome===s.categoria) ? `<option value="${s.categoria}" selected>${s.categoria}</option>` : ''}
                </select>
              </div>
              <div class="form-group"><label>Duração (min)</label><input type="number" id="eserv-dur-${s.id}" value="${s.duracao||''}"></div>
              <div class="form-group"><label>Preço (R$)</label><input type="number" id="eserv-preco-${s.id}" value="${s.preco}" step="0.01"></div>
              <div class="form-group"><label>Status</label>
                <select id="eserv-status-${s.id}">
                  <option value="ativo" ${s.status==='ativo'?'selected':''}>Ativo</option>
                  <option value="inativo" ${s.status==='inativo'?'selected':''}>Inativo</option>
                </select>
              </div>
            </div>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-primary btn-sm" onclick="salvarEditServ('${s.id}')">✓ Salvar</button>
              <button class="btn btn-secondary btn-sm" onclick="cancelEdit('serv','${s.id}')">Cancelar</button>
            </div>
          </div>
        </div>
      </td>
    </tr>`).join('');
}

// ===================== MATERIAIS =====================
function salvarMaterial() {
  const nome=document.getElementById('mat-nome').value.trim();
  const custo=document.getElementById('mat-custo').value;
  const qtd=document.getElementById('mat-qtd').value;
  if(!nome||!custo) { showToast('Preencha nome e custo!'); return; }
  var novoMat = { id:uid(), nome, fornecedor:document.getElementById('mat-fornecedor').value, custo:parseFloat(custo), qtd:qtd||'0', min:document.getElementById('mat-min').value||'0', unidade:document.getElementById('mat-unidade').value };
  db.materiais.push(novoMat);
  saveData(); renderAll(); limparFormMat();
  _salvarMaterial(novoMat);
  showToast('Material cadastrado!');
}
function limparFormMat(){['mat-nome','mat-fornecedor','mat-custo','mat-qtd','mat-min'].forEach(id=>document.getElementById(id).value='');}
function renderMateriais(){
  const busca=(document.getElementById('filtMatNome').value||'').toLowerCase();
  let items=[...db.materiais];
  if(busca) items=items.filter(m=>m.nome.toLowerCase().includes(busca));
  const tbody=document.getElementById('tbodyMat');
  if(!items.length){tbody.innerHTML=`<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🧴</div><p>Nenhum material cadastrado</p></div></td></tr>`;return;}
  tbody.innerHTML=items.map(m=>{
    const baixo=parseInt(m.qtd)<parseInt(m.min||0);
    return `
    <tr class="data-row" onclick="toggleDetail('mat-${m.id}',this)">
      <td><span class="expand-icon" id="icon-mat-${m.id}">▶</span></td>
      <td><strong>${m.nome}</strong></td>
      <td>${m.fornecedor||'—'}</td>
      <td>${fmtMoney(m.custo)}</td>
      <td>${m.qtd} ${m.unidade}</td>
      <td>${m.min||'0'}</td>
      <td><span class="badge-pill ${baixo?'badge-inativo':'badge-ativo'}">${baixo?'Baixo':'OK'}</span></td>
      <td style="display:flex;gap:4px">
        <button class="btn btn-edit" onclick="event.stopPropagation();editItem('mat','${m.id}')">✏️</button>
        <button class="btn btn-danger" onclick="event.stopPropagation();excluir('materiais','${m.id}')">✕</button>
      </td>
    </tr>
    <tr class="detail-row" id="mat-${m.id}">
      <td colspan="8">
        <div id="mat-view-${m.id}">
          <div class="detail-box">
            <div class="detail-field"><label>Nome</label><span>${m.nome}</span></div>
            <div class="detail-field"><label>Fornecedor</label><span>${m.fornecedor||'—'}</span></div>
            <div class="detail-field"><label>Preço de Custo</label><span>${fmtMoney(m.custo)}</span></div>
            <div class="detail-field"><label>Estoque</label><span>${m.qtd} ${m.unidade}</span></div>
            <div class="detail-field"><label>Estoque Mínimo</label><span>${m.min||'0'} ${m.unidade}</span></div>
            <div class="detail-field"><label>Situação</label><span style="color:${baixo?'var(--danger)':'var(--success)'}">${baixo?'⚠️ Estoque Baixo':'✅ Normal'}</span></div>
          </div>
        </div>
        <div id="mat-edit-${m.id}" style="display:none;padding:1rem">
          <div class="edit-form-row">
            <div class="form-grid">
              <div class="form-group"><label>Nome</label><input type="text" id="emat-nome-${m.id}" value="${m.nome}"></div>
              <div class="form-group"><label>Fornecedor</label><input type="text" id="emat-forn-${m.id}" value="${m.fornecedor||''}"></div>
              <div class="form-group"><label>Custo (R$)</label><input type="number" id="emat-custo-${m.id}" value="${m.custo}" step="0.01"></div>
              <div class="form-group"><label>Quantidade</label><input type="number" id="emat-qtd-${m.id}" value="${m.qtd}"></div>
              <div class="form-group"><label>Estoque Mín.</label><input type="number" id="emat-min-${m.id}" value="${m.min||'0'}"></div>
              <div class="form-group"><label>Unidade</label>
                <select id="emat-un-${m.id}">
                  ${['un','ml','g','L','kg','cx'].map(u=>`<option value="${u}" ${m.unidade===u?'selected':''}>${u}</option>`).join('')}
                </select>
              </div>
            </div>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-primary btn-sm" onclick="salvarEditMat('${m.id}')">✓ Salvar</button>
              <button class="btn btn-secondary btn-sm" onclick="cancelEdit('mat','${m.id}')">Cancelar</button>
            </div>
          </div>
        </div>
      </td>
    </tr>`}).join('');
}


// ===================== PROTOCOLOS PERSONALIZADOS =====================
function mostrarSubAba(aba) {
  document.getElementById('sub-aba-servicos').style.display = aba === 'servicos' ? '' : 'none';
  document.getElementById('sub-aba-protocolos').style.display = aba === 'protocolos' ? '' : 'none';
  document.getElementById('sub-btn-servicos').classList.toggle('active', aba === 'servicos');
  document.getElementById('sub-btn-protocolos').classList.toggle('active', aba === 'protocolos');
  if (aba === 'protocolos') renderProtocolos();
}

function _renderChipsProtocolo(selecionados) {
  var ativos = db.servicos.filter(function(s){ return s.status === 'ativo'; });
  return ativos.map(function(s) {
    var sel = (selecionados || []).indexOf(s.id) >= 0;
    return '<span class="service-chip' + (sel ? ' selected' : '') + '" style="font-size:12px" onclick="toggleChipProtocolo(this,\'' + s.id + '\')">' + s.nome + '</span>';
  }).join('');
}

function toggleChipProtocolo(el, id) {
  el.classList.toggle('selected');
}

function _filtrarChipsProtocolo() {
  var v = (document.getElementById('filtProtChips').value || '').toLowerCase().trim();
  document.querySelectorAll('#prot-chips .service-chip').forEach(function(c) {
    c.style.display = c.textContent.toLowerCase().includes(v) ? '' : 'none';
  });
}

function _getSelecionadosProtocolo(containerId) {
  var ids = [];
  document.querySelectorAll('#' + containerId + ' .service-chip.selected').forEach(function(el) {
    ids.push(el.getAttribute('onclick').match(/'([^']+)'\)/)[1]);
  });
  return ids;
}

function salvarProtocolo() {
  var nome = document.getElementById('prot-nome').value.trim();
  var descricao = document.getElementById('prot-descricao').value.trim();
  var valor = parseFloat(document.getElementById('prot-valor').value);
  var servicoIds = _getSelecionadosProtocolo('prot-chips');
  if (!nome) { showToast('Preencha o nome do protocolo!'); return; }
  if (isNaN(valor) || valor <= 0) { showToast('Preencha um valor válido!'); return; }
  if (!servicoIds.length) { showToast('Selecione pelo menos um serviço!'); return; }
  var novo = { id: uid(), nome: nome, descricao: descricao, valor: valor, servicoIds: servicoIds, status: 'ativo' };
  db.protocolos.push(novo);
  saveData();
  _salvarProtocolo(novo);
  renderProtocolos();
  renderServiceChips();
  // Limpar form
  document.getElementById('prot-nome').value = '';
  document.getElementById('prot-descricao').value = '';
  document.getElementById('prot-valor').value = '';
  document.querySelectorAll('#prot-chips .service-chip.selected').forEach(function(el){ el.classList.remove('selected'); });
  showToast('✅ Protocolo salvo!');
}

function excluirProtocolo(id) {
  if (!confirm('Excluir este protocolo?')) return;
  db.protocolos = db.protocolos.filter(function(p){ return p.id !== id; });
  saveData();
  _excluirProtocolo(id);
  renderProtocolos();
  renderServiceChips();
  showToast('Protocolo excluído.');
}

function renderProtocolos() {
  var el = document.getElementById('lista-protocolos');
  if (!el) return;
  // Repopular chips do form
  var chipsEl = document.getElementById('prot-chips');
  if (chipsEl) chipsEl.innerHTML = _renderChipsProtocolo([]);

  if (!db.protocolos || !db.protocolos.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><p>Nenhum protocolo cadastrado</p></div>';
    return;
  }
  el.innerHTML = db.protocolos.map(function(p) {
    var nomesSvs = (p.servicoIds || []).map(function(id) {
      var sv = db.servicos.find(function(x){ return x.id === id; });
      return sv ? sv.nome : '';
    }).filter(Boolean).join(' + ');
    var valorNormal = (p.servicoIds || []).reduce(function(s, id) {
      var sv = db.servicos.find(function(x){ return x.id === id; });
      return s + (sv ? parseFloat(sv.preco) || 0 : 0);
    }, 0);
    var economia = valorNormal > p.valor ? valorNormal - p.valor : 0;
    return '<div class="panel" style="margin-bottom:1rem">'
      + '<div class="panel-header">'
      + '<div><div class="panel-title">📦 ' + p.nome + '</div>'
      + (p.descricao ? '<div style="font-size:12px;color:var(--text-light);margin-top:2px">' + p.descricao + '</div>' : '')
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:0.75rem">'
      + '<div style="text-align:right"><div style="font-family:Cormorant Garamond,serif;font-size:22px;color:var(--gold-dark);font-weight:500">' + fmtMoney(p.valor) + '</div>'
      + (economia > 0 ? '<div style="font-size:11px;color:var(--success)">Economia: ' + fmtMoney(economia) + '</div>' : '')
      + '</div>'
      + '<button class="btn btn-danger" onclick="excluirProtocolo(\'' + p.id + '\')">✕</button>'
      + '</div></div>'
      + '<div style="padding:0.75rem 1.5rem;font-size:12px;color:var(--text-mid)">'
      + '<strong>Serviços:</strong> ' + (nomesSvs || '—')
      + '</div></div>';
  }).join('');
}
