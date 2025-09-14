  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

  const supabaseUrl = 'https://ouoodvqsezartigpzwke.supabase.co'
  const supabaseKey = 'sb_publishable_DTWfFZNCYFZdcXK_s6JWXg_JAOwa9MV'
  const supabase = createClient(supabaseUrl, supabaseKey)

  async function cargarUsuario() {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Actualizar saludo y datos
      document.querySelector('.greeting').textContent = `¡Hola, ${user.user_metadata?.nombre || user.email}!`
      document.querySelector('#name').value = user.user_metadata?.nombre || "Sin nombre"
      document.querySelector('#email').value = user.email
      document.querySelector('#password').value = "********"

      // Consultar tabla perfiles (ejemplo)
      let { data: perfil, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (perfil) {
        document.querySelector('.contract-info').innerHTML = `
          <h2>Información de tu contrato</h2>
          <p><span>Número de contrato:</span> ${perfil.contrato}</p>
          <p><span>Tipo de plan:</span> ${perfil.plan}</p>
          <p><span>Fecha de inicio:</span> ${perfil.fecha_inicio}</p>
          <p><span>Fecha de fin:</span> ${perfil.fecha_fin}</p>
          <p><span>Estado:</span> ${perfil.estado}</p>
        `
      }
    } else {
      // Si no hay sesión activa → redirigir
      window.location.href = '/login.html'
    }
  }

  cargarUsuario()