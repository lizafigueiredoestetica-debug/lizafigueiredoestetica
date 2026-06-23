/* =====================================================
   LIZA FIGUEIREDO ESTÉTICA — idb.js
   IndexedDB, Supabase Storage para fotos
   ===================================================== */

// ===================== FOTOLOG =====================
// ── IndexedDB para fotos (evita quota do localStorage) ──
var _idbName = 'lizafig_fotos', _idbVersion = 1, _idb = null;

function _abrirIDB(cb) {
  if (_idb) { cb(_idb); return; }
  var req = indexedDB.open(_idbName, _idbVersion);
  req.onupgradeneeded = function(e) {
    var db2 = e.target.result;
    if (!db2.objectStoreNames.contains('fotos')) {
      db2.createObjectStore('fotos', { keyPath: 'id' });
    }
  };
  req.onsuccess = function(e) {
    _idb = e.target.result;
    // Resetar referência quando conexão for fechada (evita InvalidStateError)
    _idb.onclose = function() { _idb = null; };
    _idb.onversionchange = function() { _idb.close(); _idb = null; };
    cb(_idb);
  };
  req.onerror = function() { console.error('IDB erro'); cb(null); };
}

// ── Supabase Storage helpers ──────────────────────────────
var SUPA_BUCKET = 'Fotos';

function _supaFotoPath(foto) {
  // Caminho: agId/grupoId_tipo.jpg
  return foto.agId + '/' + (foto.grupoId || foto.id) + '_' + foto.tipo + '.jpg';
}

