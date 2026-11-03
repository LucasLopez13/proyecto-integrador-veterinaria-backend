const { Usuario } = require('./models');

async function crearUsuarios() {
  const usuarios = [
    {
      nombre: 'Administrador',
      apellido: 'VetCare',
      email: 'admin@vetcare.com',
      password: 'AdminTemporal2026!',
      rol: 'admin'
    },
    {
      nombre: 'Recepcion',
      apellido: 'VetCare',
      email: 'recepcion@vetcare.com',
      password: 'RecepcionTemporal2026!',
      rol: 'recepcion'
    }
  ];

  for (const datos of usuarios) {
    const existente = await Usuario.findOne({
      where: { email: datos.email }
    });

    if (existente) {
      console.log(`Ya existe: ${datos.email}`);
      continue;
    }

    await Usuario.create(datos);
    console.log(`Creado: ${datos.email} - ${datos.rol}`);
  }
}

crearUsuarios()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
