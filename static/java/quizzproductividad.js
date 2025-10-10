document.addEventListener("DOMContentLoaded", function () {
  const questions = Array.from(document.querySelectorAll(".question"));
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const form = document.getElementById("quizForm");

  // Crear la barra superior de progreso
  const topProgress = document.createElement("div");
  topProgress.classList.add("main-progress-bar");
  document.body.prepend(topProgress);

  let currentQuestion = 0;
  const totalQuestions = questions.length;

  // === FUNCIONES ===
  function showQuestion(index) {
    questions.forEach((q, i) => {
      q.classList.toggle("active", i === index);
    });
    currentQuestion = index;
    updateButtons();
    updateProgressBars();
  }

  function updateButtons() {
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.textContent = currentQuestion === totalQuestions - 1 ? "Enviar" : "Siguiente";
    updateNextBtnState();
  }

  function validateCurrentQuestion() {
    const currentQ = questions[currentQuestion];
    return currentQ.querySelector('input[type="radio"]:checked') !== null;
  }

  function updateNextBtnState() {
    nextBtn.disabled = !validateCurrentQuestion();
  }

  function updateProgressBars() {
    // Porcentaje global
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    topProgress.style.width = progress + "%";

    // Barras internas de cada pregunta
    questions.forEach((q, i) => {
      const bar = q.querySelector(".progress-bar");
      if (bar) {
        const localProgress = ((i + 1) / totalQuestions) * 100;
        bar.style.width = i <= currentQuestion ? localProgress + "%" : "0%";
      }
    });
  }

  // === EVENTOS ===
  document.querySelectorAll("ul.answers li").forEach((li) => {
    li.addEventListener("click", () => {
      const input = li.querySelector("input");
      if (input) input.checked = true;

      const ul = li.closest("ul");
      ul.querySelectorAll("li").forEach((item) => item.classList.remove("selected"));
      li.classList.add("selected");

      updateNextBtnState();
    });
  });

  prevBtn.addEventListener("click", () => {
    if (currentQuestion > 0) showQuestion(currentQuestion - 1);
  });

  nextBtn.addEventListener("click", () => {
    if (!validateCurrentQuestion()) return;

    if (currentQuestion === totalQuestions - 1) {
      nextBtn.textContent = "Enviando...";
      nextBtn.disabled = true;
      setTimeout(() => form.submit(), 300);
    } else {
      showQuestion(currentQuestion + 1);
    }
  });
document.getElementById("submitBtn").addEventListener("click", function () {
  window.location.href = "{{ url_for('pricing') }}";
});

  // === INICIALIZACIÓN ===
  showQuestion(0);
  updateProgressBars();
});

