
  // header.js (versión robusta)
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Pequeño fallback para showNotification (evita ReferenceError)
  function showNotification(msg) {
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification(msg);
        return;
      }
    } catch (e) { /* ignore */ }

    // Toast simple
    const id = 'ytq-toast';
    let toast = document.getElementById(id);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = id;
      toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#111;color:#fff;padding:10px 14px;border-radius:8px;z-index:3000;opacity:0;transition:opacity .2s';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(()=> toast.remove(), 250); }, 2200);
  }

  /* ===== MENU MÓVIL ===== */
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      let mobileMenu = document.querySelector('.mobile-menu');

      if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.style.cssText = `
          position: fixed;
          top: 70px;
          left: 0;
          width: 100%;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 20px;
          z-index: 999;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        `;
        mobileMenu.innerHTML = `
          <nav style="display:flex;flex-direction:column;gap:15px;text-align:center">
            <a href="#" style="text-decoration:none;color:#2563eb;font-weight:500;padding:10px">Inicio</a>
            <a href="#" style="text-decoration:none;color:#2563eb;font-weight:500;padding:10px">Quizzes</a>
            <a href="#" style="text-decoration:none;color:#2563eb;font-weight:500;padding:10px">Blog</a>
            <a href="#" style="text-decoration:none;color:#2563eb;font-weight:500;padding:10px">Beneficios</a>
            <a href="#" style="text-decoration:none;color:#2563eb;font-weight:500;padding:10px">Contacto</a>
          </nav>
        `;
        document.body.appendChild(mobileMenu);
      }

      const isOpen = mobileMenu.style.transform === 'translateY(0%)';
      mobileMenu.style.transform = isOpen ? 'translateY(-100%)' : 'translateY(0%)';

      const icon = menuBtn.querySelector('i');
      if (icon) icon.className = isOpen ? 'fas fa-bars' : 'fas fa-times';
    });
  }

  /* ===== AUTH SIMULADA ===== */
  const authSection = document.getElementById('auth-section');
  let isLoggedIn = false;

  function toggleAuth() {
    isLoggedIn = !isLoggedIn;
    if (!authSection) return;

    if (isLoggedIn) {
      authSection.innerHTML = `
        <a class="btn-logout desktop-only" href="/logout">Cerrar sesión</a>
        <a class="btn-logout mobile-only" href="/logout" title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3H10a2 2 0 00-2 2v4h2V5h10v14H10v-4H8v4a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"/>
          </svg>
        </a>
      `;
      showNotification('¡Bienvenido a YourToolQuizz!');
    } else {
      authSection.innerHTML = `
        <a class="btn-login desktop-only" href="/login">Iniciar sesión</a>
        <a class="btn-login mobile-only" href="/login" title="Iniciar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4zm0-2a4 4 0 110-8 4 4 0 010 8z"/>
          </svg>
        </a>
      `;
      showNotification('Sesión cerrada correctamente');
    }
  }

  document.addEventListener('click', function (e) {
    if (e.target && (e.target.closest('.btn-login') || e.target.closest('.btn-logout'))) {
      e.preventDefault();
      toggleAuth();
    }
  });

  /* ===== BOCADILLO DE BÚSQUEDA ===== */
  const searchToggle = document.getElementById('search-toggle');
  const searchPopup = document.getElementById('search-popup');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = (searchPopup && searchPopup.querySelector('.search-popup-input')) || document.querySelector('.search-popup-input');

  if (searchToggle && searchPopup && searchOverlay) {
    // abrir / cerrar
    searchToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const nowOpen = !searchPopup.classList.contains('active');
      searchPopup.classList.toggle('active', nowOpen);
      searchOverlay.classList.toggle('active', nowOpen);
      searchToggle.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');

      if (nowOpen && searchInput) setTimeout(() => searchInput.focus(), 80);
    });

    // clic en overlay => cerrar
    searchOverlay.addEventListener('click', function () {
      searchPopup.classList.remove('active');
      searchOverlay.classList.remove('active');
      searchToggle.setAttribute('aria-expanded', 'false');
    });

    // ESC => cerrar
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchPopup.classList.contains('active')) {
        searchPopup.classList.remove('active');
        searchOverlay.classList.remove('active');
        searchToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // clic fuera (por si el overlay no cubre)
    document.addEventListener('click', function (e) {
      if (searchPopup.classList.contains('active')) {
        if (!searchPopup.contains(e.target) && !searchToggle.contains(e.target)) {
          searchPopup.classList.remove('active');
          searchOverlay.classList.remove('active');
          searchToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // evitar que clics dentro cierren por burbujeo
    searchPopup.addEventListener('click', function (e) { e.stopPropagation(); });
  } else {
    console.warn('Elementos del popup de búsqueda no encontrados:', { searchToggle, searchPopup, searchOverlay });
  }
});