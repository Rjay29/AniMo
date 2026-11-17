// Account Login
// Future Integrations
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const status = document.getElementById('authStatus');
  const isAdminLogin = new URLSearchParams(window.location.search).get('next') === '/admin/';
  const password = document.getElementById('loginPassword');
  const passwordToggle = document.getElementById('passwordToggle');

  if (isAdminLogin) {
    document.body.classList.add('admin-login');
    document.title = 'Admin Log In | AniMo';
    document.getElementById('loginEyebrow').textContent = 'Administrator access';
    document.getElementById('loginHeading').textContent = 'Admin Log In';
    document.getElementById('registerLink').hidden = true;
    document.getElementById('userLoginLink').hidden = false;
  } else {
    document.getElementById('adminLoginLink').hidden = false;
  }

  // Click Interaction
  passwordToggle.addEventListener('click', () => {
    const showPassword = password.type === 'password';
    password.type = showPassword ? 'text' : 'password';
    passwordToggle.textContent = showPassword ? 'Hide password' : 'Show password';
    passwordToggle.setAttribute('aria-pressed', String(showPassword));
  });

  // Form Submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    status.textContent = 'Signing in...';
    status.classList.remove('error');
    try {
      const { user } = await window.aniMoApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: form.elements.username.value,
          password: form.elements.password.value
        })
      });
      const requested = new URLSearchParams(window.location.search).get('next');
      if (requested === '/admin/' && user.role !== 'admin') {
        throw new Error('Administrator access requires an administrator account.');
      }
      const safeNext = requested === '/admin/' && user.role === 'admin'
        ? '/admin/'
        : requested && requested.startsWith('/pages/')
        && !requested.startsWith('/pages/login/') && !requested.startsWith('/pages/register/')
        ? requested
        : user.role === 'admin' ? '/admin/' : '/pages/home/home.html';
      window.location.assign(safeNext);
    } catch (error) {
      status.textContent = error.message || 'Could not log in. Please try again.';
      status.classList.add('error');
      submit.disabled = false;
    }
  });
});
