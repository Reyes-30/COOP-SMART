// Login - COOP-SMART

const API_URL = (window.location.hostname === 'localhost' || window.location.protocol === 'file:')
  ? 'http://localhost:3000'
  : 'https://coop-smart.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const remember = document.getElementById('remember');
  const errorAlert = document.getElementById('errorAlert');
  const successAlert = document.getElementById('successAlert');
  const togglePassword = document.getElementById('togglePassword');
  const eyeIcon = document.getElementById('eyeIcon');

  // Mostrar/Ocultar contraseña
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      if (password.type === 'password') {
        password.type = 'text';
        eyeIcon.textContent = '🙈';
      } else {
        password.type = 'password';
        eyeIcon.textContent = '👁';
      }
    });
  }

  // Recordarme: cargar usuario guardado
  try {
    const savedUser = localStorage.getItem('saved_username');
    if (savedUser) username.value = savedUser;
  } catch {}

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Evitar recarga doble por cualquier comportamiento del navegador
    e.stopPropagation();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    hideAlerts();

    const payload = {
      nombre_usuario: username.value.trim(),
      contrasena: password.value.trim()
    };

    if (!payload.nombre_usuario || !payload.contrasena) {
      return showError('Completa usuario y contraseña');
    }

    try {
      const baseUrl = API_URL.replace('localhost', '127.0.0.1');
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await safeJson(res);
        return showError(err?.error || 'Credenciales inválidas');
      }

      const data = await res.json();
      const token = data?.token;
      const user = data?.usuario || data?.user;

      if (!token || !user) {
        return showError('Respuesta de login inválida');
      }

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (remember.checked) {
        localStorage.setItem('saved_username', payload.nombre_usuario);
      } else {
        localStorage.removeItem('saved_username');
      }
      showSuccess('¡Inicio de sesión exitoso!');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    } catch (error) {
      console.error('Login error:', error);
      showError('No se pudo conectar al servidor');
    }
    // Rehabilitar botón al final
    if (submitBtn) submitBtn.disabled = false;
  });

  function showError(msg) {
    errorAlert.querySelector('.alert-message').textContent = msg;
    errorAlert.style.display = 'flex';
    successAlert.style.display = 'none';
  }
  function showSuccess(msg) {
    successAlert.querySelector('.alert-message').textContent = msg;
    successAlert.style.display = 'flex';
    errorAlert.style.display = 'none';
  }
  function hideAlerts() {
    errorAlert.style.display = 'none';
    successAlert.style.display = 'none';
  }

  async function safeJson(res) {
    try { return await res.json(); } catch (e) { return null; }
  }
});
