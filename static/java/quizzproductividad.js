document.addEventListener("DOMContentLoaded", function () {
  const questions = document.querySelectorAll(".question");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
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
  prevBtn.disabled = currentQuestion === 0;

  if (currentQuestion === totalQuestions - 1) {
    nextBtn.style.display = "none";
    document.querySelector(".submit-container").style.display = "flex";
    submitBtn.style.display = "inline-block";
  } else {
    nextBtn.style.display = "inline-block";
    document.querySelector(".submit-container").style.display = "none";
    submitBtn.style.display = "none";
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

  prevBtn.addEventListener("click", () => {
    if (currentQuestion > 0) showQuestion(currentQuestion - 1);
  });

  nextBtn.addEventListener("click", () => {
    if (validateCurrentQuestion()) {
      if (currentQuestion < totalQuestions - 1)
        showQuestion(currentQuestion + 1);
    } else {
      alert("Por favor selecciona una respuesta.");
    }
  });

  showQuestion(0);
});

