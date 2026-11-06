const db = require('./models');

const sumarDiasFecha = (dias) => {
  const f = new Date();
  f.setDate(f.getDate() + dias);
  return f.toISOString().slice(0, 10);
};

async function seedInitialData() {
  const rolesDefault = [
    { id: 1, nombre: 'CLIENTE', descripcion: 'Tutor responsable de pacientes' },
    { id: 2, nombre: 'PROFESIONAL', descripcion: 'Personal profesional' },
    { id: 3, nombre: 'ADMIN', descripcion: 'Administrador general' },
    { id: 4, nombre: 'RECEPCION', descripcion: 'Personal de recepcion y facturacion' }
  ];

  for (const r of rolesDefault) {
    await db.Rol.findOrCreate({
      where: { id: r.id },
      defaults: r
    });
  }

  const tiposMovimientoDefault = [
    { id: 1, codigo: 'CONSUMO_CLINICO', nombre: 'Consumo clinico en atencion medica', esSuma: false },
    { id: 2, codigo: 'INGRESO_COMPRA', nombre: 'Ingreso por compra de mercaderia', esSuma: true },
    { id: 3, codigo: 'AJUSTE_MANUAL', nombre: 'Ajuste manual de stock', esSuma: false }
  ];

  for (const tm of tiposMovimientoDefault) {
    await db.TipoMovimientoStock.findOrCreate({
      where: { codigo: tm.codigo },
      defaults: tm
    });
  }

  const prodsSeed = [
    {
      nombre: 'Meloxicam 0.5% Inyectable',
      principioActivo: 'Meloxicam',
      concentracion: 5,
      unidadMedida: 'ml',
      stockActual: 100,
      alertaStockMinimo: 15,
      precioUnitario: 350,
      lote: { numeroLote: 'LOT-MEL-2026', fechaVencimiento: sumarDiasFecha(120), stockInicial: 100, stockActual: 100 }
    },
    {
      nombre: 'Amoxicilina + Ac. Clavulanico 250mg',
      principioActivo: 'Amoxicilina',
      concentracion: 250,
      unidadMedida: 'comprimidos',
      stockActual: 60,
      alertaStockMinimo: 12,
      precioUnitario: 1200,
      lote: { numeroLote: 'LOT-AMO-2026', fechaVencimiento: sumarDiasFecha(90), stockInicial: 60, stockActual: 60 }
    },
    {
      nombre: 'Tramadol Gotas 50mg/ml',
      principioActivo: 'Tramadol',
      concentracion: 50,
      unidadMedida: 'ml',
      stockActual: 4,
      alertaStockMinimo: 8,
      precioUnitario: 420,
      lote: { numeroLote: 'LOT-TRA-2026', fechaVencimiento: sumarDiasFecha(14), stockInicial: 30, stockActual: 4 }
    },
    {
      nombre: 'Cefalexina 500mg',
      principioActivo: 'Cefalexina',
      concentracion: 500,
      unidadMedida: 'comprimidos',
      stockActual: 8,
      alertaStockMinimo: 10,
      precioUnitario: 1500,
      lote: { numeroLote: 'LOT-CEF-2026', fechaVencimiento: sumarDiasFecha(25), stockInicial: 40, stockActual: 8 }
    },
    {
      nombre: 'Solucion Fisiologica 0.9% 500ml',
      principioActivo: 'Cloruro de Sodio',
      concentracion: 9,
      unidadMedida: 'ml',
      stockActual: 2500,
      alertaStockMinimo: 500,
      precioUnitario: 5.6,
      lote: { numeroLote: 'LOT-FIS-2026', fechaVencimiento: sumarDiasFecha(180), stockInicial: 2500, stockActual: 2500 }
    },
    {
      nombre: 'Dexametasona 4mg/ml Inyectable',
      principioActivo: 'Dexametasona',
      concentracion: 4,
      unidadMedida: 'ml',
      stockActual: 0,
      alertaStockMinimo: 10,
      precioUnitario: 390,
      lote: { numeroLote: 'LOT-DEX-2026', fechaVencimiento: sumarDiasFecha(60), stockInicial: 20, stockActual: 0 }
    },
    {
      nombre: 'Ketamina 50mg/ml Anestesico',
      principioActivo: 'Ketamina',
      concentracion: 50,
      unidadMedida: 'ml',
      stockActual: 3,
      alertaStockMinimo: 10,
      precioUnitario: 680,
      lote: { numeroLote: 'LOT-KET-2026', fechaVencimiento: sumarDiasFecha(6), stockInicial: 25, stockActual: 3 }
    },
    {
      nombre: 'Atropina Sulfato 1% Urgencias',
      principioActivo: 'Atropina',
      concentracion: 10,
      unidadMedida: 'ml',
      stockActual: 5,
      alertaStockMinimo: 5,
      precioUnitario: 310,
      lote: { numeroLote: 'LOT-ATR-VENC', fechaVencimiento: sumarDiasFecha(-5), stockInicial: 15, stockActual: 5 }
    }
  ];

  for (const item of prodsSeed) {
    const [prod, creado] = await db.Producto.findOrCreate({
      where: { nombre: item.nombre },
      defaults: {
        nombre: item.nombre,
        principioActivo: item.principioActivo,
        concentracion: item.concentracion,
        unidadMedida: item.unidadMedida,
        stockActual: item.stockActual,
        alertaStockMinimo: item.alertaStockMinimo,
        precioUnitario: item.precioUnitario
      }
    });

    if (!creado && Number(prod.precioUnitario) !== Number(item.precioUnitario)) {
      await prod.update({ precioUnitario: item.precioUnitario });
    }

    const [loteExistente] = await db.Lote.findOrCreate({
      where: { numeroLote: item.lote.numeroLote },
      defaults: {
        productoId: prod.id,
        numeroLote: item.lote.numeroLote,
        fechaVencimiento: item.lote.fechaVencimiento,
        stockInicial: item.lote.stockInicial,
        stockActual: item.lote.stockActual
      }
    });

    if (
      !creado &&
      (item.nombre === 'Tramadol Gotas 50mg/ml' || item.nombre === 'Cefalexina 500mg') &&
      String(loteExistente.fechaVencimiento).startsWith('2027')
    ) {
      await prod.update({
        stockActual: item.stockActual,
        alertaStockMinimo: item.alertaStockMinimo
      });
      await loteExistente.update({
        fechaVencimiento: item.lote.fechaVencimiento,
        stockActual: item.lote.stockActual
      });
    }
  }

  if (db.Servicio) {
    const cantServicios = await db.Servicio.count();
    if (cantServicios === 0) {
      const serviciosSeed = [
        { nombre: 'Consulta Clinica General', descripcion: 'Evaluacion clinica completa SOAP', precioUnitario: 15000, activo: true },
        { nombre: 'Atencion de Urgencia / Guardia', descripcion: 'Atencion prioritaria en sala de triage', precioUnitario: 25000, activo: true },
        { nombre: 'Aplicacion de Vacuna', descripcion: 'Acto profesional de inmunizacion', precioUnitario: 12000, activo: true },
        { nombre: 'Desparasitacion Interna / Externa', descripcion: 'Control antiparasitario preventivo', precioUnitario: 8500, activo: true },
        { nombre: 'Control Post-Operatorio / Curacion', descripcion: 'Revision de evolucion e higiene de herida', precioUnitario: 9000, activo: true }
      ];
      for (const srv of serviciosSeed) {
        await db.Servicio.create(srv);
      }
    }
  }

  await db.Usuario.findOrCreate({
    where: { email: 'dra.valeria.gomez@veterinaria.com' },
    defaults: {
      nombre: 'Valeria',
      apellido: 'Gomez',
      email: 'dra.valeria.gomez@veterinaria.com',
      password: '123456',
      telefono: '1145678901',
      rolId: 2
    }
  });

  const clientesSeed = [
    {
      nombre: 'Carlos',
      apellido: 'Fernandez',
      email: 'carlos.fernandez@gmail.com',
      password: '123456',
      telefono: '1134567890',
      rolId: 1,
      mascotas: [
        { nombre: 'Milo', especie: 'Canino', raza: 'Golden Retriever', edad: 4, sexo: 'Macho', peso: 32.5 },
        { nombre: 'Luna', especie: 'Felino', raza: 'Siames', edad: 2, sexo: 'Hembra', peso: 3.8 },
        { nombre: 'Rocky', especie: 'Canino', raza: 'Bulldog Frances', edad: 3, sexo: 'Macho', peso: 12.0 }
      ]
    },
    {
      nombre: 'Mariana',
      apellido: 'Lopez',
      email: 'mariana.lopez@gmail.com',
      password: '123456',
      telefono: '1167890123',
      rolId: 1,
      mascotas: [
        { nombre: 'Simba', especie: 'Felino', raza: 'Comun Europeo', edad: 5, sexo: 'Macho', peso: 4.5 },
        { nombre: 'Bella', especie: 'Canino', raza: 'Labrador Retriever', edad: 6, sexo: 'Hembra', peso: 29.0 },
        { nombre: 'Thor', especie: 'Canino', raza: 'Pastor Aleman', edad: 2, sexo: 'Macho', peso: 35.0 }
      ]
    }
  ];

  for (const cliData of clientesSeed) {
    const [cliente] = await db.Usuario.findOrCreate({
      where: { email: cliData.email },
      defaults: {
        nombre: cliData.nombre,
        apellido: cliData.apellido,
        email: cliData.email,
        password: cliData.password,
        telefono: cliData.telefono,
        rolId: cliData.rolId
      }
    });

    for (const m of cliData.mascotas) {
      await db.Mascota.findOrCreate({
        where: { nombre: m.nombre, usuarioId: cliente.id },
        defaults: {
          ...m,
          usuarioId: cliente.id
        }
      });
    }
  }
}

module.exports = seedInitialData;

