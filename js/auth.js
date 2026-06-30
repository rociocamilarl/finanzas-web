const PASS = btoa('rocio2026');

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

  login() {
    const input = document.getElementById('login-pass');
    const pass  = input?.value || '';
    if (btoa(pass) === PASS) {
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
  }
};
