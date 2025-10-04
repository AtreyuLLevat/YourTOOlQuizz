document.addEventListener('DOMContentLoaded', function () {
    // ===== HEADER.JS CON PROTECCIÓN DE ESTILOS =====
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
    
    // ===== FUNCIÓN DE PROTECCIÓN DE ESTILOS =====
    function protegerEstilosBuscador() {
        if (!searchBar || !searchOverlay) return;
        
        // Estilos inmutables para la barra de búsqueda
        const estilosSearchBar = {
            position: 'fixed',
            top: '14px',
            left: '50%',
            transform: 'translate(-50%, -10px) scale(.98)',
            width: 'min(980px, calc(100% - 48px))',
            maxWidth: '980px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.86)',
            backdropFilter: 'blur(10px) saturate(120%)',
            boxShadow: '0 10px 30px rgba(17,24,39,0.12)',
            opacity: '0',
            visibility: 'hidden',
            transition: 'transform 240ms cubic-bezier(.2,.9,.2,1), opacity 200ms',
            zIndex: '1200',
            pointerEvents: 'none'
        };
        
        // Estilos inmutables para el overlay
        const estilosOverlay = {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0,0,0,0.28)',
            backdropFilter: 'blur(4px)',
            opacity: '0',
            visibility: 'hidden',
            transition: 'opacity 200ms ease',
            zIndex: '1150',
            pointerEvents: 'none'
        };
        
        // Aplicar estilos protegidos
        Object.assign(searchBar.style, estilosSearchBar);
        Object.assign(searchOverlay.style, estilosOverlay);
        
        // Estilos específicos cuando está activo
        if (searchBar.classList.contains('active')) {
            searchBar.style.transform = 'translate(-50%, 0) scale(1)';
            searchBar.style.opacity = '1';
            searchBar.style.visibility = 'visible';
            searchBar.style.pointerEvents = 'auto';
            searchBar.style.top = '18px';
            
            searchOverlay.style.opacity = '1';
            searchOverlay.style.visibility = 'visible';
            searchOverlay.style.pointerEvents = 'auto';
        }
    }
    
    function openSearch() {
        searchBar.classList.add('active');
        searchOverlay.classList.add('active');
        searchInput.focus();
        document.body.style.overflow = 'hidden';
        protegerEstilosBuscador(); // Reforzar estilos al abrir
    }
    
    function closeSearch() {
        searchBar.classList.remove('active');
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        protegerEstilosBuscador(); // Reforzar estilos al cerrar
    }
    
    // Aplicar protección inicial
    protegerEstilosBuscador();
    
    // Observador de mutaciones para proteger contra cambios dinámicos
    const observer = new MutationObserver(function(mutations) {
        let necesitaProteccion = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                (mutation.target === searchBar || mutation.target === searchOverlay) &&
                mutation.attributeName === 'style') {
                necesitaProteccion = true;
            }
        });
        
        if (necesitaProteccion) {
            protegerEstilosBuscador();
        }
    });
    
    // Iniciar observación
    if (searchBar && searchOverlay) {
        observer.observe(searchBar, { attributes: true, attributeFilter: ['style'] });
        observer.observe(searchOverlay, { attributes: true, attributeFilter: ['style'] });
    }
    
    // Event listeners
    searchToggle.addEventListener('click', openSearch);
    searchOverlay.addEventListener('click', closeSearch);
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchBar.classList.contains('active')) {
            closeSearch();
        }
    });
    
    // Proteger en resize y scroll
    window.addEventListener('resize', protegerEstilosBuscador);
    window.addEventListener('scroll', protegerEstilosBuscador);
    
    // Protección periódica (fallback)
    setInterval(protegerEstilosBuscador, 1000);
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
    }

    // Función para cerrar el menú
    function closeMenu() {
        navMenu.classList.remove('active');
        menuBtn.classList.remove('active');
        menuOverlay.classList.remove('active');
        body.style.overflow = '';
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