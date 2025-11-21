const data = {
  apps: [
    { title: "MindFlow", desc: "Organiza tus pensamientos visualmente y mejora tu productividad.", img: "https://picsum.photos/200/200?random=1", tags: ["IA", "Productividad"] },
    { title: "QuickTask", desc: "Gestor de tareas colaborativo con IA.", img: "https://picsum.photos/200/200?random=2", tags: ["Colaboración", "IA"] },
    { title: "EcoMind", desc: "Optimiza el consumo energético de tu hogar.", img: "https://picsum.photos/200/200?random=3", tags: ["Sostenibilidad", "Machine Learning"] }
  ],
  extensions: [
    { title: "QuickNotes", desc: "Toma notas rápidas desde cualquier página.", img: "https://picsum.photos/200/200?random=20", tags: ["Productividad", "Colaboración"] },
    { title: "TabOptimizer", desc: "Gestión inteligente de pestañas.", img: "https://picsum.photos/200/200?random=21", tags: ["Navegador", "Eficiencia"] }
  ],
  communities: [
    { title: "CodeMinds", desc: "Desarrolladores creando soluciones juntos.", tags: ["Desarrollo", "Comunidad"] },
    { title: "AI Builders", desc: "Comparte proyectos de IA aplicada.", tags: ["IA", "Investigación"] },
    { title: "EcoTech", desc: "Proyectos tecnológicos sostenibles.", tags: ["Sostenibilidad", "Innovación"] }
  ]
};

let currentView = 'apps';
let activeFilter = null;

function renderContent() {
  const container = document.getElementById('content');
  container.innerHTML = '';

  let items = [];
  if (currentView === 'apps') items = [...data.apps, ...data.extensions];
  else items = [...data.communities];

  if (activeFilter) items = items.filter(i => i.tags.includes(activeFilter));

  items.forEach(item => {
    let div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      ${item.img ? `<img src="${item.img}" alt="${item.title}">` : ''}
      <div class="info">
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        <div class="tags">${item.tags.map(tag => `<span class='tag'>${tag}</span>`).join('')}</div>
      </div>`;
    div.onclick = () => alert("Abrir: " + item.title);
    container.appendChild(div);
  });

  renderFilters();
}

function renderFilters() {
  const bar = document.getElementById('filterBar');
  bar.innerHTML = '';
  let items = currentView === 'apps' ? [...data.apps, ...data.extensions] : [...data.communities];
  const tags = [...new Set(items.flatMap(i => i.tags))];
  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    if (activeFilter === tag) btn.classList.add('active');
    btn.onclick = () => { activeFilter = activeFilter === tag ? null : tag; renderContent(); };
    bar.appendChild(btn);
  });
}

document.getElementById('btnApps').onclick = () => {
  currentView = 'apps';
  document.getElementById('btnApps').classList.add('active');
  document.getElementById('btnComms').classList.remove('active');
  activeFilter = null;
  renderContent();
};

document.getElementById('btnComms').onclick = () => {
  currentView = 'comms';
  document.getElementById('btnComms').classList.add('active');
  document.getElementById('btnApps').classList.remove('active');
  activeFilter = null;
  renderContent();
};

document.getElementById('filterToggle').onclick = () => {
  const menu = document.getElementById('filterBar');
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
};

renderContent();