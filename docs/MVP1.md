# Sistema Integral de Gestión Veterinaria — Alcance del 1er MVP

Documento descriptivo del alcance, objetivos, flujo punta a punta, arquitectura y restricciones correspondientes al **Primer Producto Mínimo Viable (1er MVP)** del Sistema Integral de Gestión Veterinaria.

---

## 1. Objetivo General del 1er MVP

El propósito de este primer MVP es construir una solución base, integrada y completamente funcional de punta a punta (End-to-End), adaptando la base de código preexistente para validar el flujo crítico de atención:
> **Registro / Autenticación ➔ Alta de Mascota ➔ Solicitud de Turno ➔ Visualización y Consulta Profesional.**

---

## 2. Stack Tecnológico y Adaptación

El desarrollo se encuentra condicionado por la reutilización y adaptación de activos tecnológicos previos:

* **Backend:** Node.js con **Sequelize (ORM)** y base de datos relacional.
  * Adaptación de esquemas y modelos para soportar entidades de `Usuarios`, `Mascotas` y `Turnos`.
  * Endpoints RESTful para autenticación, gestión de mascotas y agendamiento de turnos.
* **Frontend:** **React + TypeScript**.
  * Adaptación de vistas y componentes reutilizables a las necesidades del dominio veterinario.
  * Interfaces diferenciadas según el rol del usuario conectado.

---

## 3. Funcionalidades Incluidas en el MVP

### 3.1. Gestión de Usuarios y Autenticación
* **Registro e Inicio de Sesión:** Mecanismo de autenticación para los usuarios de la plataforma.
* **Roles soportados en el MVP:**
  * **Cliente:** Tutor responsable de una o más mascotas.
  * **Personal Profesional:** Veterinario o staff técnico de la clínica.
* Control básico de acceso y navegación condicionada al rol autenticado.

### 3.2. Gestión y Vinculación de Mascotas
* **Alta de Mascota:** Formulario para que el cliente registre a sus animales ingresando datos básicos (nombre, especie, raza, edad/fecha de nacimiento, sexo).
* **Vinculación 1:N:** Cada mascota queda formalmente asociada a su cliente/tutor.
* **Consulta de Pacientes:**
  * El cliente puede listar y revisar los datos básicos de sus mascotas asociadas.
  * El profesional puede consultar la información básica del paciente al atender o revisar un turno.

### 3.3. Solicitud y Visualización de Turnos
* **Solicitud de Turnos (Portal Cliente):**
  * Selección de una de sus mascotas previamente registradas.
  * Selección de fecha, franja horaria y motivo general de consulta.
  * Vinculación automática del turno con la mascota y el cliente solicitante.
* **Visualización de Turnos (Portal Profesional):**
  * Bandeja / lista centralizada donde el profesional visualiza los turnos agendados.
  * Acceso directo a los datos básicos del paciente y cliente vinculados a cada turno.

---

## 4. Flujo Integrado E2E (Recorrido de Prueba)

El criterio de éxito del MVP radica en la integración completa de Frontend y Backend, verificable mediante el siguiente recorrido:

```text
[ 1. Registro / Login ]
        │
        ▼
[ 2. Registro de Mascota ] ──► Vinculación Cliente ➔ Mascota
        │
        ▼
[ 3. Solicitud de Turno ]  ──► Selección de mascota + fecha/hora
        │
        ▼
[ 4. Portal Profesional ]  ──► Visualización de turnos asignados
        │
        ▼
[ 5. Consulta de Paciente] ──► Detalle de datos básicos de la mascota
```

---

## 5. Restricciones y Exclusiones del 1er MVP

Para acotar el esfuerzo y asegurar una entrega funcional rápida, se establecen las siguientes restricciones de alcance:

| Área | Fuera del Alcance en este MVP (Diferido a fases posteriores) |
| :--- | :--- |
| **Historia Clínica** | No incluye evolución clínica SOAP, carga de estudios complementarios (imágenes, laboratorios) ni carnet de vacunación digital con QR. |
| **Flujo de Turnos** | No incluye cancelaciones avanzadas, reprogramación automática, manejo de colas de guardia ni tablero dinámico de triage. |
| **Administración** | No incluye gestión de stock, fraccionamiento farmacéutico de dosis (mg/kg), órdenes de compra ni facturación/caja. |
| **Servicios Externos** | No incluye pasarelas de pago online (ej. Mercado Pago) ni envío automatizado de recordatorios por WhatsApp o SMS. |
| **Roles Avanzados** | Excluye perfiles como Administrador General con métricas/BI, Personal de Farmacia y Cajero. |

---

## 6. Resultado Esperado de la Entrega

Contar con un sistema estable, responsive y funcional donde:
1. El backend exponga la API REST adaptada con Sequelize.
2. El frontend en React + TS consuma dicha API sin dependencias mockeadas en el flujo principal.
3. Se valide satisfactoriamente el ciclo completo de atención básica de un paciente veterinario.
