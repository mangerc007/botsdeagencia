/**
 * ============================================================
 * BOTS DE AGENCIA — main.js
 * ============================================================
 * Cubre:
 *   1. Navbar: scroll-aware + hamburger mobile
 *   2. Scroll animations (Intersection Observer)
 *   3. FAQ accordion
 *   4. Form validation + submit handler
 *   5. Thank-you screen reveal
 *
 * ── WEBHOOK INTEGRATION ─────────────────────────────────────
 * Para conectar el formulario a n8n, Zapier, Make u otro:
 *
 *   const WEBHOOK_URL = 'https://tu-dominio.app.n8n.cloud/webhook/diagnostico';
 *   // o Make: 'https://hook.eu1.make.com/xxxxxxxxxxxx'
 *   // o Zapier: 'https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/'
 *
 * Descomentar el bloque fetch() dentro de handleFormSubmit()
 * y reemplazar WEBHOOK_URL con tu endpoint real.
 * ────────────────────────────────────────────────────────────
 */

'use strict';

/* ══════════════════════════════════════════════════════════
   1. NAVBAR
══════════════════════════════════════════════════════════ */
(function initNav() {
  const nav        = document.getElementById('main-nav');
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');

  if (!nav) return;

  // Scroll-aware styling
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load

  // Mobile hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');

      // Animate hamburger to X
      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.cssText = 'transform: translateY(7px) rotate(45deg)';
        spans[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
        spans[2].style.cssText = 'transform: translateY(-7px) rotate(-45deg)';
      } else {
        spans.forEach(s => s.removeAttribute('style'));
      }
    });

    // Close mobile menu on link click
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
   2. SCROLL ANIMATIONS (fade-up)
══════════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Fire once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   3. FAQ ACCORDION
══════════════════════════════════════════════════════════ */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', !isOpen);
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   4. FORM VALIDATION + SUBMIT HANDLER
══════════════════════════════════════════════════════════ */
(function initForm() {
  const form          = document.getElementById('diagnostic-form');
  const thankyouScreen = document.getElementById('thankyou-screen');
  const btnSubmit     = document.getElementById('btn-submit');
  const btnText       = document.getElementById('btn-submit-text');
  const btnSpinner    = document.getElementById('btn-submit-spinner');

  if (!form || !thankyouScreen) return;

  // ── Validation helpers ────────────────────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\+\d\s\-\(\)]{6,20}$/;

  function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (!field || !error) return;
    field.style.borderColor = 'rgba(248, 113, 113, 0.7)';
    field.style.boxShadow   = '0 0 0 3px rgba(248, 113, 113, 0.12)';
    error.textContent = message;
    error.style.display = 'block';
  }

  function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (!field || !error) return;
    field.style.borderColor = '';
    field.style.boxShadow   = '';
    error.style.display = 'none';
  }

  function validateForm(data) {
    let valid = true;
    clearError('field-email',    'email-error');
    clearError('field-whatsapp', 'whatsapp-error');

    if (!data.email || !emailRegex.test(data.email)) {
      showError('field-email', 'email-error', 'Ingresa un correo electrónico válido.');
      valid = false;
    }
    if (!data.whatsapp || !phoneRegex.test(data.whatsapp)) {
      showError('field-whatsapp', 'whatsapp-error', 'Ingresa un número de WhatsApp válido.');
      valid = false;
    }
    return valid;
  }

  // ── Real-time error clearing ──────────────────────────────
  document.getElementById('field-email')?.addEventListener('input', () => clearError('field-email', 'email-error'));
  document.getElementById('field-whatsapp')?.addEventListener('input', () => clearError('field-whatsapp', 'whatsapp-error'));

  // ── Loading state ─────────────────────────────────────────
  function setLoading(loading) {
    if (!btnSubmit || !btnText || !btnSpinner) return;
    btnSubmit.disabled    = loading;
    btnText.textContent   = loading ? 'Enviando...' : 'Agendar diagnóstico';
    btnSpinner.style.display = loading ? 'inline-block' : 'none';
  }

  // ── Show thank-you screen ─────────────────────────────────
  function showThankYou() {
    form.style.display = 'none';
    thankyouScreen.classList.add('visible');

    // Scroll form card into view
    thankyouScreen.closest('.form-card')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  // ── Main submit handler ───────────────────────────────────
  async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {
      nombre:         formData.get('nombre')         || '',
      empresa:        formData.get('empresa')        || '',
      email:          formData.get('email')          || '',
      whatsapp:       formData.get('whatsapp')       || '',
      tipo_empleado:  formData.get('tipo_empleado')  || '',
      proceso_actual: formData.get('proceso_actual') || '',
      origen:         'landing_botsdeagencia',
      timestamp:      new Date().toISOString(),
    };

    // Client-side validation
    if (!validateForm(data)) return;

    setLoading(true);

    /*
    ══════════════════════════════════════════════════════════
    WEBHOOK INTEGRATION — descomenta y configura para activar
    ══════════════════════════════════════════════════════════

    const WEBHOOK_URL = 'https://tu-webhook.com/endpoint';
    // Ejemplo n8n: 'https://tu-instancia.n8n.cloud/webhook/diagnostico-bda'
    // Ejemplo Make: 'https://hook.eu1.make.com/xxxxxxxxxxxxxxxxxxxx'
    // Ejemplo Zapier: 'https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/'

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Agrega headers de autenticación si tu webhook lo requiere:
          // 'Authorization': 'Bearer TU_TOKEN',
          // 'x-api-key': 'TU_API_KEY',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // El webhook respondió con error — mostrar gracias igual
        // para no bloquear la UX. Loguear para debugging:
        console.error('[BDA] Webhook error:', response.status, await response.text());
      }
    } catch (err) {
      // Error de red — no bloquear al usuario
      console.error('[BDA] Webhook fetch error:', err);
    }
    ══════════════════════════════════════════════════════════
    FIN WEBHOOK INTEGRATION
    ══════════════════════════════════════════════════════════
    */

    // Simulate async delay until webhook is connected
    await new Promise(resolve => setTimeout(resolve, 900));

    setLoading(false);
    showThankYou();
  }

  form.addEventListener('submit', handleFormSubmit);
})();


/* ══════════════════════════════════════════════════════════
   5. SMOOTH SCROLL for anchor links (fallback for older browsers)
══════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   6. HERO CARD — animated typing indicator loop
══════════════════════════════════════════════════════════ */
(function initHeroAnimation() {
  // The typing animation is pure CSS — no JS needed.
  // This section reserved for future hero interactivity.
})();
