document.addEventListener('DOMContentLoaded', function () {



    // Funcionalidad del acordeón FAQ
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const item = question.parentNode;
        const isActive = item.classList.contains('active');
        
        // Cerrar todos los items primero
        document.querySelectorAll('.faq-item').forEach(otherItem => {
          otherItem.classList.remove('active');
        });
        
        // Abrir el item clickeado si no estaba activo
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });

    // Funcionalidad de las pestañas de comparación
    document.querySelectorAll('.tab-btn').forEach(button => {
      button.addEventListener('click', () => {
        const tab = button.getAttribute('data-tab');
        
        // Remover clase active de todos los botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Añadir clase active al botón clickeado
        button.classList.add('active');
        
        // Ocultar todas las tablas
        document.querySelectorAll('.table-container').forEach(table => {
          table.classList.remove('active');
        });
        
        // Mostrar la tabla correspondiente
        document.getElementById(`${tab}-table`).classList.add('active');
      });
    });
    });