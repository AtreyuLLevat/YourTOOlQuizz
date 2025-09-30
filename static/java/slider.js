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

 // ===== SEARCH (reemplaza el bloque antiguo que manipulaba #search-popup) =====
  const toggle = document.getElementById('search-toggle');
  const bar = document.getElementById('header-searchbar');
  const overlay = document.getElementById('header-search-overlay');
  const input = document.getElementById('header-search-input');

  if (!toggle || !bar || !overlay || !input) return;

  function openSearch() {
    bar.classList.add('active');
    overlay.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
    bar.setAttribute('aria-hidden', 'false');
    // prevenir scroll de fondo (opcional)
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 120);
  }

  function closeSearch() {
    bar.classList.remove('active');
    overlay.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i class="fas fa-search" aria-hidden="true"></i>';
    bar.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    // devolver foco al toggle por accesibilidad
    toggle.focus({preventScroll:true});
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (bar.classList.contains('active')) closeSearch();
    else openSearch();
  });

  overlay.addEventListener('click', closeSearch);

  // Escape para cerrar; Ctrl/Cmd+K para abrir rápido (como en muchas páginas)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (bar.classList.contains('active')) { closeSearch(); }
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (bar.classList.contains('active')) closeSearch();
      else openSearch();
    }
  });

  // Si el formulario se envía vacío, evita submit accidental (opcional)
  const form = bar.querySelector('form');
  form?.addEventListener('submit', function (ev) {
    const v = input.value?.trim();
    if (!v) {
      ev.preventDefault();
      input.focus();
    }
  });
});
