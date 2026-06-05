/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — atendimentos.js
   salvarAtendimento, renderAtendimentos, chips, materiais
   ===================================================== */

// ===================== ATENDIMENTOS =====================
function salvarAtendimento() {
  const data = document.getElementById('atend-data').value;
  const cliente = document.getElementById('atend-cliente').value.trim();
  const valor = document.getElementById('atend-valor').value;
  const pagto = document.getElementById('atend-pagto').value;
  if(!data||!cliente||!valor||!pagto) { showToast('Preencha data, cliente, valor e pagamento!'); return; }

  // Baixar estoque pela quantidade utilizada
  Object.entries(selectedMateriais).forEach(([mid, qtdUsada]) => {
    const m = db.materiais.find(x=>x.id===mid);
    if(m) m.qtd = String(Math.max(0, parseInt(m.qtd) - qtdUsada));
  });

  // Build materiais array with qty for storage
  const materiaisUsados = Object.entries(selectedMateriais).map(([mid, qtd]) => ({id: mid, qtd}));

  var _valorFinal = parseFloat(valor);
  var _nomesCache = selectedServicos.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:''; }).filter(Boolean);

  // Verificar sinal do pacote para incluir
  var _ag = db.agenda.find(function(ag) {
    return ag.cliente && ag.cliente.toLowerCase().trim() === cliente.toLowerCase().trim() && parseFloat(ag.sinal) > 0;
  });
  if (_ag && parseFloat(_ag.sinal) > 0) {
    var _sinalJaIncluido = db.atendimentos.some(function(a) {
      return a.cliente && a.cliente.toLowerCase().trim() === cliente.toLowerCase().trim() && a.pagto === 'sinal';
    });
    if (!_sinalJaIncluido) {
      var _sinalVal = parseFloat(_ag.sinal);
      if (confirm('Sinal de R$ ' + _sinalVal.toFixed(2).replace('.',',') + ' registrado para ' + cliente + '. Deseja incluir o sinal neste atendimento?')) {
        var _atendSinal = { id: uid(), data: data, cliente: cliente, valor: _sinalVal, pagto: 'sinal', servicoIds: [], servicoNomesCache: ['Sinal/Entrada'], materiais: [], obs: 'Sinal de entrada' };
        db.atendimentos.push(_atendSinal);
        _salvarAtendimento(_atendSinal);
      }
    }
  }

  db.atendimentos.push({
    id: uid(), data, cliente, valor: _valorFinal,
    pagto,
    servicoIds: [...selectedServicos],
    servicoNomesCache: _nomesCache,
    materiais: materiaisUsados,
    obs: document.getElementById('atend-obs').value
  });

  var novoAtend = db.atendimentos[db.atendimentos.length-1];
  selectedServicos = []; selectedMateriais = {};
  saveData(); renderAll(); limparFormAtend();
  addLog('INFO', '✨ Atendimento registrado — Cliente: ' + cliente + ' | Valor: R$' + valor);
  _salvarAtendimento(novoAtend);

  // Toast com botão WhatsApp pós-sessão
  var servNomes = (db.atendimentos[db.atendimentos.length-1].servicoIds||[]).map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:''; }).filter(Boolean).join(' + ') || 'sessão';
  var t = document.getElementById('toast');
  t.innerHTML = '✨ Atendimento registrado! &nbsp;<button onclick="waPosAtendimento(\''+cliente.replace(/'/g,"\\'")+'\',' + '\''+servNomes.replace(/'/g,"\\'")+'\''+')" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:white;border-radius:6px;padding:2px 10px;font-size:11px;cursor:pointer;margin-left:4px">💬 Agradecer no WhatsApp</button>';
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); t.textContent=''; }, 6000);
}

