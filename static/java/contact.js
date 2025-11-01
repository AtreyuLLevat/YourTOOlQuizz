// contact.js — inicializador robusto con logging, polling + MutationObserver
(function () {
  const LOG = true;
  const debug = (...args) => { if (LOG) console.log("[contact.js]", ...args); };

  // Espera por elementos usando MutationObserver y fallback polling
  function waitFor(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) {
        debug("waitFor immediate:", selector);
        return resolve(el);
      }

      const observer = new MutationObserver((mutations, obs) => {
        const found = document.querySelector(selector);
        if (found) {
          debug("waitFor via MutationObserver:", selector);
          obs.disconnect();
          resolve(found);
        }
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });

      // Fallback polling in case MutationObserver misses it
      const start = Date.now();
      const interval = setInterval(() => {
        const found = document.querySelector(selector);
        if (found) {
          clearInterval(interval);
          observer.disconnect();
          debug("waitFor via polling:", selector);
          return resolve(found);
        }
        if (Date.now() - start > timeout) {
          clearInterval(interval);
          observer.disconnect();
          debug("waitFor TIMEOUT:", selector);
          return reject(new Error("Timeout waiting for " + selector));
        }
      }, 120);
    });
  }

  async function init() {
    try {
      // Esperamos a main y a los elementos del menú
      await waitFor("main", 7000);
      const main = document.querySelector("main");
      await waitFor(".menu", 7000);

      const sections = Array.from(main.querySelectorAll("section"));
      const navLinks = Array.from(document.querySelectorAll(".menu a"));

      debug("Found main, sections:", sections.length, "links:", navLinks.length);

      if (!sections.length || !navLinks.length) {
        debug("Missing sections or navLinks — aborting.");
        return;
      }

      // Mostrar solo la sección indicada por hash o la primera
      const showSection = (id) => {
        debug("showSection:", id);
        sections.forEach(s => {
          s.style.display = (s.id === id) ? "block" : "none";
        });
        navLinks.forEach(l => {
          l.classList.toggle("active", l.getAttribute("href") === "#" + id);
        });
        // opcional: actualizar url sin añadir al historial
        history.replaceState(null, null, "#" + id);
      };

      // Inicializar: si hay hash válido, mostrarlo, si no, la primera
      const hash = window.location.hash.replace("#", "");
      const initial = hash && document.getElementById(hash) ? hash : sections[0].id;
      showSection(initial);

      // Click handlers
      navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const target = link.getAttribute("href").substring(1);
          if (!document.getElementById(target)) {
            debug("Click target not found:", target);
            return;
          }
          showSection(target);
          // scroll suave al main
          window.scrollTo({ top: main.offsetTop - 20, behavior: "smooth" });
        });
      });

      // Escuchar cambios de hash por usuario (ej: back/forward)
      window.addEventListener("hashchange", () => {
        const h = window.location.hash.replace("#", "");
        if (document.getElementById(h)) showSection(h);
      });

      debug("contact.js initialized successfully.");
    } catch (err) {
      console.error("[contact.js] init error:", err);
    }
  }

  // Ejecutar cuando el documento esté listo (no importa si defer/async)
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(init, 10);
  } else {
    window.addEventListener("DOMContentLoaded", init);
  }
})();
