require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db/models');
const apiRoutes = require('./db/routers');
const errorMiddleware = require('./db/middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sistema-gestion-veterinaria-backend' });
});

app.use(errorMiddleware);

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('Conexion con la base de datos establecida correctamente.');

    await db.sequelize.sync();
    console.log('Modelos sincronizados con la base de datos.');

    try {
      await db.sequelize.query('ALTER TABLE consultas ADD COLUMN version INTEGER NOT NULL DEFAULT 1;');
    } catch (e) {
    }

    try {
      await db.sequelize.query('ALTER TABLE triages ADD COLUMN turnoId INTEGER;');
    } catch (e) {
    }

    try {
      await db.sequelize.query('ALTER TABLE turnos ADD COLUMN deletedAt DATETIME;');
    } catch (e) {
    }

    const rolesDefault = [
      { id: 1, nombre: 'CLIENTE', descripcion: 'Tutor responsable de pacientes' },
      { id: 2, nombre: 'PROFESIONAL', descripcion: 'Personal profesional' },
      { id: 3, nombre: 'ADMIN', descripcion: 'Administrador general' }
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

    const cantProductos = await db.Producto.count();
    if (cantProductos === 0) {
      const prodsSeed = [
        {
          nombre: 'Meloxicam 0.5% Inyectable',
          principioActivo: 'Meloxicam',
          concentracion: 5,
          unidadMedida: 'ml',
          stockActual: 100,
          alertaStockMinimo: 15,
          lote: { numeroLote: 'LOT-MEL-2026', fechaVencimiento: '2027-12-31', stockInicial: 100, stockActual: 100 }
        },
        {
          nombre: 'Amoxicilina + Ac. Clavulanico 250mg',
          principioActivo: 'Amoxicilina',
          concentracion: 250,
          unidadMedida: 'comprimidos',
          stockActual: 60,
          alertaStockMinimo: 12,
          lote: { numeroLote: 'LOT-AMO-2026', fechaVencimiento: '2027-09-30', stockInicial: 60, stockActual: 60 }
        },
        {
          nombre: 'Tramadol Gotas 50mg/ml',
          principioActivo: 'Tramadol',
          concentracion: 50,
          unidadMedida: 'ml',
          stockActual: 30,
          alertaStockMinimo: 5,
          lote: { numeroLote: 'LOT-TRA-2026', fechaVencimiento: '2027-08-15', stockInicial: 30, stockActual: 30 }
        },
        {
          nombre: 'Cefalexina 500mg',
          principioActivo: 'Cefalexina',
          concentracion: 500,
          unidadMedida: 'comprimidos',
          stockActual: 40,
          alertaStockMinimo: 10,
          lote: { numeroLote: 'LOT-CEF-2026', fechaVencimiento: '2027-11-20', stockInicial: 40, stockActual: 40 }
        },
        {
          nombre: 'Solucion Fisiologica 0.9% 500ml',
          principioActivo: 'Cloruro de Sodio',
          concentracion: 9,
          unidadMedida: 'ml',
          stockActual: 2500,
          alertaStockMinimo: 500,
          lote: { numeroLote: 'LOT-FIS-2026', fechaVencimiento: '2028-01-30', stockInicial: 2500, stockActual: 2500 }
        }
      ];

      for (const item of prodsSeed) {
        const prod = await db.Producto.create({
          nombre: item.nombre,
          principioActivo: item.principioActivo,
          concentracion: item.concentracion,
          unidadMedida: item.unidadMedida,
          stockActual: item.stockActual,
          alertaStockMinimo: item.alertaStockMinimo
        });
        await db.Lote.create({
          productoId: prod.id,
          numeroLote: item.lote.numeroLote,
          fechaVencimiento: item.lote.fechaVencimiento,
          stockInicial: item.lote.stockInicial,
          stockActual: item.lote.stockActual
        });
      }
    }

    app.listen(PORT, () => {
      console.log(`Servidor iniciado y escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
}

startServer();