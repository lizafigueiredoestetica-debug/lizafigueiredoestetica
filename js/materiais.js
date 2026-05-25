/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — materiais.js
   salvarMaterial, renderMateriais
   ===================================================== */

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

