<<<<<<< HEAD
function togglePassword(id, btn) {
    const input = document.getElementById(id);
    const svg = btn.querySelector('svg');
    const eye = svg.querySelector('.eye');
    const slash = svg.querySelector('.slash');

    if (input.type === "password") {
        input.type = "text";
        slash.style.display = "none"; // quitar tachado
        eye.setAttribute("fill", "#000");
    } else {
        input.type = "password";
        slash.style.display = "block"; // poner tachado
        eye.setAttribute("fill", "#888");
    }
}

// Validación en tiempo real
const newPassword = document.getElementById('new_password');
const confirmPassword = document.getElementById('confirm_password');
const submitBtn = document.getElementById('submit-btn');
const newPasswordError = document.getElementById('new-password-error');
const confirmPasswordError = document.getElementById('confirm-password-error');

function validatePasswords() {
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&¿¡?_'-]).{8,}$/;
    const newPassNotEmpty = newPassword.value.length > 0;
    const newPassValid = pattern.test(newPassword.value);
    const confirmMatch = newPassword.value === confirmPassword.value;

    newPasswordError.style.display = newPassNotEmpty && !newPassValid ? 'block' : 'none';
    confirmPasswordError.style.display = confirmPassword.value.length > 0 && !confirmMatch ? 'block' : 'none';

    submitBtn.disabled = !(newPassValid && confirmMatch);
}

newPassword.addEventListener('input', validatePasswords);
confirmPassword.addEventListener('input', validatePasswords);
=======
function togglePassword(id, btn) {
    const input = document.getElementById(id);
    const svg = btn.querySelector('svg');
    const eye = svg.querySelector('.eye');
    const slash = svg.querySelector('.slash');

    if (input.type === "password") {
        input.type = "text";
        slash.style.display = "none"; // quitar tachado
        eye.setAttribute("fill", "#000");
    } else {
        input.type = "password";
        slash.style.display = "block"; // poner tachado
        eye.setAttribute("fill", "#888");
    }
}

// Validación en tiempo real
const newPassword = document.getElementById('new_password');
const confirmPassword = document.getElementById('confirm_password');
const submitBtn = document.getElementById('submit-btn');
const newPasswordError = document.getElementById('new-password-error');
const confirmPasswordError = document.getElementById('confirm-password-error');

function validatePasswords() {
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&¿¡?_'-]).{8,}$/;
    const newPassNotEmpty = newPassword.value.length > 0;
    const newPassValid = pattern.test(newPassword.value);
    const confirmMatch = newPassword.value === confirmPassword.value;

    newPasswordError.style.display = newPassNotEmpty && !newPassValid ? 'block' : 'none';
    confirmPasswordError.style.display = confirmPassword.value.length > 0 && !confirmMatch ? 'block' : 'none';

    submitBtn.disabled = !(newPassValid && confirmMatch);
}

newPassword.addEventListener('input', validatePasswords);
confirmPassword.addEventListener('input', validatePasswords);
>>>>>>> ec1e43cfb7f709d6f69ef6f58ce66c05937cf404
validatePasswords();