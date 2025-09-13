document.addEventListener('DOMContentLoaded', () => {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slider .slide');
  const dots = document.querySelectorAll('.dots .dot');

  if (slides.length === 0) return;

  // Función para cambiar slide
  function changeSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  // Siguiente slide automáticamente
  let slideInterval = setInterval(() => {
    changeSlide((currentSlide + 1) % slides.length);
  }, 4000);

  // Eventos para los dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(slideInterval);
      changeSlide(parseInt(dot.dataset.index));
      slideInterval = setInterval(() => {
        changeSlide((currentSlide + 1) % slides.length);
      }, 4000);
    });
  });
});