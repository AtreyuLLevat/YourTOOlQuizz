    document.getElementById('mobileSearchBtn').addEventListener('click', function() {
      const searchContainer = document.getElementById('mobileSearchContainer');
      searchContainer.classList.toggle('active');
      
      // Enfocar el campo de búsqueda cuando se muestra
      if (searchContainer.classList.contains('active')) {
        document.querySelector('.mobile-search-input').focus();
      }
      
      // Cerrar el menú si está abierto
      document.getElementById('mobileMenu').classList.remove('active');
    });

    // Mostrar / ocultar menú móvil
    document.getElementById('menuToggle').addEventListener('click', function() {
      document.getElementById('mobileMenu').classList.toggle('active');
      // Cerrar el buscador si está abierto
      document.getElementById('mobileSearchContainer').classList.remove('active');
    });
    
    // Cerrar menús al hacer clic fuera de ellos
    document.addEventListener('click', function(event) {
      const mobileSearchBtn = document.getElementById('mobileSearchBtn');
      const mobileSearchContainer = document.getElementById('mobileSearchContainer');
      const menuToggle = document.getElementById('menuToggle');
      const mobileMenu = document.getElementById('mobileMenu');
      
      if (!mobileSearchBtn.contains(event.target)) {
        mobileSearchContainer.classList.remove('active');
      }
      
      if (!menuToggle.contains(event.target)) {
        mobileMenu.classList.remove('active');
      }
    });
    