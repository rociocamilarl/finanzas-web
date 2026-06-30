// Autenticación con contraseña hasheada (SHA-256 via Web Crypto)
const Auth = {
  SESSION_KEY: 'fin_auth_session',
  PASS_KEY:    'fin_auth_hash',
  // Hash SHA-256 de "rocio2026" (contraseña por defecto)
  DEFAULT_HASH: '4a1b2a0b6b8c7d81f60b85afcd79b2c51a93fc55807f4fc461dabf129ff720fb',

  async hash(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  getStoredHash() {
    return localStorage.getItem(this.PASS_KEY) || this.DEFAULT_HASH;
  },

  isAuthenticated() {
    return sessionStorage.getItem(this.SESSION_KEY) === '1';
  },

  setSession() {
    sessionStorage.setItem(this.SESSION_KEY, '1');
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    location.reload();
  },

  async verify(password) {
    const h = await this.hash(password);
    // Primera vez: comparar con hash precalculado del default
    const stored = this.getStoredHash();
    // Si aún es el default, usamos comparación directa de hash
    return h === stored;
  },

  async changePassword(oldPass, newPass) {
    const oldHash = await this.hash(oldPass);
    if (oldHash !== this.getStoredHash()) return false;
    const newHash = await this.hash(newPass);
    localStorage.setItem(this.PASS_KEY, newHash);
    return true;
  },

  init() {
    const screen = document.getElementById('login-screen');
    const form   = document.getElementById('login-form');
    const input  = document.getElementById('login-pass');
    const error  = document.getElementById('login-error');

    if (this.isAuthenticated()) {
      screen.classList.add('hidden');
      return;
    }

    // Mostrar pantalla de login
    document.getElementById('app').style.visibility = 'hidden';

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const pass = input.value;
      if (!pass) return;

      const ok = await this.verify(pass);
      if (ok) {
        this.setSession();
        screen.classList.add('hidden');
        document.getElementById('app').style.visibility = 'visible';
        App.init();
      } else {
        error.classList.add('show');
        input.value = '';
        input.classList.add('shake');
        input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
        setTimeout(() => error.classList.remove('show'), 3000);
      }
    });
  }
};
