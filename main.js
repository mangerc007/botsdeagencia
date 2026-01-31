// ===========================
// main.js  -  BOTS DE AGENCIA
// ===========================

// Toggle menú móvil
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav-open');
  });
}

// Cerrar menú al hacer clic en un enlace (mejor UX móvil)
if (navLinks) {
  navLinks.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      navLinks.classList.remove('nav-open');
    }
  });
}

// Año dinámico en el footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// (Opcional) Listener del formulario solo a nivel visual
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Gracias por tu interés. Este formulario es una demo visual. Integraremos el envío con tu CRM o herramienta de email.');
  });
}
