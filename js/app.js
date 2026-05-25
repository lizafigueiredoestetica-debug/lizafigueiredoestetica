/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — app.js
   init, drawer, boas-vindas, aniversariantes, relatório, boot
   ===================================================== */

// ===================== INIT =====================
async function init() {
  await loadData();
  if(db.categorias.length === 0) {
    db.categorias = [
      {id: uid(), nome: 'Bumbum'},
      {id: uid(), nome: 'Barriga'}
    ];
    try { localStorage.setItem('lizafig_db', JSON.stringify(db)); } catch(e) {}
  }
  setToday();
  updateHeaderDate();
  renderAll();
  _inicializando = false;
  setInterval(updateHeaderDate, 1000);
  setTimeout(function() {
    try {
      var _secSalva = localStorage.getItem('lizafig_secao');
      if (_secSalva && document.getElementById('sec-' + _secSalva)) {
        showSection(_secSalva);
      }
    } catch(e) {}
  }, 100);
}

// ── DATA BRASÍLIA (UTC-3) — _hoje() definido em utils.js ──
function _semanaAtras() {
  var d = new Date();
  var utc = d.getTime() + d.getTimezoneOffset() * 60000;
  var br = new Date(utc - 3 * 3600000 - 7 * 86400000);
  var y = br.getFullYear();
  var m = String(br.getMonth()+1).padStart(2,'0');
  var day = String(br.getDate()).padStart(2,'0');
  return y + '-' + m + '-' + day;
}

// toggleDrawer e fecharDrawer definidos em utils.js


// ── OBSERVAÇÕES HISTÓRICAS ──
function _obsHistorico(nomeCliente, limite) {
  limite = limite || 5;
  return db.atendimentos
    .filter(function(a){ return a.cliente && a.cliente.toLowerCase() === nomeCliente.toLowerCase() && a.obs && a.obs.trim(); })
    .sort(function(a,b){ return b.data.localeCompare(a.data); })
    .slice(0, limite);
}

function _buildObsHtml(nomeCliente) {
  var lista = _obsHistorico(nomeCliente, 5);
  if (!lista.length) return '';
  var itens = lista.map(function(a) {
    var servNomes = (a.servicoIds||[]).map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:''; }).filter(Boolean).join(' + ') || '—';
    return '<div style="padding:0.6rem 0.75rem;border-left:3px solid var(--gold);background:white;border-radius:0 8px 8px 0;margin-bottom:6px">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">'
      + '<span style="font-size:11px;font-weight:500;color:var(--text-mid)">' + servNomes + '</span>'
      + '<span style="font-size:10px;color:var(--text-light)">' + fmtDate(a.data) + '</span>'
      + '</div>'
      + '<div style="font-size:12px;color:var(--text-dark);line-height:1.5">' + a.obs + '</div>'
      + '</div>';
  }).join('');
  return '<div style="margin-top:1rem;margin-bottom:0.5rem">'
    + '<div style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;margin-bottom:0.5rem">📝 Observações Anteriores</div>'
    + itens
    + '</div>';
}


// ── TELA BOAS-VINDAS ──
function mostrarBoasVindas(nome, servico, hora, duracao) {
  duracao = duracao || 6000;
  var primeiroNome = nome.split(' ')[0];
  var horaTexto = hora ? ' às ' + hora : '';
  var servicoTexto = servico || 'sua sessão';

  var tela = document.createElement('div');
  tela.className = 'bv-tela';
  tela.id = 'bv-tela';
  tela.style.setProperty('--bv-dur', (duracao/1000) + 's');
  tela.innerHTML =
    '<div class="bv-logo">'
    + '<div class="bv-icone">🌸</div>'
    + '<div class="bv-marca">Lizandra Figueiredo · Estética</div>'
    + '</div>'
    + '<div class="bv-saudacao">Seja bem-vinda,<br><span>' + primeiroNome + '!</span></div>'
    + '<div class="bv-servico">Sua sessão de <strong>' + servicoTexto + '</strong>' + horaTexto + '<br>começa em instantes.</div>'
    + '<div class="bv-mensagem">✨ Relaxe e aproveite cada momento</div>'
    + '<div class="bv-barra"><div class="bv-barra-prog"></div></div>'
    + '<div class="bv-rodape">Toque para fechar</div>';

  tela.addEventListener('click', function() { fecharBoasVindas(); });
  document.body.appendChild(tela);

  setTimeout(function() { fecharBoasVindas(); }, duracao);
}

function fecharBoasVindas() {
  var tela = document.getElementById('bv-tela');
  if (!tela) return;
  tela.style.animation = 'bvEntrar 0.35s cubic-bezier(.4,0,.2,1) reverse forwards';
  setTimeout(function() { if (tela.parentNode) tela.parentNode.removeChild(tela); }, 350);
  // Limpar campo CPF
  var ci = document.getElementById('checkinCpf');
  if (ci) ci.value = '';
  var msg = document.getElementById('checkinMsg');
  if (msg) msg.style.display = 'none';
}


