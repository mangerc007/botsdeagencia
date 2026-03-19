/**
 * ============================================================
 * BOTS DE AGENCIA — main.js  v2
 * ============================================================
 * Módulos:
 *   1. Navbar scroll-aware + hamburger
 *   2. Scroll animations (IntersectionObserver)
 *   3. FAQ accordion
 *   4. Form: validación + envío a webhook + pantalla de gracias
 *   5. Bot de agendamiento post-submit
 *   6. Smooth scroll fallback
 *
 * ════════════════════════════════════════════════════════════
 * GUÍA DE INTEGRACIÓN — lee esto antes de editar
 * ════════════════════════════════════════════════════════════
 *
 * Hay DOS cosas que debes configurar:
 *
 *  A) WEBHOOK de captura de leads (n8n / Make / Zapier / BotWe)
 *     ──────────────────────────────────────────────────────
 *     Busca la constante:
 *       const WEBHOOK_LEADS_URL = '...'
 *     Reemplaza la URL de prueba por la de tu plataforma.
 *
 *  B) BOT DE AGENDAMIENTO post-submit
 *     ──────────────────────────────────────────────────────
 *     Hay dos modos, elige uno:
 *
 *     MODO 1 — WhatsApp (más simple, funciona siempre)
 *       Busca: const WHATSAPP_NUMBER = '...'
 *       Pon tu número en formato internacional sin +
 *       Ejemplo: '51987654321'  (Perú 9 dígitos)
 *
 *     MODO 2 — Widget embebido (Calendly, Tidio, BotWe, etc.)
 *       Activa SCHEDULING_MODE = 'widget'
 *       y completa WIDGET_EMBED_HTML con el snippet de tu bot.
 *
 * ════════════════════════════════════════════════════════════
 */

'use strict';

/* ────────────────────────────────────────────────────────────
   ██████╗  ██████╗ ███╗   ██╗███████╗██╗ ██████╗
   ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
   ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
   ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
   ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
    ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
   Todas las URLs y números configurables están aquí.
   ────────────────────────────────────────────────────────── */

/**
 * ── A) WEBHOOK DE CAPTURA DE LEADS ───────────────────────────
 *
 * Reemplaza por tu URL real. Ejemplos:
 *   n8n:    'https://mi-instancia.n8n.cloud/webhook/diagnostico-bda'
 *   Make:   'https://hook.eu1.make.com/XXXXXXXXXXXXXXXXXX'
 *   Zapier: 'https://hooks.zapier.com/hooks/catch/XXXXX/YYYYY/'
 *   BotWe:  'https://api.botwe.io/v1/webhook/XXXXXXXXXX'
 *
 * Mientras no tengas URL real, se usa el endpoint de prueba
 * (httpbin.org) que acepta POST y devuelve los datos enviados.
 */
const WEBHOOK_LEADS_URL = 'https://bots-de-agencia-n8n.ftl4jk.easypanel.host/webhook/efb5ccb7-a2f9-4fa0-ab2c-7b156a148bbc';
//                         ↑ Webhook n8n — Production URL del trigger


/**
 * ── B) MODO DEL BOT DE AGENDAMIENTO ─────────────────────────
 *
 * 'whatsapp' → muestra botón verde con link wa.me  (default)
 * 'widget'   → inyecta el HTML de tu widget embebido
 */
const SCHEDULING_MODE = 'whatsapp';
//                        ↑ Cambia a 'widget' si usas bot web


/**
 * ── B.1) WHATSAPP — número y mensaje ─────────────────────────
 *
 * Número sin + ni espacios. Formato internacional.
 * Ejemplo Perú: '51987654321'
 * El mensaje se personaliza con el nombre del lead.
 */
const WHATSAPP_NUMBER = '51999999999';
//                        ↑ REEMPLAZA con tu número real

/** Texto del mensaje de WhatsApp (se codifica automáticamente) */
function buildWhatsAppText(nombre) {
  const saludo = nombre ? `Hola, soy ${nombre}.` : 'Hola.';
  return `${saludo} Acabo de completar el formulario de diagnóstico en botsdeagencia.com y quiero agendar mi llamada de 30 minutos con un especialista en empleados virtuales.`;
}


/**
 * ── B.2) WIDGET EMBEBIDO ─────────────────────────────────────
 *
 * Si usas Calendly, Tidio, BotWe, Landbot, HubSpot Meetings
 * u otro bot web, pega aquí el snippet que te da la plataforma.
 *
 * Ejemplos:
 *
 *   Calendly inline:
 *     '<div class="calendly-inline-widget" data-url="https://calendly.com/tu-link"
 *      style="min-width:320px;height:630px;"></div>
 *      <script src="https://assets.calendly.com/assets/external/widget.js" async></script>'
 *
 *   BotWe / Landbot iframe:
 *     '<iframe src="https://landbot.io/u/XXXXXX/index.html"
 *      style="width:100%;height:500px;border:none;border-radius:12px;"></iframe>'
 *
 *   Tidio / Intercom: solo necesitas cargar su script en <head>
 *     y llamar window.tidioChatApi.open() — ver initSchedulingBot()
 */
