// =====================================================
// 📲 CATÁLOGO — sub-aba do Radar de Clientes
// Lê os contatos do catálogo online (cat-logo) via RPC.
// Arquivo independente: não altera nenhuma função existente.
// =====================================================
(function () {
  var _catDados = [];
  var _catFiltro = 'todos';

  // ---- encaixa a 3ª sub-aba sem mexer no radar.js ----
  var _origSubAba = window.mostrarSubAbaRadar;
  window.mostrarSubAbaRadar = function (aba) {
    var box = document.getElementById('sub-aba-radar-catalogo');
    var btn = document.getElementById('sub-btn-radar-catalogo');
    if (aba === 'catalogo') {
      document.getElementById('sub-aba-radar-cadastro').style.display = 'none';
      document.getElementById('sub-aba-radar-indicadores').style.display = 'none';
      document.getElementById('sub-btn-radar-cadastro').classList.remove('active');
      document.getElementById('sub-btn-radar-indicadores').classList.remove('active');
      if (box) box.style.display = '';
      if (btn) btn.classList.add('active');
      carregarCatalogoAdmin();
      return;
    }
    if (box) box.style.display = 'none';
    if (btn) btn.classList.remove('active');
    if (typeof _origSubAba === 'function') _origSubAba(aba);
  };

  // ---- utilidades ----
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtTel(t) {
    t = String(t || '');
    return t.length === 11 ? '(' + t.slice(0, 2) + ') ' + t.slice(2, 7) + '-' + t.slice(7) : t;
  }
  function tempoAtras(iso) {
    var m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 60) return 'há ' + Math.max(m, 1) + ' min';
    var h = Math.floor(m / 60); if (h < 24) return 'há ' + h + 'h';
    var d = Math.floor(h / 24); return 'há ' + d + (d === 1 ? ' dia' : ' dias');
  }
  function rpc(nome, corpo) {
    return fetch(SUPA_URL + '/rest/v1/rpc/' + nome, {
      method: 'POST',
      headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo || {})
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.status === 204 ? null : r.json(); });
  }

  // nomes dos serviços (eventos antigos gravaram o código)
  var NOMES = {gordura:'Gordura Localizada',flacidez:'Tratamento para Flacidez',diastase:'Diástase Abdominal',celulite:'Tratamento para Celulite',
    estrias:'Tratamento para Estrias',gluteos:'Protocolo para Glúteos',peim:'PEIM (Microvasos)',metodo:'Método Liza Define',
    lipofuncional:'Massagem Lipofuncional',modeladora:'Massagem Modeladora',drenagem:'Drenagem Linfática',limpeza:'Limpeza de Pele',
    hydra:'Hydra Glow',laser:'Depilação a Laser'};
  function nomeServ(s) { return s ? (NOMES[s] || s) : s; }

  // ---- analisa os cliques de cada contato ----
  function analisar(c) {
    var ev = (c.eventos || []).map(function (e) { return { tipo: e.tipo, servico: nomeServ(e.servico), em: e.em }; });
    var abertos = {}, favs = {}, whats = false;
    ev.slice().reverse().forEach(function (e) {            // ordem cronológica
      if (e.servico && (e.tipo === 'abriu' || e.tipo === 'whatsapp')) abertos[e.servico] = (abertos[e.servico] || 0) + 1;
      if (e.tipo === 'favoritou' && e.servico) favs[e.servico] = true;
      if (e.tipo === 'desfavoritou' && e.servico) delete favs[e.servico];
      if (e.tipo === 'whatsapp') whats = true;
    });
    var servicos = Object.keys(abertos).sort(function (a, b) { return abertos[b] - abertos[a]; });
    Object.keys(favs).forEach(function (f) { if (servicos.indexOf(f) < 0) servicos.unshift(f); });
    var temp = (whats || Object.keys(favs).length || c.acessos > 1) ? 'quente'
             : servicos.length ? 'morno' : 'frio';
    return { servicos: servicos, favs: favs, whats: whats, temp: temp, cliques: ev.filter(function (e) { return e.tipo === 'abriu'; }).length };
  }

  // ---- carrega ----
  window.carregarCatalogoAdmin = function () {
    var lista = document.getElementById('catAdmLista');
    if (lista) lista.innerHTML = '<div class="empty-state" style="padding:2rem;text-align:center;opacity:.6">Carregando…</div>';
    rpc('catalogo_painel').then(function (d) {
      _catDados = (d || []).map(function (c) { c._a = analisar(c); return c; });
      renderCatalogoAdmin();
    }).catch(function (e) {
      if (lista) lista.innerHTML = '<div style="padding:2rem;text-align:center;color:#c0574a">Erro ao carregar o catálogo (' + esc(e.message) + ')</div>';
    });
  };

  window.filtrarCatalogoAdmin = function (f) { _catFiltro = f; renderCatalogoAdmin(); };

  // ---- desenha ----
  window.renderCatalogoAdmin = function () {
    var d = _catDados;
    var mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
    var cont = {
      mes: d.filter(function (c) { return new Date(c.criado_em) >= mes; }).length,
      quentes: d.filter(function (c) { return c._a.temp === 'quente'; }).length,
      novos: d.filter(function (c) { return c.status === 'novo'; }).length,
      fechou: d.filter(function (c) { return c.status === 'fechou'; }).length
    };

    // cards
    var cards = [
      { l: 'Entraram no mês', v: cont.mes, s: 'cadastros pelo catálogo', i: '📲', c: '' },
      { l: 'Quentes', v: cont.quentes, s: 'favoritaram, voltaram ou chamaram', i: '🔥', c: 'gold' },
      { l: 'Ainda não chamados', v: cont.novos, s: 'status "novo"', i: '⏳', c: cont.novos ? 'red' : 'green' },
      { l: 'Fecharam', v: cont.fechou, s: 'viraram clientes', i: '✅', c: 'green' }
    ];
    document.getElementById('catAdmCards').innerHTML = cards.map(function (k) {
      return '<div class="summary-card"><div class="card-icon">' + k.i + '</div><div class="card-label">' + k.l
        + '</div><div class="card-value ' + k.c + '">' + k.v + '</div><div class="card-sub">' + k.s + '</div></div>';
    }).join('');

    // ranking de serviços
    var rank = {};
    d.forEach(function (c) { c._a.servicos.forEach(function (s) { rank[s] = (rank[s] || 0) + 1; }); });
    var top = Object.keys(rank).sort(function (a, b) { return rank[b] - rank[a]; }).slice(0, 8);
    var max = top.length ? rank[top[0]] : 1;
    document.getElementById('catAdmRanking').innerHTML = top.length ? top.map(function (s) {
      return '<div style="margin:.45rem 0"><div style="display:flex;justify-content:space-between;font-size:.85rem"><span>' + esc(s)
        + '</span><b>' + rank[s] + '</b></div><div style="height:6px;border-radius:6px;background:#efe4de;margin-top:4px"><div style="height:6px;border-radius:6px;background:#A67C68;width:'
        + Math.round(rank[s] / max * 100) + '%"></div></div></div>';
    }).join('') : '<div style="opacity:.6">Nenhum serviço visualizado ainda.</div>';

    // filtros
    ['todos', 'quente', 'morno', 'frio', 'novo', 'contatado', 'fechou'].forEach(function (f) {
      var b = document.getElementById('catF-' + f); if (b) b.classList.toggle('active', _catFiltro === f);
    });

    var busca = (document.getElementById('catAdmBusca') || {}).value || '';
    busca = busca.toLowerCase().trim();
    var lst = d.filter(function (c) {
      if (['quente', 'morno', 'frio'].indexOf(_catFiltro) >= 0 && c._a.temp !== _catFiltro) return false;
      if (['novo', 'contatado', 'fechou'].indexOf(_catFiltro) >= 0 && c.status !== _catFiltro) return false;
      if (busca && (c.nome + ' ' + c.telefone + ' ' + c._a.servicos.join(' ')).toLowerCase().indexOf(busca) < 0) return false;
      return true;
    });
    var ordemT = { quente: 0, morno: 1, frio: 2 };
    lst.sort(function (a, b) { return (ordemT[a._a.temp] - ordemT[b._a.temp]) || (new Date(b.ultimo_acesso) - new Date(a.ultimo_acesso)); });

    var tempLbl = { quente: '🔥 Quente', morno: '🟠 Morno', frio: '🔵 Frio' };
    var tempCor = { quente: '#c0574a', morno: '#d08a2e', frio: '#5b7fa8' };
    var stOpts = [['novo', '🆕 Novo'], ['contatado', '💬 Contatado'], ['agendou', '📅 Agendou'], ['fechou', '✅ Fechou'], ['perdido', '❌ Perdido']];

    document.getElementById('catAdmLista').innerHTML = lst.length ? lst.map(function (c) {
      var a = c._a;
      var chips = a.servicos.length ? a.servicos.map(function (s) {
        return '<span style="display:inline-block;margin:3px 4px 0 0;padding:4px 10px;border-radius:20px;font-size:.75rem;background:'
          + (a.favs[s] ? '#A67C68;color:#fff' : '#efe4de;color:#5E463B') + '">' + (a.favs[s] ? '♥ ' : '') + esc(s) + '</span>';
      }).join('') : '<span style="font-size:.8rem;opacity:.6">Só se cadastrou, ainda não abriu nenhum serviço</span>';
      var sel = '<select onchange="mudarStatusCatalogo(\'' + c.id + '\',this.value)" style="padding:6px 8px;border-radius:8px;border:1px solid #DFCEC5;font-size:.8rem">'
        + stOpts.map(function (o) { return '<option value="' + o[0] + '"' + (c.status === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>';
      return '<div class="panel" style="margin-bottom:.8rem;padding:1rem 1.2rem;border-left:4px solid ' + tempCor[a.temp] + '">'
        + '<div style="display:flex;flex-wrap:wrap;gap:.8rem;align-items:center;justify-content:space-between">'
        +   '<div style="min-width:200px"><div style="font-weight:700;font-size:1rem">' + esc(c.nome)
        +     ' <span style="font-size:.75rem;font-weight:600;color:' + tempCor[a.temp] + '">' + tempLbl[a.temp] + '</span></div>'
        +     '<div style="font-size:.8rem;opacity:.75">' + fmtTel(c.telefone) + ' · entrou ' + tempoAtras(c.criado_em)
        +     ' · ' + c.acessos + (c.acessos === 1 ? ' acesso' : ' acessos')
        +     (c.canal && c.canal !== 'direto' ? ' · via ' + esc(c.canal) : '') + (a.whats ? ' · 💬 clicou no WhatsApp' : '') + '</div></div>'
        +   '<div style="display:flex;gap:.5rem;align-items:center">' + sel
        +     '<button class="btn btn-primary btn-sm" onclick="chamarCatalogoWhats(\'' + c.id + '\')">💬 Chamar</button></div>'
        + '</div>'
        + '<div style="margin-top:.6rem">' + chips + '</div></div>';
    }).join('') : '<div style="padding:2rem;text-align:center;opacity:.6">Nenhum contato neste filtro.</div>';
  };

  window.mudarStatusCatalogo = function (id, st) {
    rpc('catalogo_status', { p_id: id, p_status: st }).then(function () {
      var c = _catDados.find(function (x) { return x.id === id; }); if (c) c.status = st;
      renderCatalogoAdmin();
      if (typeof showToast === 'function') showToast('Status atualizado');
    }).catch(function () { if (typeof showToast === 'function') showToast('Erro ao salvar status'); });
  };

  window.chamarCatalogoWhats = function (id) {
    var c = _catDados.find(function (x) { return x.id === id; }); if (!c) return;
    var s = c._a.servicos;
    var txt = s.length
      ? 'Oi ' + c.nome + '! Tudo bem? Aqui é a Liza 💛 Vi que você se interessou por *' + s.slice(0, 2).join('* e *') + '* no meu catálogo. Posso te explicar como funciona e montar uma avaliação pra você?'
      : 'Oi ' + c.nome + '! Tudo bem? Aqui é a Liza 💛 Vi que você acessou meu catálogo. Ficou com alguma dúvida sobre os tratamentos?';
    window.open('https://wa.me/55' + c.telefone + '?text=' + encodeURIComponent(txt), '_blank');
    if (c.status === 'novo') mudarStatusCatalogo(id, 'contatado');
  };
  // =====================================================
  // ALERTAS AUTOMÁTICOS (a cada 30s, consulta leve)
  // =====================================================
  var LS_DESDE = 'catalogo_alerta_desde';
  var _desde = null, _naoVistos = 0;
  try { _desde = localStorage.getItem(LS_DESDE); } catch (e) {}
  if (!_desde) _desde = new Date().toISOString();

  function abaCatalogoAberta() {
    var box = document.getElementById('sub-aba-radar-catalogo');
    var sec = document.getElementById('sec-radar');
    return box && box.style.display !== 'none' && sec && sec.offsetParent !== null;
  }
  function atualizaBadge() {
    var btn = document.getElementById('sub-btn-radar-catalogo'); if (!btn) return;
    btn.innerHTML = '📲 Catálogo' + (_naoVistos ? ' <span style="background:#c0574a;color:#fff;border-radius:10px;padding:1px 7px;font-size:.7rem;margin-left:4px">' + _naoVistos + '</span>' : '');
  }
  function popup(html) {
    var w = document.getElementById('catAlertBox');
    if (!w) {
      w = document.createElement('div'); w.id = 'catAlertBox';
      w.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:340px';
      document.body.appendChild(w);
    }
    var d = document.createElement('div');
    d.style.cssText = 'background:#fff;border-left:5px solid #A67C68;border-radius:12px;padding:12px 14px;box-shadow:0 10px 28px -10px rgba(0,0,0,.35);font-size:.85rem;cursor:pointer;line-height:1.4';
    d.innerHTML = html + '<div style="font-size:.7rem;opacity:.6;margin-top:4px">Toque para abrir o Catálogo</div>';
    d.onclick = function () {
      d.remove();
      if (typeof showSection === 'function') showSection('radar');
      window.mostrarSubAbaRadar('catalogo');
    };
    w.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.remove(); }, 15000);
  }
  var TXT = { cadastro: '📲 <b>Novo cadastro</b> no catálogo', retorno: '🔁 <b>Voltou</b> ao catálogo',
              favoritou: '♥ <b>Favoritou</b>', whatsapp: '💬 <b>Clicou em "Quero saber mais"</b>' };

  function verificarNovidades() {
    if (typeof SUPA_URL === 'undefined') return;
    rpc('catalogo_novidades', { p_desde: _desde }).then(function (ev) {
      if (!ev || !ev.length) return;
      _desde = ev[ev.length - 1].em;
      try { localStorage.setItem(LS_DESDE, _desde); } catch (e) {}
      // agrupa por pessoa para não encher a tela
      var porPessoa = {};
      ev.forEach(function (e) { (porPessoa[e.contato] = porPessoa[e.contato] || []).push(e); });
      Object.keys(porPessoa).forEach(function (k) {
        var lst = porPessoa[k], nome = esc(lst[0].nome);
        var linhas = lst.slice(-3).map(function (e) {
          return TXT[e.tipo] + (e.servico ? ': ' + esc(nomeServ(e.servico)) : '');
        }).join('<br>');
        popup('<div style="font-weight:700;margin-bottom:3px">' + nome + '</div>' + linhas);
      });
      if (abaCatalogoAberta()) { _naoVistos = 0; carregarCatalogoAdmin(); }
      else { _naoVistos += Object.keys(porPessoa).length; }
      atualizaBadge();
    }).catch(function () {});
  }
  var _origMostrar = window.mostrarSubAbaRadar;
  window.mostrarSubAbaRadar = function (aba) {
    if (aba === 'catalogo') { _naoVistos = 0; atualizaBadge(); }
    _origMostrar(aba);
  };
  setTimeout(verificarNovidades, 5000);
  setInterval(function () { if (!document.hidden) verificarNovidades(); }, 30000);
})();