// ── ANIVERSARIANTES ──

function waAbrirAniv(btn) { window.open(btn.getAttribute('data-url'), '_blank'); }
function _getAniversariantes() {
  var hoje = new Date();
  var mesHoje = hoje.getMonth() + 1;
  var diaHoje = hoje.getDate();
  var proxDias = [];
  db.anamneses.forEach(function(a) {
    if (!a.pessoais || !a.pessoais.dataNasc) return;
    var partes = a.pessoais.dataNasc.split('-');
    if (partes.length < 3) return;
    var mes = parseInt(partes[1]);
    var dia = parseInt(partes[2]);
    var isHoje = (mes === mesHoje && dia === diaHoje);
    // Próximos 30 dias
    var nascAno = new Date(hoje.getFullYear(), mes - 1, dia);
    if (nascAno < hoje) nascAno.setFullYear(hoje.getFullYear() + 1);
    var diff = Math.ceil((nascAno - hoje) / 86400000);
    if (diff <= 30) {
      proxDias.push({ nome: a.pessoais.nome, dia: dia, mes: mes, isHoje: isHoje, diff: diff,
        tel: a.pessoais.telefone ? a.pessoais.telefone.replace(/\D/g,'') : '' });
    }
  });
  return proxDias.sort(function(a,b){ return a.diff - b.diff; });
}

