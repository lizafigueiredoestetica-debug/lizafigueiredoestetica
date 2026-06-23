/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — radar_supabase.js
   Persistência do Radar de Clientes (tabela "leads")
   Reaproveita _supaUpsert / _supaDelete já existentes em supabase.js
   ===================================================== */

async function _salvarLead(lead) {
  return _supaUpsert('leads', {
    id: lead.id,
    nome: lead.nome,
    instagram: lead.instagram || '',
    telefone: lead.telefone || '',
    primeira_pergunta: lead.primeiraPergunta || '',
    classificacao: lead.classificacao || 'frio',
    ultimo_contato: lead.ultimoContato || null,
    status_negociacao: lead.statusNegociacao || '',
    atualizado_em: new Date().toISOString()
  });
}

async function _excluirLead(id) {
  return _supaDelete('leads', id);
}

// Carrega os leads do Supabase para db.leads. Chamar dentro do boot
// (_carregarDaNuvem) e também pode ser chamado isoladamente no _pollingNovos.
async function _carregarLeadsDaNuvem() {
  try {
    var resp = await fetch(SUPA_URL + '/rest/v1/leads?select=*&order=criado_em.desc', { headers: _supaHeaders() });
    if (!resp.ok) { db.leads = db.leads || []; return false; }
    var leads = await resp.json();
    db.leads = leads.map(function(l) {
      return {
        id: l.id,
        nome: l.nome,
        instagram: l.instagram || '',
        telefone: l.telefone || '',
        primeiraPergunta: l.primeira_pergunta || '',
        classificacao: l.classificacao || 'frio',
        ultimoContato: l.ultimo_contato || '',
        statusNegociacao: l.status_negociacao || '',
        criadoEm: l.criado_em
      };
    });
    return true;
  } catch (e) {
    addLog('WARN', '⚠️ Erro ao carregar leads do Radar: ' + e.message);
    if (!db.leads) db.leads = [];
    return false;
  }
}
