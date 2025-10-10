document.addEventListener("DOMContentLoaded", function () {
  try {
    const questions = Array.from(document.querySelectorAll(".question"));
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const form = document.getElementById("quizForm");
    const mainProgressBar = document.createElement("div");

    // Crear una barra de progreso superior global
    mainProgressBar.classList.add("main-progress-bar");
    document.body.prepend(mainProgressBar);

    if (!questions.length || !form || !nextBtn || !prevBtn) {
      console.error("❌ Faltan elementos esenciales en el HTML del quiz.");
      return;
    }

    let currentQuestion = 0;
    const totalQuestions = questions.length;

    // Mostrar la pregunta actual
    function showQuestion(index) {
      if (index < 0 || index >= totalQuestions) return;
      questions.forEach((q) => q.classList.remove("active"));
      questions[index].classList.add("active");
      currentQuestion = index;
      updateButtons();
      updateProgressBars();
    }

    // Actualiza el estado de los botones
    function updateButtons() {
      prevBtn.disabled = currentQuestion === 0;
      nextBtn.textContent =
        currentQuestion === totalQuestions - 1 ? "Enviar" : "Siguiente";
      updateNextBtnState();
    }

    // Verifica si hay una respuesta seleccionada en la pregunta actual
    function validateCurrentQuestion() {
      const currentQ = questions[currentQuestion];
      return currentQ.querySelector('input[type="radio"]:checked') !== null;
    }

    // Habilita/deshabilita el botón siguiente
    function updateNextBtnState() {
      nextBtn.disabled = !validateCurrentQuestion();
    }

    // Actualiza tanto la barra global como la de cada pregunta
    function updateProgressBars() {
      // Barra global superior
      const globalProgress = ((currentQuestion + 1) / totalQuestions) * 100;
      mainProgressBar.style.width = globalProgress + "%";

      // Barra dentro de cada pregunta
      questions.forEach((q, i) => {
        const bar = q.querySelector(".progress-bar");
        if (bar) {
          bar.style.width = i === currentQuestion ? globalProgress + "%" : "0%";
        }
      });
    }

    // Manejo de selección de respuestas
    document.querySelectorAll("ul.answers li").forEach((li) => {
      li.addEventListener("click", () => {
        const radio = li.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;

        li.parentNode.querySelectorAll("li").forEach((item) =>
          item.classList.remove("selected")
        );
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

    // Botón siguiente / enviar
    nextBtn.addEventListener("click", () => {
      if (!validateCurrentQuestion()) return;

      if (currentQuestion === totalQuestions - 1) {
        // Enviar formulario al final
        nextBtn.textContent = "Enviando...";
        nextBtn.disabled = true;
        setTimeout(() => form.submit(), 300);
      } else {
        showQuestion(currentQuestion + 1);
      }
    });

    // Inicialización
    showQuestion(0);
    updateProgressBars();

    console.log("✅ Quiz de productividad inicializado correctamente");
  } catch (err) {
    console.error("Error inicializando el quiz:", err);
  }
});
