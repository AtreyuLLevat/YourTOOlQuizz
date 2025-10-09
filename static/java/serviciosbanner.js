const slider = document.getElementById('duration');
const priceEl = document.getElementById('price');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');

const taxPercent = 0.21;
// ✅ Precios actualizados en euros
const prices = { 
  1: 10, 
  2: 15, 
  3: 20, 
  4: 25 
};

function updatePrice() {
  const value = slider.value;
  const price = prices[value];
  const tax = price * taxPercent;
  const total = price + tax;

  priceEl.textContent = `${price} €`;
  taxEl.textContent = `IVA (21%): ${tax.toFixed(2)} €`;
  totalEl.textContent = `Total con IVA: ${total.toFixed(2)} €`;
}
slider.addEventListener('input', updatePrice);
updatePrice();