function renderAniversariantes() {
  var painel = document.getElementById('anivPanel');
  if (!painel) return;
  var lista = _getAniversariantes();
  if (!lista.length) { painel.style.display = 'none'; return; }
  var meses = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var cards = lista.map(function(a) {
    var label = a.isHoje ? '🎂 Hoje!' : 'em ' + a.diff + (a.diff===1?' dia':' dias');
    var msg = 'Olá ' + a.nome.split(' ')[0] + '! 🎉\n\nDesejamos a você um feliz aniversário! Que este novo ciclo seja repleto de saúde, beleza e muitas realizações. 🌸\n\nCom carinho, equipe Liza Figueiredo Estética';
    var waUrl = 'https://wa.me/' + (a.tel ? '55' + a.tel : '') + '?text=' + encodeURIComponent(msg);
    return '<div class="aniv-card' + (a.isHoje ? ' aniv-hoje' : '') + '">'
      + '<div><div class="aniv-nome">' + (a.isHoje ? '🎂 ' : '🎁 ') + a.nome + '</div>'
      + '<div class="aniv-data">' + String(a.dia).padStart(2,'0') + '/' + meses[a.mes] + ' — ' + label + '</div></div>'
      + '<button onclick="waAbrirAniv(this)" data-url="' + waUrl.replace(/"/g,'&quot;') + '" style="background:#E7F7EE;border:1px solid #7DB87D;color:#276749;border-radius:8px;padding:5px 12px;font-size:12px;cursor:pointer;white-space:nowrap">💬 Parabenizar</button>'
      + '</div>';
  }).join('');
  painel.style.display = 'block';
  painel.innerHTML = '<div class="aniv-wrap">'
    + '<div class="aniv-header"><div class="aniv-titulo">🎂 Aniversariantes — próximos 30 dias</div>'
    + '<span style="font-size:11px;color:#7A5C00;background:rgba(212,160,168,0.2);padding:2px 10px;border-radius:20px">' + lista.length + (lista.length===1?' aniversariante':' aniversariantes') + '</span></div>'
    + cards + '</div>';
}


// ── SWIPE GLOBAL PARA ABRIR/FECHAR DRAWER ──
(function() {
  var _txStart = 0, _tyStart = 0, _txCur = 0, _tyCur = 0, _ativo = false;
  var MIN_SWIPE = 40;
  var MAX_VERT  = 80;
  var BORDA     = 60;

  document.addEventListener('touchstart', function(e) {
    var t = e.touches[0];
    _txStart = _txCur = t.clientX;
    _tyStart = _tyCur = t.clientY;
    _ativo = true;
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (!_ativo) return;
    _txCur = e.touches[0].clientX;
    _tyCur = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    if (!_ativo) return;
    _ativo = false;
    var dx = _txCur - _txStart;
    var dy = Math.abs(_tyCur - _tyStart);
    if (dy > MAX_VERT || Math.abs(dx) < MIN_SWIPE) return;

    var sidebar = document.getElementById('appSidebar');
    if (!sidebar) return;
    var aberto = sidebar.classList.contains('drawer-aberto');

    if (dx > 0 && !aberto && _txStart < BORDA) {
      toggleDrawer();
    } else if (dx < 0 && aberto) {
      fecharDrawer();
    }
  }, { passive: true });
})();


// ── RELATÓRIO MENSAL PDF ──
function abrirModalRelatorio() {
  var hoje = new Date();
  var anoAtual = hoje.getFullYear();
  var mesAtual = hoje.getMonth() + 1;

  var mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var optAnos = '';
  for (var y = anoAtual; y >= anoAtual - 2; y--) {
    optAnos += '<option value="' + y + '"' + (y === anoAtual ? ' selected' : '') + '>' + y + '</option>';
  }
  var optMeses = mesesNomes.map(function(m, i) {
    var v = i + 1;
    return '<option value="' + v + '"' + (v === mesAtual ? ' selected' : '') + '>' + m + '</option>';
  }).join('');

  var modal = document.createElement('div');
  modal.id = 'modal-relatorio';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9995;display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML =
    '<div style="background:white;border-radius:16px;max-width:420px;width:100%;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35)">'
    + '<div style="background:linear-gradient(135deg,#1C1C1E,#2C2C2E);padding:1.1rem 1.5rem;display:flex;justify-content:space-between;align-items:center">'
    + '<span style="color:#FAF0F2;font-family:Cormorant Garamond,serif;font-size:18px;letter-spacing:2px">📄 Relatório Mensal</span>'
    + '<button onclick="document.getElementById(\'modal-relatorio\').remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="padding:1.5rem">'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem">'
    + '<div><label style="font-size:10px;letter-spacing:2px;color:#888;text-transform:uppercase;display:block;margin-bottom:6px">Mês</label>'
    + '<select id="rel-mes" style="width:100%;padding:0.5rem;border:1px solid #E5E5EA;border-radius:8px;font-size:13px;font-family:Jost,sans-serif;outline:none;background:white;box-sizing:border-box">' + optMeses + '</select></div>'
    + '<div><label style="font-size:10px;letter-spacing:2px;color:#888;text-transform:uppercase;display:block;margin-bottom:6px">Ano</label>'
    + '<select id="rel-ano" style="width:100%;padding:0.5rem;border:1px solid #E5E5EA;border-radius:8px;font-size:13px;font-family:Jost,sans-serif;outline:none;background:white;box-sizing:border-box">' + optAnos + '</select></div>'
    + '</div>'
    + '<div style="background:#F9F5F0;border-radius:8px;padding:0.75rem 1rem;margin-bottom:1.25rem;font-size:12px;color:#7A5C00;line-height:1.7">'
    + '📊 O relatório inclui:<br>'
    + '• Resumo financeiro (receita, custos, lucro)<br>'
    + '• Atendimentos do mês com detalhes<br>'
    + '• Top serviços realizados<br>'
    + '• Formas de pagamento'
    + '</div>'
    + '<div style="display:flex;gap:0.75rem">'
    + '<button class="btn btn-primary" onclick="gerarRelatorioPDF()">📥 Gerar PDF</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'modal-relatorio\').remove()">Cancelar</button>'
    + '</div>'
    + '<div id="rel-status" style="margin-top:0.75rem;font-size:12px;color:#888"></div>'
    + '</div></div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

function gerarRelatorioPDF() {
  var status = document.getElementById('rel-status');
  if(status) status.textContent = 'Gerando PDF...';

  var mes = parseInt((document.getElementById('rel-mes')||{value:'1'}).value);
  var ano = parseInt((document.getElementById('rel-ano')||{value:'2026'}).value);
  var mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var mesNome = mesesNomes[mes-1];
  var prefixo = ano + '-' + String(mes).padStart(2,'0');

  // Filtrar atendimentos do mês
  var atends = db.atendimentos.filter(function(a){ return a.data && a.data.startsWith(prefixo); });
  var despAdm = db.despAdm.filter(function(d){ return d.data && d.data.startsWith(prefixo); });
  var despExtra = db.despExtra.filter(function(d){ return d.data && d.data.startsWith(prefixo); });

  var receita = atends.reduce(function(s,a){ return s + parseFloat(a.valor||0); }, 0);
  var custoAdm = despAdm.reduce(function(s,d){ return s + parseFloat(d.valor||0); }, 0);
  var custoExtra = despExtra.reduce(function(s,d){ return s + parseFloat(d.valor||0); }, 0);
  var custoTotal = custoAdm + custoExtra;
  var lucro = receita - custoTotal;

  // Contagem por serviço
  var srvCount = {};
  atends.forEach(function(a) {
    var ids = a.servicoIds || (a.servicoId ? [a.servicoId] : []);
    ids.forEach(function(id) {
      var sv = db.servicos.find(function(x){ return x.id === id; });
      var nome = sv ? sv.nome : 'Outro';
      srvCount[nome] = (srvCount[nome]||0) + 1;
    });
  });
  var topSrvs = Object.keys(srvCount).sort(function(a,b){ return srvCount[b]-srvCount[a]; }).slice(0,5);

  // Formas de pagamento
  var pagtos = {};
  atends.forEach(function(a){ if(a.pagto) pagtos[a.pagto] = (pagtos[a.pagto]||0) + parseFloat(a.valor||0); });

  // Gerar PDF com jsPDF
  var jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
  if (!jsPDF) { if(status) status.textContent = '❌ Biblioteca PDF não carregada. Verifique sua conexão.'; return; }

  var doc = new jsPDF({ unit: 'mm', format: 'a4' });
  var W = 210, H = 297;
  var y = 0;

  function addPage() { doc.addPage(); y = 0; }
  function checkPage(needed) { if (y + needed > H - 15) addPage(); }

  // ── Cabeçalho ──
  doc.setFillColor(28, 28, 30);
  doc.rect(0, 0, W, 38, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(250, 240, 242);
  doc.text('Liza Figueiredo', 15, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(196, 168, 130);
  doc.text('ESTETICA & BELEZA', 15, 22);
  doc.setFontSize(11);
  doc.setTextColor(212, 160, 168);
  doc.text('RELATORIO MENSAL — ' + mesNome.toUpperCase() + ' ' + ano, 15, 30);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Gerado em ' + new Date().toLocaleDateString('pt-BR') + ' as ' + new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}), W-15, 30, {align:'right'});
  y = 48;

  // ── Cards financeiros ──
  function drawCard(x, cx, label, valor, corFundo, corTexto, corValor) {
    doc.setFillColor(corFundo[0], corFundo[1], corFundo[2]);
    doc.roundedRect(x, y, cx, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
    doc.text(label, x+5, y+7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(corValor[0], corValor[1], corValor[2]);
    doc.text('R$ ' + valor.toFixed(2).replace('.',','), x+5, y+17);
  }
  var cw = (W-30)/3;
  drawCard(15,    cw, 'RECEITA',      receita,    [232,245,233],[80,120,80],[30,120,50]);
  drawCard(15+cw+7.5, cw, 'CUSTOS TOTAL', custoTotal, [255,235,238],[180,80,80],[180,50,50]);
  drawCard(15+2*(cw+7.5), cw, 'LUCRO LIQUIDO', lucro, lucro>=0?[232,245,233]:[255,235,238], lucro>=0?[80,120,80]:[180,80,80], lucro>=0?[30,120,50]:[180,50,50]);
  y += 30;

  // ── Mini cards ──
  doc.setFillColor(245,245,250);
  doc.roundedRect(15, y, 55, 14, 2, 2, 'F');
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(100,100,100);
  doc.text('ATENDIMENTOS', 18, y+5);
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(30,30,30);
  doc.text(String(atends.length), 18, y+12);

  doc.setFillColor(245,245,250);
  doc.roundedRect(75, y, 55, 14, 2, 2, 'F');
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(100,100,100);
  doc.text('TICKET MEDIO', 78, y+5);
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(30,30,30);
  var ticket = atends.length ? (receita/atends.length) : 0;
  doc.text('R$ ' + ticket.toFixed(2).replace('.',','), 78, y+12);

  doc.setFillColor(245,245,250);
  doc.roundedRect(135, y, 60, 14, 2, 2, 'F');
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(100,100,100);
  doc.text('MARGEM LUCRO', 138, y+5);
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(30,30,30);
  var margem = receita > 0 ? ((lucro/receita)*100) : 0;
  doc.text(margem.toFixed(1).replace('.',',') + '%', 138, y+12);
  y += 22;

  // ── Top Serviços ──
  if (topSrvs.length) {
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(28,28,30);
    doc.text('TOP SERVICOS', 15, y); y += 5;
    doc.setDrawColor(212,160,168); doc.line(15, y, W-15, y); y += 4;
    topSrvs.forEach(function(nome, i) {
      checkPage(8);
      var cnt = srvCount[nome];
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(50,50,50);
      doc.text((i+1)+'. '+nome, 18, y);
      doc.setFont('helvetica','bold'); doc.setTextColor(138,154,90);
      doc.text(cnt + 'x', W-15, y, {align:'right'});
      y += 6;
    });
    y += 4;
  }

  // ── Formas de Pagamento ──
  var pagtoKeys = Object.keys(pagtos);
  if (pagtoKeys.length) {
    checkPage(20);
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(28,28,30);
    doc.text('FORMAS DE PAGAMENTO', 15, y); y += 5;
    doc.setDrawColor(212,160,168); doc.line(15, y, W-15, y); y += 4;
    pagtoKeys.forEach(function(k) {
      checkPage(7);
      var labels = {pix:'PIX',dinheiro:'Dinheiro',credito:'Credito',debito:'Debito',transferencia:'Transferencia'};
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(50,50,50);
      doc.text(labels[k]||k, 18, y);
      doc.setFont('helvetica','bold'); doc.setTextColor(30,80,30);
      doc.text('R$ '+pagtos[k].toFixed(2).replace('.',','), W-15, y, {align:'right'});
      y += 6;
    });
    y += 4;
  }

  // ── Atendimentos ──
  checkPage(20);
  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(28,28,30);
  doc.text('ATENDIMENTOS DO MES', 15, y); y += 5;
  doc.setDrawColor(212,160,168); doc.line(15, y, W-15, y); y += 4;

  // Cabeçalho tabela
  doc.setFillColor(245,240,250);
  doc.rect(15, y, W-30, 7, 'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(80,60,80);
  doc.text('DATA', 18, y+5);
  doc.text('CLIENTE', 42, y+5);
  doc.text('SERVICO', 95, y+5);
  doc.text('PAGTO', 155, y+5);
  doc.text('VALOR', W-18, y+5, {align:'right'});
  y += 9;

  var atendSort = [...atends].sort(function(a,b){ return a.data.localeCompare(b.data); });
  atendSort.forEach(function(a, idx) {
    checkPage(7);
    if (idx % 2 === 0) {
      doc.setFillColor(250,250,250);
      doc.rect(15, y-3, W-30, 7, 'F');
    }
    var ids = a.servicoIds || (a.servicoId ? [a.servicoId] : []);
    var sNomes = ids.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:''; }).filter(Boolean).join('+') || '—';
    if (sNomes.length > 25) sNomes = sNomes.substring(0,23)+'...';
    var cli = (a.cliente||'').length > 22 ? (a.cliente||'').substring(0,20)+'...' : (a.cliente||'');
    var pagtoL = {pix:'PIX',dinheiro:'Din.',credito:'Cred.',debito:'Deb.',transferencia:'Transf.'}[a.pagto]||a.pagto||'—';
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(60,60,60);
    doc.text(fmtDate(a.data), 18, y+2);
    doc.text(cli, 42, y+2);
    doc.text(sNomes, 95, y+2);
    doc.text(pagtoL, 155, y+2);
    doc.setFont('helvetica','bold'); doc.setTextColor(30,80,30);
    doc.text('R$'+parseFloat(a.valor||0).toFixed(2).replace('.',','), W-18, y+2, {align:'right'});
    y += 7;
  });

  // ── Rodapé ──
  var totalPages = doc.internal.getNumberOfPages();
  for (var pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    doc.setFillColor(245,240,242);
    doc.rect(0, H-12, W, 12, 'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(150,120,120);
    doc.text('Liza Figueiredo Estetica & Beleza  |  Relatorio ' + mesNome + ' ' + ano, 15, H-5);
    doc.text('Pagina '+pg+'/'+totalPages, W-15, H-5, {align:'right'});
  }

  // Download
  doc.save('Relatorio_' + mesNome + '_' + ano + '.pdf');
  if(status) status.textContent = '✅ PDF gerado com sucesso!';
  setTimeout(function(){ var m=document.getElementById('modal-relatorio'); if(m) m.remove(); }, 1500);
}


// ── WHATSAPP AVANÇADO ──────────────────────────────────────────────────────

// URL da anamnese — configurável
var _urlAnamnese = localStorage.getItem('lizafig_url_anamnese') || 'https://liza-figueiredo.netlify.app';

// 1. Link da anamnese ao criar agendamento
function waEnviarAnamnese(cliente, tel) {
  var primeiroNome = (cliente||'').split(' ')[0];
  var msg = 'Olá ' + primeiroNome + '! 🌸\n\n'
    + 'Seu agendamento foi confirmado na Liza Figueiredo Estética & Beleza!\n\n'
    + 'Antes de sua chegada, pedimos que preencha nossa ficha de anamnese:\n'
    + '👉 ' + _urlAnamnese + '\n\n'
    + 'Leva apenas 2 minutinhos e nos ajuda a preparar o melhor atendimento para você. 💆‍♀️\n\n'
    + 'Qualquer dúvida, estamos à disposição! ✨';
  var telFmt = tel ? '55' + tel.replace(/\D/g,'') : '';
  window.open('https://wa.me/' + telFmt + '?text=' + encodeURIComponent(msg), '_blank');
}

// 2. Pós-ciclo completo
function waPosCirclo(agId) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var servico = _agServicos(ag);
  var total = ag.sessoes.length;
  var msg = 'Parabéns, ' + ag.cliente.split(' ')[0] + '! 🎉\n\n'
    + 'Você completou seu pacote de *' + total + ' sessões* de *' + servico + '*! 🌟\n\n'
    + 'É uma conquista incrível e estamos muito felizes por acompanhar sua evolução. 💆‍♀️✨\n\n'
    + 'Que tal renovar e continuar cuidando de você? Temos ótimas condições para quem já é cliente! 😊\n\n'
    + 'Me chame para conversarmos sobre seu próximo pacote! 🌸';
  var tel = _waTelefone(ag.cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}

// 3. Orçamento formatado
function waOrcamento(agId) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var servico = _agServicos(ag);
  var total = ag.sessoes.length;

  // Calcular valor médio dos serviços
  var valor = 0;
  var srvIds = [];
  ag.sessoes.forEach(function(s){ (s.servicoIds||[]).forEach(function(id){ if(!srvIds.includes(id)) srvIds.push(id); }); });
  srvIds.forEach(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); if(sv) valor += parseFloat(sv.preco)||0; });
  var valorTotal = valor * total;

  var msg = '✨ *PROPOSTA DE TRATAMENTO* ✨\n'
    + 'Liza Figueiredo Estética & Beleza\n\n'
    + '👤 Cliente: ' + ag.cliente + '\n'
    + '💆 Tratamento: *' + servico + '*\n'
    + '📅 Sessões: *' + total + ' sessões*\n'
    + (valorTotal > 0 ? '💰 Investimento: *R$ ' + valorTotal.toFixed(2).replace('.',',') + '*\n' : '')
    + (valorTotal > 0 && total > 1 ? '📊 Por sessão: R$ ' + valor.toFixed(2).replace('.',',') + '\n' : '')
    + '\n'
    + 'Este tratamento foi personalizado especialmente para você! 🌸\n\n'
    + 'Para agendar ou tirar dúvidas, é só responder esta mensagem. 😊';
  var tel = _waTelefone(ag.cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}

// 4. Reagendamento rápido
function waReagendar(agId, sessaoIdx) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var s = ag.sessoes[sessaoIdx];
  var servico = (function(){ var ids=s&&s.servicoIds||[]; if(ids.length) return ids.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }).join(' + '); return _agServicos(ag); })();
  var msg = 'Olá ' + ag.cliente.split(' ')[0] + '! 🌸\n\n'
    + 'Precisamos reagendar sua sessão de *' + servico + '*'
    + (s && s.data ? ' que estava prevista para ' + fmtDate(s.data) : '') + '.\n\n'
    + 'Quando você tiver disponibilidade? Temos horários abertos e adoraríamos te receber! 😊\n\n'
    + 'Me chame para escolhermos a melhor data para você! ✨';
  var tel = _waTelefone(ag.cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}


// ── SINCRONIZAR AGORA ──
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
      showToast('Nenhum dado novo no Sheets.');
    }
  } catch(e) {
    if (btn) { btn.textContent = '🔄'; btn.disabled = false; }
  }
}


