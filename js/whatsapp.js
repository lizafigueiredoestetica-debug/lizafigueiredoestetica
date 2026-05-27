/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — whatsapp.js
   WhatsApp helpers, agenda principal, ICS import
   ===================================================== */

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
  var msg = _getMensagem('confirmar_sessao').replace(/{nome}/g, ag.cliente.split(' ')[0]).replace(/{servico}/g, servico).replace(/{data}/g, fmtDate(s.data)).replace(/{hora}/g, hora);
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
  var msg = _getMensagem('lembrete_amanha').replace(/{nome}/g, ag.cliente.split(' ')[0]).replace(/{servico}/g, servico).replace(/{hora}/g, hora);
  var tel = _waTelefone(ag.cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}

function waPosAtendimento(cliente, servico) {
  var msg = _getMensagem('pos_atendimento').replace(/{nome}/g, cliente.split(' ')[0]).replace(/{servico}/g, servico);
  var tel = _waTelefone(cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}

function waRetorno(agId) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var msg = _getMensagem('retorno').replace(/{nome}/g, ag.cliente.split(' ')[0]).replace(/{servico}/g, _agServicos(ag));
  var tel = _waTelefone(ag.cliente);
  window.open('https://wa.me/' + (tel ? '55' + tel : '') + '?text=' + encodeURIComponent(msg), '_blank');
}
