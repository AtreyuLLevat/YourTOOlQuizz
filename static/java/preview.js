
  const products = [
    { id: "price_1ABC", name: "Stubborn Attachments", price: 20, img: "https://i.imgur.com/EHyR2nP.png" },
    { id: "price_2DEF", name: "Another Book", price: 15, img: "https://i.imgur.com/EHyR2nP.png" },
    { id: "price_3GHI", name: "Curso Python", price: 50, img: "https://i.imgur.com/EHyR2nP.png" }
  ];

  let cart = [];

  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      cart.push(product);
      renderCart();
    }
  }

  function renderCart() {
    const cartDiv = document.getElementById("cart");
    cartDiv.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price;
      const itemDiv = document.createElement("div");
      itemDiv.className = "product";
      itemDiv.innerHTML = `
        <img src="${item.img}" alt="${item.name}" />
        <div class="description">
          <h3>${item.name}</h3>
          <h5>$${item.price.toFixed(2)}</h5>
          <button onclick="removeFromCart(${index})">Eliminar</button>
        </div>
      `;
      cartDiv.appendChild(itemDiv);
    });

    const totalDiv = document.getElementById("total");
    totalDiv.textContent = "Total: $" + total.toFixed(2);
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
  }

  async function checkout() {
    if (cart.length === 0) return alert("Tu carrito está vacío");

    const lineItems = cart.map(item => ({ price: item.id, quantity: 1 }));

    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line_items: lineItems })
    });

    const data = await response.json();
    if (data.url) window.location.href = data.url;
    else alert("Error al iniciar el pago: " + data.error);
  }

