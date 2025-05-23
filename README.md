#  La Cabina - Plataforma de Reservas para Estudio de Grabación

Bienvenido al repositorio de **La Cabina**, un sistema web profesional para la gestión de reservas de un estudio de música. Esta plataforma permite a músicos, bandas y productores reservar sesiones de grabación, mezcla o masterización de forma rápida, segura y moderna.

---

##  Índice

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Objetivos](#objetivos)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación](#instalación)
- [Configuración del Entorno](#configuración-del-entorno)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Pruebas](#pruebas)
- [Despliegue](#despliegue)
- [Autor](#autor)
- [Licencia](#licencia)

---

##  Descripción del Proyecto

**La Cabina** nace como respuesta a la falta de digitalización en muchos estudios de grabación, donde las reservas aún se gestionan por teléfono o redes sociales. Esta web ofrece una solución moderna para centralizar la gestión de citas, mostrar los servicios del estudio y permitir a los usuarios interactuar de forma sencilla.

Con esta plataforma, los clientes pueden:
- Consultar disponibilidad en tiempo real.
- Reservar sesiones según duración y tipo de servicio.
- Conocer las tarifas y características de cada servicio.
- Registrarse, iniciar sesión y gestionar sus reservas desde un panel privado.

---

##  Objetivos

### Objetivo general
Desarrollar una plataforma web profesional para digitalizar y optimizar la gestión de reservas en un estudio de grabación.

### Objetivos específicos
1. Implementar un sistema de reservas con disponibilidad actualizada y selección de horarios.
2. Desarrollar un panel de usuario con funciones de autenticación y gestión de citas.
3. Mostrar información clara sobre los servicios, precios y horarios disponibles.
4. Facilitar la modificación y cancelación de reservas por parte del usuario.
5. Diseñar una experiencia de usuario intuitiva y moderna, accesible desde cualquier dispositivo.

---

##  Características Principales

- Página de inicio con presentación del estudio.
- Sección de servicios: grabación, mezcla, masterización, producción.
- Sistema de reservas con calendario y formulario.
- Área privada con historial de sesiones y opciones de edición.
- Registro e inicio de sesión de usuarios.
- Diseño responsivo y profesional.

---

##  Tecnologías Utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript
- jQuery

### Backend
- Node.js
- Express.js

### Base de Datos
- MongoDB

---

##  Requisitos del Sistema

- Node.js v16 o superior
- MongoDB Atlas o MongoDB local
- Navegador moderno (Chrome, Firefox, Edge, Safari)

---

##  Instalación

1. Clona el repositorio:

```
git clone https://github.com/tuusuario/la-cabina.git
cd la-cabina
```

2. Instala las dependencias:

```
npm install
```
3. Crea un archivo .env en la raíz del proyecto y añade las siguientes variables:
PORT=3000
MONGODB_URI=tu_uri_de_mongo_aqui
JWT_SECRET=tu_contraseña_secreta

4. Inicia el Servidor localmente
```
npm start
```
##  Uso

Una vez el servidor está corriendo:

1.Accede a http://localhost:3000 desde tu navegador.

2.	Regístrate o inicia sesión como usuario.

3.	Consulta el calendario de disponibilidad.

4.	Realiza una reserva completando el formulario.

5.	Accede a tu área privada para consultar o modificar tus citas.

##  Estructura del Proyecto
```
la-cabina/
├── public/             # Archivos estáticos (CSS, imágenes, JS frontend)
├── routes/             # Rutas de Express
├── controllers/        # Lógica del backend
├── models/             # Modelos de Mongoose para MongoDB
├── views/              # Plantillas EJS
├── .env                # Variables de entorno
├── server.js              # Archivo principal de la aplicación
├── package.json        # Dependencias y scripts de npm
└── README.md           # Documentación del proyecto
```

##  Autor

- David Hervás Egea
  
- Estudiante de DAW
  
- Correo electrónico: hervasegea@gmail.com
  
- Desarrollo de una aplicación web para la gestión de un estudio musica