function _supaUploadFoto(foto, cb) {
  // Converte base64 para Blob e faz upload no Supabase Storage
  try {
    var base64 = foto.url;
    if (!base64 || !base64.startsWith('data:')) { cb && cb(foto); return; }
    var parts = base64.split(',');
    var byteString = atob(parts[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    var blob = new Blob([ab], { type: 'image/jpeg' });
    var path = _supaFotoPath(foto);
    fetch(SUPA_URL + '/storage/v1/object/' + SUPA_BUCKET + '/' + path, {
      method: 'POST',
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
      },
      body: blob
    }).then(function(r) {
      if (r.ok) {
        // Substituir url base64 pela url pública do Storage
        var publicUrl = SUPA_URL + '/storage/v1/object/public/' + SUPA_BUCKET + '/' + path;
        foto.url = publicUrl;
        foto.storageUrl = publicUrl;
      }
      cb && cb(foto);
    }).catch(function() { cb && cb(foto); });
  } catch(e) { cb && cb(foto); }
}

function _supaDeleteFoto(path, cb) {
  fetch(SUPA_URL + '/storage/v1/object/' + SUPA_BUCKET + '/' + path, {
    method: 'DELETE',
    headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
  }).then(function() { cb && cb(); }).catch(function() { cb && cb(); });
}

// ── Tabela fotos no Supabase (metadados) ──────────────────
function _supaGetFotos(agId, cb) {
  fetch(SUPA_URL + '/rest/v1/fotos?agId=eq.' + encodeURIComponent(agId) + '&select=*', {
    headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
  }).then(function(r) { return r.json(); })
    .then(function(rows) {
      if (!Array.isArray(rows)) { cb([]); return; }
      // Só retorna fotos com URL válida (https) ou sem foto (obs)
      var validas = rows.filter(function(f) {
        return !f.url || f.url === '' || f.url.startsWith('http');
      });
      cb(validas);
    })
    .catch(function() { cb([]); });
}

function _supaSalvarFoto(foto, cb) {
  // Upsert na tabela fotos
  fetch(SUPA_URL + '/rest/v1/fotos', {
    method: 'POST',
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': 'Bearer ' + SUPA_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(foto)
  }).then(function() { cb && cb(); }).catch(function() { cb && cb(); });
}

function _supaExcluirFoto(fotoId, url, cb) {
  // Apaga da tabela e do Storage
  fetch(SUPA_URL + '/rest/v1/fotos?id=eq.' + encodeURIComponent(fotoId), {
    method: 'DELETE',
    headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
  }).then(function() {
    // Apagar do Storage se tiver storageUrl
    if (url && url.includes('/storage/v1/object/public/')) {
      var path = url.split('/storage/v1/object/public/' + SUPA_BUCKET + '/')[1];
      if (path) { _supaDeleteFoto(path, cb); return; }
    }
    cb && cb();
  }).catch(function() { cb && cb(); });
}

// ── API pública usada pelo sistema (substitui IDB) ────────
function _idbGetFotos(agId, cb) {
  _supaGetFotos(agId, function(rows) {
    if (rows.length > 0) { cb(rows); return; }
    // Fallback: busca no IDB local (dados antigos)
    _abrirIDB(function(db2) {
      if (!db2) { cb([]); return; }
      var tx = db2.transaction('fotos', 'readonly');
      var store = tx.objectStore('fotos');
      var result = [];
      var req = store.openCursor();
      req.onsuccess = function(e) {
        var cursor = e.target.result;
        if (cursor) {
          if (cursor.value.agId === agId) result.push(cursor.value);
          cursor.continue();
        } else { cb(result); }
      };
      req.onerror = function() { cb([]); };
    });
  });
}

function _idbSalvarFoto(foto, cb) {
  if (foto.url && foto.url.startsWith('data:')) {
    // Upload da imagem para Storage primeiro
    _supaUploadFoto(foto, function(fotoAtualizada) {
      _supaSalvarFoto(fotoAtualizada, cb);
    });
  } else {
    // Só texto/obs ou já tem URL pública
    _supaSalvarFoto(foto, cb);
  }
}

function _idbExcluirFoto(fotoId, cb) {
  // Busca a foto para ter a url antes de excluir
  fetch(SUPA_URL + '/rest/v1/fotos?id=eq.' + encodeURIComponent(fotoId) + '&select=url', {
    headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
  }).then(function(r) { return r.json(); })
    .then(function(rows) {
      var url = rows && rows[0] ? rows[0].url : '';
      _supaExcluirFoto(fotoId, url, cb);
    }).catch(function() { _supaExcluirFoto(fotoId, '', cb); });
}

// ── Migração automática IDB → Supabase (roda uma vez) ─────
function _migrarFotosIDB() {
  if (localStorage.getItem('lizafig_fotos_migradas')) return;
  _abrirIDB(function(db2) {
    if (!db2) return;
    var tx = db2.transaction('fotos', 'readonly');
    var store = tx.objectStore('fotos');
    var fotos = [];
    var req = store.openCursor();
    req.onsuccess = function(e) {
      var cursor = e.target.result;
      if (cursor) { fotos.push(cursor.value); cursor.continue(); }
      else {
        if (!fotos.length) { localStorage.setItem('lizafig_fotos_migradas', '1'); return; }
        addLog('INFO', '📦 Migrando ' + fotos.length + ' foto(s) do dispositivo para a nuvem...');
        var pend = fotos.length;
        fotos.forEach(function(f) {
          _idbSalvarFoto(f, function() {
            pend--;
            if (pend === 0) {
              localStorage.setItem('lizafig_fotos_migradas', '1');
              addLog('INFO', '✅ Migração de fotos concluída!');
              renderAcomp && renderAcomp();
            }
          });
        });
      }
    };
  });
}

function _getFotos(agId) {
  // mantido para compatibilidade — retorna array vazio síncrono
  return [];
}

function _buildFotologHtml(agId) {
  // Carregamento sob demanda: só busca fotos quando o usuário clicar para abrir.
  // Isso evita baixar todas as fotos de todos os clientes a cada renderAcomp().
  // Se o fotolog já estava aberto (ex: após salvar/excluir uma foto, que chama
  // renderAcomp() de novo), mantemos aberto para não regredir o comportamento atual.
  if (!window._fotologAbertos) window._fotologAbertos = {};
  var wrapId = 'fotolog_' + agId.replace(/[^a-z0-9]/gi,'');
  if (window._fotologAbertos[agId]) {
    setTimeout(function() {
      _idbGetFotos(agId, function(fotos) {
        var el = document.getElementById(wrapId);
        if (el) el.innerHTML = _fotologConteudo(agId, fotos);
      });
    }, 0);
    return '<div class="fotolog-wrap" id="' + wrapId + '">'
      + '<div class="fotolog-titulo"><span>📷 Fotolog de Evolução</span>'
      + '</div><div style="padding:1rem;color:var(--text-light);font-size:12px">Carregando...</div></div>';
  }
  return '<div class="fotolog-wrap" id="' + wrapId + '">'
    + '<div class="fotolog-titulo" style="display:flex;align-items:center;justify-content:space-between">'
    + '<span>📷 Fotolog de Evolução</span>'
    + '<button class="btn btn-secondary btn-sm" onclick="_abrirFotolog(\'' + agId + '\',\'' + wrapId + '\')" style="font-size:11px">Ver fotos</button>'
    + '</div></div>';
}

function _abrirFotolog(agId, wrapId) {
  if (!window._fotologAbertos) window._fotologAbertos = {};
  window._fotologAbertos[agId] = true;
  var el = document.getElementById(wrapId);
  if (!el) return;
  el.innerHTML = '<div class="fotolog-titulo"><span>📷 Fotolog de Evolução</span></div><div style="padding:1rem;color:var(--text-light);font-size:12px">Carregando...</div>';
  _idbGetFotos(agId, function(fotos) {
    var el2 = document.getElementById(wrapId);
    if (el2) el2.innerHTML = _fotologConteudo(agId, fotos);
  });
}

function _fotologConteudo(agId, fotos) {
  // Agrupa por data+servico
  var grupos = {};
  fotos.forEach(function(f) {
    var key = (f.grupoId || f.data) + '||' + (f.servico || '');
    if (!grupos[key]) grupos[key] = { data: f.data, servico: f.servico || '', fotos: [] };
    grupos[key].fotos.push(f);
  });
  var keys = Object.keys(grupos).sort(function(a,b){ return b.localeCompare(a); });

  var fotosHtml = keys.length === 0
    ? '<div class="fotolog-vazio">📷 Nenhuma foto ainda — use o botão 📷 em cada sessão para registrar</div>'
    : '<div class="fotolog-grid">' + keys.map(function(k) {
        var g = grupos[k];
        var antes = g.fotos.find(function(f){ return f.tipo === 'antes'; });
        var depois = g.fotos.find(function(f){ return f.tipo === 'depois'; });
        return '<div class="fotolog-card">'
          + '<div class="fotolog-card-header">'
          + '<span class="fotolog-card-data">📅 ' + fmtDate(g.data) + '</span>'
          + '<span class="fotolog-card-servico">' + (g.servico || '—') + '</span>'
          + '<button onclick="excluirGrupoFoto(\'' + agId + '\',\'' + k + '\')" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px;padding:0 2px" title="Excluir registro">✕</button>'
          + '</div>'
          + '<div class="fotolog-fotos">'
          + _fotoSlot(agId, k, antes, 'antes')
          + _fotoSlot(agId, k, depois, 'depois')
          + '</div>'
          + '<div class="fotolog-foto-obs"><input type="text" placeholder="Observação..." value="' + (g.fotos[0] && g.fotos[0].obs ? g.fotos[0].obs : '') + '" onchange="salvarObsFoto(\'' + agId + '\',\'' + k + '\',this.value)" style="width:100%;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:Jost,sans-serif;outline:none;box-sizing:border-box"></div>'
          + '</div>';
      }).join('') + '</div>';

  return '<div class="fotolog-wrap">'
    + '<div class="fotolog-titulo"><span>📷 Fotolog de Evolução</span></div>'
    + fotosHtml
    + '</div>';
}

function _fotoSlot(agId, grupoKey, foto, tipo) {
  if (foto) {
    return '<div class="fotolog-foto-wrap" onclick="abrirLightbox(\'' + foto.url.replace(/'/g,"\\'") + '\')">'
      + '<img src="' + foto.url + '" alt="' + tipo + '" loading="lazy">'
      + '<div class="fotolog-foto-label">' + tipo + '</div>'
      + '<button class="fotolog-foto-del" onclick="event.stopPropagation();excluirFoto(\'' + agId + '\',\'' + foto.id + '\')" title="Remover foto">✕</button>'
      + '</div>';
  }
  // Slot vazio com grupoKey existente: abre seletor direto sem modal
  var inputId = 'slot_' + tipo + '_' + grupoKey.replace(/[^a-z0-9]/gi,'_');
  return '<div class="fotolog-foto-empty" onclick="document.getElementById(\'' + inputId + '\').click()">'
    + '<span style="font-size:20px">+</span>'
    + '<span>' + tipo + '</span>'
    + '<input type="file" id="' + inputId + '" accept="image/*" style="display:none"'
    + ' data-agid="' + agId + '" data-grupokey="' + grupoKey.replace(/"/g,'&quot;') + '" data-tipo="' + tipo + '">'
    + '</div>';
}

function abrirModalNovaFoto(agId, grupoKeyPre, tipoPre) {
  var ag = db.agenda.find(function(x){ return x.id === agId; });
  if (!ag) return;
  var servicosChips = db.servicos.filter(function(s){ return s.status==='ativo'; }).map(function(s){
    return '<span class="service-chip" style="font-size:12px;cursor:pointer" onclick="this.classList.toggle(\'selected\')">' + s.nome + '</span>';
  }).join('');
  var hoje = _hoje();

  var modal = document.createElement('div');
  modal.id = 'modal-foto';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9995;display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:440px;width:100%;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35)">'
    + '<div style="background:linear-gradient(135deg,#1C1C1E,#2C2C2E);padding:1.1rem 1.5rem;display:flex;justify-content:space-between;align-items:center">'
    + '<span style="color:#FAF0F2;font-family:Cormorant Garamond,serif;font-size:17px;letter-spacing:1.5px">📷 Novo Registro de Evolução</span>'
    + '<button onclick="document.getElementById(\'modal-foto\').remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer">✕</button>'
    + '</div>'
    + '<div style="padding:1.25rem 1.5rem">'
    + '<div style="font-size:12px;color:var(--text-light);margin-bottom:1rem">Cliente: <strong style="color:var(--text-dark)">' + ag.cliente + '</strong></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">'
    + '<div><label style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;display:block;margin-bottom:4px">Data</label>'
    + '<input type="date" id="nf-data" value="' + hoje + '" style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px;font-size:13px;font-family:Jost,sans-serif;outline:none;box-sizing:border-box"></div>'
    + '</div>'
    + '<div style="margin-bottom:1rem"><label style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;display:block;margin-bottom:6px">Tratamentos (selecione um ou mais)</label>'
    + '<div id="nf-chips" style="display:flex;flex-wrap:wrap;gap:6px;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--off-white);min-height:38px">' + servicosChips + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">'
    + _uploadSlot('nf-antes', 'Foto Antes', tipoPre === 'antes')
    + _uploadSlot('nf-depois', 'Foto Depois', tipoPre === 'depois')
    + '</div>'
    + '<div style="margin-bottom:1rem"><label style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;display:block;margin-bottom:4px">Observação</label>'
    + '<input type="text" id="nf-obs" placeholder="Ex: Resultado após 3 sessões..." style="width:100%;padding:0.5rem;border:1px solid var(--border);border-radius:8px;font-size:13px;font-family:Jost,sans-serif;outline:none;box-sizing:border-box"></div>'
    + '<div style="display:flex;gap:0.75rem">'
    + '<button class="btn btn-primary" onclick="salvarNovaFoto(\'' + agId + '\')">✓ Salvar Fotos</button>'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'modal-foto\').remove()">Cancelar</button>'
    + '</div></div></div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

function _uploadSlot(id, label, destaque) {
  return '<div>'
    + '<label style="font-size:10px;letter-spacing:2px;color:var(--text-light);text-transform:uppercase;display:block;margin-bottom:4px">' + label + '</label>'
    + '<label for="' + id + '" id="' + id + '_label" style="display:flex;flex-direction:column;align-items:center;justify-content:center;border:' + (destaque ? '2px dashed var(--gold)' : '1.5px dashed var(--border)') + ';border-radius:8px;padding:1rem;cursor:pointer;min-height:80px;background:' + (destaque ? 'var(--rose-light)' : 'var(--off-white)') + ';transition:all 0.15s">'
    + '<span style="font-size:22px">📷</span>'
    + '<span style="font-size:11px;color:var(--text-light);margin-top:4px">Toque para selecionar</span>'
    + '</label>'
    + '<input type="file" id="' + id + '" accept="image/*" style="display:none" onchange="previewFoto(\'' + id + '\')">'
    + '</div>';
}

function previewFoto(inputId) {
  var input = document.getElementById(inputId);
  var label = document.getElementById(inputId + '_label');
  if (!input || !input.files || !input.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    label.innerHTML = '<img src="' + e.target.result + '" style="max-height:100px;max-width:100%;border-radius:6px;object-fit:cover">'
      + '<span style="font-size:10px;color:var(--text-light);margin-top:4px">✓ Selecionada</span>';
    label.style.padding = '4px';
  };
  reader.readAsDataURL(input.files[0]);
}

function salvarNovaFoto(agId) {
  var data = (document.getElementById('nf-data')||{value:''}).value;
  var _sc = document.querySelectorAll('#nf-chips .service-chip.selected');
  var servico = Array.prototype.map.call(_sc, function(c){ return c.textContent.trim(); }).join(' + ');
  var obs = (document.getElementById('nf-obs')||{value:''}).value;
  var inpAntes = document.getElementById('nf-antes');
  var inpDepois = document.getElementById('nf-depois');

  if (!data) { showToast('Selecione a data!'); return; }
  // Permitir salvar só observação sem foto
  var _grupoId2 = uid();
  if (!inpAntes.files.length && !inpDepois.files.length) {
    if (!obs.trim()) { showToast('Adicione pelo menos uma foto ou escreva uma observação!'); return; }
    // Salvar só observação como registro de texto
    _idbSalvarFoto({ id: uid(), grupoId: _grupoId2, agId: agId, tipo: 'obs', url: '', data: data, servico: servico, obs: obs }, function() {
      renderAcomp();
      var m = document.getElementById('modal-foto');
      if (m) m.remove();
      showToast('📝 Observação salva!');
    });
    return;
  }

  var pendentes = 0;
  var novas = [];

  function _lerFoto(inp, tipo, cb) {
    if (!inp.files || !inp.files[0]) { cb(); return; }
    pendentes++;
    var reader = new FileReader();
    reader.onload = function(e) {
      novas.push({ id: uid(), grupoId: _grupoId, agId: agId, tipo: tipo, url: e.target.result, data: data, servico: servico, obs: obs });
      pendentes--;
      if (pendentes === 0) cb();
    };
    reader.readAsDataURL(inp.files[0]);
  }

  function _finalizar() {
    var pendSalvar = novas.length;
    if (pendSalvar === 0) { renderAcomp(); return; }
    novas.forEach(function(f) {
      _idbSalvarFoto(f, function() {
        pendSalvar--;
        if (pendSalvar === 0) {
          renderAcomp();
          var m = document.getElementById('modal-foto');
          if (m) m.remove();
          showToast('📷 Fotos salvas com sucesso!');
        }
      });
    });
  }

  var _grupoId = uid();
  if (inpAntes.files.length && inpDepois.files.length) {
    _lerFoto(inpAntes, 'antes', function() {
      _lerFoto(inpDepois, 'depois', _finalizar);
    });
  } else if (inpAntes.files.length) {
    _lerFoto(inpAntes, 'antes', _finalizar);
  } else {
    _lerFoto(inpDepois, 'depois', _finalizar);
  }
}

function excluirFoto(agId, fotoId) {
  if (!confirm('Remover esta foto?')) return;
  _idbExcluirFoto(fotoId, function() { renderAcomp(); showToast('Foto removida.'); });
}

function excluirGrupoFoto(agId, grupoKey) {
  if (!confirm('Excluir este registro de evolução (antes + depois)?')) return;
  var parts = grupoKey.split('||');
  var idOuData = parts[0], servico = parts[1] || '';
  _idbGetFotos(agId, function(fotos) {
    var paraExcluir = fotos.filter(function(f){
      // Filtra por grupoId se disponível, senão por data+servico
      if (f.grupoId && f.grupoId === idOuData) return true;
      return f.data === idOuData && (f.servico||'') === servico;
    });
    var pend = paraExcluir.length;
    if (pend === 0) { renderAcomp(); return; }
    paraExcluir.forEach(function(f) {
      _idbExcluirFoto(f.id, function() { pend--; if (pend === 0) { renderAcomp(); showToast('Registro excluído.'); } });
    });
  });
}

function salvarObsFoto(agId, grupoKey, obs) {
  var parts = grupoKey.split('||');
  var idOuData = parts[0], servico = parts[1] || '';
  _idbGetFotos(agId, function(fotos) {
    fotos.filter(function(f){
      if (f.grupoId && f.grupoId === idOuData) return true;
      return f.data === idOuData && (f.servico||'') === servico;
    }).forEach(function(f) { f.obs = obs; _idbSalvarFoto(f); });
  });
}

function abrirLightbox(url) {
  var lb = document.createElement('div');
  lb.className = 'foto-lightbox';
  lb.innerHTML = '<img src="' + url + '" alt="foto">'
    + '<button class="foto-lightbox-close" onclick="this.parentElement.remove()">✕</button>';
  lb.addEventListener('click', function(e){ if(e.target===lb) lb.remove(); });
  document.body.appendChild(lb);
}




