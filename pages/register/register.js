// Account Registration And Verification
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const status = document.getElementById('authStatus');
  const accountType = document.getElementById('accountType');
  const applicantType = document.getElementById('applicantType');
  const farmerFields = document.getElementById('farmerFields');
  const groupDocument = document.getElementById('groupDocument');
  const otpCode = document.getElementById('otpCode');
  const otpStatus = document.getElementById('otpStatus');
  let challengeId = '';
  let verifiedContact = '';

  // Form Mode
  document.querySelectorAll('[data-account-type]').forEach((choice) => {
    choice.addEventListener('click', () => {
      accountType.value = choice.dataset.accountType;
      document.querySelectorAll('[data-account-type]').forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      farmerFields.hidden = accountType.value !== 'farmer';
      ['farmerName', 'farmerLocation', 'farmerSpecialty', 'farmerStory'].forEach((name) => {
        form.elements[name].required = accountType.value === 'farmer';
      });
      document.getElementById('registerHeading').textContent = accountType.value === 'farmer'
        ? 'Apply as a farmer' : 'Create a buyer account';
    });
  });
  applicantType.addEventListener('change', () => {
    groupDocument.hidden = applicantType.value !== 'group';
  });

  // Verification State
  document.getElementById('contact').addEventListener('input', () => {
    challengeId = '';
    verifiedContact = '';
    otpCode.hidden = true;
    document.getElementById('verifyOtpButton').hidden = true;
    otpStatus.textContent = '';
  });

  // One Time Code Request
  document.getElementById('sendOtpButton').addEventListener('click', async () => {
    const contact = document.getElementById('contact').value.trim();
    otpStatus.classList.remove('error');
    otpStatus.textContent = 'Preparing a local demo verification code…';
    try {
      const result = await window.aniMoApi('/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ contact })
      });
      challengeId = result.challengeId;
      verifiedContact = '';
      otpCode.hidden = false;
      document.getElementById('verifyOtpButton').hidden = false;
      otpStatus.textContent = `${result.notice} Demo code: ${result.demoCode}`;
    } catch (error) {
      otpStatus.textContent = error.message || 'Could not start contact verification.';
      otpStatus.classList.add('error');
    }
  });

  // One Time Code Verification
  document.getElementById('verifyOtpButton').addEventListener('click', async () => {
    otpStatus.classList.remove('error');
    try {
      const result = await window.aniMoApi('/api/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ challengeId, code: document.getElementById('otpValue').value.trim() })
      });
      verifiedContact = result.contact;
      otpStatus.textContent = `Verified ${result.contact}.`;
    } catch (error) {
      otpStatus.textContent = error.message || 'Could not verify this code.';
      otpStatus.classList.add('error');
    }
  });

  // Local File Encoding
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      reader.readAsDataURL(file);
    });
  }

  // Profile Image Preparation
  async function prepareProfilePicture(file) {
    if (!file) return null;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      throw new Error('Choose a JPG, PNG, or WebP profile picture under 5 MB.');
    }
    const source = await readFile(file);
    const image = new Image();
    image.src = source;
    await image.decode();
    const scale = Math.min(1, 800 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the profile picture.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', 0.8);
  }

  // Farmer Document Preparation
  async function documentValue(inputName, key) {
    const file = form.elements[inputName].files[0];
    if (!file) throw new Error(`Attach the ${key} document.`);
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      throw new Error(`${key} must be a PDF, JPG, or PNG smaller than 3 MB.`);
    }
    return { name: file.name, data: await readFile(file) };
  }

  // Registration Submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!challengeId || !verifiedContact) {
      status.textContent = 'Verify your email address or Philippine mobile number before continuing.';
      status.classList.add('error');
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    status.classList.remove('error');
    status.textContent = 'Creating your account…';
    try {
      const body = {
        accountType: accountType.value,
        username: form.elements.username.value,
        displayName: form.elements.displayName.value,
        contact: document.getElementById('contact').value,
        password: form.elements.password.value,
        termsAccepted: form.elements.termsAccepted.checked,
        otpChallengeId: challengeId,
        profilePicture: await prepareProfilePicture(form.elements.profilePicture.files[0])
      };
      if (accountType.value === 'farmer') {
        body.applicantType = applicantType.value;
        body.farmerProfile = {
          name: form.elements.farmerName.value,
          location: form.elements.farmerLocation.value,
          specialty: form.elements.farmerSpecialty.value,
          story: form.elements.farmerStory.value
        };
        body.documents = {
          governmentId: await documentValue('governmentId', 'government-issued ID'),
          proofOfAddress: await documentValue('proofOfAddress', 'proof of address'),
          bankProof: await documentValue('bankProof', 'bank account proof')
        };
        if (applicantType.value === 'group') {
          body.documents.daAccreditation = await documentValue('daAccreditation', 'DA accreditation');
        }
      }
      const result = await window.aniMoApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      if (result.pending) {
        status.classList.remove('error');
        status.textContent = result.message;
        form.reset();
        return;
      }
      window.location.assign('/pages/home/home.html');
    } catch (error) {
      status.textContent = error.message || 'Could not create account. Please try again.';
      status.classList.add('error');
    } finally {
      submit.disabled = false;
    }
  });
});
