const Auth = {
  SESSION_KEY: 'fin_session',
  _pass: 'rocio2026',

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

    document.getElementById('login-btn').addEventListener('click', () => Auth.login());
    document.getElementById('login-pass').addEventListener('keydown', e => {
      if (e.key === 'Enter') Auth.login();
    });
  },

  login() {
    const input = document.getElementById('login-pass');
    const pass  = input ? input.value : '';
    if (pass === this._pass) {
      sessionStorage.setItem(this.SESSION_KEY, '1');
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app').style.visibility = 'visible';
      App.init();
    } else {
      document.getElementById('login-error').textContent = 'Contraseña incorrecta';
      if (input) { input.value = ''; input.focus(); }
    }
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    location.reload();
  }
};