// ── NOVO AGENDAMENTO A PARTIR DE FALTA ──
function novoAgendamentoDeFalta(agId, sessaoIdx) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var s = ag.sessoes[sessaoIdx];

  // Navegar para agenda
  showSection('agenda');

  // Preencher formulário com dados da cliente
  setTimeout(function() {
    var nomeEl = document.getElementById('ag-cliente');
    var telEl = document.getElementById('ag-tel');
    var obsEl = document.getElementById('ag-obs');

    if (nomeEl) nomeEl.value = ag.cliente;
    if (telEl) telEl.value = ag.tel || '';

    // Serviço da sessão como observação
    var servico = s.servico || (s.servicoIds && s.servicoIds.length
      ? s.servicoIds.map(function(id){ var sv=db.servicos.find(function(x){return x.id===id;}); return sv?sv.nome:id; }).join(' + ')
      : '');
    if (obsEl && servico) obsEl.value = 'Reag.: ' + servico;

    // Scroll para o formulário
    var form = document.querySelector('#sec-agenda .form-section');
    if (!form) form = document.querySelector('#sec-agenda');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });

    showToast('📅 Preencha as novas datas para ' + ag.cliente);
  }, 300);
}

// Verificar sessão salva
var _sessaoSalva = sessionStorage.getItem('lizafig_sessao');
if (_sessaoSalva) {
  try {
    var _u = JSON.parse(_sessaoSalva);
    var _usuarios = _getUsuarios();
    var _uAtual = _usuarios.find(function(x){ return x.id===_u.id && x.senha===_u.senha; });
    if (_uAtual) {
      _usuarioLogado = _uAtual;
      _aplicarNivelAcesso();
      var hu = document.getElementById('sidebarUserName');
      if (hu) hu.textContent = _uAtual.nome; var av=document.getElementById('sidebarAvatarLetter'); if(av) av.textContent=_uAtual.nome.charAt(0).toUpperCase();
      init();
    } else {
      sessionStorage.removeItem('lizafig_sessao');
      mostrarLoginScreen();
    }
  } catch(e) {
    sessionStorage.removeItem('lizafig_sessao');
    mostrarLoginScreen();
  }
} else {
  mostrarLoginScreen();
}
addLog('INFO', 'Sistema carregado. Servicos:'+db.servicos.length+' Atend:'+db.atendimentos.length);
setTimeout(_migrarFotosIDB, 3000);

