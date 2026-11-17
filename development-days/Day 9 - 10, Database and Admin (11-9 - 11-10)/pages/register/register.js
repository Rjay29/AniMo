// Account Registration
// Future Integrations
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const status = document.getElementById('authStatus');
  // Form Submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    status.textContent = 'Creating your account...';
    status.classList.remove('error');
    try {
      await window.aniMoApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: form.elements.username.value,
          password: form.elements.password.value
        })
      });
      window.location.assign('/pages/home/home.html');
    } catch (error) {
      status.textContent = error.message || 'Could not create account. Please try again.';
      status.classList.add('error');
      submit.disabled = false;
    }
  });
});
