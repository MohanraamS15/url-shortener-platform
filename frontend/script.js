
function showMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent  = text;
  el.className    = `msg ${type}`;
}

function setLoading(btn, loading, defaultText) {
  if (loading) {
    btn.disabled   = true;
    btn.innerHTML  = '<span class="spinner"></span>';
  } else {
    btn.disabled   = false;
    btn.textContent = defaultText;
  }
}

//Register

const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn      = document.getElementById('submit-btn');

    setLoading(btn, true);

    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.user?.name) localStorage.setItem('userName', data.user.name);
        window.location.href = 'dashboard.html';
      } else {
        showMsg('msg', data.msg || 'Registration failed.');
      }
    } catch {
      showMsg('msg', 'Could not connect to server.');
    } finally {
      setLoading(btn, false, 'Create account');
    }
  });
}

//Login

const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn      = document.getElementById('submit-btn');

    setLoading(btn, true);

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.user?.name) localStorage.setItem('userName', data.user.name);
        window.location.href = 'dashboard.html';
      } else {
        showMsg('msg', data.msg || 'Invalid email or password.');
      }
    } catch {
      showMsg('msg', 'Could not connect to server.');
    } finally {
      setLoading(btn, false, 'Sign in');
    }
  });
}

//Dashboard

const urlForm = document.getElementById('url-form');

if (urlForm) {

  // Auth guard
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
  }

  // Show user name in topbar
  const userName = localStorage.getItem('userName');
  const nameChip = document.getElementById('user-name');
  if (nameChip && userName) nameChip.textContent = userName;

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
  });

  // Shorten URL
  urlForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('url').value.trim();
    const btn = document.getElementById('shorten-btn');

    if (!url) {
      showMsg('form-msg', 'Please enter a URL.');
      return;
    }

    // Clear previous result & msg
    document.getElementById('result').innerHTML = '';
    document.getElementById('form-msg').className = 'msg';

    setLoading(btn, true);

    try {
      const response = await fetch('http://localhost:5000/shorten', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        showMsg('form-msg', data.msg || 'Something went wrong.');
        return;
      }

      const shortUrl = `http://localhost:5000/shorten/${data.shortCode}`;

      const lastAccessed = data.lastAccessedAt
        ? new Date(data.lastAccessedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })
        : 'Never';

      document.getElementById('result').innerHTML = `
        <div class="result-card">
          <h3>Short link ready <span class="badge">✓ Created</span></h3>

          <div class="result-row">
            <span class="label">Original</span>
            <span class="value">${data.url}</span>
          </div>

          <div class="result-row">
            <span class="label">Short URL</span>
            <span class="value">
              <a href="${shortUrl}" target="_blank">${shortUrl}</a>
            </span>
          </div>

          <div class="result-row">
            <span class="label">Clicks</span>
            <span class="value">${data.accessCount ?? 0}</span>
          </div>

          <div class="result-row">
            <span class="label">Last visited</span>
            <span class="value">${lastAccessed}</span>
          </div>

          <div class="result-actions">
            <button class="btn btn-copy" id="copy-btn">Copy link</button>
            <a href="${shortUrl}" target="_blank" class="btn btn-ghost">Open ↗</a>
          </div>

          <p class="expiry-note">⏱ This link stays active for 7 days from the last visit.</p>
        </div>
      `;

      // Copy button
      document.getElementById('copy-btn').addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(shortUrl);
          this.textContent = '✓ Copied!';
          this.classList.add('copied');
          setTimeout(() => {
            this.textContent = 'Copy link';
            this.classList.remove('copied');
          }, 2000);
        } catch {
          alert('Copy failed — please copy manually.');
        }
      });

    } catch {
      showMsg('form-msg', 'Could not connect to server.');
    } finally {
      setLoading(btn, false, 'Shorten');
    }
  });
}