
// main.js
import { verificarPlanActivo } from './verificarPlan.js';
import { crearOverlayCompra } from './overlayCompra.js';

// Esperamos a que cargue la página
document.addEventListener('DOMContentLoaded', async () => {
  const botonMenu = document.getElementById('menu-publicitario');

  if (botonMenu) {
    botonMenu.addEventListener('click', async (e) => {
      e.preventDefault();
      const activo = await verificarPlanActivo();

      if (activo) {
        // ✅ Tiene plan activo → entra al menú
        window.location.href = '/menu-publicitario';
      } else {
        // ❌ No tiene plan → mostrar overlay
        crearOverlayCompra();
      }
    });
  }

  // Si ya estamos dentro del menú publicitario, comprobamos de nuevo
  if (document.body.id === 'menu-page') {
    const activo = await verificarPlanActivo();
    if (!activo) crearOverlayCompra();
    else inicializarMenuPublicitario();
  }
});

function inicializarMenuPublicitario() {
  console.log("✅ Plan activo: Menú Publicitario inicializado");
  // Aquí activas tus módulos: gráficos, estadísticas, banners, etc.
}
// Detectar si venimos de Stripe
if (window.location.search.includes('status=success')) {
  const msg = document.createElement('div');
  msg.textContent = "✅ Pago confirmado — activando tu plan...";
  msg.style = "position:fixed;bottom:20px;right:20px;background:#4caf50;color:white;padding:10px;border-radius:8px;";
  document.body.appendChild(msg);

  setTimeout(() => location.reload(), 2500);
}
