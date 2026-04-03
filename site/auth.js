/* ============================================
   SYNTH3D — auth.js
   All authentication logic — wired to Supabase.
   Works as soon as you fill in supabase.js keys.
   ============================================ */

/* ── Helpers ── */

const BASE_URL = 'http://127.0.0.1:5500/site';

function showAlert(id, message, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className   = `auth-alert ${type}`;
    el.style.display = 'block';
  }
  
  function hideAlert(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }
  
  function setLoading(btnId, spinnerId, textId, loading, text = '') {
    const btn     = document.getElementById(btnId);
    const spinner = document.getElementById(spinnerId);
    const txt     = document.getElementById(textId);
    if (!btn) return;
    btn.disabled          = loading;
    spinner.style.display = loading ? 'inline-block' : 'none';
    if (text) txt.textContent = text;
  }
  
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  function fieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  
  function clearErrors(...ids) {
    ids.forEach(id => fieldError(id, ''));
  }
  
  function markField(inputId, valid) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.classList.toggle('valid',   valid);
    el.classList.toggle('invalid', !valid);
  }
  
  /* ── Password strength ── */
  function checkPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
  
    const levels = [
      { label: 'Very weak', color: '#ef4444', pct: '15%' },
      { label: 'Weak',      color: '#f97316', pct: '30%' },
      { label: 'Fair',      color: '#eab308', pct: '55%' },
      { label: 'Good',      color: '#22c55e', pct: '80%' },
      { label: 'Strong',    color: '#4ade80', pct: '100%' },
    ];
    return levels[Math.min(score, 4)];
  }
  
  /* ── Toggle password visibility ── */
  function initPasswordToggle(inputId = 'password', btnId = 'togglePw') {
    const btn   = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const show     = input.type === 'password';
      input.type     = show ? 'text' : 'password';
      btn.textContent = show ? '🙈' : '👁';
    });
  }
  
  /* ── OAuth ── */
  function initOAuth() {
    const googleBtn = document.getElementById('googleBtn');
    const githubBtn = document.getElementById('githubBtn');
  
    if (googleBtn) {
      googleBtn.addEventListener('click', async () => {
        const { error } = await window.sb.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: BASE_URL + '/index.html' }
        });
        if (error) showAlert('authAlert', error.message);
      });
    }
  
    if (githubBtn) {
      githubBtn.addEventListener('click', async () => {
        const { error } = await window.sb.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo: BASE_URL + '/index.html' }
        });
        if (error) showAlert('authAlert', error.message);
      });
    }
  }
  
  /* ── Store pending email for confirm page ── */
  function setPendingEmail(email) {
    sessionStorage.setItem('synth3d_pending_email', email);
  }
  function getPendingEmail() {
    return sessionStorage.getItem('synth3d_pending_email') || 'your email address';
  }
  
  /* ============================================
     LOGIN PAGE
     ============================================ */
  function initLoginPage() {
    initPasswordToggle();
    initOAuth();
  
    // If already logged in, redirect home
    window.sb.auth.getUser().then(({ data }) => {
      if (data?.user) window.location.href = 'index.html';
    });
  
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert('authAlert');
      clearErrors('emailError', 'passwordError');
  
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
  
      let valid = true;
      if (!isValidEmail(email)) {
        fieldError('emailError', 'Please enter a valid email address.');
        markField('email', false);
        valid = false;
      }
      if (password.length < 6) {
        fieldError('passwordError', 'Password must be at least 6 characters.');
        markField('password', false);
        valid = false;
      }
      if (!valid) return;
  
      setLoading('submitBtn', 'submitSpinner', 'submitText', true, 'Signing in…');
  
      const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
  
      setLoading('submitBtn', 'submitSpinner', 'submitText', false, 'Sign in');
  
      if (error) {
        // Friendly error messages
        const msg = error.message.includes('Email not confirmed')
          ? 'Please confirm your email first. Check your inbox.'
          : error.message.includes('Invalid login')
          ? 'Incorrect email or password.'
          : error.message;
        showAlert('authAlert', msg, 'error');
        return;
      }
  
      // Success — redirect
      window.location.href = 'index.html';
    });
  }
  
  /* ============================================
     REGISTER PAGE
     ============================================ */
  function initRegisterPage() {
    initPasswordToggle();
    initOAuth();
  
    // Password strength meter
    const pwInput    = document.getElementById('password');
    const pwStrength = document.getElementById('pwStrength');
    const pwFill     = document.getElementById('pwFill');
    const pwLabel    = document.getElementById('pwLabel');
  
    if (pwInput) {
      pwInput.addEventListener('input', () => {
        const val = pwInput.value;
        if (!val) { pwStrength.style.display = 'none'; return; }
        pwStrength.style.display = 'flex';
        const result = checkPasswordStrength(val);
        pwFill.style.width      = result.pct;
        pwFill.style.background = result.color;
        pwLabel.textContent     = result.label;
        pwLabel.style.color     = result.color;
      });
    }
  
    // Confirm password live check
    const confirmInput = document.getElementById('confirmPassword');
    const confirmIcon  = document.getElementById('confirmIcon');
    if (confirmInput) {
      confirmInput.addEventListener('input', () => {
        const match = confirmInput.value === pwInput.value;
        confirmIcon.textContent = confirmInput.value ? (match ? '✓' : '✗') : '';
        confirmIcon.style.color = match ? '#4ade80' : '#fca5a5';
        markField('confirmPassword', match);
      });
    }
  
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert('authAlert');
      clearErrors('usernameError', 'emailError', 'passwordError', 'confirmError', 'termsError');
  
      const username = document.getElementById('username').value.trim();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm  = document.getElementById('confirmPassword').value;
      const terms    = document.getElementById('terms').checked;
  
      let valid = true;
  
      if (username.length < 3) {
        fieldError('usernameError', 'Username must be at least 3 characters.');
        markField('username', false); valid = false;
      }
      if (!isValidEmail(email)) {
        fieldError('emailError', 'Please enter a valid email address.');
        markField('email', false); valid = false;
      }
      if (password.length < 8) {
        fieldError('passwordError', 'Password must be at least 8 characters.');
        markField('password', false); valid = false;
      }
      if (password !== confirm) {
        fieldError('confirmError', 'Passwords do not match.');
        markField('confirmPassword', false); valid = false;
      }
      if (!terms) {
        fieldError('termsError', 'You must accept the terms to continue.');
        valid = false;
      }
      if (!valid) return;
  
      setLoading('submitBtn', 'submitSpinner', 'submitText', true, 'Creating account…');
  
      const { data, error } = await window.sb.auth.signUp({
        email,
        password,
        options: {
          data: { username },           
          emailRedirectTo: BASE_URL + '/login.html',
        }
      });
  
      setLoading('submitBtn', 'submitSpinner', 'submitText', false, 'Create account');
  
      if (error) {
        const msg = error.message.includes('already registered')
          ? 'An account with this email already exists.'
          : error.message;
        showAlert('authAlert', msg, 'error');
        return;
      }
  
      // Supabase sends confirmation email automatically
      setPendingEmail(email);
      window.location.href = 'confirm-email.html';
    });
  }
  
  /* ============================================
     CONFIRM EMAIL PAGE
     ============================================ */
  function initConfirmPage() {
    // Show the email they signed up with
    const emailEl = document.getElementById('confirmEmail');
    if (emailEl) emailEl.textContent = getPendingEmail();
  
    // Resend button
    const resendBtn = document.getElementById('resendBtn');
    if (resendBtn) {
      resendBtn.addEventListener('click', async () => {
        const email = getPendingEmail();
        if (email === 'your email address') {
          showAlert('resendAlert', 'Could not find your email. Please register again.', 'error');
          return;
        }
  
        setLoading('resendBtn', 'resendSpinner', 'resendText', true, 'Sending…');
  
        const { error } = await window.sb.auth.resend({
          type: 'signup',
          email,
          options: { emailRedirectTo: BASE_URL + '/reset-password.html' }
        });
  
        setLoading('resendBtn', 'resendSpinner', 'resendText', false, 'Resend confirmation email');
  
        if (error) {
          showAlert('resendAlert', error.message, 'error');
        } else {
          showAlert('resendAlert', 'Confirmation email resent! Check your inbox.', 'success');
          // Disable for 60s to prevent abuse
          resendBtn.disabled = true;
          let secs = 60;
          const interval = setInterval(() => {
            document.getElementById('resendText').textContent = `Resend again in ${--secs}s`;
            if (secs <= 0) {
              clearInterval(interval);
              resendBtn.disabled = false;
              document.getElementById('resendText').textContent = 'Resend confirmation email';
            }
          }, 1000);
        }
      });
    }
  }
  
  /* ============================================
     FORGOT PASSWORD PAGE
     ============================================ */
  function initForgotPage() {
    document.getElementById('forgotForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert('authAlert');
      clearErrors('emailError');
  
      const email = document.getElementById('email').value.trim();
      if (!isValidEmail(email)) {
        fieldError('emailError', 'Please enter a valid email address.');
        markField('email', false);
        return;
      }
  
      setLoading('submitBtn', 'submitSpinner', 'submitText', true, 'Sending…');
  
      const { error } = await window.sb.auth.resetPasswordForEmail(email, {
        redirectTo: BASE_URL + '/reset-password.html',
      });
  
      setLoading('submitBtn', 'submitSpinner', 'submitText', false, 'Send reset link');
  
      // Always show success (don't reveal if email exists — security best practice)
      showAlert('authAlert', 'If an account exists with that email, a reset link is on its way.', 'success');
    });
  }