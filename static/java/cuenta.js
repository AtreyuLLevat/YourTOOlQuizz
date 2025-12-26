import { supabase } from './supabaseClient.js'

function toast(msg) {
  const div = document.createElement('div')
  div.textContent = msg
  div.style = 'position:fixed;bottom:20px;right:20px;background:#111827;color:#fff;padding:10px 16px;border-radius:8px;'
  document.body.appendChild(div)
  setTimeout(() => div.remove(), 2500)
}


// ====== Detectar usuario actual ======
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  window.location.href = '/login'  // redirige si no hay sesión
}

// Rellenar datos iniciales
document.getElementById('email').value = user.email
if (user.user_metadata?.name)
  document.getElementById('name').value = user.user_metadata.name

// ====== Mostrar botón “Guardar” solo si hay cambios ======
function activarBoton(idBoton) {
  const btn = document.getElementById(idBoton)
  if (btn) btn.classList.remove('hidden')
}

function ocultarBoton(idBoton) {
  const btn = document.getElementById(idBoton)
  if (btn) btn.classList.add('hidden')
}

document.querySelectorAll('#perfil input, #privacidad input, #notificaciones input')
  .forEach(input => {
    input.addEventListener('input', e => {
      const section = e.target.closest('section')
      const btn = section.querySelector('.btn.primary')
      if (btn) activarBoton(btn.id)
    })
  })

// ====== Guardar perfil ======
document.getElementById('saveProfile').addEventListener('click', async () => {
  const email = document.getElementById('email').value
  const name = document.getElementById('name').value

  const { error } = await supabase.auth.updateUser({
    email,
    data: { name }
  })

  if (!error) {
    alert('Perfil actualizado correctamente.')
    ocultarBoton('saveProfile')
  } else {
    alert('Error: ' + error.message)
  }
})

// ====== Guardar privacidad ======
document.getElementById('savePrivacy').addEventListener('click', async () => {
  const publicProfile = document.getElementById('publicProfile').checked
  const dataUsage = document.getElementById('dataUsage').checked

  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, public_profile: publicProfile, data_usage: dataUsage })

  if (!error) {
    alert('Preferencias guardadas.')
    ocultarBoton('savePrivacy')
  } else {
    alert('Error: ' + error.message)
  }
})

// ====== Guardar notificaciones ======
document.getElementById('saveNotifications').addEventListener('click', async () => {
  const newsletters = document.getElementById('newsletters').checked
  const reminders = document.getElementById('reminders').checked
  const offers = document.getElementById('offers').checked

  const { error } = await supabase
    .from('user_notifications')
    .upsert({ user_id: user.id, newsletters, reminders, offers })

  if (!error) {
    alert('Notificaciones actualizadas.')
    ocultarBoton('saveNotifications')
  } else {
    alert('Error: ' + error.message)
  }
})

// ====== Cambiar contraseña ======
const modal = document.getElementById('modal')
document.getElementById('changeBtn').addEventListener('click', () => modal.style.display = 'flex')
document.getElementById('cancelModal').addEventListener('click', () => modal.style.display = 'none')

document.getElementById('saveModal').addEventListener('click', async () => {
  const newPwd = document.getElementById('newPwd').value
  const confirmPwd = document.getElementById('confirmPwd').value
  if (newPwd !== confirmPwd) return alert('Las contraseñas no coinciden.')

  const { error } = await supabase.auth.updateUser({ password: newPwd })
  if (!error) {
    alert('Contraseña actualizada correctamente.')
    modal.style.display = 'none'
  } else {
    alert('Error: ' + error.message)
  }
})

// ====== Cerrar sesión ======
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = '/login'


  
})
