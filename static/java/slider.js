    // SLIDER
    document.addEventListener('DOMContentLoaded', function() {
        // Elementos del slider
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        let currentSlide = 0;
        const slideInterval = 5000; // 5 segundos

        // Función para mostrar slide específico
        function showSlide(index) {
            // Remover clase active de todos los slides y dots
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Añadir clase active al slide y dot actual
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            
            currentSlide = index;
        }

        // Función para siguiente slide
        function nextSlide() {
            let next = currentSlide + 1;
            if (next >= slides.length) next = 0;
            showSlide(next);
        }

        // Event listeners para dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetTimer();
            });
        });

        // Auto-slide
        let slideTimer = setInterval(nextSlide, slideInterval);

        // Resetear timer al interactuar
        function resetTimer() {
            clearInterval(slideTimer);
            slideTimer = setInterval(nextSlide, slideInterval);
        }

        // Pausar slider al hacer hover
        const slider = document.querySelector('.slider');
        slider.addEventListener('mouseenter', () => clearInterval(slideTimer));
        slider.addEventListener('mouseleave', () => {
            slideTimer = setInterval(nextSlide, slideInterval);
        });
        // FUNCIÓN DE NOTIFICACIONES
        function showNotification(message) {
            // Remover notificación existente
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }
            
            // Crear nueva notificación
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1001;
                transform: translateX(150%);
                transition: transform 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            // Animación de entrada
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Auto-remover después de 3 segundos
            setTimeout(() => {
                notification.style.transform = 'translateX(150%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        // ANIMACIÓN DE CARDS AL SCROLL
        function animateOnScroll() {
            const cards = document.querySelectorAll('.quiz-card, .blog-card, .benefit-card');
            
            cards.forEach(card => {
                const cardTop = card.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (cardTop < windowHeight - 100) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
            });
        }

        // Estilos iniciales para animación
        const cards = document.querySelectorAll('.quiz-card, .blog-card, .benefit-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        // Event listener para scroll
        window.addEventListener('scroll', animateOnScroll);
        
        // Ejecutar una vez al cargar
        animateOnScroll();

        console.log('YourToolQuizz cargado correctamente 🚀');
    });
