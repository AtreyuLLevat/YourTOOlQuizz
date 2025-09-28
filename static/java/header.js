        // MENÚ MÓVIL
        const menuBtn = document.querySelector('.menu-btn');
        
        menuBtn.addEventListener('click', function() {
            // Crear menú desplegable si no existe
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
                    <nav style="display: flex; flex-direction: column; gap: 15px; text-align: center;">
                        <a href="#" style="text-decoration: none; color: #2563eb; font-weight: 500; padding: 10px;">Inicio</a>
                        <a href="#" style="text-decoration: none; color: #2563eb; font-weight: 500; padding: 10px;">Quizzes</a>
                        <a href="#" style="text-decoration: none; color: #2563eb; font-weight: 500; padding: 10px;">Blog</a>
                        <a href="#" style="text-decoration: none; color: #2563eb; font-weight: 500; padding: 10px;">Beneficios</a>
                        <a href="#" style="text-decoration: none; color: #2563eb; font-weight: 500; padding: 10px;">Contacto</a>
                    </nav>
                `;
                
                document.body.appendChild(mobileMenu);
            }
            
            // Alternar menú
            const isOpen = mobileMenu.style.transform === 'translateY(0%)';
            mobileMenu.style.transform = isOpen ? 'translateY(-100%)' : 'translateY(0%)';
            
            // Cambiar ícono
            const icon = menuBtn.querySelector('i');
            icon.className = isOpen ? 'fas fa-bars' : 'fas fa-times';
        });

        // SIMULACIÓN DE AUTENTICACIÓN
        const authSection = document.getElementById('auth-section');
        let isLoggedIn = false;
        
        // Función para cambiar estado de autenticación
        function toggleAuth() {
            isLoggedIn = !isLoggedIn;
            
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
        
        // Event listener para los botones de login/logout
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-login') || e.target.closest('.btn-logout')) {
                e.preventDefault();
                toggleAuth();
            }
        });