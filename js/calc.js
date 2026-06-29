// Cálculos financieros
const Calc = {
  totalIngresos() {
    return Store.getIngresos().reduce((s, i) => s + i.monto, 0);
  },

  totalGastosFijos() {
    const uf = Store.getSupuestos().uf;
    return Store.getGastosFijos().reduce((s, g) => {
      return s + (g.es_uf ? g.monto_uf * uf : g.monto);
    }, 0);
  },

  saldoDisponible() {
    return this.totalIngresos() - this.totalGastosFijos();
  },

  // Saldo Fondo Solidario total (incluyendo LP)
  saldoTotalSolidario() {
    return Store.getDeudasSolidario().reduce((s, d) => s + d.saldo, 0);
  },

  // Saldo prioritario (excluye LP-SOLIDARIO)
  saldoPrioritarioSolidario() {
    return Store.getDeudasSolidario()
      .filter(d => !d.excluido)
      .reduce((s, d) => s + d.saldo, 0);
  },

  // Aplica un abono al Fondo Solidario (tramo más antiguo primero, excluye LP)
  aplicarAbono(monto) {
    const deudas = Store.getDeudasSolidario();
    const prioritarias = deudas
      .filter(d => !d.excluido)
      .sort((a, b) => a.orden - b.orden);

    let resto = monto;
    for (const d of prioritarias) {
      if (resto <= 0) break;
      const idx = deudas.findIndex(x => x.id === d.id);
      if (deudas[idx].saldo <= resto) {
        resto -= deudas[idx].saldo;
        deudas[idx].saldo = 0;
      } else {
        deudas[idx].saldo -= resto;
        resto = 0;
      }
    }
    Store.setDeudasSolidario(deudas);
    return monto - resto; // monto efectivamente imputado
  },

  // Meses restantes hasta sept-2027
  mesesHastaBirmingham() {
    const hoy = new Date();
    const objetivo = new Date(2027, 8, 1); // Septiembre 2027
    const meses = (objetivo.getFullYear() - hoy.getFullYear()) * 12
      + (objetivo.getMonth() - hoy.getMonth());
    return Math.max(0, meses);
  },

  metaEmergencia() {
    return this.totalGastosFijos() * 3;
  },

  porcentaje(actual, meta) {
    if (!meta) return 0;
    return Math.min(100, (actual / meta) * 100);
  },

  // Movimientos del mes actual
  movimientosDelMes(año, mes) {
    const prefijo = `${año}-${String(mes).padStart(2, '0')}`;
    return Store.getMovimientos().filter(m => m.fecha.startsWith(prefijo));
  },

  // Gasto real registrado del mes (tipo Gasto, montos negativos)
  gastoRealMes(año, mes) {
    return this.movimientosDelMes(año, mes)
      .filter(m => m.tipo === 'Gasto')
      .reduce((s, m) => s + Math.abs(m.monto), 0);
  },

  // Ahorro registrado en metas este mes
  ahorroMeta(destino, año, mes) {
    return this.movimientosDelMes(año, mes)
      .filter(m => m.destino === destino && m.tipo === 'Ahorro')
      .reduce((s, m) => s + Math.abs(m.monto), 0);
  },

  // Saldo corriente: suma todos los movimientos (con signo)
  saldoCorriente() {
    return Store.getMovimientos().reduce((s, m) => {
      if (m.tipo === 'Saldo inicial') return m.monto;
      return s + m.monto;
    }, 0);
  },

  alertas() {
    const alerts = [];
    const hoy = new Date();
    const deudas = Store.getDeudasSolidario();

    // Alerta vencimientos próximos (< 60 días)
    deudas.filter(d => d.vencimiento && d.saldo > 0).forEach(d => {
      const venc = new Date(d.vencimiento);
      const dias = Math.round((venc - hoy) / 86400000);
      if (dias >= 0 && dias <= 60) {
        alerts.push({ tipo: 'warning', msg: `Vence ${d.tramo} en ${dias} días (${d.vencimiento})` });
      }
      if (dias < 0 && d.saldo > 0) {
        alerts.push({ tipo: 'danger', msg: `${d.tramo} está VENCIDO y tiene saldo $${fmt(d.saldo)}` });
      }
    });

    // Alerta ahorro Birmingham bajo
    const metas = Store.getMetas();
    const mesesRestantes = this.mesesHastaBirmingham();
    const ahorroNecesario = mesesRestantes > 0
      ? (metas.birmingham.meta - metas.birmingham.acumulado - metas.birmingham.ingreso_extra) / mesesRestantes
      : 0;
    const plan = Store.getPlan();
    if (plan.birmingham < ahorroNecesario * 0.9) {
      alerts.push({ tipo: 'warning', msg: `Ahorro Birmingham mensual ($${fmt(plan.birmingham)}) está por debajo del mínimo requerido ($${fmt(ahorroNecesario)})` });
    }

    return alerts;
  }
};

function fmt(n) {
  return Math.round(n).toLocaleString('es-CL');
}
