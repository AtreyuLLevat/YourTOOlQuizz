 // Navegación entre páginas
    const links = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        // Quitar active de todos los enlaces y páginas
        links.forEach(l => l.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));

        // Agregar active al enlace clicado y mostrar su sección
        link.classList.add('active');
        const targetId = link.getAttribute('href').substring(1);
        document.getElementById(targetId).classList.add('active');
        
        // Scroll al inicio de la página
        window.scrollTo(0, 0);
      });
    });

    // Tema claro/oscuro
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Verificar si hay una preferencia guardada
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
      if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
      } else {
        themeIcon.className = 'fas fa-moon';
      }
    }

    // Gráficos
    document.addEventListener('DOMContentLoaded', function() {

       const paymentMethods = [
    { id: 'card_1', brand: 'Visa', last4: '4242', expiry: '2026-12', holder: 'Usuario Empresa', primary: true },
    { id: 'card_2', brand: 'Mastercard', last4: '5510', expiry: '2027-04', holder: 'Usuario Empresa', primary: false }
  ];

  // Elementos
  const changeCardBtn = document.getElementById('changeCardBtn');
  const paymentModal = document.getElementById('paymentModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const paymentList = document.getElementById('paymentList');
  const currentCardText = document.getElementById('current-card'); // si existe en tu markup
  const cardForm = document.getElementById('cardForm');

  // Abrir modal
  function openModal() {
    paymentModal.classList.add('open');
    paymentModal.setAttribute('aria-hidden', 'false');
    renderPaymentMethods();
    document.getElementById('cardName').focus();
  }

  // Cerrar modal
  function closeModal() {
    paymentModal.classList.remove('open');
    paymentModal.setAttribute('aria-hidden', 'true');
    cardForm.reset();
  }

  if (changeCardBtn) changeCardBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Cerrar al hacer click fuera del modal
  paymentModal.addEventListener('click', (e) => {
    if (e.target === paymentModal) closeModal();
  });

  // Renderiza la lista de métodos
  function renderPaymentMethods() {
    paymentList.innerHTML = '';
    paymentMethods.forEach(pm => {
      const item = document.createElement('div');
      item.className = 'payment-item';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'selectPayment';
      radio.checked = !!pm.primary;
      radio.addEventListener('change', () => setPrimary(pm.id));

      const details = document.createElement('div');
      details.className = 'payment-details';
      details.innerHTML = `<div><strong>${pm.brand} •••• ${pm.last4}</strong> ${pm.primary ? '<span class="primary-badge">Principal</span>' : ''}</div><div class="payment-meta">Titular: ${pm.holder} · Expira: ${formatExpiry(pm.expiry)}</div>`;

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-outline';
      editBtn.style.minWidth = '92px';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => populateFormForEdit(pm));

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-outline';
      removeBtn.style.minWidth = '92px';
      removeBtn.textContent = 'Eliminar';
      removeBtn.addEventListener('click', () => removePaymentMethod(pm.id));

      item.appendChild(radio);
      item.appendChild(details);
      item.appendChild(editBtn);
      item.appendChild(removeBtn);

      paymentList.appendChild(item);
    });
  }

  function formatExpiry(ym) {
    const [y,m] = ym.split('-');
    return `${m}/${y}`;
  }

  function setPrimary(id) {
    paymentMethods.forEach(pm => pm.primary = (pm.id === id));
    const primary = paymentMethods.find(p=>p.primary);
    if (primary && currentCardText) currentCardText.innerHTML = `${primary.brand} terminada en <strong>${primary.last4}</strong> | Expira: ${formatExpiry(primary.expiry)}`;
    renderPaymentMethods();
    console.log('Se solicitó marcar como principal:', id);
    // En producción: llamada a tu API para persistir el cambio
  }

  function populateFormForEdit(pm) {
    document.getElementById('cardName').value = pm.holder;
    document.getElementById('cardNumber').value = '•••• •••• •••• ' + pm.last4; // solo UI
    document.getElementById('cardExpiry').value = pm.expiry;
    document.getElementById('cardCvv').value = '';
    document.getElementById('setPrimary').checked = pm.primary;
    document.getElementById('cardName').focus();
  }

  function removePaymentMethod(id) {
    if (!confirm('¿Eliminar este método de pago? Esta acción no puede deshacerse (simulado).')) return;
    const idx = paymentMethods.findIndex(p=>p.id===id);
    if (idx !== -1) {
      const wasPrimary = paymentMethods[idx].primary;
      paymentMethods.splice(idx,1);
      if (wasPrimary && paymentMethods.length) paymentMethods[0].primary = true;
      renderPaymentMethods();
      const primary = paymentMethods.find(p=>p.primary);
      if (primary && currentCardText) currentCardText.innerHTML = `${primary.brand} terminada en <strong>${primary.last4}</strong> | Expira: ${formatExpiry(primary.expiry)}`;
    }
  }

  // Manejo submit del formulario (UI solamente)
  cardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const holder = document.getElementById('cardName').value.trim();
    const number = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('cardExpiry').value;
    const cvv = document.getElementById('cardCvv').value.trim();
    const makePrimary = document.getElementById('setPrimary').checked;

    if (!holder || !number || !expiry) {
      alert('Rellena los campos requeridos (UI).');
      return;
    }

    const last4 = number.slice(-4).replace(/[^0-9]/g, '') || '0000';
    const newMethod = { id: 'card_' + Math.random().toString(36).slice(2,9), brand: detectBrand(number), last4, expiry, holder, primary: !!makePrimary };

    if (makePrimary) paymentMethods.forEach(pm => pm.primary = false);
    paymentMethods.push(newMethod);

    if (makePrimary && currentCardText) {
      currentCardText.innerHTML = `${newMethod.brand} terminada en <strong>${newMethod.last4}</strong> | Expira: ${formatExpiry(newMethod.expiry)}`;
    }

    renderPaymentMethods();
    cardForm.reset();
    alert('Método guardado (simulado). En producción, esto llamaría a tu API para persistir el cambio.');
  });

  function detectBrand(number) {
    const n = number.replace(/\s+/g,'');
    if (/^4/.test(n)) return 'Visa';
    if (/^5[1-5]/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'American Express';
    return 'Tarjeta';
  }

  // Inicializa UI
  renderPaymentMethods();

  // Debug
  window.__payment = { paymentMethods, setPrimary };
    });