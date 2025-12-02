// app.js
import { supabase } from './supabaseClient.js';

const createAppForm = document.getElementById('createAppForm');
const createAppModal = document.getElementById('createAppModal');
const cancelAppBtn = document.getElementById('cancelAppBtn');
const newAppBtn = document.getElementById('newAppBtn');
const appsList = document.getElementById('appsList');

// ===========================
// Obtener usuario actual con await
// ===========================
async function getUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

// ===========================
// Cargar apps
// ===========================
async function loadApps() {
    appsList.innerHTML = '';

    const userId = await getUserId();
    if (!userId) return;

    const { data: apps, error } = await supabase
        .from('apps')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando apps:', error.message);
        return;
    }

    apps.forEach(app => {
        const btn = document.createElement('button');
        btn.className = 'app-item';
        btn.innerHTML = `
            <img src="${app.image_url || '/static/images/app-placeholder.png'}" class="app-img">
            <span class="app-name">${app.name}</span>
        `;
        appsList.appendChild(btn);
    });
}

// ===========================
// Subir imagen a Storage
// ===========================
async function uploadImage(file) {
    if (!file) return "";

    const fileName = `${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
        .from('app-images')
        .upload(fileName, file);

    if (error) {
        console.error("Error subiendo imagen:", error.message);
        return "";
    }

    const { data: publicUrl } = supabase.storage
        .from('app-images')
        .getPublicUrl(fileName);

    return publicUrl.publicUrl;
}

// ===========================
// Crear nueva app
// ===========================
createAppForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = await getUserId();
    if (!userId) return alert("Debes iniciar sesión.");

    const file = document.getElementById('appImage').files[0];
    const imageUrl = await uploadImage(file);

    const payload = {
        name: document.getElementById('appName').value,
        description: document.getElementById('appDescription').value,
        image_url: imageUrl,
        team: document.getElementById('appTeam').value,
        theme: document.getElementById('appTheme').value,
        creation_date: document.getElementById('appCreationDate').value,
        status: document.getElementById('appStatus').value,
        official_id: document.getElementById('appOfficialId').value,
        created_by: userId
    };

    const { error } = await supabase
        .from('apps')
        .insert([payload]);

    if (error) {
        alert('❌ Error al crear app: ' + error.message);
        return;
    }

    alert('✅ App creada!');
    createAppForm.reset();
    createAppModal.classList.add('hidden');

    loadApps();
});

// ===========================
document.addEventListener('DOMContentLoaded', loadApps);
