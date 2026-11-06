const { Usuario, Rol } = require('./models');

async function crearUsuarios() {
  const rolesDefault = [
    { id: 3, nombre: 'ADMIN', descripcion: 'Administrador general' },
    { id: 4, nombre: 'RECEPCION', descripcion: 'Personal de recepcion y facturacion' }
  ];

  for (const r of rolesDefault) {
    await Rol.findOrCreate({
      where: { id: r.id },
      defaults: r
    });
  }

  const usuarios = [
    {
      nombre: 'Administrador',
      apellido: 'VetCare',
      email: 'admin@vetcare.com',
      password: 'AdminTemporal2026!',
      rolId: 3
    },
    {
      nombre: 'Recepcion',
      apellido: 'VetCare',
      email: 'recepcion@vetcare.com',
      password: 'RecepcionTemporal2026!',
      rolId: 4
    }
  ];

  for (const datos of usuarios) {
    const existente = await Usuario.findOne({
      where: { email: datos.email }
    });

    if (existente) {
      if (!existente.rolId) {
        await existente.update({ rolId: datos.rolId });
      }
      console.log(`Ya existe: ${datos.email}`);
      continue;
    }

    await Usuario.create(datos);
    console.log(`Creado: ${datos.email} - rolId ${datos.rolId}`);
  }
}

crearUsuarios()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
