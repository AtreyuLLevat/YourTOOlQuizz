document.addEventListener("readystatechange", () => {
  if (document.readyState !== "complete") return;

  const sections = Array.from(document.querySelectorAll("main section"));
  const navLinks = Array.from(document.querySelectorAll(".menu a"));

  if (!sections.length || !navLinks.length) {
    console.warn("No se encontraron secciones o enlaces del menú.");
    return;
  }

  // --- Función para mostrar una sección ---
  const showSection = (id) => {
    sections.forEach(section => {
      section.style.display = section.id === id ? "block" : "none";
    });

    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });

    // Actualiza el hash en la URL
    history.replaceState(null, null, "#" + id);
  };

  // --- Mostrar la primera o la del hash ---
  const currentHash = window.location.hash.substring(1);
  const initialId = currentHash && document.getElementById(currentHash) ? currentHash : sections[0].id;
  showSection(initialId);

  // --- Click en enlaces ---
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      if (document.getElementById(targetId)) showSection(targetId);
      window.scrollTo({ top: document.querySelector("main").offsetTop - 20, behavior: "smooth" });
    });
  });
});
