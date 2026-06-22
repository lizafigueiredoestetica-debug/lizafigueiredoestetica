/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — disponibilidade.js
   Controle de dias liberados para agendamento público
   (db.diasDisponiveis — persistido na tabela configuracoes)
   Arquivo isolado: não altera agenda.js nem calendario.js
   ===================================================== */

var _dispCalData = new Date();

// ── Calcula a data (string) da segunda-feira da semana corrente real ──
function _dispSegundaVisivel() {
  var hoje = new Date();
  var dow = hoje.getDay();
  var diffLun = (dow === 0 ? -6 : 1 - dow);
  var seg = new Date(hoje.getTime() + diffLun * 86400000);
  return seg.getFullYear() + '-' + String(seg.getMonth()+1).padStart(2,'0') + '-' + String(seg.getDate()).padStart(2,'0');
}

// ── Toggle de um dia (liberar/bloquear) ──
function dispToggleDia(dataStr) {
  if (!db.diasDisponiveis) db.diasDisponiveis = [];
  var idx = db.diasDisponiveis.indexOf(dataStr);
  if (idx >= 0) {
    db.diasDisponiveis.splice(idx, 1);
  } else {
    db.diasDisponiveis.push(dataStr);
  }
  saveData();
  _salvarDiasDisponiveis();
  renderDisponibilidade();
}

// ── Liberar todos os dias da semana visível (Seg–Sáb, mantém Dom fechado por padrão) ──
function dispLiberarSemana(segundaStr) {
  if (!db.diasDisponiveis) db.diasDisponiveis = [];
  var seg = new Date(segundaStr + 'T12:00:00');
  var add = 0;
  for (var i = 0; i < 7; i++) {
    var d = new Date(seg.getTime() + i * 86400000);
    var dStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    if (db.diasDisponiveis.indexOf(dStr) < 0) { db.diasDisponiveis.push(dStr); add++; }
  }
  saveData();
  _salvarDiasDisponiveis();
  renderDisponibilidade();
  showToast('✅ ' + add + ' dia(s) liberado(s) nesta semana!');
}

// ── Bloquear todos os dias da semana visível ──
function dispBloquearSemana(segundaStr) {
  if (!db.diasDisponiveis) db.diasDisponiveis = [];
  var seg = new Date(segundaStr + 'T12:00:00');
  for (var i = 0; i < 7; i++) {
    var d = new Date(seg.getTime() + i * 86400000);
    var dStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    var idx = db.diasDisponiveis.indexOf(dStr);
    if (idx >= 0) db.diasDisponiveis.splice(idx, 1);
  }
  saveData();
  _salvarDiasDisponiveis();
  renderDisponibilidade();
  showToast('🔒 Semana bloqueada para novos agendamentos públicos.');
}

function dispNavegar(dir) {
  _dispCalData = new Date(_dispCalData.getFullYear(), _dispCalData.getMonth() + dir, 1);
  renderDisponibilidade();
}

function dispHoje() {
  _dispCalData = new Date();
  renderDisponibilidade();
}

// ── Renderizar o painel de disponibilidade (aba Agenda do admin) ──
function renderDisponibilidade() {
  var grid = document.getElementById('dispGrid');
  var titulo = document.getElementById('dispTitulo');
  if (!grid || !titulo) return;

  if (!db.diasDisponiveis) db.diasDisponiveis = [];
  var liberados = db.diasDisponiveis;

  var hoje = _hoje();
  var ano = _dispCalData.getFullYear(), mes = _dispCalData.getMonth();
  var meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  titulo.textContent = meses[mes] + ' ' + ano;

  var primeiroDia = new Date(ano, mes, 1).getDay();
  var diasNoMes = new Date(ano, mes + 1, 0).getDate();
  var diasAntes = primeiroDia === 0 ? 6 : primeiroDia - 1;

  var html = '<div class="disp-month-grid">';
  var dows = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  dows.forEach(function(d, i) { html += '<div class="disp-dow' + (i >= 5 ? ' disp-fim-semana' : '') + '">' + d + '</div>'; });

  var mesPrev = new Date(ano, mes, 0);
  for (var i = diasAntes - 1; i >= 0; i--) {
    var dNum = mesPrev.getDate() - i;
    html += '<div class="disp-day outro-mes"><div class="disp-day-num">' + dNum + '</div></div>';
  }

  for (var d = 1; d <= diasNoMes; d++) {
    var dStr = ano + '-' + String(mes+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    var isHoje = dStr === hoje;
    var isPassado = dStr < hoje;
    var liberado = liberados.indexOf(dStr) >= 0;
    var cls = 'disp-day' + (isHoje ? ' disp-hoje' : '') + (liberado ? ' disp-liberado' : ' disp-fechado') + (isPassado ? ' disp-passado' : '');
    var onclick = isPassado ? '' : ' onclick="dispToggleDia(\'' + dStr + '\')"';
    var icone = isPassado ? '' : (liberado ? '<div class="disp-icone">✓</div>' : '<div class="disp-icone">🔒</div>');
    html += '<div class="' + cls + '"' + onclick + '><div class="disp-day-num">' + d + '</div>' + icone + '</div>';
  }

  var total = diasAntes + diasNoMes;
  var diasDepois = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (var k = 1; k <= diasDepois; k++) {
    html += '<div class="disp-day outro-mes"><div class="disp-day-num">' + k + '</div></div>';
  }
  html += '</div>';
  grid.innerHTML = html;
}
