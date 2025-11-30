// static/java/supabaseClient.js - VERSIÓN LOCAL
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://db.ouoodvqsezartigpzwke.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91b29kdnFzZXphcnRpZ3B6d2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzI3NDUsImV4cCI6MjA3MTYwODc0NX0.LiS7sXDRc2KA0uYr3QXp0QM3C_PAmL1pVki0g0cp2wU";

// Crear y exportar el cliente de Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Opcional: Verificar que la conexión funciona
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Error conectando a Supabase:', error.message);
  } else {
    console.log('✅ Supabase conectado correctamente');
  }
});