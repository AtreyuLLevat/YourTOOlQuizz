// analytics.js
import { supabase } from './supabaseClient.js';

export async function registrarEvento(tipo, quizId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await fetch('/api/registrar-evento', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user.id,
      quiz_id: quizId,
      tipo // "impresion" o "click"
    })
  });
}
