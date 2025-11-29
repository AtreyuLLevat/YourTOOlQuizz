import { supabase } from './supabaseClient.js';

const createAppForm = document.getElementById('createAppForm');

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
        imageUrl = supabase.storage.from('app-images').getPublicUrl(fileName).publicUrl;
    }

    // Insertar en tabla apps
    const { data, error } = await supabase
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
            created_by: supabase.auth.user().id
        }]);

    if (error) return alert('Error al crear app: ' + error.message);

    alert('App creada con éxito!');
    createAppForm.reset();
    document.getElementById('createAppModal').classList.add('hidden');
    // refrescar lista de apps aquí
});
