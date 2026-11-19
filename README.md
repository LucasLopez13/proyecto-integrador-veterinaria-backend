# VetCare — Backend API

API REST del **Sistema Integral de Gestión Veterinaria y Portal de Clientes (VetCare)**, desarrollada como Proyecto Integrador de la **Universidad Nacional de Hurlingham (UNAHUR)**.

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Módulos y Endpoints Principales](#módulos-y-endpoints-principales)
- [Modelo de Datos (20 Entidades)](#modelo-de-datos-20-entidades)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución](#ejecución)
- [Datos Iniciales y Usuarios de Prueba](#datos-iniciales-y-usuarios-de-prueba)
- [Equipo de Desarrollo](#equipo-de-desarrollo)

---

## Descripción General

El backend de **VetCare** centraliza la lógica de negocio, la persistencia relacional y la seguridad para dos experiencias diferenciadas: el **Portal del Tutor (Cliente)** y el **Portal Profesional / Administrativo**.

Entre sus capacidades principales se destacan:

- **Autenticación y Autorización (RBAC):** Tokens JWT (`Bearer`), hashing de contraseñas con `bcryptjs` en hooks de Sequelize y validación de propiedad de recursos (prevención de IDOR).
- **Historia Clínica SOAP Inmutable:** Versionado histórico automático (`VersionConsulta`) con registro de autor, motivo obligatorio de enmienda, diff de valores, sellado criptográfico **SHA-256** y bloqueo de borrado físico (`paranoid: true` + hook `beforeDestroy`).
- **Calculadora Posológica:** Cálculo automático de dosis total y volumen a administrar según peso del paciente (`mg/kg`) y concentración del medicamento (`mg/ml`, `mg/comprimido`), con confirmación profesional.
- **Farmacia con Fraccionamiento y FEFO:** Control de stock por lotes ordenados por vencimiento más próximo (*First-Expired, First-Out*), soporte de consumo fraccionado (`ml`), validación entera para `comprimidos`, transacciones ACID y alertas proactivas de stock mínimo y vencimientos.
- **Tablero de Triage y Guardia:** Sincronización de turnos del día, clasificación por prioridad e ingreso directo de urgencias sin turno previo.
- **Facturación Unificada:** Liquidación transaccional 1:1 por consulta, cálculo monetario en centavos enteros, snapshot inmutable de precios históricos y registro directo de cobros/pagos.
- **Carnet de Vacunación Digital con QR:** Acceso público mediante token `UUID v4` exponiendo únicamente datos básicos del paciente y sus vacunas aplicadas.
- **Gestión de Estudios Médicos:** Carga segura de archivos adjuntos (`PDF`, `JPG`, `PNG` hasta 5 MB) mediante `multer`.

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
| :--- | :--- | :--- |
| **Node.js** | v20+ | Entorno de ejecución |
| **Express** | `^5.2.1` | Framework web y enrutamiento REST |
| **Sequelize** | `^6.37.8` | ORM relacional, transacciones, hooks y Soft Delete |
| **SQLite3** | `^6.0.1` | Base de datos relacional embebida (`data/veterinaria.db`) |
| **Joi** | `^18.2.1` | Validación declarativa de esquemas de entrada |
| **jsonwebtoken** | `^9.0.3` | Autenticación stateless mediante JWT |
| **bcryptjs** | `^3.0.3` | Hashing seguro de contraseñas |
| **Multer** | `^2.2.0` | Gestión y filtrado de archivos médicos adjuntos |
| **dotenv** | `^17.4.2` | Gestión de variables de entorno |
| **cors** | `^2.8.6` | Control de acceso entre orígenes (CORS) |

---

## Arquitectura del Proyecto

El backend implementa una **Arquitectura en Capas (N-Tier)** bajo el patrón **Thin Controllers / Fat Services**:

```text
proyecto-integrador-veterinaria-backend/
├── data/                                            # Archivo local de base de datos SQLite
├── docs/                                            # Documentación técnica (ARQUITECTURA.md, DER, MVP1)
├── uploads/archivos-medicos/                        # Almacenamiento de adjuntos clínicos
└── src/
    ├── main.js                                      # Punto de entrada: Express, sync de BD y seed inicial
    └── db/
        ├── config/config.json                       # Configuración de Sequelize (dev, test, prod)
        ├── routers/                                 # Definición de endpoints y cadena de middlewares
        ├── middlewares/                             # Auth JWT/RBAC, validación Joi, Multer, manejo global de errores
        ├── controllers/                             # Recepción/respuesta HTTP (sin lógica de negocio)
        ├── services/                                # Reglas de negocio, transacciones, SHA-256, FEFO, posología
        ├── models/                                  # 20 modelos Sequelize con asociaciones y hooks
        ├── schema/                                  # Esquemas de validación Joi
        ├── utils/                                   # Errores semánticos y helpers de acceso
        └── seedInitialData.js                       # Carga idempotente de catálogos y datos iniciales
```

Para más detalle técnico consultar [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md).

---

## Módulos y Endpoints Principales

Todos los endpoints se exponen bajo el prefijo `/api` (más un endpoint de estado en `GET /health`):

| Prefijo | Descripción |
| :--- | :--- |
| `/api/auth` | Registro, inicio de sesión y perfil autenticado (`/me`) |
| `/api/usuarios` | Gestión de usuarios y profesionales |
| `/api/mascotas` | CRUD completo de pacientes (con borrado lógico) |
| `/api/turnos` | Solicitud, reprogramación, cancelación, gestión de estados y paginación |
| `/api/triage` | Tablero Kanban de guardia, ingreso directo y movimiento de tarjetas |
| `/api/consultas` | Atención clínica SOAP, enmiendas versionadas, historial de versiones y anulación lógica |
| `/api/prescripcion` | Calculadora posológica (`mg/kg`) y confirmación médica |
| `/api/recetas` | Emisión y consulta unificada de recetas y prescripciones |
| `/api/registroSanitario` | Registro de vacunas y desparasitaciones |
| `/api/carnets-vacunacion` | Generación de token QR y consulta pública (`/carnet/:token`) |
| `/api/archivos-medicos` | Subida, listado y descarga segura de estudios complementarios |
| `/api/inventario` | Consulta de productos/lotes FEFO, consumo fraccionado y trazabilidad de movimientos |
| `/api/alertas-stock` | Alertas de stock crítico, productos vencidos y próximos a vencer |
| `/api/facturacion` | Catálogo de servicios, conceptos por consulta, emisión de órdenes 1:1 y cobro/pago |

---

## Modelo de Datos (20 Entidades)

- **Seguridad y Pacientes:** `Rol`, `Usuario`, `Mascota`
- **Agenda y Guardia:** `Turno`, `Triage`
- **Historia Clínica y Sanidad:** `Consulta`, `VersionConsulta`, `ArchivoMedico`, `Prescripcion`, `Receta`, `CarnetVacunacion`, `RegistroSanitario`
- **Farmacia y Facturación:** `TipoMovimientoStock`, `Producto`, `Lote`, `MovimientoStock`, `Servicio`, `ConceptoConsulta`, `OrdenFacturacion`, `DetalleOrdenFacturacion`

---

## Requisitos Previos

- **Node.js** v18 o superior (probado en Node.js v24)
- **npm** v9 o superior

---

## Instalación y Configuración

1. Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

2. Crear un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

```env
PORT=5000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=data/veterinaria.db
JWT_SECRET=tu_clave_secreta_segura
JWT_EXPIRES_IN=24h
```

---

## Ejecución

- **Modo desarrollo (con recarga automática vía `nodemon`):**

```bash
npm run dev
```

- **Modo estándar:**

```bash
npm start
```

Al iniciar el servidor:
1. Se verifica la conexión con SQLite (`data/veterinaria.db`).
2. Se sincronizan los 20 modelos de Sequelize.
3. Se ejecuta `seedInitialData.js` de forma idempotente para precargar roles, tipos de movimiento, catálogo de insumos/lotes, servicios y cuentas demo.
4. El servidor queda escuchando en `http://localhost:5000` (verificable en `GET http://localhost:5000/health`).

---

## Datos Iniciales y Usuarios de Prueba

Al iniciar en un entorno limpio, `seedInitialData.js` crea automáticamente los catálogos base y las siguientes cuentas de demostración:

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Profesional** | `dra.valeria.gomez@veterinaria.com` | `123456` |
| **Cliente / Tutor** | `carlos.fernandez@gmail.com` | `123456` |
| **Cliente / Tutor** | `mariana.lopez@gmail.com` | `123456` |

> **Nota:** Estas credenciales son exclusivamente para entornos locales de desarrollo y demostración académica.

---

## Equipo de Desarrollo

**Grupo 11 — Proyecto Integrador (UNAHUR)**
- Lucas López
- Agustín Fernandes
- Juan Pablo Céspedes
- Osvaldo Galán

**Tutor:** Prof. Cristian Ciarallo

