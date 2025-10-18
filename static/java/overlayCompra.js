// overlayCompra.js
import { supabase } from './supabaseClient.js';

export function crearOverlayCompra() {
  const overlay = document.createElement('div');
  overlay.id = 'overlay-compra';
  overlay.innerHTML = `
    <div class="overlay-bg"></div>
    <div class="overlay-content">
      <h2>⚠️ No tienes un plan activo</h2>
      <p>Compra un plan para desbloquear el Menú Publicitario</p>
      <button id="btn-comprar-plan">Comprar Plan</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const btn = overlay.querySelector('#btn-comprar-plan');
  btn.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Primero inicia sesión");
      return;
    }

    const planId = 'PLAN_BASICO'; // ⚠️ Cambia por el ID real de tu plan
    const resp = await fetch('/api/crear-sesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, planId })
    });

    const result = await resp.json();
    if (result.url) {
      window.location.href = result.url;
    } else {
      alert("Error creando la sesión de pago");
    }
  });
}
