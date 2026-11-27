// Account Login
// Future Integrations
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const status = document.getElementById('authStatus');
  const requested = new URLSearchParams(window.location.search).get('next') || '';
  const isAdminLogin = /^\/control\/[a-f0-9]{48}\/?$/.test(requested);
  const accountType = document.getElementById('accountType');
  const password = document.getElementById('loginPassword');
  const passwordToggle = document.getElementById('passwordToggle');

  if (isAdminLogin) {
    document.body.classList.add('admin-login');
    document.title = 'Admin Log In | AniMo';
    document.getElementById('loginEyebrow').textContent = 'Administrator access';
    document.getElementById('loginHeading').textContent = 'Admin Log In';
    document.getElementById('registerLink').hidden = true;
    document.getElementById('userLoginLink').hidden = false;
    document.getElementById('accountChoice').hidden = true;
    accountType.value = 'admin';
  } else {
    document.querySelectorAll('[data-account-type]').forEach((choice) => {
      choice.addEventListener('click', () => {
        accountType.value = choice.dataset.accountType;
        document.querySelectorAll('[data-account-type]').forEach((item) => {
          const selected = item === choice;
          item.classList.toggle('active', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        document.getElementById('loginHeading').textContent = choice.dataset.accountType === 'farmer'
          ? 'Farmer Log In' : 'Buyer Log In';
      });
    });
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
          accountType: accountType.value,
          password: form.elements.password.value
        })
      });
      if (isAdminLogin && user.role !== 'admin') throw new Error('Administrator access requires an administrator account.');
      const safeNext = isAdminLogin && user.role === 'admin'
        ? requested
        : requested && requested.startsWith('/pages/')
        && !requested.startsWith('/pages/login/') && !requested.startsWith('/pages/register/')
        ? requested
        : user.role === 'farmer' ? '/pages/farmer-dashboard/farmer-dashboard.html'
        : user.role === 'admin' ? '/pages/home/home.html' : '/pages/home/home.html';
      window.location.assign(safeNext);
    } catch (error) {
      status.textContent = error.message || 'Could not log in. Please try again.';
      status.classList.add('error');
      submit.disabled = false;
    }
  });
});
