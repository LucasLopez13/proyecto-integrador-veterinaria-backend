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
    console.log('Conexión con la base de datos establecida correctamente.');

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

    app.listen(PORT, () => {
      console.log(`Servidor iniciado y escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
}

startServer();