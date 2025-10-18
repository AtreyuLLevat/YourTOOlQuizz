// utils.js
import { supabase } from './supabaseClient.js';

export async function verificarPlanActivo() {
  // Obtenemos el usuario actual desde Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("Usuario no autenticado");
    return false;
  }

  // Consultamos al backend Flask para verificar el plan activo
  const resp = await fetch('/api/verificar-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id })
  });

  const result = await resp.json();
  return result.activo === true;
}
