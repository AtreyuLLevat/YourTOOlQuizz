// static/java/communities.js

/**
 * Módulo para manejar la lógica de comunidades
 */
export class CommunitiesManager {
  constructor() {
    this.currentApp = null;
    this.appDetailModal = null;
    this.initialized = false;
  }

  /**
   * Inicializar el módulo con referencias necesarias
   */
  init(currentApp, appDetailModal) {
    this.currentApp = currentApp;
    this.appDetailModal = appDetailModal;
    this.initialized = true;
    console.log('✅ CommunitiesManager inicializado');
    return this;
  }

  /**
   * Renderizar comunidades en el modal
   */
  renderCommunities() {
    if (!this.initialized || !this.appDetailModal) {
      console.error('❌ CommunitiesManager no inicializado');
      return;
    }

    const list = this.appDetailModal.querySelector('.community-list');
    if (!list) {
      console.error('❌ No se encontró .community-list');
      return;
    }

    list.innerHTML = '';

    // Validación exhaustiva
    if (!this.currentApp) {
      console.error('❌ currentApp es null/undefined');
      list.innerHTML = '<li>Error: App no cargada</li>';
      return;
    }

    if (!this.currentApp.communities) {
      console.warn('⚠️ currentApp.communities es undefined');
      this.currentApp.communities = [];
    }

    if (!this.currentApp.communities.length) {
      console.log('ℹ️ No hay comunidades para mostrar');
      list.innerHTML = '<li>Sin comunidades</li>';
      return;
    }

    console.log(`🎯 Renderizando ${this.currentApp.communities.length} comunidades:`);
    
    this.currentApp.communities.forEach((c, index) => {
      console.log(`  ${index + 1}. ID: ${c?.id}, Nombre: ${c?.name}`);
      
      if (!c || !c.id) {
        console.warn(`⚠️ Comunidad ${index} sin ID válido:`, c);
        return;
      }
      
      this.createCommunityElement(c, list);
    });

    console.log('✅ Comunidades renderizadas');
  }

  /**
   * Crear elemento HTML para una comunidad
   */
  createCommunityElement(community, container) {
    const li = document.createElement('li');
    li.className = 'community-item';
    li.style.cssText = `
      margin-bottom: 10px;
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
    `;
    
    const a = document.createElement('a');
    const communityUrl = `/community/${community.id}`;
    
    a.href = communityUrl;
    a.className = 'community-link';
    a.textContent = community.name || 'Comunidad sin nombre';
    a.target = '_blank';
    a.style.cssText = `
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
      display: block;
      padding: 6px 10px;
      border-radius: 4px;
      transition: all 0.2s ease;
      cursor: pointer;
    `;
    
    // Efecto hover
    a.addEventListener('mouseenter', () => {
      a.style.backgroundColor = '#eff6ff';
      a.style.color = '#1d4ed8';
    });
    
    a.addEventListener('mouseleave', () => {
      a.style.backgroundColor = 'transparent';
      a.style.color = '#2563eb';
    });
    
    // Click handler
    a.addEventListener('click', (e) => {
      console.log(`🔗 Navegando a comunidad: ${communityUrl}`);
      // El navegador manejará el enlace normalmente
    });
    
    li.appendChild(a);
    container.appendChild(li);
  }

  /**
   * Añadir una nueva comunidad
   */
  async addCommunity(name, appId) {
    if (!name || !appId) {
      alert('Nombre y App ID son obligatorios');
      return null;
    }

    console.log(`➕ Creando comunidad para app ${appId}: ${name}`);

    try {
      const res = await fetch(`/apps/${appId}/create_community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      const data = await res.json();
      console.log('📥 Respuesta crear comunidad:', data);
      
      if (!data.success) {
        alert(data.error || 'Error creando comunidad');
        return null;
      }

      // Agregar a la lista actual
      if (!this.currentApp.communities) {
        this.currentApp.communities = [];
      }
      
      this.currentApp.communities.push(data.community);
      console.log('✅ Comunidad agregada:', data.community);
      
      // Re-renderizar
      this.renderCommunities();
      
      return data.community;

    } catch (error) {
      console.error('❌ Error creando comunidad:', error);
      alert('Error de red');
      return null;
    }
  }

  /**
   * Obtener todas las comunidades de una app
   */
  async fetchCommunities(appId) {
    console.log(`🔍 Obteniendo comunidades para app: ${appId}`);
    
    try {
      const res = await fetch(`/account/get_app/${appId}`);
      const data = await res.json();
      
      if (!data.success) {
        console.error('❌ Error obteniendo comunidades:', data.error);
        return [];
      }

      return data.app.communities || [];
      
    } catch (error) {
      console.error('❌ Error en fetchCommunities:', error);
      return [];
    }
  }

  /**
   * Verificar si hay comunidades
   */
  hasCommunities() {
    return this.currentApp && 
           this.currentApp.communities && 
           this.currentApp.communities.length > 0;
  }

  /**
   * Obtener número de comunidades
   */
  getCommunitiesCount() {
    return this.hasCommunities() ? this.currentApp.communities.length : 0;
  }
}

// Exportar una instancia singleton
export const communitiesManager = new CommunitiesManager();