/**
 * COOP-SMART - Login JavaScript
 * Funcionalidad del formulario de login
 */

// API Configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://coop-smart.vercel.app';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const errorAlert = document.getElementById('errorAlert');
const successAlert = document.getElementById('successAlert');
const submitBtn = loginForm.querySelector('.btn-primary');

// Toggle Password Visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    eyeIcon.textContent = type === 'password' ? '👁' : '🙈';
});

// Hide alerts on input
[usernameInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
        hideAlerts();
    });
});

// Form Submit Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Validate
    if (!username || !password) {
        showError('Por favor completa todos los campos');
        return;
    }
    
    // Show loading state
    setLoading(true);
    hideAlerts();
    
    try {
        // Call API
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre_usuario: username,
                contrasena: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login successful
            showSuccess('¡Inicio de sesión exitoso!');
            
            // Save token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // Login failed
            showError(data.error || 'Credenciales inválidas');
            setLoading(false);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión. Verifica que el servidor esté corriendo.');
        setLoading(false);
    }
});

// Helper Functions
function showError(message) {
    errorAlert.querySelector('.alert-message').textContent = message;
    errorAlert.style.display = 'flex';
    successAlert.style.display = 'none';
}

function showSuccess(message) {
    successAlert.querySelector('.alert-message').textContent = message;
    successAlert.style.display = 'flex';
    errorAlert.style.display = 'none';
}

function hideAlerts() {
    errorAlert.style.display = 'none';
    successAlert.style.display = 'none';
}

function setLoading(loading) {
    submitBtn.disabled = loading;
    if (loading) {
        submitBtn.classList.add('loading');
        submitBtn.textContent = '';
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'INICIAR SESIÓN';
    }
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
});

// Enter key on inputs
[usernameInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});
