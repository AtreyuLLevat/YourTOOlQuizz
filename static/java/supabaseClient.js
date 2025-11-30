// static/java/supabaseClient.js
// Versión compatible con navegador sin bundler ✔

// Import ESM desde CDN (supabase-js v2)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.86.0/+esm";

// ⚠️ IMPORTANTE: NO pongas la anon key directa aquí en producción.
// Flask debe inyectarla desde el backend.
const SUPABASE_URL = "{{ SUPABASE_URL }}";
const SUPABASE_KEY = "{{ SUPABASE_KEY }}";

// Crear cliente
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Prueba de conexión
supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
        console.error("❌ Error conectando a Supabase:", error.message);
    } else {
        console.log("✅ Supabase conectado");
    }
});


