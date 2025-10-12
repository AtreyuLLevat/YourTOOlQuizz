<<<<<<< HEAD

  const blogsEl = document.getElementById("blogs");
  const priceEl = document.getElementById("price");
  const ivaEl = document.getElementById("iva");
  const totalEl = document.getElementById("total");
  const plusBtn = document.getElementById("plus");
  const minusBtn = document.getElementById("minus");

  let blogs = 1; // valor inicial
  const maxBlogs = 3;
  const precioUnitario = 30;
  const ivaPorcentaje = 0.21;

  function updatePrice() {
    const price = blogs * precioUnitario; // precio sin IVA
    const iva = (price * ivaPorcentaje).toFixed(2);
    const total = (price + parseFloat(iva)).toFixed(2);

    blogsEl.textContent = blogs;
    priceEl.textContent = `Precio: ${price} €`;
    ivaEl.textContent = `IVA (21%): ${iva} €`;
    totalEl.textContent = `Total: ${total} €`;
  }

  plusBtn.addEventListener("click", () => {
    if (blogs < maxBlogs) {
      blogs++;
      updatePrice();
    }
  });

  minusBtn.addEventListener("click", () => {
    if (blogs > 1) {
      blogs--;
      updatePrice();
    }
  });

  updatePrice();
=======

  const blogsEl = document.getElementById("blogs");
  const priceEl = document.getElementById("price");
  const ivaEl = document.getElementById("iva");
  const totalEl = document.getElementById("total");
  const plusBtn = document.getElementById("plus");
  const minusBtn = document.getElementById("minus");

  let blogs = 1; // valor inicial
  const maxBlogs = 3;
  const precioUnitario = 30;
  const ivaPorcentaje = 0.21;

  function updatePrice() {
    const price = blogs * precioUnitario; // precio sin IVA
    const iva = (price * ivaPorcentaje).toFixed(2);
    const total = (price + parseFloat(iva)).toFixed(2);

    blogsEl.textContent = blogs;
    priceEl.textContent = `Precio: ${price} €`;
    ivaEl.textContent = `IVA (21%): ${iva} €`;
    totalEl.textContent = `Total: ${total} €`;
  }

  plusBtn.addEventListener("click", () => {
    if (blogs < maxBlogs) {
      blogs++;
      updatePrice();
    }
  });

  minusBtn.addEventListener("click", () => {
    if (blogs > 1) {
      blogs--;
      updatePrice();
    }
  });

  updatePrice();
>>>>>>> ec1e43cfb7f709d6f69ef6f58ce66c05937cf404
