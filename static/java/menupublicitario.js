  const buttons = document.querySelectorAll(".sidebar button");
  const pages = document.querySelectorAll(".page");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      pages.forEach(p => p.style.display = "none");
      document.getElementById(btn.dataset.page).style.display = "block";
    });
  });

  function openApp(nombre) {
    pages.forEach(p => p.style.display = "none");
    document.getElementById("app-detalle").style.display = "block";
    document.getElementById("detalle-nombre").innerText = nombre;
  }

  function volver() {
    pages.forEach(p => p.style.display = "none");
    document.getElementById("apps").style.display = "block";
  }
