// Capa de persistencia en localStorage
const KEYS = {
  supuestos:        'fin_supuestos',
  ingresos:         'fin_ingresos',
  gastos_fijos:     'fin_gastos_fijos',
  deudas_solidario: 'fin_deudas_solidario',
  metas:            'fin_metas',
  plan:             'fin_plan',
  movimientos:      'fin_movimientos',
  inicializado:     'fin_init_v8'
};

const Store = {
  init() {
    const oldKeys = ['fin_init_v2','fin_init_v3','fin_init_v4','fin_init_v5','fin_init_v6','fin_init_v7'];
    const hasOld  = oldKeys.some(v => localStorage.getItem(v));
    const hasNew  = localStorage.getItem(KEYS.inicializado);

    if (!hasNew) {
      // Conservar movimientos del usuario, re-seed todo lo demás
      const movsGuardados = localStorage.getItem('fin_movimientos');
      oldKeys.forEach(k => localStorage.removeItem(k));
      this._seedConfig();
      localStorage.setItem(KEYS.movimientos,
        movsGuardados || JSON.stringify(SEED.movimientos));
      localStorage.setItem(KEYS.inicializado, '1');
    }
    // Si ya tiene v8: no tocar nada
  },

  _seedConfig() {
    localStorage.setItem(KEYS.supuestos,        JSON.stringify(SEED.supuestos));
    localStorage.setItem(KEYS.ingresos,         JSON.stringify(SEED.ingresos));
    localStorage.setItem(KEYS.gastos_fijos,     JSON.stringify(SEED.gastos_fijos));
    localStorage.setItem(KEYS.deudas_solidario, JSON.stringify(SEED.deudas_solidario));
    localStorage.setItem(KEYS.metas,            JSON.stringify(SEED.metas));
    localStorage.setItem(KEYS.plan,             JSON.stringify(SEED.plan_asignacion));
  },

  get(key)      { return JSON.parse(localStorage.getItem(KEYS[key]) || 'null'); },
  set(key, val) {
    localStorage.setItem(KEYS[key], JSON.stringify(val));
  },

  getSupuestos()        { return this.get('supuestos'); },
  setSupuestos(v)       { this.set('supuestos', v); },
  getIngresos()         { return this.get('ingresos'); },
  getGastosFijos()      { return this.get('gastos_fijos'); },
  getDeudasSolidario()  { return this.get('deudas_solidario'); },
  setDeudasSolidario(v) { this.set('deudas_solidario', v); },
  getMetas()            { return this.get('metas'); },
  setMetas(v)           { this.set('metas', v); },
  getPlan()             { return this.get('plan'); },
  getMovimientos()      { return this.get('movimientos') || []; },
  setMovimientos(v)     { this.set('movimientos', v); },

  addMovimiento(mov) {
    const movs = this.getMovimientos();
    const id = movs.length ? Math.max(...movs.map(m => m.id)) + 1 : 1;
    movs.push({ ...mov, id });
    movs.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id);
    this.setMovimientos(movs);
    return id;
  },

  deleteMovimiento(id) {
    this.setMovimientos(this.getMovimientos().filter(m => m.id !== id));
  },

  exportar() {
    return JSON.stringify({
      version: 2,
      exportado: new Date().toISOString(),
      supuestos:        this.getSupuestos(),
      ingresos:         this.getIngresos(),
      gastos_fijos:     this.getGastosFijos(),
      deudas_solidario: this.getDeudasSolidario(),
      metas:            this.getMetas(),
      plan:             this.getPlan(),
      movimientos:      this.getMovimientos()
    }, null, 2);
  },

  importar(json) {
    const d = JSON.parse(json);
    if (!d.version) throw new Error('Formato inválido');
    if (d.supuestos)        this.set('supuestos', d.supuestos);
    if (d.ingresos)         this.set('ingresos', d.ingresos);
    if (d.gastos_fijos)     this.set('gastos_fijos', d.gastos_fijos);
    if (d.deudas_solidario) this.set('deudas_solidario', d.deudas_solidario);
    if (d.metas)            this.set('metas', d.metas);
    if (d.plan)             this.set('plan', d.plan);
    if (d.movimientos)      this.set('movimientos', d.movimientos);
    localStorage.setItem(KEYS.inicializado, '1');
  }
};
