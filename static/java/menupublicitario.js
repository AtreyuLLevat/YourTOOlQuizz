// menupublicitario.js
import { supabase } from './supabaseClient.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js';

// === FUNCIÓN PRINCIPAL ===
async function cargarEstadisticas() {
  try {
    // 1️⃣ Obtener usuario logueado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Debes iniciar sesión para ver tus estadísticas");
      window.location.href = "/login";
      return;
    }

    // 2️⃣ Llamar al backend Flask para obtener los quizzes contratados
    const res = await fetch(`/api/quizzes-estadisticas/${user.id}`);
    const quizzes = await res.json();

    // 3️⃣ Seleccionar contenedor de tarjetas
    const container = document.querySelector('#stats-container');
    container.innerHTML = ''; // limpiar contenido anterior

    // 4️⃣ Mostrar mensaje si no hay datos
    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      container.innerHTML = `<p style="color: var(--muted)">No tienes quizzes activos o aún no hay datos registrados.</p>`;
      return;
    }

    // 5️⃣ Renderizar tarjetas con estadísticas
    quizzes.forEach(q => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h4><i class="fas fa-question-circle" style="color: #3b82f6;"></i> ${q.nombre}</h4>
        <p>Rendimiento de este quiz</p>
        <div class="campaign-stats">
          <div class="campaign-stat">
            <div class="campaign-stat-value">${q.impresiones}</div>
            <div class="campaign-stat-label">Impresiones</div>
          </div>
          <div class="campaign-stat">
            <div class="campaign-stat-value">${q.clicks}</div>
            <div class="campaign-stat-label">Clicks</div>
          </div>
          <div class="campaign-stat">
            <div class="campaign-stat-value">${q.ctr}%</div>
            <div class="campaign-stat-label">CTR</div>
          </div>
          <div class="campaign-stat">
            <div class="campaign-stat-value">$${q.dinero}</div>
            <div class="campaign-stat-label">Gastado</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // 6️⃣ Crear gráfico con Chart.js (CTR por quiz)
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: quizzes.map(q => q.nombre),
        datasets: [{
          label: 'CTR (%)',
          data: quizzes.map(q => q.ctr),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: '#3b82f6',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'CTR por Quiz',
            color: '#333',
            font: { size: 16 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'CTR (%)' }
          },
          x: { title: { display: true, text: 'Quizzes' } }
        }
      }
    });

  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

// === EJECUTAR CUANDO CARGA LA PÁGINA ===
window.addEventListener('DOMContentLoaded', cargarEstadisticas);
