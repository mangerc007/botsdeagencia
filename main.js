/**
 * ============================================================
 * BOTS DE AGENCIA — main.js  v3
 * ============================================================
 * Módulos:
 *   1. Navbar scroll-aware + hamburger
 *   2. Scroll animations (IntersectionObserver)
 *   3. FAQ accordion
 *   4. Form: validación + envío a webhook + pantalla de gracias
 *   5. Chat bot conversacional post-submit
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
 *  B) WHATSAPP — número real
 *     ──────────────────────────────────────────────────────
 *     Busca: const WHATSAPP_NUMBER = '...'
 *     Pon tu número en formato internacional sin +
 *     Ejemplo: '51987654321'  (Perú 9 dígitos)
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
 *
 * Mientras no tengas URL real, se usa el endpoint de prueba
 * (httpbin.org) que acepta POST y devuelve los datos enviados.
 */
const WEBHOOK_LEADS_URL = 'https://bots-de-agencia-n8n.ftl4jk.easypanel.host/webhook-test/efb5ccb7-a2f9-4fa0-ab2c-7b156a148bbc';
//                         ↑ TEST URL — requiere "Listen for test event" activo en n8n
//
// Cuando tu workflow esté activo (toggle verde), cambia a Production URL:
// const WEBHOOK_LEADS_URL = 'https://bots-de-agencia-n8n.ftl4jk.easypanel.host/webhook/efb5ccb7-a2f9-4fa0-ab2c-7b156a148bbc';


/**
 * ── B) WHATSAPP — número y mensaje ─────────────────────────────
 *
 * Número sin + ni espacios. Formato internacional.
 * Ejemplo Perú: '51987654321'
 * El chat bot personaliza el mensaje con el nombre del lead.
 */
const WHATSAPP_NUMBER = '51999999999';
//                        ↑ REEMPLAZA con tu número real

/** Texto del mensaje de WhatsApp (se codifica automáticamente) */
function buildWhatsAppText(nombre) {
  const saludo = nombre ? `Hola, soy ${nombre}.` : 'Hola.';
  return `${saludo} Acabo de completar el formulario de diagnóstico en botsdeagencia.com y quiero agendar mi llamada de 30 minutos con un especialista en empleados virtuales.`;
}


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
   4. FORM: VALIDACIÓN + ENVÍO + GRACIAS + CHAT BOT
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
    try {
      const res = await fetch(WEBHOOK_LEADS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        console.warn('[BDA] Webhook respondió con error:', res.status, await res.text().catch(() => ''));
      } else {
        console.info('[BDA] Lead enviado correctamente al webhook.');
      }
    } catch (err) {
      console.warn('[BDA] Error de red al llamar webhook:', err.message);
    }
  }

  // ── Mostrar pantalla de gracias ───────────────────────────
  function showThankYou(data) {
    form.style.transition = 'opacity 0.3s ease';
    form.style.opacity = '0';
    setTimeout(() => {
      form.style.display = 'none';
      thankyouScreen.classList.add('visible');
      // Iniciar chat bot conversacional
      initChatBot(data);
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
    await sendToWebhook(data);
    setLoading(false);
    showThankYou(data);
  }

  form.addEventListener('submit', handleSubmit);
})();


/* ══════════════════════════════════════════════════════════
   5. CHAT BOT CONVERSACIONAL — se activa tras el submit
══════════════════════════════════════════════════════════ */

/* ── Helpers ──────────────────────────────────────────── */
function labelTipoEmpleado(val) {
  const map = {
    'agendamiento':     'Agente de agendamiento',
    'atencion':         'Atención al cliente 24/7',
    'ventas':           'Agente de ventas',
    'seguimiento':      'Seguimiento de leads',
    'administrativo':   'Asistente administrativo',
    'otro':             'Empleado virtual personalizado',
  };
  return map[val] || val || 'empleado virtual';
}

function formatPhone(raw) {
  // Limpia el número: quita todo excepto dígitos y +
  return raw ? raw.replace(/[^\d+]/g, '') : WHATSAPP_NUMBER;
}

/* ── Flujo del chat ───────────────────────────────────── */
/**
 * Cada paso tiene:
 *   id         — identificador único del paso
 *   botMsgs    — array de mensajes del bot (strings o función(data))
 *   replies    — array de { label, next, isWA?, isInput? }
 *   inputMode  — true → mostrar campo de texto libre en lugar de quick replies
 */
