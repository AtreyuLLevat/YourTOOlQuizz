document.addEventListener("DOMContentLoaded", function () {
  const questions = document.querySelectorAll(".question");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const form = document.getElementById("quizForm");
  const progressBars = document.querySelectorAll(".progress-bar");

  let currentQuestion = 0;
  const totalQuestions = questions.length;

  function showQuestion(index) {
    questions[currentQuestion].classList.remove("active");
    currentQuestion = index;
    questions[currentQuestion].classList.add("active");
    updateProgressBar();
    updateButtons();
  }

  function updateButtons() {
    // Botón anterior
    prevBtn.disabled = currentQuestion === 0;

    // Cambiar texto del botón siguiente → “Enviar” en la última pregunta
    if (currentQuestion === totalQuestions - 1) {
      nextBtn.textContent = "Enviar";
    } else {
      nextBtn.textContent = "Siguiente";
    }

    updateNextBtnState();
  }

  function validateCurrentQuestion() {
    const currentQ = questions[currentQuestion];
    return currentQ.querySelector('input[type="radio"]:checked') !== null;
  }

  function updateNextBtnState() {
    nextBtn.disabled = !validateCurrentQuestion();
  }

  function updateProgressBar() {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    progressBars.forEach((bar, i) => {
      bar.style.width = i <= currentQuestion ? progress + "%" : "0%";
    });
  }

  // Selección de respuestas
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
    if (currentQuestion > 0) showQuestion(currentQuestion - 1);
  });

  // Botón siguiente / enviar
  nextBtn.addEventListener("click", () => {
    if (!validateCurrentQuestion()) {
      alert("Por favor selecciona una respuesta.");
      return;
    }

    // Si está en la última pregunta → enviar formulario
    if (currentQuestion === totalQuestions - 1) {
      form.submit();
    } else {
      showQuestion(currentQuestion + 1);
    }
  });

  showQuestion(0);
});
