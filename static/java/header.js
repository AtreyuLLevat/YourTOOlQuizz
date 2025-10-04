 document.addEventListener('DOMContentLoaded', function () {
 // ===== HEADER.JS =====
    function showNotification(msg) {
        const id = 'ytq-toast';
        let toast = document.getElementById(id);
        if (!toast) {
            toast = document.createElement('div');
            toast.id = id;
            toast.style.cssText = `
                position:fixed;bottom:20px;right:20px;
                background:#111;color:#fff;
                padding:10px 14px;border-radius:8px;
                z-index:3000;opacity:0;transition:opacity .2s
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        requestAnimationFrame(() => toast.style.opacity = '1');
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 250);
        }, 2200);
    }

    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('header-searchbar');
    const searchOverlay = document.getElementById('header-search-overlay');
    const searchInput = document.getElementById('header-search-input');
    
    function openSearch() {
      searchBar.classList.add('active');
      searchOverlay.classList.add('active');
      searchInput.focus();
      document.body.style.overflow = 'hidden';
    }
    
    function closeSearch() {
      searchBar.classList.remove('active');
      searchOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    searchToggle.addEventListener('click', openSearch);
    searchOverlay.addEventListener('click', closeSearch);
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchBar.classList.contains('active')) {
        closeSearch();
      }
    });
  });
  // menu.js - Script para el menú hamburguesa
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const menuOverlay = document.getElementById('menuOverlay');
    const body = document.body;

    // Función para abrir/cerrar el menú
    function toggleMenu() {
        const isMenuOpen = navMenu.classList.contains('active');
        
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // Función para abrir el menú
    function openMenu() {
        navMenu.classList.add('active');
        menuBtn.classList.add('active');
        menuOverlay.classList.add('active');
        body.style.overflow = 'hidden';
        
        // Cambiar ícono a "X"
        const icon = menuBtn.querySelector('i');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    }

    // Función para cerrar el menú
    function closeMenu() {
        navMenu.classList.remove('active');
        menuBtn.classList.remove('active');
        menuOverlay.classList.remove('active');
        body.style.overflow = '';
        
        // Cambiar ícono a hamburguesa
        const icon = menuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }

    // Event listener para el botón del menú
    menuBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleMenu();
    });

    // Cerrar menú al hacer clic en el overlay
    menuOverlay.addEventListener('click', closeMenu);

    // Cerrar menú al hacer clic en un enlace
    const menuLinks = navMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Cerrar menú al cambiar tamaño de ventana a desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024 && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
});