const CHAT_FLOW = [
  {
    id: 'welcome',
    botMsgs: [
      (d) => `¡Hola${d.nombre ? ', ' + d.nombre : ''}! 👋 Soy Aria, la asistente virtual de Bots de Agencia.`,
      (d) => `Recibí tu solicitud para un ${labelTipoEmpleado(d.tipo_empleado)}. Estoy aquí para ayudarte a agendar tu diagnóstico gratuito de 30 minutos con uno de nuestros especialistas.`,
      '¿Cómo quieres continuar?',
    ],
    replies: [
      { label: '¡Perfecto, sigamos! 🚀', next: 'horario' },
      { label: 'Tengo una duda', next: 'duda' },
    ],
  },
  {
    id: 'duda',
    botMsgs: ['Claro, con gusto te respondo. ¿Sobre qué quieres saber más?'],
    replies: [
      { label: '¿Es realmente gratis?', next: 'gratis' },
      { label: '¿Cuánto tarda implementar un bot?', next: 'tiempo' },
      { label: 'Ya no tengo dudas 👍', next: 'horario' },
    ],
  },
  {
    id: 'gratis',
    botMsgs: [
      '¡Sí, 100% gratuito y sin compromiso! 🎁',
      'En la llamada analizamos tu proceso actual, te mostramos qué se puede automatizar y te damos una propuesta clara. Sin letras pequeñas.',
    ],
    replies: [
      { label: 'Quiero agendar ahora', next: 'horario' },
      { label: '¿Y cuánto tarda la implementación?', next: 'tiempo' },
    ],
  },
  {
    id: 'tiempo',
    botMsgs: [
      'Los primeros resultados los ves entre 7 y 14 días hábiles ⚡',
      'Empezamos con el proceso más crítico de tu negocio, lo automatizamos y medimos resultados desde el primer mes.',
    ],
    replies: [
      { label: 'Quiero agendar', next: 'horario' },
    ],
  },
  {
    id: 'horario',
    botMsgs: [
      'Perfecto. ¿Qué día te viene mejor para la llamada? 📅',
      'La sesión dura 30 minutos y es 100% por videollamada.',
    ],
    replies: [
      { label: 'Hoy o mañana', next: 'confirmar' },
      { label: 'Esta semana', next: 'confirmar' },
      { label: 'La próxima semana', next: 'confirmar' },
    ],
    _selectedSlot: null, // se guarda al elegir
  },
  {
    id: 'confirmar',
    botMsgs: [
      (d) => `Excelente${d.nombre ? ', ' + d.nombre : ''}! 🙌`,
      (d) => `Voy a conectarte ahora mismo con un especialista por WhatsApp para confirmar el horario exacto de tu diagnóstico sobre ${labelTipoEmpleado(d.tipo_empleado)}.`,
      'Presiona el botón de abajo para abrir WhatsApp con el mensaje listo.',
    ],
    replies: [
      { label: '💬 Abrir WhatsApp ahora', next: 'whatsapp', isWA: true },
      { label: 'Prefiero que me escriban a mí', next: 'esperar' },
    ],
  },
  {
    id: 'esperar',
    botMsgs: [
      '¡Anotado! 📝 Un especialista se pondrá en contacto contigo en las próximas 2-4 horas hábiles.',
      (d) => `Te escribiremos al correo ${d.email} y también al WhatsApp ${d.whatsapp ? d.whatsapp : 'que nos dejaste'}.`,
      '¿Hay algo más en lo que pueda ayudarte?',
    ],
    replies: [
      { label: 'No, ¡gracias! 🎉', next: 'fin' },
      { label: 'Sí, tengo otra pregunta', next: 'duda' },
    ],
  },
  {
    id: 'fin',
    botMsgs: [
      '¡Perfecto! Estamos muy emocionados de trabajar contigo. 🚀',
      'Revisa tu correo en los próximos minutos — te enviaremos un resumen y los próximos pasos.',
      '¿Nos vemos pronto?',
    ],
    replies: [
      { label: '¡Hasta pronto! 👋', next: null },
      { label: 'Abrir WhatsApp igual', next: 'whatsapp', isWA: true },
    ],
  },
  {
    id: 'whatsapp',
    botMsgs: [
      (d) => `Abriendo WhatsApp con el mensaje listo para ${d.nombre || 'ti'}...`,
    ],
    replies: [
      { label: '💬 Ir a WhatsApp', next: null, isWA: true },
    ],
    _autoWA: true,
  },
];

