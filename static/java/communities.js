  function renderCommunities() {
    console.log('🎯 EJECUTANDO renderCommunities()');
    
    if (!appDetailModal) {
      console.error('❌ appDetailModal no encontrado');
      return;
    }

    const list = appDetailModal.querySelector('.community-list');
    if (!list) {
      console.error('❌ No se encontró .community-list en el modal');
      return;
    }

    // Limpiar completamente
    list.innerHTML = '';

    if (!currentApp || !currentApp.communities || !currentApp.communities.length) {
      console.log('ℹ️ No hay comunidades para mostrar');
      list.innerHTML = '<li>Sin comunidades</li>';
      return;
    }

    console.log(`🔄 Renderizando ${currentApp.communities.length} comunidades`);
    
    // Crear cada elemento MANUALMENTE con createElement
    currentApp.communities.forEach(community => {
      if (!community || !community.id) return;
      
      // 1. Crear el elemento <li>
      const li = document.createElement('li');
      li.style.cssText = 'margin-bottom: 10px;';
      
      // 2. Crear el elemento <a> - ¡ESTO ES LO CLAVE!
      const a = document.createElement('a');
      a.href = `/community/${community.id}`;
      a.className = 'community-link';
      a.textContent = community.name || 'Comunidad sin nombre';
      a.target = '_blank';
      
      // Estilos INLINE obligatorios
      a.style.cssText = `
        display: block;
        padding: 12px 16px;
        background: #2563eb;
        color: white !important;
        text-decoration: none !important;
        border-radius: 8px;
        font-weight: 600;
        text-align: center;
        cursor: pointer;
        border: 2px solid #2563eb;
        transition: all 0.2s ease;
      `;
      
      // Efectos hover
      a.addEventListener('mouseenter', () => {
        a.style.background = '#1d4ed8';
        a.style.borderColor = '#1d4ed8';
      });
      
      a.addEventListener('mouseleave', () => {
        a.style.background = '#2563eb';
        a.style.borderColor = '#2563eb';
      });
      
      // Evento de clic
      a.addEventListener('click', () => {
        console.log(`🔗 Navegando a comunidad: ${community.name}`);
      });
      
      // 3. Añadir el enlace al <li>
      li.appendChild(a);
      
      // 4. Añadir el <li> a la lista
      list.appendChild(li);
    });
    
    console.log(`✅ Se crearon ${list.children.length} enlaces de comunidad`);
  }

   * Crear elemento HTML para una comunidad
 