// ── Polling a cada 30s — busca só registros novos desde o último sync ──
setInterval(function() { _pollingNovos(); }, 30000);

// ===== LISTENER GLOBAL — botões de sessão no Acompanhamento =====
document.addEventListener('click', function(e) {
  var b1 = e.target.closest('._btn-serv-sessao');
  if (b1) { _abrirModalServSessao(b1.dataset.agid, parseInt(b1.dataset.idx)); return; }
  var b2 = e.target.closest('._btn-salv-sessao');
  if (b2) { salvarServicoSessao(b2.dataset.agid, parseInt(b2.dataset.idx), b2.dataset.sid); return; }
  var b3 = e.target.closest('._btn-foto-sessao');
  if (b3) {
    var row = document.getElementById(b3.dataset.fotoid);
    if (row) row.style.display = row.style.display === 'none' ? '' : 'none';
    return;
  }
  var b4 = e.target.closest('._btn-fecha-foto');
  if (b4) {
    var row2 = document.getElementById(b4.dataset.fotoid);
    if (row2) row2.style.display = 'none';
    return;
  }
  var b5 = e.target.closest('._btn-salv-foto');
  if (b5) {
    var agId = b5.dataset.agid;
    var sid  = b5.dataset.sid;
    var data = b5.dataset.data;
    var servico = b5.dataset.servico;
    var obs  = (document.getElementById('fp_obs_'+sid)||{value:''}).value;
    var inpA = document.getElementById('fp_antes_'+sid);
    var inpD = document.getElementById('fp_depois_'+sid);
    if (!inpA.files.length && !inpD.files.length && !obs.trim()) {
      showToast('Adicione pelo menos uma foto ou escreva uma observação!'); return;
    }
    var grupoId = uid();
    var novas = [];
    function _ler(inp, tipo, cb) {
      if (!inp || !inp.files || !inp.files[0]) { cb(); return; }
      var r = new FileReader();
      r.onload = function(ev) {
        novas.push({ id: uid(), grupoId: grupoId, agId: agId, tipo: tipo, url: ev.target.result, data: data, servico: servico, obs: obs });
        cb();
      };
      r.readAsDataURL(inp.files[0]);
    }
    function _fim() {
      if (!novas.length) {
        _idbSalvarFoto({ id: uid(), grupoId: grupoId, agId: agId, tipo: 'obs', url: '', data: data, servico: servico, obs: obs }, function() {
          renderAcomp(); showToast('📝 Observação salva!');
        });
        return;
      }
      var pend = novas.length;
      novas.forEach(function(f) {
        _idbSalvarFoto(f, function() {
          pend--;
          if (pend === 0) { renderAcomp(); showToast('📷 Fotos salvas!'); }
        });
      });
    }
    if (inpA && inpA.files.length && inpD && inpD.files.length) {
      _ler(inpA, 'antes', function() { _ler(inpD, 'depois', _fim); });
    } else if (inpA && inpA.files.length) {
      _ler(inpA, 'antes', _fim);
    } else if (inpD && inpD.files.length) {
      _ler(inpD, 'depois', _fim);
    } else { _fim(); }
    return;
  }
});

