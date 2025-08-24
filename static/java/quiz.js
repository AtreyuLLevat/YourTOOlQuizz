document.addEventListener("DOMContentLoaded", function () {
  // =========================
  // Quiz Navigation
  // =========================
  const questions = document.querySelectorAll(".question");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const progressBarInner = document.querySelector(".progress-bar-inner");

  let currentQuestion = 0;
  const totalQuestions = questions.length;

  function showQuestion(index) {
    questions[currentQuestion].classList.remove("active");
    currentQuestion = index;
    questions[currentQuestion].classList.add("active");
    updateButtons();
    updateProgressBar();
    updateNextBtnState();
  }

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

  function validateCurrentQuestion() {
    const currentQ = questions[currentQuestion];
    return currentQ.querySelector('input[type="radio"]:checked') !== null;
  }

  function updateNextBtnState() {
    nextBtn.disabled = !validateCurrentQuestion();
  }

  function updateProgressBar() {
    if (!progressBarInner) return;
    const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;
    progressBarInner.style.width = progressPercent + "%";
  }

  // Selección de respuestas
  document.querySelectorAll("ul.answers li").forEach((li) => {
    li.addEventListener("click", () => {
      const radio = li.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      li.parentNode.querySelectorAll("li").forEach((item) => item.classList.remove("selected"));
      li.classList.add("selected");

      updateNextBtnState();
    });
  });

  prevBtn.addEventListener("click", () => {
    if (currentQuestion > 0) showQuestion(currentQuestion - 1);
  });

  nextBtn.addEventListener("click", () => {
    if (validateCurrentQuestion()) {
      if (currentQuestion < totalQuestions - 1) showQuestion(currentQuestion + 1);
    } else {
      alert("Por favor selecciona una respuesta");
    }
  });

  showQuestion(0);

  // =========================
  // Mobile Search & Menu
  // =========================
  const searchToggleBtn = document.getElementById("searchToggleBtn");
  const searchCloseBtn = document.getElementById("searchCloseBtn");
  const mobileSearchForm = document.getElementById("mobileSearchForm");

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileNavMenu = document.getElementById("mobileNavMenu");

  searchToggleBtn.addEventListener("click", () => {
    mobileSearchForm.style.display = "flex";
    searchToggleBtn.style.display = "none";
    mobileSearchForm.querySelector("input").focus();
    mobileNavMenu.classList.add("hidden");
  });

  searchCloseBtn.addEventListener("click", () => {
    mobileSearchForm.style.display = "none";
    searchToggleBtn.style.display = "inline-block";
  });

  hamburgerBtn.addEventListener("click", () => {
    mobileNavMenu.classList.toggle("hidden");
    if (!mobileNavMenu.classList.contains("hidden")) {
      mobileSearchForm.style.display = "none";
      searchToggleBtn.style.display = "inline-block";
    }
  });

  // Cerrar buscador o menú si clic fuera
  document.addEventListener("click", (e) => {
    if (!mobileSearchForm.contains(e.target) && !searchToggleBtn.contains(e.target)) {
      mobileSearchForm.style.display = "none";
      searchToggleBtn.style.display = "inline-block";
    }
    if (!mobileNavMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      mobileNavMenu.classList.add("hidden");
    }
  });
});
