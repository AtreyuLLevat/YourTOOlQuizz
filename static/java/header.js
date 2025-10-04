document.addEventListener('DOMContentLoaded', function () {
    // ===== HEADER.JS CON PROTECCIÓN COMPLETA DE ESTILOS =====
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
    const searchForm = document.querySelector('.header-search-form');
    
    // ===== FUNCIÓN DE PROTECCIÓN COMPLETA =====
    function protegerEstilosBuscador() {
        if (!searchBar || !searchOverlay || !searchInput) return;
        
        // Estilos inmutables para la barra de búsqueda
        const estilosSearchBar = {
            position: 'fixed',
            top: '14px',
            left: '50%',
            transform: searchBar.classList.contains('active') 
                ? 'translate(-50%, 0) scale(1)' 
                : 'translate(-50%, -10px) scale(.98)',
            width: 'min(980px, calc(100% - 48px))',
            maxWidth: '980px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(10px) saturate(120%)',
            WebkitBackdropFilter: 'blur(10px) saturate(120%)',
            boxShadow: searchBar.classList.contains('active')
                ? '0 10px 30px rgba(17,24,39,0.16), 0 0 0 3px rgba(37,99,235,0.06)'
                : '0 10px 30px rgba(17,24,39,0.12)',
            opacity: searchBar.classList.contains('active') ? '1' : '0',
            visibility: searchBar.classList.contains('active') ? 'visible' : 'hidden',
            transition: 'transform 240ms cubic-bezier(.2,.9,.2,1), opacity 200ms, box-shadow 200ms',
            zIndex: '1200',
            pointerEvents: searchBar.classList.contains('active') ? 'auto' : 'none'
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
            WebkitBackdropFilter: 'blur(4px)',
            opacity: searchOverlay.classList.contains('active') ? '1' : '0',
            visibility: searchOverlay.classList.contains('active') ? 'visible' : 'hidden',
            transition: 'opacity 200ms ease',
            zIndex: '1150',
            pointerEvents: searchOverlay.classList.contains('active') ? 'auto' : 'none'
        };
        
        // Estilos inmutables para el INPUT (CRÍTICO)
        const estilosInput = {
            flex: '1 1 0',
            border: 'none',
            background: 'transparent',
            fontSize: '16px',
            padding: '10px 8px',
            outline: 'none',
            color: '#111827',
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            lineHeight: '1.5',
            width: '100%',
            minWidth: '0',
            margin: '0',
            boxShadow: 'none',
            appearance: 'none',
            WebkitAppearance: 'none'
        };
        
        // Estilos para el formulario
        const estilosForm = {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            margin: '0',
            padding: '0'
        };
        
        // Estilos para el ícono de búsqueda dentro del popup
        const searchIcon = searchBar.querySelector('.material-icons');
        if (searchIcon) {
            searchIcon.style.fontSize = '20px';
            searchIcon.style.color = '#6b7280';
            searchIcon.style.marginLeft = '6px';
            searchIcon.style.flexShrink = '0';
        }
        
        // Aplicar todos los estilos protegidos
        Object.assign(searchBar.style, estilosSearchBar);
        Object.assign(searchOverlay.style, estilosOverlay);
        Object.assign(searchInput.style, estilosInput);
        
        if (searchForm) {
            Object.assign(searchForm.style, estilosForm);
        }
        
        // Posición superior cuando está activo
        if (searchBar.classList.contains('active')) {
            searchBar.style.top = '18px';
        }
    }
    
    function openSearch() {
        searchBar.classList.add('active');
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Pequeño delay para asegurar que los estilos se aplican antes del focus
        setTimeout(() => {
            protegerEstilosBuscador();
            searchInput.focus();
        }, 10);
    }
    
    function closeSearch() {
        searchBar.classList.remove('active');
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        protegerEstilosBuscador();
    }
    
    // Aplicar protección inicial inmediatamente
    protegerEstilosBuscador();
    
    // Observador de mutaciones MÁS AGRESIVO
    const observer = new MutationObserver(function(mutations) {
        let necesitaProteccion = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (mutation.target === searchBar || 
                    mutation.target === searchOverlay || 
                    mutation.target === searchInput ||
                    mutation.target === searchForm) {
                    necesitaProteccion = true;
                }
            }
            
            // También proteger si se añaden clases de Conflictance
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('conflictance') || 
                    target.classList.contains('ctc') ||
                    target.getAttribute('class')?.includes('conflictance')) {
                    target.className = target.className.replace(/conflictance|ctc/g, '').trim();
                    necesitaProteccion = true;
                }
            }
        });
        
        if (necesitaProteccion) {
            setTimeout(protegerEstilosBuscador, 0);
        }
    });
    
    // Configuración completa del observador
    const observerConfig = {
        attributes: true,
        attributeFilter: ['style', 'class'],
        attributeOldValue: true,
        subtree: true
    };
    
    // Observar el contenedor completo del header
    const header = document.querySelector('header');
    if (header) {
        observer.observe(header, observerConfig);
    }
    
    // También observar elementos específicos
    [searchBar, searchOverlay, searchInput, searchForm].forEach(el => {
        if (el) observer.observe(el, observerConfig);
    });
    
    // Event listeners
    searchToggle.addEventListener('click', openSearch);
    searchOverlay.addEventListener('click', closeSearch);
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchBar.classList.contains('active')) {
            closeSearch();
        }
    });
    
    // Protección en múltiples eventos
    ['resize', 'scroll', 'focus', 'blur'].forEach(event => {
        window.addEventListener(event, protegerEstilosBuscador);
    });
    
    // Protección periódica más frecuente
    setInterval(protegerEstilosBuscador, 300);
    
    // Protección adicional en el input
    searchInput.addEventListener('input', protegerEstilosBuscador);
    searchInput.addEventListener('focus', protegerEstilosBuscador);
    searchInput.addEventListener('blur', protegerEstilosBuscador);

    // ===== PROTECCIÓN CONTRA ESTILOS INLINE DE CONFLICTANCE =====
    function limpiarEstilosConflictance() {
        // Remover estilos inline problemáticos
        document.querySelectorAll('*').forEach(el => {
            if (el.style && (el.style.fontFamily?.includes('Conflictance') || 
                             el.style.background?.includes('gradient') ||
                             el.style.borderRadius === '20px')) {
                el.style.fontFamily = 'Inter, sans-serif !important';
                el.style.background = '';
                el.style.borderRadius = '';
            }
        });
    }
    
    // Ejecutar limpieza periódica
    setInterval(limpiarEstilosConflictance, 500);
});

// menu.js - Script para el menú hamburguesa (sin cambios)
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const menuOverlay = document.getElementById('menuOverlay');
    const body = document.body;

    function toggleMenu() {
        const isMenuOpen = navMenu.classList.contains('active');
        isMenuOpen ? closeMenu() : openMenu();
    }

    function openMenu() {
        navMenu.classList.add('active');
        menuBtn.classList.add('active');
        menuOverlay.classList.add('active');
        body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        menuBtn.classList.remove('active');
        menuOverlay.classList.remove('active');
        body.style.overflow = '';
    }

    menuBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleMenu();
    });

    menuOverlay.addEventListener('click', closeMenu);
    
    const menuLinks = navMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024 && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
});