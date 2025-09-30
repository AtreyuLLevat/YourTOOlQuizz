document.addEventListener('DOMContentLoaded', function () {
    // ===== SLIDER =====
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideInterval = 5000;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= slides.length) next = 0;
        showSlide(next);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetTimer();
        });
    });

    let slideTimer = setInterval(nextSlide, slideInterval);

    function resetTimer() {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, slideInterval);
    }

    const slider = document.querySelector('.slider');
    if (slider) {
        slider.addEventListener('mouseenter', () => clearInterval(slideTimer));
        slider.addEventListener('mouseleave', () => {
            slideTimer = setInterval(nextSlide, slideInterval);
        });
    }

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

    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', function () {
            let mobileMenu = document.querySelector('.mobile-menu');
            if (!mobileMenu) {
                mobileMenu = document.createElement('div');
                mobileMenu.className = 'mobile-menu';
                mobileMenu.style.cssText = `
                    position: fixed;
                    top: 70px; left: 0; width: 100%;
                    background: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    padding: 20px;
                    z-index: 999;
                    transform: translateY(-100%);
                    transition: transform 0.3s ease;
                `;
                mobileMenu.innerHTML = `
                    <nav style="display:flex;flex-direction:column;gap:15px;text-align:center">
                        <a href="#">Inicio</a>
                        <a href="#">Quizzes</a>
                        <a href="#">Blog</a>
                        <a href="#">Beneficios</a>
                        <a href="#">Contacto</a>
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

    });

    const searchToggle = document.getElementById('search-toggle');
    const searchPopup = document.getElementById('search-popup');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = searchPopup?.querySelector('.search-popup-input');

    if (searchToggle && searchPopup && searchOverlay) {
        searchToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const nowOpen = !searchPopup.classList.contains('active');
            searchPopup.classList.toggle('active', nowOpen);
            searchOverlay.classList.toggle('active', nowOpen);
            if (nowOpen && searchInput) setTimeout(() => searchInput.focus(), 80);
        });

        searchOverlay.addEventListener('click', function () {
            searchPopup.classList.remove('active');
            searchOverlay.classList.remove('active');
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                searchPopup.classList.remove('active');
                searchOverlay.classList.remove('active');
            }
        });
    }
});