document.addEventListener('change', function(e) {
  var inp = e.target;
  // Preview inline nas linhas de sessão
  if (inp.id && (inp.id.startsWith('fp_antes_') || inp.id.startsWith('fp_depois_'))) {
    var lbl = document.getElementById(inp.id + '_lbl');
    if (!lbl || !inp.files || !inp.files[0]) return;
    var r = new FileReader();
    r.onload = function(ev) {
      lbl.innerHTML = '<img src="' + ev.target.result + '" style="max-height:80px;max-width:100%;border-radius:6px;object-fit:cover"><span style="font-size:10px;color:var(--text-light);margin-top:4px">✓ Selecionada</span>';
      lbl.style.padding = '4px';
    };
    r.readAsDataURL(inp.files[0]);
    return;
  }
  // Slot vazio no fotolog — salvar direto no grupo existente
  if (inp.id && inp.id.startsWith('slot_') && inp.dataset.grupokey) {
    if (!inp.files || !inp.files[0]) return;
    var agId = inp.dataset.agid;
    var grupoKey = inp.dataset.grupokey;
    var tipo = inp.dataset.tipo;
    // Buscar dados do grupo para reutilizar data e servico
    _idbGetFotos(agId, function(fotos) {
      var parts = grupoKey.split('||');
      var idOuData = parts[0], servico = parts[1] || '';
      var ref = fotos.find(function(f){
        if (f.grupoId && f.grupoId === idOuData) return true;
        return f.data === idOuData;
      });
      var data = ref ? ref.data : _hoje();
      var srv  = ref ? (ref.servico || '') : servico;
      var obs  = ref ? (ref.obs || '') : '';
      var grupoId = ref ? ref.grupoId : idOuData;
      var reader = new FileReader();
      reader.onload = function(ev) {
        _idbSalvarFoto({ id: uid(), grupoId: grupoId, agId: agId, tipo: tipo, url: ev.target.result, data: data, servico: srv, obs: obs }, function() {
          renderAcomp(); showToast('📷 Foto adicionada!');
        });
      };
      reader.readAsDataURL(inp.files[0]);
    });
    return;
  }
});

