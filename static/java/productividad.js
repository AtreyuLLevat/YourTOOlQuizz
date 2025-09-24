document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach((carousel, index) => {
    const items = carousel.querySelector('.carousel-items');
    const totalItems = items.children.length;
    let currentIndex = 0;

    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    const updateCarousel = () => {
      const itemWidth = items.children[0].offsetWidth + 20;
      items.style.transform = `translateX(-${itemWidth * currentIndex}px)`;
    };

    prevBtn.addEventListener('click', () => {
      currentIndex = Math.max(currentIndex - 1, 0);
      updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
      const itemsPerView = Math.floor(carousel.querySelector('.carousel-wrapper').offsetWidth / items.children[0].offsetWidth);
      currentIndex = Math.min(currentIndex + 1, totalItems - itemsPerView);
      updateCarousel();
    });

    window.addEventListener('resize', updateCarousel);
  });
});