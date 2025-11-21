const data = {
  apps: [
    { 
      title: "MindFlow", 
      desc: "Organiza tus pensamientos visualmente y mejora tu productividad.", 
      extra: "Incluye espacios colaborativos, mapas mentales con IA y conexión con Notion.",
      img: "https://picsum.photos/200/200?random=1", 
      tags: ["IA", "Productividad", "En desarrollo"] 
    },
    { 
      title: "QuickTask", 
      desc: "Gestor de tareas colaborativo con IA integrada.", 
      extra: "Permite trabajo en equipo, seguimiento de progreso y chat interno.",
      img: "https://picsum.photos/200/200?random=2", 
      tags: ["Colaboración", "IA", "Beta abierta"] 
    },
    { 
      title: "EcoMind", 
      desc: "Optimiza el consumo energético de tu hogar mediante aprendizaje automático.", 
      extra: "Monitoreo en tiempo real y consejos personalizados para reducir el consumo.",
      img: "https://picsum.photos/200/200?random=3", 
      tags: ["Sostenibilidad", "Machine Learning", "Lanzado"] 
    }
  ],
  extensions: [
    {
      title: "QuickNotes",
      desc: "Extensión para tomar notas rápidas desde cualquier página web.",
      extra: "Sincroniza con tus apps de productividad y permite colaboración en tiempo real.",
      img: "https://picsum.photos/200/200?random=20",
      tags: ["Productividad", "Colaboración"]
    },
    {
      title: "TabOptimizer",
      desc: "Gestión inteligente de pestañas del navegador para ahorrar memoria.",
      extra: "Permite agrupar, suspender y reabrir pestañas automáticamente.",
      img: "https://picsum.photos/200/200?random=21",
      tags: ["Navegador", "Eficiencia"]
    }
  ],
  communities: [
    { 
      title: "CodeMinds", 
      desc: "Desarrolladores creando soluciones reales juntos.", 
      tags: ["Desarrollo", "Comunidad"] 
    },
    { 
      title: "AI Builders", 
      desc: "Experimenta y comparte proyectos de inteligencia artificial aplicada.", 
      tags: ["IA", "Investigación"] 
    },
    { 
      title: "EcoTech", 
      desc: "Tecnología verde y proyectos sostenibles para el planeta.", 
      tags: ["Sostenibilidad", "Innovación"] 
    }
  ],
  quizzes: [
    {
      title: "Test de Productividad",
      desc: "Evalúa tu nivel de productividad y descubre hábitos clave.",
      tags: ["Productividad", "Autoconocimiento"]
    },
    {
      title: "Quiz de IA",
      desc: "Pon a prueba tus conocimientos en inteligencia artificial aplicada.",
      tags: ["IA", "Aprendizaje"]
    },
    {
      title: "Sostenibilidad en Casa",
      desc: "Conoce cómo tus hábitos impactan el medio ambiente.",
      tags: ["Sostenibilidad", "Educativo"]
    }
  ]
};

// Render apps y extensiones (tarjetas)
function renderCards(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container.hasChildNodes()) {
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <img src="${item.img}" alt="${item.title}">
        <div class="info">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <div class="tags">
            ${item.tags.map(tag => `<span class='tag'>${tag}</span>`).join("")}
          </div>
          <div class="more-info">${item.extra || ""}</div>
          <a href="#" class="view-btn">Ver más</a>
        </div>
      `;
      container.appendChild(div);
    });
  }
}

// Render comunidades (bloques simples)
function renderCommunities(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container.hasChildNodes()) {
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "community-item";
      div.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <div class="tags">
          ${item.tags.map(tag => `<span class='tag'>${tag}</span>`).join("")}
        </div>
      `;
      container.appendChild(div);
    });
  }
}

// Render quizzes (bloques con estilo distinto)
function renderQuizzes(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container.hasChildNodes()) {
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "quiz-item";
      div.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <div class="tags">
          ${item.tags.map(tag => `<span class='tag'>${tag}</span>`).join("")}
        </div>
      `;
      container.appendChild(div);
    });
  }
}

// Ejecutar render
renderCards(data.apps, "appsList");
renderCards(data.extensions, "extensionsList");
renderCommunities(data.communities, "communitiesList");
renderQuizzes(data.quizzes, "quizzesList");