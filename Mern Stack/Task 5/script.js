/**
 * script.js
 * Dynamically creates a login form and implements instruction 3:
 * Event handling & interactivity: validation, show/hide password, loading,
 * enter-key submit, debounced real-time validation, char count, clear form, accessibility.
 *
 * Author: MERN Stack Guru (example)
 */

/* -------------------------
   Utility helpers
   ------------------------- */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const ce = (tag, props = {}, ...children) => {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('aria')) el.setAttribute(k, v);
    else if (k === 'html') el.innerHTML = v;
    else el[k] = v;
  });
  children.flat().forEach(child => {
    if (!child && child !== 0) return;
    el.appendChild(child.nodeType ? child : document.createTextNode(child));
  });
  return el;
};

// debounce helper
const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

/* -------------------------
   Constants & Regex
   ------------------------- */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PASSWORD_MIN = 8;

/* -------------------------
   Build DOM - fully dynamic
   ------------------------- */
(function buildForm() {
  const app = qs('#app');

  // top-level card
  const card = ce('div', { class: 'form-card', role: 'region', 'aria-label': 'Login form card' });

  // Header
  const header = ce('div', { class: 'form-header' },
    ce('div', {}, ce('div', { class: 'form-title', text: 'Sign In' }), ce('div', { class: 'form-sub', text: 'Welcome back — please login' }))
  );

  // Live announcer for accessibility
  const liveRegion = ce('div', { class: 'sr-only', 'aria-live': 'polite', id: 'live-region' });

  // Form element
  const form = ce('form', { role: 'form', id: 'login-form', 'aria-describedby': 'form-desc' });

  // description
  const formDesc = ce('div', { id: 'form-desc', class: 'msg', text: 'Enter your email and password.' });

  // EMAIL group
  const emailGroup = ce('div', { class: 'form-group' },
    ce('label', { class: 'label', htmlFor: 'email', text: 'Email' }),
    ce('input', { id: 'email', class: 'input', type: 'email', name: 'email', placeholder: 'you@example.com', required: true, 'aria-required': 'true', 'aria-label': 'Email address' }),
    ce('div', { class: 'msg', id: 'email-msg' })
  );

  // PASSWORD group (includes toggle and char count)
  const passwordInput = ce('input', { id: 'password', class: 'input', type: 'password', name: 'password', placeholder: 'Your password', required: true, 'aria-required': 'true', 'aria-label': 'Password' });
  const toggleBtn = ce('button', { type: 'button', class: 'toggle-btn', 'aria-pressed': 'false', title: 'Show password', text: 'Show' });
  const charCount = ce('div', { class: 'char-count', text: `0 / ${PASSWORD_MIN}+` });

  const passwordGroup = ce('div', { class: 'form-group' },
    ce('label', { class: 'label', htmlFor: 'password', text: 'Password' }),
    ce('div', { class: 'input-row' }, passwordInput, toggleBtn),
    ce('div', { class: 'msg', id: 'password-msg' }),
    charCount
  );

  // Remember me custom toggle
  const rememberToggle = ce('div', { class: 'toggle', role: 'button', tabIndex: 0, 'aria-pressed': 'false', title: 'Remember me' },
    ce('div', { class: 'checkbox' }, ce('div', { class: 'knob' })),
    ce('div', { class: 'msg', text: 'Remember me' })
  );

  // Buttons: submit, clear
  const submitBtn = ce('button', { type: 'submit', class: 'btn btn-primary', id: 'submit-btn', 'aria-label': 'Sign in' },
    ce('span', { text: 'Sign In' })
  );
  const clearBtn = ce('button', { type: 'button', class: 'btn btn-ghost', id: 'clear-btn', text: 'Clear' });

  // Footer row (remember & actions)
  const footerRow = ce('div', { class: 'form-row' }, rememberToggle, ce('div', {}, submitBtn, ' ', clearBtn));

  // Attach all to form
  form.appendChild(formDesc);
  form.appendChild(emailGroup);
  form.appendChild(passwordGroup);
  form.appendChild(footerRow);

  card.appendChild(header);
  card.appendChild(form);
  card.appendChild(liveRegion);

  app.appendChild(card);

  // Expose elements for later use
  window._loginFormEls = {
    form, emailEl: qs('#email', form), passwordEl: qs('#password', form),
    submitBtn, toggleBtn, charCount, rememberToggle, emailMsg: qs('#email-msg', form), passwordMsg: qs('#password-msg', form),
    liveRegion
  };
})();

/* -------------------------
   Event handling & logic
   ------------------------- */