function limparFormAtend() {
  ['atend-cliente','atend-valor','atend-obs'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('atend-pagto').value='';
  selectedServicos=[]; selectedMateriais={};
  var fs = document.getElementById('filtServicos'); if(fs) fs.value='';
  var fm = document.getElementById('filtMateriais'); if(fm) fm.value='';
  renderServiceChips();
  setToday();
  var p = document.getElementById('obs-historico-painel');
  if (p) p.remove();
  var ps = document.getElementById('painel-sinal');
  if (ps) ps.remove();
}

function renderAtendimentos() {
  const busca = (document.getElementById('filtAtendCliente').value||'').toLowerCase();
  const de = document.getElementById('filtAtendDe').value;
  const ate = document.getElementById('filtAtendAte').value;
  const pagto = document.getElementById('filtAtendPagto').value;

  let items = [...db.atendimentos].sort((a,b)=>b.data.localeCompare(a.data));
  if(busca) items = items.filter(a=>a.cliente.toLowerCase().includes(busca));
  if(de) items = items.filter(a=>a.data>=de);
  if(ate) items = items.filter(a=>a.data<=ate);
  if(pagto) items = items.filter(a=>a.pagto===pagto);

  const tbody = document.getElementById('tbodyAtend');
  if(!items.length) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">✨</div><p>Nenhum atendimento encontrado</p></div></td></tr>`; _renderPagAtend(0,0,0); return; }

  const _POR_PAG = 10;
  const _total = items.length;
  const _totalPags = Math.ceil(_total/_POR_PAG);
  if(!window._pagAtend || window._pagAtend > _totalPags) window._pagAtend = 1;
  const _inicio = (window._pagAtend-1)*_POR_PAG;
  items = items.slice(_inicio, _inicio+_POR_PAG);

  tbody.innerHTML = items.map(a => {
    // Support both old (servicoId) and new (servicoIds) formats
    const servicoIds = a.servicoIds || (a.servicoId ? [a.servicoId] : []);
    const s = db.servicos.find(x=>x.id===servicoIds[0]); // first for table display
    const servNomes = servicoIds.map(sid=>{const sv=db.servicos.find(x=>x.id===sid);return sv?sv.nome:'?'}).join(' + ')||'—';
    const matsNomes = (a.materiais && typeof a.materiais === 'object' && !Array.isArray(a.materiais))
      ? Object.keys(a.materiais).map(mid=>{ const m=db.materiais.find(x=>x.id===mid); return m?m.nome+(a.materiais[mid]>1?' ×'+a.materiais[mid]:''):'?'; }).join(', ')||'Nenhum'
      : (a.materiais||[]).map(item=>{ const mid=typeof item==='object'?item.id:item; const m=db.materiais.find(x=>x.id===mid); return m?m.nome:'?'; }).join(', ')||'Nenhum';
    return `
      <tr class="data-row" onclick="toggleDetail('atend-${a.id}',this)">
        <td><span class="expand-icon" id="icon-atend-${a.id}">▶</span></td>
        <td>${fmtDate(a.data)}</td>
        <td><strong>${a.cliente}</strong></td>
        <td>${servNomes}</td>
        <td><span class="badge-pill ${pagtoBadge(a.pagto)}">${pagtoLabel(a.pagto)}</span></td>
        <td><strong>${fmtMoney(a.valor)}</strong></td>
        <td style="display:flex;gap:4px">
          <button class="btn btn-edit" onclick="event.stopPropagation();editAtend('${a.id}')">✏️</button>
          <button class="btn btn-danger" onclick="event.stopPropagation();excluir('atendimentos','${a.id}')">✕</button>
        </td>
      </tr>
      <tr class="detail-row" id="atend-${a.id}">
        <td colspan="7">
          <div id="atend-view-${a.id}">
            <div class="detail-box">
              <div class="detail-field"><label>Data</label><span>${fmtDate(a.data)}</span></div>
              <div class="detail-field"><label>Cliente</label><span>${a.cliente}</span></div>
              <div class="detail-field"><label>Serviço(s)</label><span>${servNomes}</span></div>
              <div class="detail-field"><label>Categoria</label><span>${s?s.categoria:'—'}</span></div>
              <div class="detail-field"><label>Valor</label><span>${fmtMoney(a.valor)}</span></div>
              <div class="detail-field"><label>Pagamento</label><span>${pagtoLabel(a.pagto)}</span></div>
              <div class="detail-field"><label>Materiais Utilizados</label><span>${matsNomes}</span></div>
              <div class="detail-field"><label>Observações</label><span>${a.obs||'—'}</span></div>
            </div>
          </div>
          <div id="atend-edit-${a.id}" style="display:none;padding:1rem">
            <div class="edit-form-row">
              <div class="form-grid">
                <div class="form-group"><label>Data</label><input type="date" id="eatend-data-${a.id}" value="${a.data}"></div>
                <div class="form-group"><label>Cliente</label><input type="text" id="eatend-cliente-${a.id}" value="${a.cliente}"></div>
                <div class="form-group"><label>Valor (R$)</label><input type="number" id="eatend-valor-${a.id}" value="${a.valor}" step="0.01"></div>
                <div class="form-group"><label>Pagamento</label>
                  <select id="eatend-pagto-${a.id}">
                    <option value="pix" ${a.pagto==='pix'?'selected':''}>PIX</option>
                    <option value="dinheiro" ${a.pagto==='dinheiro'?'selected':''}>Dinheiro</option>
                    <option value="cartao_debito" ${a.pagto==='cartao_debito'?'selected':''}>Cartão Débito</option>
                    <option value="cartao_credito" ${a.pagto==='cartao_credito'?'selected':''}>Cartão Crédito</option>
                  </select>
                </div>
                <div class="form-group"><label>Observações</label><input type="text" id="eatend-obs-${a.id}" value="${a.obs||''}"></div>
              </div>
              <div class="form-group" style="margin-top:0.75rem">
                <label style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light)">Serviço Realizado</label>
                <input type="text" placeholder="🔍 Filtrar serviços..." oninput="(function(el){var v=el.value.toLowerCase();el.nextElementSibling.querySelectorAll('.service-chip').forEach(function(c){c.style.display=c.textContent.toLowerCase().includes(v)?'':'none';});})(this)" style="width:100%;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:Jost,sans-serif;outline:none;margin-bottom:6px">
                <div id="eatend-srv-${a.id}" style="display:flex;flex-wrap:wrap;gap:6px;padding:6px 0">
                  ${db.servicos.filter(s=>s.status==='ativo').map(s=>`<span class="service-chip${(a.servicoIds&&a.servicoIds.includes(s.id))||a.servicoNomes===s.nome?' selected':''}" style="font-size:12px;cursor:pointer" onclick="this.classList.toggle('selected')">${s.nome}</span>`).join('')}
                </div>
              </div>
              <div class="form-group" style="margin-top:0.5rem">
                <label style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light)">Materiais Utilizados</label>
                <input type="text" placeholder="🔍 Filtrar materiais..." oninput="(function(el){var v=el.value.toLowerCase();el.nextElementSibling.querySelectorAll('.material-chip').forEach(function(c){c.style.display=c.textContent.toLowerCase().includes(v)?'':'none';});})(this)" style="width:100%;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:Jost,sans-serif;outline:none;margin-bottom:6px">
                <div id="eatend-mat-${a.id}" style="display:flex;flex-wrap:wrap;gap:6px;padding:6px 0">
                  ${db.materiais.map(m=>`<span class="material-chip${a.materiais&&a.materiais[m.id]?' selected':''}" style="font-size:12px;cursor:pointer" onclick="this.classList.toggle('selected')">${m.nome} (estoque: ${m.qtd} ${m.unidade})</span>`).join('')}
                </div>
              </div>
              <div style="display:flex;gap:0.5rem;margin-top:0.75rem">
                <button class="btn btn-primary btn-sm" onclick="salvarEditAtend('${a.id}')">✓ Salvar</button>
                <button class="btn btn-secondary btn-sm" onclick="cancelEdit('atend','${a.id}')">Cancelar</button>
              </div>
            </div>
          </div>
        </td>
      </tr>`;
  }).join('');
  _renderPagAtend(window._pagAtend, Math.ceil(db.atendimentos.length/10), _total);
}

function _renderPagAtend(pag, totalPags, total) {
  var el = document.getElementById('pagAtend');
  if (!el) return;
  if (totalPags <= 1) { el.innerHTML = ''; return; }
  var html = _buildPagHtml(pag, totalPags, total, 10, 'window._pagAtend', 'renderAtendimentos()');
  el.innerHTML = html;
}

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



// Alias para uso em utils.js
if (typeof window !== 'undefined') { window._renderAtendimentos = renderAtendimentos; }
