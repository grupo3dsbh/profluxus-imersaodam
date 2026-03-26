/* ============================================================
   INICIALIZAÇÃO DO CONFIG + MODAL TYPEBOT
   Profluxus Conexão — scriptconexao.js
============================================================ */

(function () {

  /* ── CSS variables: podem ser aplicadas antes do DOM ── */
  if (CONFIG.cores) {
    const root = document.documentElement.style;
    const c = CONFIG.cores;
    if (c.gold)       root.setProperty('--gold',       c.gold);
    if (c.gold_light) root.setProperty('--gold-light', c.gold_light);
    if (c.teal)       root.setProperty('--teal',       c.teal);
    if (c.deep)       root.setProperty('--deep',       c.deep);
    if (c.navy)       root.setProperty('--navy',       c.navy);
    if (c.white)      root.setProperty('--white',      c.white);
  }

  /* ── Variáveis de estado da modal ── */
  const steps      = CONFIG.modal.steps;
  let currentStep  = 0;
  const leadData   = {};
  let partialTimer = null;
  let partialSent  = false;
  let completeSent = false;
  const PARTIAL_DELAY = 3 * 60 * 1000; // 3 minutos

  /* ── Referências ao DOM (preenchidas no DOMContentLoaded) ── */
  let overlay, modalBody, progress, progLbl, closeBtn;

  /* ============================================================
     HELPERS
  ============================================================ */
  function interpolate(str) {
    return (str || '').replace(/\{(\w+)\}/g, (_, k) => leadData[k] || '');
  }

  /* ============================================================
     MODAL — OPEN / CLOSE
  ============================================================ */
  function openModal() {
    currentStep  = 0;
    partialSent  = false;
    completeSent = false;
    clearTimeout(partialTimer);
    Object.keys(leadData).forEach(k => delete leadData[k]);
    renderStep(0);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';

    /* Envio parcial ao fechar se tiver nome + whatsapp */
    if (!partialSent && !completeSent && leadData.nome && leadData.whatsapp) {
      partialSent = true;
      clearTimeout(partialTimer);
      sendWebhook('parcial');
    }
  }

  /* ============================================================
     TIMER DE ABANDONO
  ============================================================ */
  function startPartialTimer() {
    if (partialSent || completeSent) return;
    if (!leadData.nome || !leadData.whatsapp) return;
    clearTimeout(partialTimer);
    partialTimer = setTimeout(() => {
      if (partialSent || completeSent) return;
      partialSent = true;
      sendWebhook('parcial_timeout');
    }, PARTIAL_DELAY);
  }

  /* ============================================================
     PROGRESS BAR
  ============================================================ */
  function updateProgress(idx) {
    const inputSteps = steps.filter(s => s.tipo !== 'confirm');
    const total = inputSteps.length;
    if (steps[idx] && steps[idx].tipo === 'confirm') {
      progress.style.width = '100%';
      progLbl.textContent  = 'Concluído! 🎉';
      return;
    }
    const pct = total ? Math.round((idx / total) * 100) : 0;
    progress.style.width = pct + '%';
    progLbl.textContent  = `${idx + 1} de ${total}`;
  }

  /* ============================================================
     RENDER DISPATCHER
  ============================================================ */
  function renderStep(idx) {
    const step = steps[idx];
    updateProgress(idx);
    modalBody.innerHTML = '';
    if (step.tipo === 'confirm') { renderConfirm(step); return; }
    if (step.tipo === 'radio')   { renderRadio(step);   return; }
    if (step.tipo === 'multi')   { renderMulti(step);   return; }
  }

  /* Cabecalho padrao */
  function makeHeader(step, wrap) {
    if (step.icone) {
      const ico = document.createElement('div');
      ico.className   = 'ms-icon';
      ico.textContent = step.icone;
      wrap.appendChild(ico);
    }
    const q = document.createElement('div');
    q.className = 'modal-question';
    q.innerHTML = interpolate(step.pergunta);
    wrap.appendChild(q);
    if (step.subtitulo) {
      const sub = document.createElement('div');
      sub.className   = 'modal-question-desc';
      sub.textContent = step.subtitulo;
      wrap.appendChild(sub);
    }
  }

  /* RADIO com emoji cards */
  function renderRadio(step) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-step active';
    makeHeader(step, wrap);

    const grid = document.createElement('div');
    grid.className = 'modal-radio-grid';

    step.options.forEach(opt => {
      const isObj = typeof opt === 'object';
      const label = isObj ? opt.label : opt;
      const value = isObj ? opt.value : opt;
      const emoji = isObj ? opt.emoji : null;

      const card = document.createElement('div');
      card.className = 'modal-radio-option';
      card.innerHTML = emoji
        ? `<span class="ro-emoji">${emoji}</span><span class="ro-label">${label}</span><span class="ro-check">&#10003;</span>`
        : `<div class="modal-radio-dot"></div><span class="ro-label">${label}</span><span class="ro-check">&#10003;</span>`;

      card.addEventListener('click', () => {
        grid.querySelectorAll('.modal-radio-option').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        leadData[step.key] = value;
        setTimeout(() => nextStep(), 320);
      });
      grid.appendChild(card);
    });

    wrap.appendChild(grid);
    modalBody.appendChild(wrap);
  }

  /* MULTI - varios campos numa tela */
  function renderMulti(step) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-step active';
    makeHeader(step, wrap);

    const fieldsWrap = document.createElement('div');
    fieldsWrap.className = 'ms-fields';

    const errGlobal = document.createElement('div');
    errGlobal.className   = 'modal-error';
    errGlobal.id          = 'modalError';
    errGlobal.textContent = 'Preencha os campos obrigatorios para continuar.';

    step.campos.forEach(campo => {
      const group = document.createElement('div');
      group.className = 'ms-field-group';

      const lbl = document.createElement('label');
      lbl.className   = 'ms-label';
      lbl.textContent = campo.label + (campo.obrigatorio ? ' *' : '');
      group.appendChild(lbl);

      let el;

      if (campo.input === 'select') {
        el = document.createElement('select');
        el.className = 'modal-input modal-select';
        const ph = document.createElement('option');
        ph.value       = '';
        ph.textContent = 'Selecione...';
        ph.disabled    = true;
        ph.selected    = true;
        el.appendChild(ph);
        campo.options.forEach(opt => {
          const o   = document.createElement('option');
          const obj = typeof opt === 'object';
          o.value       = obj ? opt.value : opt;
          o.textContent = obj ? opt.label : opt;
          if (leadData[campo.key] === o.value) o.selected = true;
          el.appendChild(o);
        });
        el.addEventListener('change', () => {
          leadData[campo.key] = el.value;
          errGlobal.classList.remove('show');
        });

      } else {
        el = document.createElement('input');
        el.className    = 'modal-input';
        el.type         = campo.input === 'email' ? 'email' : campo.input === 'phone' ? 'tel' : 'text';
        el.placeholder  = campo.placeholder || '';
        el.autocomplete = campo.input === 'email' ? 'email' : campo.input === 'phone' ? 'tel' : 'given-name';
        if (leadData[campo.key]) el.value = leadData[campo.key];
        el.addEventListener('input',   () => { leadData[campo.key] = el.value.trim(); errGlobal.classList.remove('show'); });
        el.addEventListener('keydown', e  => { if (e.key === 'Enter') nextStep(); });
      }

      group.appendChild(el);
      fieldsWrap.appendChild(group);
    });

    wrap.appendChild(fieldsWrap);
    wrap.appendChild(errGlobal);

    const btn = document.createElement('button');
    btn.className   = 'modal-next-btn';
    btn.textContent = CONFIG.modal.btn_proximo;
    btn.addEventListener('click', nextStep);
    wrap.appendChild(btn);

    modalBody.appendChild(wrap);

    const firstInput = wrap.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  /* CONFIRM */
  function renderConfirm(step) {
    progress.style.width = '100%';
    progLbl.textContent  = 'Concluido! 🎉';
    modalBody.innerHTML  = `
      <div class="modal-step active modal-confirm">
        <div class="modal-confirm-icon">🔥</div>
        <div class="modal-confirm-title">${interpolate(step.pergunta)}</div>
        <p class="modal-confirm-desc">${interpolate(step.descricao)}</p>
        <a href="${CONFIG.links.grupo_whatsapp || '#'}" target="_blank" rel="noopener noreferrer" class="modal-confirm-btn">
          ${CONFIG.modal.btn_entrar}
        </a>
      </div>
    `;
  }

  /* ============================================================
     NEXT STEP
  ============================================================ */
  function nextStep() {
    const step = steps[currentStep];
    const err  = document.getElementById('modalError');

    if (step.tipo === 'multi') {
      const faltando = step.campos
        .filter(c => c.obrigatorio)
        .some(c => !leadData[c.key] || String(leadData[c.key]).trim() === '');
      if (faltando) { if (err) err.classList.add('show'); return; }
    }

    if (step.tipo === 'radio' && step.obrigatorio) {
      if (!leadData[step.key]) { if (err) err.classList.add('show'); return; }
    }

    /* Apos step 2 (index 1 = WhatsApp) inicia timer de abandono */
    if (currentStep === 1 && leadData.nome && leadData.whatsapp) {
      startPartialTimer();
    }

    currentStep++;

    /* Ultima pergunta respondida: envia completo */
   if (currentStep >= steps.length || steps[currentStep].tipo === 'confirm') {
      const confirmStep = steps.find(s => s.tipo === 'confirm');
      renderConfirm(confirmStep || { pergunta: 'Obrigado!', descricao: '' });
      clearTimeout(partialTimer);
      if (!completeSent) {
        completeSent = true;
        partialSent  = true;
        sendWebhook('completo');
      }
      return;
    }

    renderStep(currentStep);
  }

  /* ============================================================
     WEBHOOK
  ============================================================ */
  async function sendWebhook(tipo) {
    const url = CONFIG.modal.webhook_url;
    if (!url) return;
    try {
      const payload = {
        ...leadData,
        evento:         CONFIG.evento.nome,
        data_inscricao: new Date().toISOString(),
        envio_tipo:     tipo,
      };
      await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      console.log('[Profluxus] Webhook enviado —', tipo, payload);
    } catch (e) {
      console.warn('[Profluxus] Webhook falhou:', e);
    }
  }

  /* ============================================================
     DOM CONTENT LOADED — tudo que precisa do DOM vai aqui
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {

    /* Referencias */
    overlay   = document.getElementById('modalOverlay');
    modalBody = document.getElementById('modalBody');
    progress  = document.getElementById('modalProgressFill');
    progLbl   = document.getElementById('modalProgressLabel');
    closeBtn  = document.getElementById('modalClose');

    /* Aplica fontes */
    if (CONFIG.fontes) {
      const f = CONFIG.fontes;
      document.querySelectorAll('.hero-title, .section-title, .speaker-name, .modal-question, .modal-confirm-title')
        .forEach(el => el.style.fontFamily = f.titulo);
      document.querySelectorAll('.nav-cta, .btn-primary, .cta-btn, .modal-next-btn, .modal-confirm-btn, .cta-inline-btn')
        .forEach(el => el.style.fontFamily = f.botoes);
      document.body.style.fontFamily = f.corpo;
    }

    /* Aplica textos do evento */
    const ev = CONFIG.evento;
    if (ev) {
      const setText = (id, txt) => { const el = document.getElementById(id); if (el && txt) el.textContent = txt; };
      setText('navLogo',        ev.nome);
      setText('footerLogo',     ev.nome);
      setText('navDate',        ev.data + ' · ' + ev.tipo);
      setText('footerSub',      'Evento online · ' + ev.data + ' de ' + ev.ano + ' · Gratuito');
      setText('floatDate',      ev.badge_float);
      setText('modalBrandName', ev.nome);
    }

    /* Bind eventos da modal */
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
    document.querySelectorAll('.js-open-modal').forEach(function(el) {
      el.addEventListener('click', function(e) { e.preventDefault(); openModal(); });
    });

    /* Scroll reveal */
    const reveals = document.querySelectorAll('.reveal');
    const revObs  = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function(r) { revObs.observe(r); });

    /* ============================================================
       FOTOS
    ============================================================ */

    function applyPhoto(imgSrc, placeholderId, altText) {
      if (!imgSrc) return;
      var placeholder = document.getElementById(placeholderId);
      if (!placeholder) return;
      placeholder.style.display = 'none';
      var frame = placeholder.closest('.photo-frame') || placeholder.parentElement;
      var img = document.createElement('img');
      img.src           = imgSrc;
      img.alt           = altText;
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;display:block;';
      var badge = frame.querySelector('.photo-badge-float');
      if (badge) { frame.insertBefore(img, badge); } else { frame.appendChild(img); }
    }

    function applyFullPhoto(imgSrc, placeholderId, altText) {
      if (!imgSrc) return;
      var ph = document.getElementById(placeholderId);
      if (!ph) return;
      var img = document.createElement('img');
      img.src = imgSrc;
      img.alt = altText;
      ph.replaceWith(img);
    }

    function applyMiniPhoto(imgSrc, miniId) {
      if (!imgSrc) return;
      var mini = document.getElementById(miniId);
      if (!mini) return;
      mini.textContent  = '';
      var img = document.createElement('img');
      img.src           = imgSrc;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:50%;display:block;';
      mini.appendChild(img);
    }

    applyPhoto(CONFIG.fotos.gilson, 'photoGilsonWrap', 'Foto Gilson Junio');

    applyFullPhoto(CONFIG.fotos.gilson,     'fullPhotoGilson',     'Gilson Junio');
    applyFullPhoto(CONFIG.fotos.ragner,     'fullPhotoRagner',     'Ragner Antony');
    applyFullPhoto(CONFIG.fotos.alessandra, 'fullPhotoAlessandra', 'Alessandra');

    applyMiniPhoto(CONFIG.fotos.gilson,     'miniPhotoGilson');
    applyMiniPhoto(CONFIG.fotos.ragner,     'miniPhotoRagner');
    applyMiniPhoto(CONFIG.fotos.alessandra, 'miniPhotoAlessandra');

    /* ============================================================
       SPEAKERS EXPAND + AUTO-ROTATE
    ============================================================ */
    var spGrid  = document.getElementById('speakersGrid');
    var spCards = spGrid ? Array.prototype.slice.call(spGrid.querySelectorAll('.speaker-card')) : [];

    function expandCard(card) {
      spCards.forEach(function(c) { c.classList.remove('expanded'); });
      card.classList.add('expanded');
      spGrid.classList.add('has-expanded');
    }

    spCards.forEach(function(card) {
      card.addEventListener('mouseenter', function() { expandCard(card); });
      card.addEventListener('click',      function() { expandCard(card); });
    });

    if (spCards.length) expandCard(spCards[0]);

    var autoIndex   = 0;
    var mouseOnGrid = false;

    setInterval(function() {
      if (mouseOnGrid) return;
      autoIndex = (autoIndex + 1) % spCards.length;
      expandCard(spCards[autoIndex]);
    }, 15000);

    spGrid.addEventListener('mouseenter', function() { mouseOnGrid = true; });
    spGrid.addEventListener('mouseleave', function() {
      mouseOnGrid = false;
      autoIndex   = spCards.findIndex(function(c) { return c.classList.contains('expanded'); });
    });
    
    window.__profluxus = { sendWebhook };

  }); // fim DOMContentLoaded

})();