        document.addEventListener("DOMContentLoaded", function () {
      const questions = document.querySelectorAll(".question");
      const prevBtn = document.getElementById("prevBtn");
      const nextBtn = document.getElementById("nextBtn");
      const submitBtn = document.getElementById("submitBtn");
      const progressBarInner = document.querySelector(".progress-bar-inner");

      let currentQuestion = 0;
      const totalQuestions = questions.length;

      // Mostrar la pregunta según índice
      function showQuestion(index) {
        questions[currentQuestion].classList.remove("active");
        currentQuestion = index;
        questions[currentQuestion].classList.add("active");
        updateButtons();
        updateProgressBar();
        updateNextBtnState();
      }

      // Actualizar botones Prev y Next / Submit
      function updateButtons() {
        prevBtn.disabled = currentQuestion === 0;

        if (currentQuestion === totalQuestions - 1) {
          nextBtn.style.display = "none";
          submitBtn.style.display = "inline-block";
        } else {
          nextBtn.style.display = "inline-block";
          submitBtn.style.display = "none";
        }
      }

      // Validar que pregunta actual tenga respuesta seleccionada
      function validateCurrentQuestion() {
        const currentQ = questions[currentQuestion];
        return currentQ.querySelector('input[type="radio"]:checked') !== null;
      }

      // Habilitar/deshabilitar botón siguiente
      function updateNextBtnState() {
        nextBtn.disabled = !validateCurrentQuestion();
      }

      // Actualizar barra de progreso (ancho en %)
      function updateProgressBar() {
        if (!progressBarInner) return; // Seguridad si no existe

        const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;
        progressBarInner.style.width = progressPercent + "%";
      }

      // Evento para selección de respuesta en cada opción
      document.querySelectorAll("ul.answers li").forEach((li) => {
        li.addEventListener("click", () => {
          const radio = li.querySelector('input[type="radio"]');
          if (radio) {
            radio.checked = true;
          }

          // Visual feedback - marca opción seleccionada
          li.parentNode.querySelectorAll("li").forEach((item) => {
            item.classList.remove("selected");
          });
          li.classList.add("selected");

          updateNextBtnState();
        });
      });

      // Botón anterior
      prevBtn.addEventListener("click", () => {
        if (currentQuestion > 0) {
          showQuestion(currentQuestion - 1);
        }
      });

      // Botón siguiente
      nextBtn.addEventListener("click", () => {
        if (validateCurrentQuestion()) {
          if (currentQuestion < totalQuestions - 1) {
            showQuestion(currentQuestion + 1);
          }
        } else {
          alert("Por favor selecciona una respuesta");
        }
      });

      // Inicializa la vista en la pregunta 0
      showQuestion(0);
    });
    document.addEventListener("DOMContentLoaded", () => {
  const searchToggleBtn = document.getElementById("searchToggleBtn");
  const searchCloseBtn = document.getElementById("searchCloseBtn");
  const mobileSearchForm = document.getElementById("mobileSearchForm");

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileNavMenu = document.getElementById("mobileNavMenu");

  // Mostrar formulario búsqueda al pulsar lupa
  searchToggleBtn.addEventListener("click", () => {
    mobileSearchForm.style.display = "flex";
    searchToggleBtn.style.display = "none";
    mobileSearchForm.querySelector("input").focus();
    // Ocultar menú móvil si abierto
    mobileNavMenu.classList.add("hidden");
  });

  // Cerrar formulario búsqueda al pulsar X
  searchCloseBtn.addEventListener("click", () => {
    mobileSearchForm.style.display = "none";
    searchToggleBtn.style.display = "inline-block";
  });

  // Toggle menú hamburguesa
  hamburgerBtn.addEventListener("click", () => {
    mobileNavMenu.classList.toggle("hidden");
    // Al abrir menú, ocultar buscador
    if (!mobileNavMenu.classList.contains("hidden")) {
      mobileSearchForm.style.display = "none";
      searchToggleBtn.style.display = "inline-block";
    }
  });

  // Opcional: cerrar menú o buscador si clic fuera
  document.addEventListener("click", (e) => {
    const insideSearch = mobileSearchForm.contains(e.target);
    const insideSearchBtn = searchToggleBtn.contains(e.target);
    const insideMenu = mobileNavMenu.contains(e.target);
    const insideHamburger = hamburgerBtn.contains(e.target);

    if (!insideSearch && !insideSearchBtn) {
      mobileSearchForm.style.display = "none";
      searchToggleBtn.style.display = "inline-block";
    }
    if (!insideMenu && !insideHamburger) {
      mobileNavMenu.classList.add("hidden");
    }
  });
});
