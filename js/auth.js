const PASS_HASH = '4a1b2a0b6b8c7d81f60b85afcd79b2c51a93fc55807f4fc461dabf129ff720fb';

const Auth = {
  SESSION_KEY: 'fin_session',

  isAuthenticated() {
    return sessionStorage.getItem(this.SESSION_KEY) === '1';
  },

  init() {
    Store.init();
    if (this.isAuthenticated()) {
      document.getElementById('login-screen').classList.add('hidden');
      App.init();
      return;
    }
    document.getElementById('app').style.visibility = 'hidden';
  },

  async login() {
    const input = document.getElementById('login-pass');
    const pass  = input?.value || '';
    const hash  = await this._sha256(pass);
    if (hash === PASS_HASH) {
      sessionStorage.setItem(this.SESSION_KEY, '1');
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app').style.visibility = 'visible';
      App.init();
    } else {
      document.getElementById('login-error').textContent = 'Contraseña incorrecta';
      input.value = '';
      input.focus();
    }
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    location.reload();
  },

  _sha256(msg) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg))
      .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join(''));
  }
};
