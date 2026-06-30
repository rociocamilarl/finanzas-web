// Renderizado de vistas
const UI = {
  // ──── Helpers ──────────────────────────────────────────────
  clp(n)  { return '$' + Math.round(n).toLocaleString('es-CL'); },
  pct(n)  { return n.toFixed(1) + '%'; },
  fecha(s) {
    if (!s) return '';
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  },
  mesNombre(año, mes) {
    return new Date(año, mes - 1, 1)
      .toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  },
  progressBar(pct, fillClass) {
    return `<div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${Math.min(100, pct)}%"></div></div>`;
  },
  tipoIcon(tipo) {
    const m = { Ingreso:'💰', Gasto:'💸', Pago:'🏦', Ahorro:'🎯', Transferencia:'↔️', 'Saldo inicial':'📌' };
    return m[tipo] || '•';
  },
  tipoDotClass(tipo) {
    const m = { Ingreso:'dot-ingreso', Gasto:'dot-gasto', Pago:'dot-pago', Ahorro:'dot-ahorro', Transferencia:'dot-transferencia', 'Saldo inicial':'dot-inicial' };
    return m[tipo] || 'dot-inicial';
  },

  // ──── Dashboard ──────────────────────────────────────────────
  renderDashboard() {
    const ingresos   = Calc.totalIngresos();
    const gastosFij  = Calc.totalGastosFijos();
    const saldo      = Calc.saldoDisponible();
    const pctGasto   = Calc.porcentaje(gastosFij, ingresos);
    const metas      = Store.getMetas();
    const plan       = Store.getPlan();
    const saldoTot   = Calc.saldoTotalSolidario();
    const saldoPrior = Calc.saldoPrioritarioSolidario();
    const metaEmerg  = Calc.metaEmergencia();
    const alertas    = Calc.alertas();
    const hoy        = new Date();
    const mesLabel   = this.mesNombre(hoy.getFullYear(), hoy.getMonth() + 1);

    const alertHtml = alertas.map(a =>
      `<div class="alert alert-${a.tipo}">
        <span class="alert-icon">${a.tipo === 'danger' ? '🚨' : '⚠️'}</span>
        <span>${a.msg}</span>
      </div>`
    ).join('');

    return `
      ${alertHtml}

      <!-- Resumen principal -->
      <div class="card">
        <div class="card-title">Resumen · ${mesLabel}</div>
        <div class="stat-grid" style="margin-bottom:0">
          <div>
            <div class="stat-label">Ingresos</div>
            <div class="stat-value green" style="font-size:16px">${this.clp(ingresos)}</div>
          </div>
          <div>
            <div class="stat-label">Gastos fijos</div>
            <div class="stat-value red" style="font-size:16px">${this.clp(gastosFij)}</div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="stat-label">Saldo disponible</div>
        <div class="card-big-number ${saldo >= 0 ? '' : 'red'}">${this.clp(saldo)}</div>
        <div class="progress-wrap mt-4">
          <div class="progress-header">
            <span>% gasto / ingreso</span><span>${this.pct(pctGasto)}</span>
          </div>
          ${this.progressBar(pctGasto, pctGasto > 80 ? 'fill-red' : pctGasto > 65 ? 'fill-orange' : 'fill-green')}
        </div>
      </div>

      <!-- Plan de asignación -->
      <div class="card">
        <div class="card-title">Plan asignación mensual</div>
        <ul class="row-list">
          <li class="row-item">
            <span class="row-label">1. Fondo Solidario <span class="chip" style="font-size:10px">2024·2025·2026</span></span>
            <span class="row-amount neg">${this.clp(plan.solidario)}</span>
          </li>
          <li class="row-item">
            <span class="row-label">2. Birmingham</span>
            <span class="row-amount neg">${this.clp(plan.birmingham)}</span>
          </li>
          <li class="row-item">
            <span class="row-label">3. Emergencia</span>
            <span class="row-amount ${plan.emergencia > 0 ? 'neg' : ''}">${plan.emergencia > 0 ? this.clp(plan.emergencia) : '—'} <span class="badge badge-gray">pausado</span></span>
          </li>
        </ul>
      </div>

      <!-- Fondo Solidario -->
      <div class="card">
        <div class="card-title">Fondo Solidario (U. Tarapacá)</div>
        <div class="stat-label">Saldo pendiente</div>
        <div class="card-big-number" style="color:var(--warning)">${this.clp(saldoTot)}</div>
        <div class="card-sub">MO-2024 · MO-2025 · CP-2026 · Ley 19.287</div>
      </div>

      <!-- Metas -->
      <div class="card">
        <div class="card-title">Metas de ahorro</div>

        <div class="stat-label">✈️ Birmingham (sept-2027)</div>
        <div style="font-size:15px;font-weight:700;margin:2px 0">${this.clp(metas.birmingham.acumulado)} <span class="text-muted">/ ${this.clp(metas.birmingham.meta)}</span></div>
        <div class="progress-wrap">
          <div class="progress-header">
            <span>${this.pct(Calc.porcentaje(metas.birmingham.acumulado, metas.birmingham.meta))} avance</span>
            <span>${Calc.mesesHastaBirmingham()} meses</span>
          </div>
          ${this.progressBar(Calc.porcentaje(metas.birmingham.acumulado, metas.birmingham.meta), 'fill-blue')}
        </div>

        <div class="divider"></div>

        <div class="stat-label">🛡️ Fondo de emergencia</div>
        <div style="font-size:15px;font-weight:700;margin:2px 0">${this.clp(metas.emergencia.acumulado)} <span class="text-muted">/ ${this.clp(metaEmerg)}</span></div>
        <div class="progress-wrap">
          <div class="progress-header">
            <span>${this.pct(Calc.porcentaje(metas.emergencia.acumulado, metaEmerg))} avance</span>
            <span class="badge badge-gray">pausado</span>
          </div>
          ${this.progressBar(Calc.porcentaje(metas.emergencia.acumulado, metaEmerg), 'fill-green')}
        </div>
      </div>
    `;
  },

  // ──── Registro ──────────────────────────────────────────────
  renderRegistro() {
    const hoy = new Date().toISOString().slice(0, 10);
    return `
      <div class="card">
        <div class="card-title">Registrar movimiento</div>
        <form id="form-mov" class="form-section">

          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input type="date" class="form-input" id="f-fecha" value="${hoy}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Tipo</label>
            <select class="form-input" id="f-tipo" required>
              <option value="">— elegir —</option>
              <option value="Ingreso">💰 Ingreso</option>
              <option value="Gasto">💸 Gasto</option>
              <option value="Pago">🏦 Pago (deuda)</option>
              <option value="Ahorro">🎯 Ahorro (meta)</option>
              <option value="Transferencia">↔️ Transferencia</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select class="form-input" id="f-cat" required>
              <option value="">— elegir tipo primero —</option>
            </select>
          </div>

          <div class="form-group" id="grupo-destino" style="display:none">
            <label class="form-label">Imputar a</label>
            <select class="form-input" id="f-destino">
              <option value="">— ninguno —</option>
              <option value="solidario">Fondo Solidario</option>
              <option value="birmingham">Birmingham</option>
              <option value="emergencia">Fondo Emergencia</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Descripción</label>
            <input type="text" class="form-input" id="f-desc" placeholder="ej: supermercado Líder" required>
          </div>

          <div class="form-group">
            <label class="form-label">Monto (CLP)</label>
            <input type="number" class="form-input" id="f-monto" placeholder="0" min="1" required>
          </div>

          <button type="submit" class="btn btn-primary">Guardar movimiento</button>
        </form>
      </div>

      <div class="card">
        <div class="card-title">Atajos rápidos</div>
        <div class="btn-row" style="flex-wrap:wrap">
          <button class="btn btn-outline btn-sm atajo" data-tipo="Pago" data-cat="Fondo Solidario" data-destino="solidario" data-desc="Abono Fondo Solidario">🏦 Solidario</button>
          <button class="btn btn-outline btn-sm atajo" data-tipo="Ahorro" data-cat="Birmingham" data-destino="birmingham" data-desc="Ahorro Birmingham">✈️ Birmingham</button>
          <button class="btn btn-outline btn-sm atajo" data-tipo="Gasto" data-cat="Supermercado" data-desc="Supermercado">🛒 Super</button>
          <button class="btn btn-outline btn-sm atajo" data-tipo="Gasto" data-cat="Transporte" data-desc="Transporte">🚌 Transporte</button>
          <button class="btn btn-outline btn-sm atajo" data-tipo="Gasto" data-cat="Salud" data-desc="Gasto salud">🏥 Salud</button>
          <button class="btn btn-outline btn-sm atajo" data-tipo="Ingreso" data-cat="Sueldo" data-desc="Sueldo líquido">💼 Sueldo</button>
        </div>
      </div>
    `;
  },

  categoriasPorTipo: {
    Ingreso:       ['Sueldo', 'Arriendo', 'Bono', 'Devolución', 'Otro ingreso'],
    Gasto:         ['Supermercado', 'Farmacia', 'Salud', 'Restaurante', 'Ropa', 'Entretenimiento', 'Transporte', 'Uñas', 'Gastos varios', 'Otro gasto'],
    Pago:          ['Fondo Solidario', 'Crédito consumo', 'Dividendo Las Condes', 'Dividendo Santiago Centro', 'Otro pago'],
    Ahorro:        ['Birmingham', 'Emergencia', 'Otro ahorro'],
    Transferencia: ['Entre cuentas', 'Envío a padre', 'Otro']
  },

  // ──── Flujo diario ──────────────────────────────────────────
  renderFlujo(año, mes) {
    const movs = Calc.movimientosDelMes(año, mes).slice().reverse();
    const liItems = movs.map(m => {
      const esNeg = m.monto < 0 || m.tipo === 'Gasto' || (m.tipo === 'Pago' && m.monto > 0);
      const montoMostrar = (m.tipo === 'Gasto' || m.tipo === 'Pago' || m.tipo === 'Ahorro')
        ? -Math.abs(m.monto) : m.monto;
      const clsAmount = montoMostrar >= 0 ? 'pos' : 'neg';
      return `
        <div class="mov-item">
          <div class="mov-dot ${this.tipoDotClass(m.tipo)}">${this.tipoIcon(m.tipo)}</div>
          <div class="mov-body">
            <div class="mov-desc">${m.descripcion || m.categoria}</div>
            <div class="mov-meta">${this.fecha(m.fecha)} · ${m.categoria}${m.destino ? ' · '+m.destino : ''}</div>
          </div>
          <div class="mov-right">
            <span class="mov-amount ${clsAmount}">${montoMostrar >= 0 ? '+' : ''}${this.clp(montoMostrar)}</span>
            ${m.tipo !== 'Saldo inicial' ? `<button class="mov-delete" data-del="${m.id}">✕</button>` : ''}
          </div>
        </div>`;
    }).join('');

    return `
      <div class="month-nav">
        <button id="mes-prev">‹</button>
        <span class="month-label">${this.mesNombre(año, mes)}</span>
        <button id="mes-next">›</button>
      </div>
      <div class="card">
        ${movs.length
          ? `<div id="lista-movs">${liItems}</div>`
          : `<div class="empty-state"><div class="empty-icon">📭</div>Sin movimientos este mes</div>`
        }
      </div>
    `;
  },

  // ──── Deudas ──────────────────────────────────────────────
  renderDeudas() {
    const deudas    = Store.getDeudasSolidario();
    const saldoTot  = Calc.saldoTotalSolidario();
    const sup       = Store.getSupuestos();

    const tramosHtml = deudas.map(d => {
      const pctPagado = Calc.porcentaje(d.original - d.saldo, d.original);
      const badge = d.saldo === 0
        ? '<span class="badge badge-green">SALDADO</span>'
        : d.vencimiento && new Date(d.vencimiento) < new Date()
          ? '<span class="badge badge-red">VENCIDO</span>'
          : '<span class="badge badge-orange">pendiente</span>';
      return `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-weight:600;font-size:14px">${d.tramo}</span>
            ${badge}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-s);margin-bottom:4px">
            <span>Saldo: <strong style="color:var(--text)">${this.clp(d.saldo)}</strong></span>
            <span>Vence: ${d.vencimiento ? this.fecha(d.vencimiento) : 's/f'}</span>
          </div>
          ${this.progressBar(pctPagado, d.excluido ? 'fill-orange' : 'fill-blue')}
          <div style="font-size:11px;color:var(--text-s);margin-top:3px;text-align:right">${pctPagado.toFixed(0)}% pagado</div>
        </div>`;
    }).join('<div class="divider"></div>');

    return `
      <!-- Resumen -->
      <div class="card" style="margin-bottom:10px">
        <div class="stat-label">Saldo pendiente Fondo Solidario</div>
        <div class="card-big-number" style="color:var(--warning)">${this.clp(saldoTot)}</div>
        <div class="card-sub">MO-2024 · MO-2025 · CP-2026</div>
      </div>

      <!-- Tramos -->
      <div class="card">
        <div class="card-title">Tramos Fondo Solidario</div>
        ${tramosHtml}
        <div class="divider"></div>
        <div class="text-muted">
          ⚖️ Ley 19.287: pago anual = 5% renta año anterior. Inicio 2014 → condonación saldo remanente 2029.<br>
        </div>
      </div>

      <!-- Registrar abono -->
      <div class="card">
        <div class="card-title">Registrar abono al Fondo Solidario</div>
        <form id="form-abono" class="form-section">
          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input type="date" class="form-input" id="ab-fecha" value="${new Date().toISOString().slice(0,10)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Monto (CLP)</label>
            <input type="number" class="form-input" id="ab-monto" placeholder="0" min="1" required>
          </div>
          <div class="text-muted">Se imputará automáticamente al tramo más antiguo primero: MO-2024 → MO-2025 → CP-2026.</div>
          <button type="submit" class="btn btn-primary">Registrar abono</button>
        </form>
      </div>

      <!-- Crédito consumo -->
      <div class="card">
        <div class="card-title">Crédito de consumo</div>
        <div class="row-item">
          <span class="row-label">Cuota mensual</span>
          <span class="row-amount neg">${this.clp(360000)}</span>
        </div>
        <div class="text-muted">Incluido en gastos fijos.</div>
      </div>
    `;
  },

  // ──── Metas ──────────────────────────────────────────────
  renderMetas() {
    const metas    = Store.getMetas();
    const sup      = Store.getSupuestos();
    const metaEmerg = Calc.metaEmergencia();
    const mesesRest = Calc.mesesHastaBirmingham();
    const pb = metas.birmingham;
    const pctB = Calc.porcentaje(pb.acumulado, pb.meta);
    const pctE = Calc.porcentaje(metas.emergencia.acumulado, metaEmerg);

    // Presupuesto GBP
    const gbp = pb.presupuesto_gbp;
    const totalGBP = Object.values(gbp).reduce((s, v) => s + v, 0);
    const gbpItems = [
      ['Curso English Path (24 sem)', gbp.curso],
      ['Matrícula y materiales', gbp.matricula],
      ['Alojamiento compartido (50%)', gbp.alojamiento],
      ['Transporte local (6 meses)', gbp.transporte],
      ['Alimentación', gbp.alimentacion],
      ['Pasaje Valencia ↔ Birmingham', gbp.pasaje],
    ].map(([label, val]) =>
      `<li class="row-item"><span class="row-label">${label}</span><span class="row-amount">£${val.toLocaleString('es-CL')}</span></li>`
    ).join('');

    return `
      <!-- Birmingham -->
      <div class="card">
        <div class="card-title">✈️ Fondo Birmingham</div>
        <div class="card-big-number">${this.clp(pb.acumulado)}</div>
        <div class="card-sub">de ${this.clp(pb.meta)} · ${mesesRest} meses restantes</div>
        <div class="progress-wrap mt-4">
          <div class="progress-header"><span>${this.pct(pctB)} avance</span><span>Sept 2027</span></div>
          ${this.progressBar(pctB, 'fill-blue')}
        </div>
        <div class="divider"></div>
        <div class="stat-grid" style="margin-bottom:0">
          <div>
            <div class="stat-label">Plan mensual</div>
            <div class="stat-value blue" style="font-size:15px">${this.clp(pb.mensual_plan)}</div>
          </div>
          <div>
            <div class="stat-label">Ingreso extra (ene-2027)</div>
            <div class="stat-value green" style="font-size:15px">${this.clp(pb.ingreso_extra)}</div>
          </div>
        </div>

        <!-- Botón depositar -->
        <div class="mt-4">
          <form id="form-birm" class="form-section">
            <div style="display:flex;gap:8px">
              <input type="number" class="form-input" id="birm-monto" placeholder="Depositar CLP..." style="flex:1">
              <button type="submit" class="btn btn-primary btn-sm" style="white-space:nowrap">+ Ahorro</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Presupuesto GBP -->
      <div class="card">
        <div class="card-title">Presupuesto Birmingham (GBP · solo Rocío)</div>
        <ul class="row-list">
          ${gbpItems}
        </ul>
        <div class="divider"></div>
        <div class="row-item" style="font-weight:700">
          <span>TOTAL (£)</span>
          <span>£${totalGBP.toLocaleString('es-CL')}</span>
        </div>
        <div class="row-item" style="font-size:12px;color:var(--text-s)">
          <span>Tipo cambio GBP/CLP</span>
          <span>${this.clp(sup.gbp_clp)}</span>
        </div>
        <div class="row-item" style="font-weight:700;color:var(--primary)">
          <span>TOTAL (CLP)</span>
          <span>${this.clp(totalGBP * sup.gbp_clp)}</span>
        </div>
      </div>

      <!-- Emergencia -->
      <div class="card">
        <div class="card-title">🛡️ Fondo de emergencia</div>
        <div class="card-big-number">${this.clp(metas.emergencia.acumulado)}</div>
        <div class="card-sub">de ${this.clp(metaEmerg)} (3× gastos fijos) <span class="badge badge-gray">pausado</span></div>
        <div class="progress-wrap mt-4">
          <div class="progress-header"><span>${this.pct(pctE)} avance</span><span>Se activa post-Solidario</span></div>
          ${this.progressBar(pctE, 'fill-green')}
        </div>
        <div class="mt-4">
          <form id="form-emerg" class="form-section">
            <div style="display:flex;gap:8px">
              <input type="number" class="form-input" id="emerg-monto" placeholder="Depositar CLP..." style="flex:1">
              <button type="submit" class="btn btn-success btn-sm" style="white-space:nowrap">+ Ahorro</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  // ──── Config ──────────────────────────────────────────────
  renderConfig() {
    const sup = Store.getSupuestos();
    return `
      <div class="card">
        <div class="card-title">Supuestos y parámetros</div>
        <div class="config-row">
          <span class="config-label">Valor UF</span>
          <input type="number" class="config-input" id="cfg-uf" value="${sup.uf}" step="0.01">
        </div>
        <div class="config-row">
          <span class="config-label">Tipo cambio GBP/CLP</span>
          <input type="number" class="config-input" id="cfg-gbp" value="${sup.gbp_clp}" step="0.01">
        </div>
        <div class="config-row">
          <span class="config-label">UTM</span>
          <input type="number" class="config-input" id="cfg-utm" value="${sup.utm}" step="1">
        </div>
        <div class="config-row">
          <span class="config-label">Dividendo Sgto Centro (UF)</span>
          <input type="number" class="config-input" id="cfg-div-uf" value="${sup.dividendo_uf}" step="0.1">
        </div>
        <div class="mt-4">
          <button class="btn btn-primary" id="btn-save-cfg">Guardar cambios</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Gastos fijos mensuales</div>
        <ul class="row-list" id="lista-gastos">
          ${Store.getGastosFijos().map(g => {
            const monto = g.es_uf ? g.monto_uf * sup.uf : g.monto;
            return `<li class="row-item">
              <span class="row-label">${g.concepto}${g.es_uf ? ' <span class="chip">UF</span>' : ''}</span>
              <span class="row-amount neg">${this.clp(monto)}</span>
            </li>`;
          }).join('')}
          <li class="row-item" style="font-weight:700">
            <span>TOTAL</span>
            <span class="row-amount neg">${this.clp(Calc.totalGastosFijos())}</span>
          </li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title">Exportar / Importar datos</div>
        <div class="form-section">
          <button class="btn btn-outline" id="btn-export">⬇️ Exportar JSON</button>
          <div>
            <label class="form-label">Importar JSON</label>
            <input type="file" id="btn-import" accept=".json" class="form-input" style="padding:8px">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🔐 Cambiar contraseña</div>
        <form id="form-pass" class="form-section">
          <div class="form-group">
            <label class="form-label">Contraseña actual</label>
            <input type="password" class="form-input" id="pass-actual" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label class="form-label">Nueva contraseña</label>
            <input type="password" class="form-input" id="pass-nueva" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar nueva contraseña</label>
            <input type="password" class="form-input" id="pass-confirmar" placeholder="••••••••">
          </div>
          <button type="submit" class="btn btn-primary">Cambiar contraseña</button>
        </form>
        <div class="divider" style="margin-top:12px"></div>
        <button class="btn btn-outline mt-4" id="btn-logout" style="margin-top:12px">Cerrar sesión</button>
      </div>

      <div class="card">
        <div class="card-title">⚠️ Zona de riesgo</div>
        <button class="btn btn-danger" id="btn-reset">Resetear todos los datos</button>
        <div class="text-muted" style="margin-top:6px">Esto borra todos los movimientos y vuelve a los datos iniciales.</div>
      </div>
    `;
  }
};
