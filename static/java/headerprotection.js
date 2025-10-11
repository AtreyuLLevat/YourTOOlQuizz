<<<<<<< HEAD
// ESTO DEBE IR EN EL HEAD, ANTES DE CUALQUIER OTRO SCRIPT
(function() {
    'use strict';
    
    // BLOQUEAR CARGA DE CONFLICTANCE
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        if (tagName === 'link' || tagName === 'style') {
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'href' && value && value.includes('conflictance')) {
                    console.warn('Bloqueado Conflictance:', value);
                    return; // Bloquear carga
                }
                if (name === 'class' && value && value.includes('conflictance')) {
                    value = value.replace(/conflictance/g, '');
                }
                return originalSetAttribute.call(this, name, value);
            };
        }
        return element;
    };

    // ELIMINAR ESTILOS EXISTENTES DE CONFLICTANCE
    function eliminarConflictance() {
        // Eliminar stylesheets
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                if (sheet.href && sheet.href.includes('conflictance')) {
                    sheet.disabled = true;
                    sheet.ownerNode?.remove();
                }
            } catch(e) {}
        });
        
        // Eliminar estilos inline
        document.querySelectorAll('[class*="conflictance"], [style*="conflictance"]').forEach(el => {
            el.removeAttribute('class');
            el.removeAttribute('style');
        });
        
        // Eliminar scripts
        document.querySelectorAll('script[src*="conflictance"]').forEach(script => {
            script.remove();
        });
    }

    // EJECUTAR INMEDIATAMENTE Y CADA 100ms
    eliminarConflictance();
    setInterval(eliminarConflictance, 100);
=======
// ESTO DEBE IR EN EL HEAD, ANTES DE CUALQUIER OTRO SCRIPT
(function() {
    'use strict';
    
    // BLOQUEAR CARGA DE CONFLICTANCE
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        if (tagName === 'link' || tagName === 'style') {
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'href' && value && value.includes('conflictance')) {
                    console.warn('Bloqueado Conflictance:', value);
                    return; // Bloquear carga
                }
                if (name === 'class' && value && value.includes('conflictance')) {
                    value = value.replace(/conflictance/g, '');
                }
                return originalSetAttribute.call(this, name, value);
            };
        }
        return element;
    };

    // ELIMINAR ESTILOS EXISTENTES DE CONFLICTANCE
    function eliminarConflictance() {
        // Eliminar stylesheets
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                if (sheet.href && sheet.href.includes('conflictance')) {
                    sheet.disabled = true;
                    sheet.ownerNode?.remove();
                }
            } catch(e) {}
        });
        
        // Eliminar estilos inline
        document.querySelectorAll('[class*="conflictance"], [style*="conflictance"]').forEach(el => {
            el.removeAttribute('class');
            el.removeAttribute('style');
        });
        
        // Eliminar scripts
        document.querySelectorAll('script[src*="conflictance"]').forEach(script => {
            script.remove();
        });
    }

    // EJECUTAR INMEDIATAMENTE Y CADA 100ms
    eliminarConflictance();
    setInterval(eliminarConflictance, 100);
>>>>>>> ec1e43cfb7f709d6f69ef6f58ce66c05937cf404
})();