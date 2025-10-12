document.addEventListener("DOMContentLoaded", function () {
  // MENU HAMBURGUESA
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("active");
    menuBtn.classList.toggle("active");
  });

  // BUSCADOR
  const searchBtn = document.querySelector(".search-toggle");
  const searchPopup = document.querySelector(".search-popup");
  const searchOverlay = document.querySelector(".search-overlay");
  const searchClose = document.querySelector(".search-close");

  function toggleSearch() {
    searchPopup.classList.toggle("active");
    searchOverlay.classList.toggle("active");
  }

  if (searchBtn) searchBtn.addEventListener("click", toggleSearch);
  if (searchOverlay) searchOverlay.addEventListener("click", toggleSearch);
  if (searchClose) searchClose.addEventListener("click", toggleSearch)
console.log("JS cargado correctamente");

});