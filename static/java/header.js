document.addEventListener('DOMContentLoaded', function () {
    // ===== SOLUCIÓN SHADOW DOM - AISLAMIENTO TOTAL =====
    
    // Crear Shadow DOM para el header completo
    function encapsularHeaderEnShadowDOM() {
        const header = document.querySelector('header');
        if (!header) return;
        
        // Si ya tiene Shadow DOM, no hacer nada
        if (header.shadowRoot) return;
        
        // Crear shadow root con modo closed para máximo aislamiento
        const shadowRoot = header.attachShadow({ mode: 'closed' });
        
        // Clonar todo el contenido del header
        const headerContent = header.innerHTML;
        
        // Crear estilo encapsulado
        const styles = `
            <style>
            * {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                font-family: 'Inter', sans-serif !important;
            }
            
            :host {
                position: sticky !important;
                top: 0 !important;
                z-index: 1000 !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 16px 24px !important;
                background: #fff !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
                width: 100% !important;
            }
            
            .logo-container {
                flex: 0 0 auto !important;
            }
            
            .logo-img {
                height: 40px !important;
                width: auto !important;
            }
            
            .nav-menu {
                display: flex !important;
                gap: 24px !important;
                flex: 1 1 auto !important;
                justify-content: center !important;
                margin: 0 20px !important;
            }
            
            .nav-menu a {
                color: #1C1E21 !important;
                text-decoration: none !important;
                font-weight: 500 !important;
                transition: color 0.3s !important;
                white-space: nowrap !important;
            }
            
            .nav-menu a:hover {
                color: #2563eb !important;
            }
            
            .right-nav {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                flex: 0 0 auto !important;
            }
            
            .search-btn {
                background: none !important;
                border: none !important;
                width: 40px !important;
                height: 40px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                color: #2563eb !important;
                transition: transform .18s ease, background .18s ease !important;
            }
            
            .search-btn:hover {
                background: rgba(37, 99, 235, 0.1) !important;
            }
            
            .auth-icon {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-decoration: none !important;
                transition: all 0.3s !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                color: #2563eb !important;
                background: none !important;
            }
            
            .auth-icon:hover {
                background: rgba(37, 99, 235, 0.1) !important;
                transform: scale(1.1) !important;
            }
            
            .auth-icon svg {
                width: 22px !important;
                height: 22px !important;
            }
            
            .menu-btn {
                display: none !important;
                border: none !important;
                background: transparent !important;
                cursor: pointer !important;
                color: #1C1E21 !important;
                width: 32px !important;
                height: 32px !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 6px !important;
                transition: all 0.3s ease !important;
            }
            
            /* ESTILOS DEL POPUP DE BÚSQUEDA EN SHADOW DOM */
            .header-searchbar {
                position: fixed !important;
                top: 18px !important;
                left: 50% !important;
                transform: translate(-50%, 0) scale(1) !important;
                width: min(980px, calc(100% - 48px)) !important;
                max-width: 980px !important;
                height: 56px !important;
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                padding: 8px 14px !important;
                border-radius: 14px !important;
                background: rgba(255,255,255,0.96) !important;
                backdrop-filter: blur(10px) saturate(120%) !important;
                box-shadow: 0 10px 30px rgba(17,24,39,0.16), 0 0 0 3px rgba(37,99,235,0.06) !important;
                opacity: 1 !important;
                visibility: visible !important;
                transition: transform 240ms cubic-bezier(.2,.9,.2,1), opacity 200ms !important;
                z-index: 1200 !important;
                pointer-events: auto !important;
            }
            
            .header-search-overlay {
                position: fixed !important;
                inset: 0 !important;
                background: rgba(0,0,0,0.28) !important;
                backdrop-filter: blur(4px) !important;
                opacity: 1 !important;
                visibility: visible !important;
                transition: opacity 200ms ease !important;
                z-index: 1150 !important;
                pointer-events: auto !important;
            }
            
            .header-search-input {
                flex: 1 1 0 !important;
                border: none !important;
                background: transparent !important;
                font-size: 16px !important;
                padding: 10px 8px !important;
                outline: none !important;
                color: #111827 !important;
                border-radius: 10px !important;
                font-family: 'Inter', sans-serif !important;
                font-weight: 400 !important;
                line-height: 1.5 !important;
                width: 100% !important;
            }
            
            .header-search-form {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                width: 100% !important;
            }
            
            .header-searchbar .material-icons {
                font-size: 20px !important;
                color: #6b7280 !important;
                margin-left: 6px !important;
            }
            
            /* Responsive */
            @media (max-width: 1024px) {
                .nav-menu:not(.active) {
                    display: none !important;
                }
                
                .menu-btn {
                    display: flex !important;
                }
            }
            
            @media (max-width: 768px) {
                :host {
                    padding: 12px 16px !important;
                }
                
                .auth-icon, .search-btn {
                    width: 36px !important;
                    height: 36px !important;
                }
            }
            </style>
        `;
        
        // Insertar estilos y contenido en el shadow DOM
        shadowRoot.innerHTML = styles + headerContent;
        
        // Re-conectar los event listeners en el shadow DOM
        reconectarEventListeners(shadowRoot);
    }
    
    // Re-conectar todos los event listeners en el shadow DOM
    function reconectarEventListeners(shadowRoot) {
        // Buscar elementos dentro del shadow DOM
        const searchToggle = shadowRoot.getElementById('search-toggle');
        const searchBar = shadowRoot.getElementById('header-searchbar');
        const searchOverlay = shadowRoot.getElementById('header-search-overlay');
        const searchInput = shadowRoot.getElementById('header-search-input');
        const menuBtn = shadowRoot.querySelector('.menu-btn');
        const navMenu = shadowRoot.querySelector('.nav-menu');
        const menuOverlay = shadowRoot.getElementById('menuOverlay');
        
        // Sistema de búsqueda
        if (searchToggle && searchBar && searchOverlay) {
            function openSearch() {
                searchBar.classList.add('active');
                searchOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                setTimeout(() => searchInput?.focus(), 10);
            }
            
            function closeSearch() {
                searchBar.classList.remove('active');
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            searchToggle.addEventListener('click', openSearch);
            searchOverlay.addEventListener('click', closeSearch);
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && searchBar.classList.contains('active')) {
                    closeSearch();
                }
            });
        }
        
        // Menú hamburguesa
        if (menuBtn && navMenu && menuOverlay) {
            function toggleMenu() {
                const isMenuOpen = navMenu.classList.contains('active');
                if (isMenuOpen) {
                    closeMenu();
                } else {
                    openMenu();
                }
            }
            
            function openMenu() {
                navMenu.classList.add('active');
                menuBtn.classList.add('active');
                menuOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            
            function closeMenu() {
                navMenu.classList.remove('active');
                menuBtn.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
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
        }
    }
    
    // Ejecutar la encapsulación
    encapsularHeaderEnShadowDOM();
    
    // Fallback: si por alguna razón el Shadow DOM falla, usar protección agresiva
    setTimeout(function() {
        const header = document.querySelector('header');
        if (!header.shadowRoot) {
            console.warn('Shadow DOM falló, aplicando protección CSS agresiva');
            aplicarProteccionCSSAgresiva();
        }
    }, 100);
    
    function aplicarProteccionCSSAgresiva() {
        // Estilos que se inyectan con máxima prioridad
        const protectorStyles = `
            <style id="header-protector">
            header * {
                all: unset !important;
                font-family: 'Inter', sans-serif !important;
            }
            
            header {
                all: unset !important;
                position: sticky !important;
                top: 0 !important;
                z-index: 1000 !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 16px 24px !important;
                background: #fff !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
                width: 100% !important;
            }
            
            #header-searchbar {
                position: fixed !important;
                top: 18px !important;
                left: 50% !important;
                transform: translate(-50%, 0) scale(1) !important;
                width: min(980px, calc(100% - 48px)) !important;
                max-width: 980px !important;
                height: 56px !important;
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                padding: 8px 14px !important;
                border-radius: 14px !important;
                background: rgba(255,255,255,0.96) !important;
                backdrop-filter: blur(10px) saturate(120%) !important;
                box-shadow: 0 10px 30px rgba(17,24,39,0.16), 0 0 0 3px rgba(37,99,235,0.06) !important;
                opacity: 1 !important;
                visibility: visible !important;
                z-index: 1200 !important;
            }
            
            #header-search-input {
                all: unset !important;
                flex: 1 !important;
                font-size: 16px !important;
                padding: 10px 8px !important;
                color: #111827 !important;
                font-family: 'Inter', sans-serif !important;
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', protectorStyles);
    }
});

// Mantener la funcionalidad de notificación global
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