function _abrirModalServSessao(agId, sessaoIdx) {
  var ag = db.agenda.find(function(a){ return a.id===agId; });
  if (!ag || !ag.sessoes[sessaoIdx]) return;
  var s = ag.sessoes[sessaoIdx];
  var selecionados = s.servicoIds || (s.servico ? [s.servico] : []);
  var old = document.getElementById('modal-serv-sessao');
  if (old) old.remove();
  var overlay = document.createElement('div');
  overlay.id = 'modal-serv-sessao';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(44,26,34,0.65);z-index:999998;display:flex;align-items:center;justify-content:center;padding:1rem';
  var box = document.createElement('div');
  box.style.cssText = 'background:white;border-radius:16px;max-width:560px;width:100%;height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden';
  var header = document.createElement('div');
  header.style.cssText = 'padding:1rem 1.25rem;background:linear-gradient(135deg,#1C1C1E,#2C2C2E);border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center;flex-shrink:0';
  header.innerHTML = '<span style="font-family:\'Cormorant Garamond\',serif;font-size:16px;color:#FAF0F2;letter-spacing:2px">✏️ Serviços · Sessão '+(sessaoIdx+1)+'</span>';
  var btnX = document.createElement('button');
  btnX.style.cssText = 'background:none;border:none;color:#FAF0F2;font-size:20px;cursor:pointer';
  btnX.textContent = '✕';
  btnX.onclick = function(){ overlay.remove(); };
  header.appendChild(btnX);
  var body = document.createElement('div');
  body.style.cssText = 'padding:1rem 1.25rem;overflow-y:auto;flex:1';
  var filtro = document.createElement('input');
  filtro.type = 'text';
  filtro.placeholder = '🔍 Filtrar serviços...';
  filtro.style.cssText = 'width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:12px;font-family:Jost,sans-serif;outline:none;margin-bottom:10px';
  var chipsDiv = document.createElement('div');
  chipsDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
  db.servicos.filter(function(sv){ return sv.status==='ativo'; }).forEach(function(sv){
    var sel = selecionados.indexOf(sv.nome)>=0 || selecionados.indexOf(sv.id)>=0;
    var chip = document.createElement('span');
    chip.className = 'service-chip'+(sel?' selected':'');
    chip.style.cssText = 'font-size:12px;padding:4px 10px;cursor:pointer';
    chip.textContent = sv.nome;
    chip.addEventListener('click', function(){ this.classList.toggle('selected'); });
    chipsDiv.appendChild(chip);
  });
  filtro.oninput = function(){
    var v = this.value.toLowerCase();
    chipsDiv.querySelectorAll('.service-chip').forEach(function(c){
      c.style.display = c.textContent.toLowerCase().includes(v) ? '' : 'none';
    });
  };
  body.appendChild(filtro); body.appendChild(chipsDiv);
  var footer = document.createElement('div');
  footer.style.cssText = 'padding:0.75rem 1.25rem;border-top:1px solid var(--border);display:flex;gap:0.75rem;flex-shrink:0';
  var btnS = document.createElement('button');
  btnS.className = 'btn btn-primary'; btnS.textContent = '✓ Salvar';
  btnS.onclick = function(){
    var sels = [];
    chipsDiv.querySelectorAll('.service-chip.selected').forEach(function(el){ sels.push(el.textContent.trim()); });
    ag.sessoes[sessaoIdx].servicoIds = sels;
    ag.sessoes[sessaoIdx].servico = sels.join(' + ');
    saveData(); overlay.remove();
    if (typeof renderAcomp === 'function') renderAcomp();
    showToast('Serviços da sessão '+(sessaoIdx+1)+' salvos!');
  };
  var btnC = document.createElement('button');
  btnC.className = 'btn btn-secondary'; btnC.textContent = 'Cancelar';
  btnC.onclick = function(){ overlay.remove(); };
  footer.appendChild(btnS); footer.appendChild(btnC);
  box.appendChild(header); box.appendChild(body); box.appendChild(footer);
  overlay.appendChild(box); document.body.appendChild(overlay);
}

function salvarServicoSessao(agId, sessaoIdx, sid) {
  var ag = db.agenda.find(function(a){ return a.id===agId; });
  if (!ag || !ag.sessoes[sessaoIdx]) return;
  var container = document.getElementById('chips_'+sid);
  if (!container) return;
  var selecionados = [];
  container.querySelectorAll('.service-chip.selected').forEach(function(el){ selecionados.push(el.textContent.trim()); });
  ag.sessoes[sessaoIdx].servicoIds = selecionados;
  ag.sessoes[sessaoIdx].servico = selecionados.join(' + ');
  saveData();
  if (typeof renderAcomp === 'function') renderAcomp();
  showToast('Serviços da sessão '+(sessaoIdx+1)+' salvos!');
}