const WIDGET_EMBED_HTML = `
  <!-- REEMPLAZA ESTE BLOQUE con el snippet de tu bot de agendamiento -->
  <div style="
    background: rgba(124,58,237,0.08);
    border: 1px dashed rgba(124,58,237,0.4);
    border-radius: 12px;
    padding: 32px 24px;
    text-align: center;
    font-family: 'Space Grotesk', sans-serif;
  ">
    <p style="color:#a78bfa;font-weight:600;margin-bottom:8px;">📅 Widget de agendamiento</p>
    <p style="color:#9490b0;font-size:14px;line-height:1.6;">
      Pega aquí el snippet de tu bot (Calendly, BotWe, Landbot, etc.)<br>
      Edita la constante <code style="color:#f5c518">WIDGET_EMBED_HTML</code> en main.js
    </p>
  </div>
`;


/* ════════════════════════════════════════════════════════════
   FIN CONFIGURACIÓN — no necesitas editar debajo de esta línea
   salvo que quieras cambiar comportamiento avanzado.
   ════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════
   1. NAVBAR
══════════════════════════════════════════════════════════ */
(function initNav() {
  const nav        = document.getElementById('main-nav');
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');

  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.cssText = 'transform: translateY(7px) rotate(45deg)';
        spans[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
        spans[2].style.cssText = 'transform: translateY(-7px) rotate(-45deg)';
      } else {
        spans.forEach(s => s.removeAttribute('style'));
      }
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menú');
        hamburger.querySelectorAll('span').forEach(s => s.removeAttribute('style'));
      });
    });
  }
})();


/* ══════════════════════════════════════════════════════════
   2. SCROLL ANIMATIONS
══════════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  elements.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   3. FAQ ACCORDION
══════════════════════════════════════════════════════════ */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;
  items.forEach(item => {
    const q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(o => { o.classList.remove('open'); o.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false'); });
      item.classList.toggle('open', !isOpen);
      q.setAttribute('aria-expanded', !isOpen);
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   4. FORM: VALIDACIÓN + ENVÍO + GRACIAS + BOT
══════════════════════════════════════════════════════════ */
(function initForm() {
  const form           = document.getElementById('diagnostic-form');
  const thankyouScreen = document.getElementById('thankyou-screen');
  const btnSubmit      = document.getElementById('btn-submit');
  const btnText        = document.getElementById('btn-submit-text');
  const btnSpinner     = document.getElementById('btn-submit-spinner');

  if (!form || !thankyouScreen) return;

  // ── Validación ────────────────────────────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\+\d\s\-\(\)]{6,20}$/;

  function setFieldError(fieldId, errorId, msg) {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errorId);
    if (f) { f.style.borderColor = 'rgba(248,113,113,0.7)'; f.style.boxShadow = '0 0 0 3px rgba(248,113,113,0.12)'; }
    if (e) { e.textContent = msg; e.style.display = 'block'; }
  }
  function clearFieldError(fieldId, errorId) {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errorId);
    if (f) { f.style.borderColor = ''; f.style.boxShadow = ''; }
    if (e) { e.style.display = 'none'; }
  }
  function validateForm(data) {
    let ok = true;
    clearFieldError('field-email', 'email-error');
    clearFieldError('field-whatsapp', 'whatsapp-error');
    if (!data.email || !emailRegex.test(data.email)) {
      setFieldError('field-email', 'email-error', 'Ingresa un correo electrónico válido.'); ok = false;
    }
    if (!data.whatsapp || !phoneRegex.test(data.whatsapp)) {
      setFieldError('field-whatsapp', 'whatsapp-error', 'Ingresa un número de WhatsApp válido.'); ok = false;
    }
    return ok;
  }
  document.getElementById('field-email')?.addEventListener('input', () => clearFieldError('field-email', 'email-error'));
  document.getElementById('field-whatsapp')?.addEventListener('input', () => clearFieldError('field-whatsapp', 'whatsapp-error'));

  // ── Estado de carga ───────────────────────────────────────
  function setLoading(on) {
    if (btnSubmit) btnSubmit.disabled = on;
    if (btnText)   btnText.textContent = on ? 'Enviando...' : 'Agendar diagnóstico';
    if (btnSpinner) btnSpinner.style.display = on ? 'inline-block' : 'none';
  }

  // ── Envío al webhook ──────────────────────────────────────
  async function sendToWebhook(data) {
    /**
     * Esta función llama al WEBHOOK_LEADS_URL definido arriba.
     * Si el webhook falla (error de red o status no-OK),
     * lo logueamos pero NO bloqueamos la UX — el usuario
     * siempre ve la pantalla de gracias.
     */
    try {
      const res = await fetch(WEBHOOK_LEADS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          /**
           * Si tu webhook requiere autenticación, agrégala aquí:
           * 'Authorization': 'Bearer TU_TOKEN_AQUI',
           * 'x-api-key': 'TU_API_KEY_AQUI',
           */
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        console.warn('[BDA] Webhook respondió con error:', res.status, await res.text().catch(() => ''));
      } else {
        console.info('[BDA] Lead enviado correctamente al webhook.');
      }
    } catch (err) {
      console.warn('[BDA] Error de red al llamar webhook:', err.message);
      // No relanzamos — la UX no se bloquea por errores del webhook
    }
  }

  // ── Mostrar pantalla de gracias ───────────────────────────
  function showThankYou(data) {
    // 1. Ocultar formulario con fade
    form.style.transition = 'opacity 0.3s ease';
    form.style.opacity = '0';
    setTimeout(() => {
      form.style.display = 'none';
      // 2. Mostrar pantalla de gracias
      thankyouScreen.classList.add('visible');
      // 3. Inyectar bot de agendamiento
      initSchedulingBot(data);
      // 4. Hacer scroll para que sea visible sin esfuerzo
      requestAnimationFrame(() => {
        thankyouScreen.closest('.form-card')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      });
    }, 280);
  }

  // ── Submit handler ────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      nombre:         fd.get('nombre')         || '',
      empresa:        fd.get('empresa')        || '',
      email:          fd.get('email')          || '',
      whatsapp:       fd.get('whatsapp')       || '',
      tipo_empleado:  fd.get('tipo_empleado')  || '',
      proceso_actual: fd.get('proceso_actual') || '',
      origen:         'landing_botsdeagencia',
      timestamp:      new Date().toISOString(),
    };

    if (!validateForm(data)) return;
    setLoading(true);

    // Llamada al webhook (no bloqueante si falla)
    await sendToWebhook(data);

    setLoading(false);
    showThankYou(data);
  }

  form.addEventListener('submit', handleSubmit);
})();