(function attachLogic() {
  const { form, emailEl, passwordEl, submitBtn, toggleBtn, charCount, rememberToggle, emailMsg, passwordMsg, liveRegion } = window._loginFormEls;

  // small state
  const state = {
    remember: false,
    loading: false
  };

  // helper to set element error/success
  const setFieldState = (el, msgEl, { ok, message = '' }) => {
    el.classList.remove('error', 'success');
    msgEl.classList.remove('error', 'success');
    if (ok === true) {
      el.classList.add('success');
      msgEl.classList.add('success');
      msgEl.textContent = message || 'Looks good.';
    } else if (ok === false) {
      el.classList.add('error');
      msgEl.classList.add('error');
      msgEl.textContent = message;
    } else {
      // neutral
      msgEl.textContent = message || '';
    }
  };

  // Email validation (returns {ok: bool, message})
  const validateEmail = (value) => {
    if (!value || !value.trim()) return { ok: false, message: 'Email is required.' };
    if (!EMAIL_REGEX.test(value.trim())) return { ok: false, message: 'Invalid email format.' };
    return { ok: true, message: 'Valid email.' };
  };

  // Password strength & validation
  const passwordStrength = (pwd) => {
    const lengthOk = pwd.length >= PASSWORD_MIN;
    const hasNum = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#\$%\^&\*]/.test(pwd);
    let score = 0;
    if (lengthOk) score += 1;
    if (hasNum) score += 1;
    if (hasSpecial) score += 1;
    return { lengthOk, hasNum, hasSpecial, score };
  };

  const validatePassword = (value) => {
    if (!value) return { ok: false, message: 'Password is required.' };
    const s = passwordStrength(value);
    if (!s.lengthOk) return { ok: false, message: `Password must be at least ${PASSWORD_MIN} characters.` };
    if (!s.hasNum || !s.hasSpecial) {
      return { ok: false, message: 'Include at least one number and one special character (!@#$%^&*).' };
    }
    return { ok: true, message: 'Strong password.' };
  };

  // update character counter
  const updateCharCount = (val) => {
    charCount.textContent = `${val.length} / ${PASSWORD_MIN}+`;
  };

  // Debounced real-time validators
  const debouncedEmailValidate = debounce(() => {
    const res = validateEmail(emailEl.value);
    setFieldState(emailEl, emailMsg, res.ok ? { ok: true, message: res.message } : { ok: false, message: res.message });
    announceLive(res.message);
  }, 300);

  const debouncedPasswordValidate = debounce(() => {
    const res = validatePassword(passwordEl.value);
    setFieldState(passwordEl, passwordMsg, res.ok ? { ok: true, message: 'Good password.' } : { ok: false, message: res.message });
    announceLive(res.message);
  }, 300);

  // Accessibility announcer
  function announceLive(text) {
    liveRegion.textContent = '';
    // small timeout to ensure assistive tech sees changes
    setTimeout(() => { liveRegion.textContent = text; }, 50);
  }

  /* -------------------------
     Input event listeners
     ------------------------- */
  // Email: input, blur
  emailEl.addEventListener('input', (e) => {
    debouncedEmailValidate();
  });
  emailEl.addEventListener('blur', () => {
    const res = validateEmail(emailEl.value);
    setFieldState(emailEl, emailMsg, res.ok ? { ok: true, message: res.message } : { ok: false, message: res.message });
  });

  // Password: input events (real-time char count + validation)
  passwordEl.addEventListener('input', (e) => {
    const v = passwordEl.value;
    updateCharCount(v);
    debouncedPasswordValidate();
  });

  // Show/hide password toggle
  toggleBtn.addEventListener('click', () => {
    const isPwd = passwordEl.type === 'password';
    passwordEl.type = isPwd ? 'text' : 'password';
    toggleBtn.textContent = isPwd ? 'Hide' : 'Show';
    toggleBtn.setAttribute('aria-pressed', String(isPwd));
    toggleBtn.title = isPwd ? 'Hide password' : 'Show password';
  });

  // Remember toggle (click and keypress for accessibility)
  const setRememberState = (on) => {
    state.remember = on;
    if (on) rememberToggle.classList.add('active');
    else rememberToggle.classList.remove('active');
    rememberToggle.setAttribute('aria-pressed', String(on));
    announceLive(on ? 'Remember me enabled' : 'Remember me disabled');
  };

  rememberToggle.addEventListener('click', () => setRememberState(!state.remember));
  rememberToggle.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRememberState(!state.remember); } });

  // Enter key submission when inside fields
  [emailEl, passwordEl].forEach(el => {
    el.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        // trigger submit
        submitBtn.click();
      }
    });
  });

  // Clear form functionality
  const clearBtn = qs('#clear-btn');
  clearBtn.addEventListener('click', () => {
    form.reset();
    // clear visual states
    [emailEl, passwordEl].forEach(el => {
      el.classList.remove('error', 'success');
    });
    [emailMsg, passwordMsg].forEach(m => m.textContent = '');
    updateCharCount('');
    setRememberState(false);
    announceLive('Form cleared');
  });

  /* -------------------------
     Form submission
     ------------------------- */
  form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    if (state.loading) return;

    // Validate synchronously
    const emailVal = emailEl.value.trim();
    const passVal = passwordEl.value;

    const emailRes = validateEmail(emailVal);
    const passRes = validatePassword(passVal);

    setFieldState(emailEl, emailMsg, emailRes.ok ? { ok: true, message: emailRes.message } : { ok: false, message: emailRes.message });
    setFieldState(passwordEl, passwordMsg, passRes.ok ? { ok: true, message: passRes.message } : { ok: false, message: passRes.message });

    if (!emailRes.ok || !passRes.ok) {
      // invalid: announce and stop
      const errMsg = !emailRes.ok ? emailRes.message : passRes.message;
      announceLive(`Validation error: ${errMsg}`);
      return;
    }

    // All good - show loading state (simulate async)
    state.loading = true;
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Signing in...';

    announceLive('Signing you in');

    // simulate processing delay (in real app you'd call API)
    setTimeout(() => {
      state.loading = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      // Success feedback
      setFieldState(emailEl, emailMsg, { ok: true, message: 'Signed in successfully.' });
      setFieldState(passwordEl, passwordMsg, { ok: true, message: '' });
      announceLive('Signed in successfully');

      // Show final alert with data (for demo only — don't show passwords in production)
      alert(`Signed in!\nEmail: ${emailVal}\nRemember me: ${state.remember ? 'Yes' : 'No'}`);

      // Optionally clear password field while keeping email if remember enabled
      if (!state.remember) passwordEl.value = '';
      updateCharCount(passwordEl.value);
    }, 1000);
  });

  /* -------------------------
     Cleanup notes (if needed)
     ------------------------- */
  // For a single page app you'd keep references and remove listeners when unmounting.
})();
