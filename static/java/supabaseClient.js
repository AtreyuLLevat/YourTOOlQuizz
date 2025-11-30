// static/java/supabaseClient.js
// Versión compatible con navegador sin bundler ✔

// Import ESM desde CDN (supabase-js v2)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.86.0/+esm";

// ⚠️ IMPORTANTE: NO pongas la anon key directa aquí en producción.
// Flask debe inyectarla desde el backend.
const supabaseUrl = "https://db.ouoodvqsezartigpzwke.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91b29kdnFzZXphcnRpZ3B6d2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzI3NDUsImV4cCI6MjA3MTYwODc0NX0.LiS7sXDRc2KA0uYr3QXp0QM3C_PAmL1pVki0g0cp2wU";

// Crear cliente
export const supabase = createClient(supabaseUrl, SUPABASE_KEY);

// Prueba de conexión
supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
        console.error("❌ Error conectando a Supabase:", error.message);
    } else {
        console.log("✅ Supabase conectado");
    }
});

