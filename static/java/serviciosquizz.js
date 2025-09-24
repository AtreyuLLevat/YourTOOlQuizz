const categories = document.querySelectorAll(".categories button");
categories.forEach(btn => {
  btn.addEventListener("click", () => {
    categories.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

const timeButtons = document.querySelectorAll(".time-options button");
const priceEl = document.getElementById("price");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");

const taxPercent = 0.21;
const prices = { 1: 50, 2: 75, 3: 100 };

function updatePrice(months) {
  const price = prices[months];
  const tax = price * taxPercent;
  const total = price + tax;

  priceEl.textContent = `${price}€`;
  taxEl.textContent = `Tax (21%): ${tax.toFixed(2)}€`;
  totalEl.textContent = `Con impuestos: ${total.toFixed(2)}€`;
}

timeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    timeButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    const months = btn.getAttribute("data-months");
    updatePrice(months);
  });
});

// Inicializa con 1 mes
timeButtons[0].classList.add("selected");
updatePrice(1);

// -------------------- QUIZ COVER SCRIPT --------------------
const startBtn = document.getElementById("start-quiz");
const quizCover = document.querySelector(".quiz-cover");
const quizSample = document.querySelector(".quiz-sample");

quizSample.style.display = "none"; // Oculta el quiz al inicio

startBtn.addEventListener("click", () => {
  quizCover.style.display = "none";
  quizSample.style.display = "block";
  quizSample.scrollIntoView({ behavior: "smooth" });
});