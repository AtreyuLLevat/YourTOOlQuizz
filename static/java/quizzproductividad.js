document.addEventListener("DOMContentLoaded", function () {
  try {
    const questions = Array.from(document.querySelectorAll(".question"));
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const form = document.getElementById("quizForm");
    const progressBars = Array.from(document.querySelectorAll(".progress-bar"));

    if (!questions.length) {
      console.error("No se encontraron elementos .question. Revisa el HTML.");
      return;
    }
    if (!prevBtn || !nextBtn || !form) {
      console.error("Faltan #prevBtn, #nextBtn o #quizForm en el HTML.");
      return;
    }

    let currentQuestion = 0;
    const totalQuestions = questions.length;

    function showQuestion(index) {
      if (index < 0 || index >= totalQuestions) return;
      questions.forEach((q) => q.classList.remove("active"));
      questions[index].classList.add("active");
      currentQuestion = index;
      updateProgressBar();
      updateButtons();
      // focus primera opción para accesibilidad (si existe)
      const firstInput = questions[currentQuestion].querySelector("input");
      if (firstInput) firstInput.focus();
    }

    function updateButtons() {
      prevBtn.disabled = currentQuestion === 0;
      nextBtn.textContent = currentQuestion === totalQuestions - 1 ? "Enviar" : "Siguiente";
      nextBtn.disabled = !validateCurrentQuestion();
    }

    function validateCurrentQuestion() {
      const currentQ = questions[currentQuestion];
      const checked = currentQ.querySelector('input[type="radio"]:checked, input[type="checkbox"]:checked');
      const selected = currentQ.querySelector("li.selected");
      return Boolean(checked || selected);
    }

    function updateProgressBar() {
      const percent = Math.round(((currentQuestion + 1) / totalQuestions) * 100);
      // mostramos el progreso solo en la barra de la pregunta activa
      progressBars.forEach((bar, i) => {
        bar.style.width = i === currentQuestion ? percent + "%" : "0%";
      });
    }

    // manejo de selección por clic y por teclado
    document.querySelectorAll("ul.answers").forEach((ul) => {
      ul.addEventListener("click", (e) => {
        const li = e.target.closest("li");
        if (!li) return;
        const input = li.querySelector('input[type="radio"], input[type="checkbox"]');
        if (input) input.checked = true;

        // marcar visualmente
        ul.querySelectorAll("li").forEach((item) => item.classList.remove("selected"));
        li.classList.add("selected");

        updateButtons();
      });

      // capturar cambios directos en inputs (teclado)
      ul.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((input) => {
        input.addEventListener("change", () => {
          const li = input.closest("li");
          ul.querySelectorAll("li").forEach((item) => item.classList.remove("selected"));
          if (li) li.classList.add("selected");
          updateButtons();
        });
      });
    });

    prevBtn.addEventListener("click", () => {
      if (currentQuestion > 0) showQuestion(currentQuestion - 1);
    });

    nextBtn.addEventListener("click", () => {
      if (!validateCurrentQuestion()) {
        alert("Por favor selecciona una respuesta.");
        return;
      }
      // si estamos en la última pregunta, enviar
      if (currentQuestion === totalQuestions - 1) {
        // opción: mostrar texto "Enviando..." visualmente antes del submit
        nextBtn.disabled = true;
        const originalText = nextBtn.textContent;
        nextBtn.textContent = "Enviando…";
        // pequeño timeout para que el usuario vea el cambio en interfaces lentas
        setTimeout(() => form.submit(), 200);
        return;
      }
      showQuestion(currentQuestion + 1);
    });

    // inicializar
    showQuestion(0);
    console.log("Quiz inicializado: preguntas =", totalQuestions);
  } catch (err) {
    console.error("Error inicializando quiz:", err);
  }
});
