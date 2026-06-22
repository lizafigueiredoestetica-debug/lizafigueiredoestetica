/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — radar.js
   Radar de Clientes: cadastro de leads (Mapa 100 em 30)
   + indicadores de análise para conversão em vendas
   ===================================================== */

// ===================== NAVEGAÇÃO DE SUB-ABA =====================
function mostrarSubAbaRadar(aba) {
  document.getElementById('sub-aba-radar-cadastro').style.display = aba === 'cadastro' ? '' : 'none';
  document.getElementById('sub-aba-radar-indicadores').style.display = aba === 'indicadores' ? '' : 'none';
  document.getElementById('sub-btn-radar-cadastro').classList.toggle('active', aba === 'cadastro');
  document.getElementById('sub-btn-radar-indicadores').classList.toggle('active', aba === 'indicadores');
  if (aba === 'indicadores') renderRadarIndicadores();
}

// ===================== CADASTRO (CRUD) =====================
function salvarLeadRadar() {
  var nome = document.getElementById('radar-nome').value.trim();
  if (!nome) { showToast('Preencha o nome do lead!'); return; }

  var novoLead = {
    id: uid(),
    nome: nome,
    instagram: document.getElementById('radar-instagram').value.trim(),
    telefone: document.getElementById('radar-telefone').value.trim(),
    primeiraPergunta: document.getElementById('radar-pergunta').value.trim(),
    classificacao: document.getElementById('radar-classificacao').value,
    ultimoContato: document.getElementById('radar-ultimo-contato').value || _hoje(),
    statusNegociacao: document.getElementById('radar-status').value.trim(),
    criadoEm: new Date().toISOString()
  };

  if (!db.leads) db.leads = [];
  db.leads.push(novoLead);
  saveData();
  if (typeof _salvarLead === 'function') _salvarLead(novoLead);
  renderRadarCadastro();
  limparFormRadar();
  showToast('Lead cadastrado no Radar!');
}

