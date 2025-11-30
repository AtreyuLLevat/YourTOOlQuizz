// app.js
import { supabase } from './supabaseClient.js';

const createAppForm = document.getElementById('createAppForm');
const createAppModal = document.getElementById('createAppModal');
const cancelAppBtn = document.getElementById('cancelAppBtn');
const newAppBtn = document.getElementById('newAppBtn');
const appsList = document.getElementById('appsList');

// ===========================
// Función para refrescar lista de apps
// ===========================
async function loadApps() {
    appsList.innerHTML = ''; // limpiar lista

    const user = supabase.auth.getUser(); // obtener usuario actual
    const { data: apps, error } = await supabase
        .from('apps')
        .select('*')
        .eq('created_by', user.data.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando apps:', error.message);
        return;
    }

    apps.forEach(app => {
        const btn = document.createElement('button');
        btn.className = 'app-item';
        btn.innerHTML = `
            <img src="${app.image_url || '/static/images/app-placeholder.png'}" alt="App" class="app-img">
            <span class="app-name">${app.name}</span>
        `;
        appsList.appendChild(btn);
    });
}

// ===========================
// Mostrar / ocultar modal
// ===========================
newAppBtn?.addEventListener('click', () => {
    createAppModal.classList.remove('hidden');
});

cancelAppBtn?.addEventListener('click', () => {
    createAppModal.classList.add('hidden');
});

createAppModal?.addEventListener('click', (e) => {
    if (e.target === createAppModal) createAppModal.classList.add('hidden');
});

// ===========================
// Crear nueva app
// ===========================
createAppForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('appName').value;
    const description = document.getElementById('appDescription').value;
    const file = document.getElementById('appImage').files[0];
    const team = document.getElementById('appTeam').value;
    const theme = document.getElementById('appTheme').value;
    const creationDate = document.getElementById('appCreationDate').value;
    const status = document.getElementById('appStatus').value;
    const officialId = document.getElementById('appOfficialId').value;

    // Subir imagen a Storage
    let imageUrl = '';
    if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('app-images')
            .upload(fileName, file);

        if (error) return alert('Error al subir imagen: ' + error.message);

        const { publicUrl, error: urlError } = supabase.storage
            .from('app-images')
            .getPublicUrl(fileName);

        if (urlError) return alert('Error obteniendo URL pública: ' + urlError.message);

        imageUrl = publicUrl;
    }

    // Insertar en tabla apps
    const user = supabase.auth.getUser();
    const { data: insertData, error: insertError } = await supabase
        .from('apps')
        .insert([{
            name,
            description,
            image_url: imageUrl,
            team,
            theme,
            creation_date: creationDate,
            status,
            official_id: officialId,
            created_by: user.data.user.id
        }]);

    if (insertError) return alert('Error al crear app: ' + insertError.message);

    alert('App creada con éxito!');
    createAppForm.reset();
    createAppModal.classList.add('hidden');

    // Refrescar lista
    loadApps();
});

// ===========================
// Cargar apps al inicio
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    loadApps();
});
