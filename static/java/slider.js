document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slider .slide');
  const dots = document.querySelectorAll('.dots .dot');
  let currentSlide = 0;
  const slideIntervalTime = 5000; // 5 segundos
  let slideInterval;

  if (slides.length === 0 || dots.length === 0) return;

  // Función para mostrar un slide según índice
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  // Función para pasar al siguiente slide
  function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
  }

  // Iniciar autoplay
  function startAutoplay() {
    slideInterval = setInterval(nextSlide, slideIntervalTime);
  }

  // Detener autoplay
  function stopAutoplay() {
    clearInterval(slideInterval);
  }

  // Click en dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      const index = parseInt(dot.dataset.index);
      showSlide(index);
      startAutoplay();
    });
  });

  // Iniciar slider
  showSlide(0);
  startAutoplay();
});