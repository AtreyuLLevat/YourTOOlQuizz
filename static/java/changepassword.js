document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const new_password = document.getElementById('new_password').value;
    const confirm_password = document.getElementById('confirm_password').value;

    if(new_password !== confirm_password){
        const feedback = document.getElementById('passwordFeedback');
        feedback.style.color = 'red';
        feedback.style.display = 'block';
        feedback.textContent = 'Las contraseñas no coinciden';
        return;
    }

    try {
        const resp = await fetch('{{ url_for("change_password") }}', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({new_password})
        });
        const data = await resp.json();

        const feedback = document.getElementById('passwordFeedback');
        feedback.style.display = 'block';

        if(data.status === 'success'){
            feedback.style.color = 'green';
            feedback.textContent = 'Contraseña actualizada con éxito 🎉';
            document.getElementById('changePasswordForm').reset();
        } else {
            feedback.style.color = 'red';
            feedback.textContent = data.error || 'Error al actualizar la contraseña';
        }
    } catch(err){
        const feedback = document.getElementById('passwordFeedback');
        feedback.style.color = 'red';
        feedback.style.display = 'block';
        feedback.textContent = 'Error de conexión';
    }
});