function limparFormRadar() {
  ['radar-nome','radar-instagram','radar-telefone','radar-pergunta','radar-status'].forEach(function(id){
    var el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('radar-classificacao').value = 'frio';
  document.getElementById('radar-ultimo-contato').value = _hoje();
}

function excluirLeadRadar(id) {
  if (!confirm('Excluir este lead do Radar?')) return;
  db.leads = (db.leads||[]).filter(function(l){ return l.id !== id; });
  saveData();
  if (typeof _excluirLead === 'function') _excluirLead(id);
  renderRadarCadastro();
  showToast('Lead excluído.');
}

function editarCampoRadar(id, campo, valor) {
  var lead = (db.leads||[]).find(function(l){ return l.id === id; });
  if (!lead) return;
  lead[campo] = valor;
  saveData();
  if (typeof _salvarLead === 'function') _salvarLead(lead);
}

function renderRadarCadastro() {
  var el = document.getElementById('radarCadastroLista');
  if (!el) return;
  var busca = (document.getElementById('radarFiltroNome')||{value:''}).value.toLowerCase();
  var leads = (db.leads||[]).slice().sort(function(a,b){ return (b.criadoEm||'').localeCompare(a.criadoEm||''); });
  if (busca) leads = leads.filter(function(l){ return l.nome.toLowerCase().indexOf(busca) >= 0; });

  if (!leads.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">🎯</div><p>Nenhum lead cadastrado ainda no Radar</p></div>';
    return;
  }

  el.innerHTML = '<div class="table-wrap"><table style="width:100%"><thead><tr>'
    + '<th>Nome</th><th>Instagram</th><th>WhatsApp</th><th>Primeira pergunta</th><th>Classificação</th><th>Último contato</th><th>Status da negociação</th><th></th>'
    + '</tr></thead><tbody>'
    + leads.map(function(l) {
        var corClass = l.classificacao === 'quente' ? 'badge-inativo' : 'badge-pendente';
        var labelClass = l.classificacao === 'quente' ? '🔥 Quente' : '🧊 Frio';
        return '<tr>'
          + '<td><strong>' + l.nome + '</strong></td>'
          + '<td>' + (l.instagram ? '<a href="https://instagram.com/' + l.instagram.replace('@','') + '" target="_blank">' + l.instagram + '</a>' : '—') + '</td>'
          + '<td>' + (l.telefone ? '<button class="btn btn-secondary btn-sm" onclick="window.open(\'https://wa.me/55' + l.telefone.replace(/\D/g,'') + '\',\'_blank\')">📲 ' + l.telefone + '</button>' : '—') + '</td>'
          + '<td style="max-width:220px;font-size:12px;color:var(--text-mid)">' + (l.primeiraPergunta || '—') + '</td>'
          + '<td><select onchange="editarCampoRadar(\'' + l.id + '\',\'classificacao\',this.value)" style="font-size:11px;padding:3px 6px;border-radius:6px;border:1px solid var(--border)">'
            + '<option value="frio"' + (l.classificacao!=='quente'?' selected':'') + '>🧊 Frio</option>'
            + '<option value="quente"' + (l.classificacao==='quente'?' selected':'') + '>🔥 Quente</option>'
          + '</select></td>'
          + '<td><input type="date" value="' + (l.ultimoContato||'') + '" onchange="editarCampoRadar(\'' + l.id + '\',\'ultimoContato\',this.value)" style="font-size:12px;padding:3px;border-radius:6px;border:1px solid var(--border)"></td>'
          + '<td style="max-width:220px"><input type="text" value="' + (l.statusNegociacao||'').replace(/"/g,'&quot;') + '" placeholder="Ex: Passei o preço e sumiu" onchange="editarCampoRadar(\'' + l.id + '\',\'statusNegociacao\',this.value)" style="font-size:12px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);width:100%"></td>'
          + '<td><button class="btn btn-danger" onclick="excluirLeadRadar(\'' + l.id + '\')">✕</button></td>'
          + '</tr>';
      }).join('')
    + '</tbody></table></div>';
}

// ===================== INDICADORES =====================

// Dias desde o último contato
function _radarDiasSemContato(lead) {
  if (!lead.ultimoContato) return null;
  var hoje = new Date(_hoje() + 'T12:00:00');
  var ultimo = new Date(lead.ultimoContato + 'T12:00:00');
  return Math.round((hoje - ultimo) / 86400000);
}

// Lead "esfriando": classificado quente, mas sem contato há mais de 3 dias
function _radarLeadsEsfriando() {
  return (db.leads||[]).filter(function(l) {
    var dias = _radarDiasSemContato(l);
    return l.classificacao === 'quente' && dias !== null && dias >= 3;
  }).sort(function(a,b){ return _radarDiasSemContato(b) - _radarDiasSemContato(a); });
}

// Leads parados há muito tempo, independente da classificação (oportunidade esquecida)
function _radarLeadsParados(diasLimite) {
  diasLimite = diasLimite || 7;
  return (db.leads||[]).filter(function(l) {
    var dias = _radarDiasSemContato(l);
    return dias !== null && dias >= diasLimite;
  }).sort(function(a,b){ return _radarDiasSemContato(b) - _radarDiasSemContato(a); });
}

// Contagem por classificação
function _radarContagemClassificacao() {
  var leads = db.leads || [];
  var frios = leads.filter(function(l){ return l.classificacao !== 'quente'; }).length;
  var quentes = leads.filter(function(l){ return l.classificacao === 'quente'; }).length;
  return { frios: frios, quentes: quentes, total: leads.length };
}

// Palavras mais comuns na "primeira pergunta" (para identificar a dúvida mais frequente)
function _radarPerguntasFrequentes() {
  var contagem = {};
  (db.leads||[]).forEach(function(l) {
    if (!l.primeiraPergunta) return;
    var texto = l.primeiraPergunta.toLowerCase();
    var palavrasChave = [
      { tag: 'Preço/Valor', termos: ['preço', 'preco', 'valor', 'quanto custa', 'quanto é'] },
      { tag: 'Disponibilidade', termos: ['horário', 'horario', 'disponível', 'disponivel', 'quando', 'agenda'] },
      { tag: 'Resultado/Garantia', termos: ['resultado', 'funciona', 'garantia', 'efetivo'] },
      { tag: 'Localização', termos: ['onde', 'endereço', 'endereco', 'local', 'fica'] }
    ];
    var encontrou = false;
    palavrasChave.forEach(function(pc) {
      if (pc.termos.some(function(t){ return texto.indexOf(t) >= 0; })) {
        contagem[pc.tag] = (contagem[pc.tag]||0) + 1;
        encontrou = true;
      }
    });
    if (!encontrou) contagem['Outras'] = (contagem['Outras']||0) + 1;
  });
  return Object.entries(contagem).sort(function(a,b){ return b[1]-a[1]; });
}

function renderRadarIndicadores() {
  var cont = _radarContagemClassificacao();
  var esfriando = _radarLeadsEsfriando();
  var parados = _radarLeadsParados(7);
  var perguntas = _radarPerguntasFrequentes();

  // Cards de resumo
  var elCards = document.getElementById('radarCards');
  if (elCards) {
    var cards = [
      { label: 'Total de Leads', value: cont.total, sub: 'no Radar', cls: '', icon: '🎯' },
      { label: 'Leads Quentes', value: cont.quentes, sub: 'prontos para fechar', cls: 'gold', icon: '🔥' },
      { label: 'Leads Frios', value: cont.frios, sub: 'precisam de nutrição', cls: '', icon: '🧊' },
      { label: 'Esfriando', value: esfriando.length, sub: 'quentes sem contato 3+ dias', cls: esfriando.length ? 'red' : 'green', icon: '⚠️' }
    ];
    elCards.innerHTML = cards.map(function(c) {
      return '<div class="summary-card"><div class="card-icon">' + c.icon + '</div>'
        + '<div class="card-label">' + c.label + '</div>'
        + '<div class="card-value ' + c.cls + '">' + c.value + '</div>'
        + '<div class="card-sub">' + c.sub + '</div></div>';
    }).join('');
  }

  // Painel: leads esfriando (ação prioritária)
  var elEsfriando = document.getElementById('radarEsfriandoPanel');
  if (elEsfriando) {
    if (!esfriando.length) {
      elEsfriando.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>Nenhum lead quente esfriando agora</p></div>';
    } else {
      elEsfriando.innerHTML = esfriando.map(function(l) {
        var dias = _radarDiasSemContato(l);
        return '<div class="top5-item">'
          + '<div class="top5-info"><div class="top5-name">' + l.nome + '</div>'
          + '<div class="top5-cat">' + dias + ' dias sem contato · "' + (l.statusNegociacao||'sem status') + '"</div></div>'
          + (l.telefone ? '<button class="btn btn-primary btn-sm" onclick="window.open(\'https://wa.me/55' + l.telefone.replace(/\D/g,'') + '\',\'_blank\')">📲 Retomar agora</button>' : '')
          + '</div>';
      }).join('');
    }
  }

  // Painel: todos os leads parados (oportunidades esquecidas)
  var elParados = document.getElementById('radarParadosPanel');
  if (elParados) {
    if (!parados.length) {
      elParados.innerHTML = '<div class="empty-state"><p>Nenhum lead parado há mais de 7 dias</p></div>';
    } else {
      elParados.innerHTML = parados.slice(0, 10).map(function(l) {
        var dias = _radarDiasSemContato(l);
        var badge = l.classificacao === 'quente' ? '🔥' : '🧊';
        return '<div class="top5-item">'
          + '<div class="top5-info"><div class="top5-name">' + badge + ' ' + l.nome + '</div>'
          + '<div class="top5-cat">' + dias + ' dias sem contato</div></div>'
          + '<div class="top5-count">' + dias + 'd</div>'
          + '</div>';
      }).join('');
    }
  }

  // Painel: perguntas mais frequentes (insight de produto/abordagem)
  var elPerguntas = document.getElementById('radarPerguntasPanel');
  if (elPerguntas) {
    if (!perguntas.length) {
      elPerguntas.innerHTML = '<div class="empty-state"><p>Cadastre a "primeira pergunta" dos leads para ver os temas mais comuns</p></div>';
    } else {
      var max = perguntas[0][1] || 1;
      elPerguntas.innerHTML = perguntas.map(function(p) {
        return '<div class="pagto-item"><div class="pagto-label">' + p[0] + '</div>'
          + '<div class="top5-bar-wrap"><div class="top5-bar"><div class="top5-bar-fill" style="width:' + (p[1]/max*100) + '%"></div></div></div>'
          + '<div class="pagto-value">' + p[1] + '</div></div>';
      }).join('');
    }
  }
}
