// App principal — navegación y event handlers
const App = {
  vista: 'dashboard',
  flujoAño: new Date().getFullYear(),
  flujoMes: new Date().getMonth() + 1,

  init() {
    Store.init();
    this.render();
    this.bindNav();
  },

  render() {
    const content = document.getElementById('main-content');
    switch (this.vista) {
      case 'dashboard': content.innerHTML = UI.renderDashboard(); break;
      case 'registro':  content.innerHTML = UI.renderRegistro();  this.bindRegistro(); break;
      case 'flujo':     content.innerHTML = UI.renderFlujo(this.flujoAño, this.flujoMes); this.bindFlujo(); break;
      case 'deudas':    content.innerHTML = UI.renderDeudas();    this.bindDeudas(); break;
      case 'metas':     content.innerHTML = UI.renderMetas();     this.bindMetas(); break;
      case 'config':    content.innerHTML = UI.renderConfig();    this.bindConfig(); break;
    }
  },

  bindNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.vista = btn.dataset.view;
        this.render();
        document.getElementById('main-content').scrollTop = 0;
      });
    });
  },

  // ──── Registro ──────────────────────────────────────────────
  bindRegistro() {
    const tipoSel = document.getElementById('f-tipo');
    const catSel  = document.getElementById('f-cat');
    const destGrp = document.getElementById('grupo-destino');
    const destSel = document.getElementById('f-destino');

    tipoSel.addEventListener('change', () => {
      const tipo = tipoSel.value;
      const cats = UI.categoriasPorTipo[tipo] || [];
      catSel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');

      // Mostrar destino para Pago y Ahorro
      destGrp.style.display = (tipo === 'Pago' || tipo === 'Ahorro') ? 'flex' : 'none';

      // Auto-seleccionar destino por categoría
      if (tipo === 'Pago') {
        catSel.addEventListener('change', () => {
          if (catSel.value === 'Fondo Solidario') destSel.value = 'solidario';
        }, { once: true });
      }
    });

    // Atajos rápidos
    document.querySelectorAll('.atajo').forEach(btn => {
      btn.addEventListener('click', () => {
        tipoSel.value = btn.dataset.tipo;
        tipoSel.dispatchEvent(new Event('change'));
        setTimeout(() => {
          catSel.value  = btn.dataset.cat || '';
          if (btn.dataset.destino) { destSel.value = btn.dataset.destino; destGrp.style.display = 'flex'; }
          document.getElementById('f-desc').value  = btn.dataset.desc || '';
          document.getElementById('f-monto').focus();
        }, 10);
      });
    });

    document.getElementById('form-mov').addEventListener('submit', e => {
      e.preventDefault();
      const tipo   = document.getElementById('f-tipo').value;
      const cat    = document.getElementById('f-cat').value;
      const desc   = document.getElementById('f-desc').value.trim();
      const monto  = parseFloat(document.getElementById('f-monto').value);
      const fecha  = document.getElementById('f-fecha').value;
      const destino = document.getElementById('f-destino').value || null;

      if (!tipo || !cat || !desc || !monto || !fecha) {
        this.toast('Completa todos los campos'); return;
      }

      // Los gastos, pagos y ahorros son negativos en el flujo
      const montoFinal = (tipo === 'Gasto' || tipo === 'Pago' || tipo === 'Ahorro')
        ? -Math.abs(monto) : Math.abs(monto);

      Store.addMovimiento({ fecha, tipo, categoria: cat, descripcion: desc, monto: montoFinal, destino });

      // Si es abono al Fondo Solidario, aplicar imputación
      if (destino === 'solidario') {
        Calc.aplicarAbono(Math.abs(monto));
      }

      // Si es ahorro en meta, actualizar acumulado
      if (destino === 'birmingham' || destino === 'emergencia') {
        const metas = Store.getMetas();
        if (destino === 'birmingham') metas.birmingham.acumulado += Math.abs(monto);
        if (destino === 'emergencia') metas.emergencia.acumulado += Math.abs(monto);
        Store.setMetas(metas);
      }

      this.toast('✓ Movimiento guardado');
      document.getElementById('f-desc').value  = '';
      document.getElementById('f-monto').value = '';
      document.getElementById('f-tipo').value  = '';
      catSel.innerHTML = '<option value="">— elegir tipo primero —</option>';
      destGrp.style.display = 'none';
    });
  },

  // ──── Flujo ──────────────────────────────────────────────
  bindFlujo() {
    document.getElementById('mes-prev').addEventListener('click', () => {
      this.flujoMes--;
      if (this.flujoMes < 1) { this.flujoMes = 12; this.flujoAño--; }
      this.render();
    });
    document.getElementById('mes-next').addEventListener('click', () => {
      this.flujoMes++;
      if (this.flujoMes > 12) { this.flujoMes = 1; this.flujoAño++; }
      this.render();
    });

    document.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('¿Eliminar este movimiento?')) return;
        const id = parseInt(btn.dataset.del);
        const mov = Store.getMovimientos().find(m => m.id === id);
        // Revertir ahorro en metas si aplica
        if (mov && mov.tipo === 'Ahorro') {
          const metas = Store.getMetas();
          const monto = Math.abs(mov.monto);
          if (mov.destino === 'birmingham') metas.birmingham.acumulado = Math.max(0, metas.birmingham.acumulado - monto);
          if (mov.destino === 'emergencia') metas.emergencia.acumulado = Math.max(0, metas.emergencia.acumulado - monto);
          Store.setMetas(metas);
        }
        Store.deleteMovimiento(id);
        this.render();
        this.toast('Movimiento eliminado');
      });
    });
  },

  // ──── Deudas ──────────────────────────────────────────────
  bindDeudas() {
    document.getElementById('form-abono').addEventListener('submit', e => {
      e.preventDefault();
      const monto = parseFloat(document.getElementById('ab-monto').value);
      const fecha = document.getElementById('ab-fecha').value;
      if (!monto || !fecha) return;

      Calc.aplicarAbono(monto);
      Store.addMovimiento({
        fecha,
        tipo: 'Pago',
        categoria: 'Fondo Solidario',
        descripcion: 'Abono Fondo Solidario',
        monto: -monto,
        destino: 'solidario'
      });

      this.toast('✓ Abono registrado e imputado');
      this.render();
    });
  },

  // ──── Metas ──────────────────────────────────────────────
  bindMetas() {
    document.getElementById('form-birm').addEventListener('submit', e => {
      e.preventDefault();
      const monto = parseFloat(document.getElementById('birm-monto').value);
      if (!monto) return;
      const metas = Store.getMetas();
      metas.birmingham.acumulado += monto;
      Store.setMetas(metas);
      Store.addMovimiento({
        fecha: new Date().toISOString().slice(0,10),
        tipo: 'Ahorro',
        categoria: 'Birmingham',
        descripcion: 'Ahorro Birmingham',
        monto: -monto,
        destino: 'birmingham'
      });
      this.toast('✓ Ahorro Birmingham registrado');
      this.render();
    });

    document.getElementById('form-emerg').addEventListener('submit', e => {
      e.preventDefault();
      const monto = parseFloat(document.getElementById('emerg-monto').value);
      if (!monto) return;
      const metas = Store.getMetas();
      metas.emergencia.acumulado += monto;
      Store.setMetas(metas);
      Store.addMovimiento({
        fecha: new Date().toISOString().slice(0,10),
        tipo: 'Ahorro',
        categoria: 'Emergencia',
        descripcion: 'Ahorro Fondo Emergencia',
        monto: -monto,
        destino: 'emergencia'
      });
      this.toast('✓ Ahorro Emergencia registrado');
      this.render();
    });
  },

  // ──── Config ──────────────────────────────────────────────
  bindConfig() {
    document.getElementById('btn-save-cfg').addEventListener('click', () => {
      const sup = Store.getSupuestos();
      sup.uf          = parseFloat(document.getElementById('cfg-uf').value)     || sup.uf;
      sup.gbp_clp     = parseFloat(document.getElementById('cfg-gbp').value)    || sup.gbp_clp;
      sup.utm         = parseFloat(document.getElementById('cfg-utm').value)    || sup.utm;
      sup.dividendo_uf = parseFloat(document.getElementById('cfg-div-uf').value) || sup.dividendo_uf;

      // Actualizar gastos fijos UF
      const gastos = Store.getGastosFijos();
      gastos.find(g => g.id === 3).monto_uf = sup.dividendo_uf;
      Store.set('gastos_fijos', gastos);

      // Actualizar tipo cambio en metas
      const metas = Store.getMetas();
      const totalGBP = Object.values(metas.birmingham.presupuesto_gbp).reduce((s,v) => s+v, 0);
      metas.birmingham.meta = Math.round(totalGBP * sup.gbp_clp);
      Store.setMetas(metas);

      Store.setSupuestos(sup);
      this.toast('✓ Parámetros actualizados');
      this.render();
    });

    document.getElementById('btn-export').addEventListener('click', () => {
      const blob = new Blob([Store.exportar()], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `finanzas_rocio_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.toast('✓ Datos exportados');
    });

    document.getElementById('btn-import').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          Store.importar(ev.target.result);
          this.toast('✓ Datos importados');
          this.render();
        } catch {
          this.toast('Error: JSON inválido');
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
      if (!confirm('¿Cerrar sesión?')) return;
      Auth.logout();
    });

    document.getElementById('form-pass').addEventListener('submit', async e => {
      e.preventDefault();
      const actual    = document.getElementById('pass-actual').value;
      const nueva     = document.getElementById('pass-nueva').value;
      const confirmar = document.getElementById('pass-confirmar').value;
      if (!actual || !nueva) { this.toast('Completa todos los campos'); return; }
      if (nueva !== confirmar) { this.toast('Las contraseñas no coinciden'); return; }
      if (nueva.length < 6) { this.toast('Mínimo 6 caracteres'); return; }
      const ok = await Auth.changePassword(actual, nueva);
      if (ok) {
        this.toast('✓ Contraseña actualizada');
        document.getElementById('pass-actual').value = '';
        document.getElementById('pass-nueva').value = '';
        document.getElementById('pass-confirmar').value = '';
      } else {
        this.toast('Contraseña actual incorrecta');
      }
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      if (!confirm('¿Resetear TODOS los datos? Se perderán todos los movimientos registrados.')) return;
      Object.values({ ...localStorage }).forEach((_, i) => {});
      ['supuestos','ingresos','gastos_fijos','deudas_solidario','metas','plan','movimientos','inicializado']
        .forEach(k => localStorage.removeItem('fin_' + k));
      localStorage.removeItem('fin_init_v2');
      Store.init();
      this.toast('Datos reseteados al estado inicial');
      this.render();
    });
  },

  // ──── Toast ──────────────────────────────────────────────
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
};

// App.init() es llamado por Auth después de verificar la contraseña