/* ── Motor del chat bot ──────────────────────────────── */
function initChatBot(data) {
  // Guardamos datos en window para posibles integraciones externas
  window.__leadData = data;

  const widget      = document.getElementById('chat-widget');
  const messagesEl  = document.getElementById('chat-messages');
  const repliesEl   = document.getElementById('chat-replies');
  const inputRow    = document.getElementById('chat-input-row');
  const chatInput   = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send');

  if (!widget || !messagesEl || !repliesEl) return;

  // Mostrar el widget
  widget.style.display = 'flex';

  let currentStep = null;
  let selectedSlot = '';

  /* Añade un mensaje al chat con animación */
  function appendMsg(text, role) {
    const msg = document.createElement('div');
    msg.className = `chat-msg chat-msg--${role}`;

    if (role === 'bot') {
      // Avatar del bot
      const avatar = document.createElement('div');
      avatar.className = 'chat-msg__avatar';
      avatar.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
      msg.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg__bubble';
    bubble.textContent = text;
    msg.appendChild(bubble);

    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* Muestra el indicador de escritura y lo elimina al terminar */
  function showTyping() {
    const bubble = document.createElement('div');
    bubble.className = 'chat-typing-bubble';
    bubble.id = 'chat-typing';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  /* Envía mensajes del bot de forma secuencial con delays */
  function botSay(messages, onDone) {
    if (!messages || !messages.length) { if (onDone) onDone(); return; }
    let i = 0;
    function sendNext() {
      if (i >= messages.length) { if (onDone) onDone(); return; }
      const rawMsg = messages[i];
      const text   = typeof rawMsg === 'function' ? rawMsg(data) : rawMsg;
      i++;

      // Mostrar indicador de escritura
      const typingEl = showTyping();
      const delay = Math.min(600 + text.length * 18, 2200);

      setTimeout(() => {
        typingEl.remove();
        appendMsg(text, 'bot');
        // Pausa pequeña entre mensajes consecutivos
        setTimeout(sendNext, i < messages.length ? 300 : 0);
      }, delay);
    }
    sendNext();
  }

  /* Renderiza los botones de quick reply */
  function renderReplies(replies) {
    repliesEl.innerHTML = '';
    if (!replies || !replies.length) {
      repliesEl.style.display = 'none';
      return;
    }
    repliesEl.style.display = 'flex';
    replies.forEach(reply => {
      const btn = document.createElement('button');
      btn.className = 'chat-reply-btn';
      btn.textContent = reply.label;
      btn.addEventListener('click', () => handleReply(reply));
      repliesEl.appendChild(btn);
    });
  }

  /* Maneja la selección de una quick reply */
  function handleReply(reply) {
    // Deshabilitar todos los botones
    repliesEl.querySelectorAll('.chat-reply-btn').forEach(b => b.disabled = true);
    repliesEl.style.opacity = '0.5';

    // Mostrar respuesta del usuario
    appendMsg(reply.label.replace(/[🚀🎁⚡📅🙌💬📝🎉👋👍]/gu, '').trim(), 'user');

    // Si es acción WhatsApp
    if (reply.isWA) {
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppText(data.nombre))}`;
      // Abre en nueva pestaña
      setTimeout(() => window.open(waUrl, '_blank', 'noopener,noreferrer'), 400);

      // Mostrar mensaje de confirmación
      setTimeout(() => {
        repliesEl.style.display = 'none';
        repliesEl.innerHTML = '';
        const waBtn = document.createElement('a');
        waBtn.href    = waUrl;
        waBtn.target  = '_blank';
        waBtn.rel     = 'noopener noreferrer';
        waBtn.className = 'chat-reply-btn chat-reply-btn--wa';
        waBtn.textContent = '💬 Ir a WhatsApp';
        repliesEl.appendChild(waBtn);
        repliesEl.style.display = 'flex';
        repliesEl.style.opacity = '1';
        botSay(['¡Listo! Se abrió WhatsApp con el mensaje personalizado. Si no se abrió automáticamente, usa el botón de abajo. 👇']);
      }, 600);
      return;
    }

    // Avanzar al siguiente paso
    if (reply.next) {
      setTimeout(() => goToStep(reply.next), 500);
    } else {
      // Fin del flujo
      setTimeout(() => {
        repliesEl.innerHTML = '';
        repliesEl.style.display = 'none';
        botSay(['¡Fue un placer! Hasta pronto. 👋']);
      }, 400);
    }
  }

  /* Navega a un paso del flujo */
  function goToStep(stepId) {
    const step = CHAT_FLOW.find(s => s.id === stepId);
    if (!step) return;
    currentStep = step;

    repliesEl.innerHTML = '';
    repliesEl.style.display = 'none';
    repliesEl.style.opacity = '1';

    // Auto-abrir WA en paso whatsapp
    if (step._autoWA) {
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppText(data.nombre))}`;
      setTimeout(() => window.open(waUrl, '_blank', 'noopener,noreferrer'), 600);
    }

    botSay(step.botMsgs, () => {
      renderReplies(step.replies);
    });
  }

  // Iniciar flujo desde el primer paso
  goToStep('welcome');
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
