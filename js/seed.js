// Datos iniciales extraídos del archivo finanzas_rocio.xlsx (29-06-2026)
const SEED = {
  supuestos: {
    uf: 40817.59,
    gbp_clp: 1222.45,
    utm: 68000,
    dividendo_uf: 9.5
  },
  ingresos: [
    { id: 1, concepto: 'Sueldo líquido', monto: 2348438 },
    { id: 2, concepto: 'Arriendo depto Santiago Centro', monto: 310000 }
  ],
  gastos_fijos: [
    { id: 1, concepto: 'Dividendo depto Las Condes', monto: 500000, es_uf: false },
    { id: 2, concepto: 'Crédito de consumo', monto: 360000, es_uf: false },
    { id: 3, concepto: 'Dividendo depto Santiago Centro (9,5 UF)', monto_uf: 9.5, es_uf: true },
    { id: 4, concepto: 'Aporte mensual a padre', monto: 200000, es_uf: false },
    { id: 5, concepto: 'Transporte', monto: 41000, es_uf: false },
    { id: 6, concepto: 'Celular', monto: 12000, es_uf: false },
    { id: 7, concepto: 'Gastos varios', monto: 200000, es_uf: false },
    { id: 8, concepto: 'Uñas', monto: 20000, es_uf: false }
  ],
  // Fondo Solidario: solo tramos a pagar (MO-2024, MO-2025, CP-2026).
  // LP-SOLIDARIO excluido del registro (probable condonación 2029, Ley 19.287).
  // Saldos TRAS abono de $1.100.000 imputado a MO-2024: 2.469.817 - 1.100.000 = 1.369.817
  deudas_solidario: [
    { id: 'MO-2024', tramo: 'MO-SOLIDARIO 2024', vencimiento: '2025-05-31', original: 2469817, saldo: 1369817, orden: 1 },
    { id: 'MO-2025', tramo: 'MO-SOLIDARIO 2025', vencimiento: '2026-05-31', original: 1325721, saldo: 1325721, orden: 2 },
    { id: 'CP-2026', tramo: 'CP-SOLIDARIO 2026',  vencimiento: '2027-05-31', original: 1758333, saldo: 1758333, orden: 3 }
  ],
  metas: {
    birmingham: {
      meta: 9437314,
      acumulado: 0,
      mensual_plan: 362488,
      ingreso_extra: 4000000,
      ingreso_extra_fecha: '2027-01',
      presupuesto_gbp: {
        curso: 2500,
        matricula: 250,
        alojamiento: 2550,
        transporte: 420,
        alimentacion: 1800,
        pasaje: 200
      }
    },
    emergencia: {
      acumulado: 0,
      activo: false
    }
  },
  plan_asignacion: {
    solidario: 575182.895,
    birmingham: 362488,
    emergencia: 0
  },
  movimientos: [
    {
      id: 1,
      fecha: '2026-06-29',
      tipo: 'Saldo inicial',
      categoria: 'Apertura',
      descripcion: 'Saldo disponible estimado del mes',
      monto: 937670.895,
      destino: null
    },
    {
      id: 2,
      fecha: '2026-06-08',
      tipo: 'Pago',
      categoria: 'Fondo Solidario',
      descripcion: 'Abono Fondo Solidario (imputado a MO-2024)',
      monto: -300000,
      destino: 'solidario'
    },
    {
      id: 3,
      fecha: '2026-06-10',
      tipo: 'Pago',
      categoria: 'Fondo Solidario',
      descripcion: 'Abono Fondo Solidario (imputado a MO-2024)',
      monto: -800000,
      destino: 'solidario'
    }
  ]
};