/* ══════════════════════════════════════════════════════════
   5. BOT DE AGENDAMIENTO — se activa tras el submit
══════════════════════════════════════════════════════════ */

/**
 * initSchedulingBot(data)
 * ─────────────────────────────────────────────────────────
 * Se llama automáticamente después de mostrar la pantalla
 * de gracias. Recibe los datos del formulario para poder
 * personalizar el mensaje o el contexto del widget.
 *
 * Según SCHEDULING_MODE inyecta:
 *   'whatsapp' → botón verde wa.me con mensaje personalizado
 *   'widget'   → HTML del widget embebido
 */
function initSchedulingBot(data) {
  const container = document.getElementById('scheduling-bot-container');
  if (!container) return;

  if (SCHEDULING_MODE === 'widget') {
    /**
     * MODO WIDGET — inyecta el snippet del bot
     * ─────────────────────────────────────────
     * El HTML en WIDGET_EMBED_HTML puede contener <script> tags.
     * Los insertamos como nodos reales para que el browser los ejecute.
     */
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'scheduling-widget-wrapper';

    // Insertar HTML del widget
    const tmp = document.createElement('div');
    tmp.innerHTML = WIDGET_EMBED_HTML;

    // Mover nodos (ejecuta scripts inline)
    Array.from(tmp.childNodes).forEach(node => {
      if (node.tagName === 'SCRIPT') {
        const s = document.createElement('script');
        if (node.src) s.src = node.src;
        else s.textContent = node.textContent;
        s.async = true;
        wrapper.appendChild(s);
      } else {
        wrapper.appendChild(node.cloneNode(true));
      }
    });

    container.appendChild(wrapper);
    container.style.display = 'block';

    /**
     * ── INTEGRACIÓN DE CHATS EXTERNOS ────────────────────────
     * Si usas Tidio, Intercom o LiveChat que se cargan en <head>,
     * puedes abrir su chat programáticamente desde aquí:
     *
     * Tidio:
     *   window.tidioChatApi?.open();
     *
     * Intercom:
     *   window.Intercom?.('show');
     *
     * LiveChat:
     *   window.LC_API?.open_chat_window();
     *
     * BotWe (si usa método JS):
     *   window.BotWe?.open();
     */

  } else {
    /**
     * MODO WHATSAPP (default)
     * ─────────────────────────────────────────────────────────
     * Construye el botón con número y mensaje personalizados.
     * El nombre del lead se incluye en el mensaje de apertura.
     */
    const nombre  = data?.nombre  || '';
    const msgText = buildWhatsAppText(nombre);
    const waUrl   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msgText)}`;

    container.innerHTML = `
      <a
        href="${waUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="thankyou-wa"
        id="wa-schedule-btn"
        aria-label="Agendar diagnóstico por WhatsApp (se abre en nueva pestaña)"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        Agendar por WhatsApp ahora
      </a>
      <p class="thankyou-note">
        También nos pondremos en contacto contigo por correo en las próximas horas.
      </p>
    `;
    container.style.display = 'block';

    // Auto-focus accesible en el botón
    requestAnimationFrame(() => {
      document.getElementById('wa-schedule-btn')?.focus({ preventScroll: true });
    });
  }
}


/* ══════════════════════════════════════════════════════════
   6. SMOOTH SCROLL fallback
══════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
})();
