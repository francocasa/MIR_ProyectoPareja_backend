// src/app.js

const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet"); // Mejora de seguridad
const cors = require("cors"); // Manejo de CORS
const morgan = require("morgan"); // Logging

// Cargar las variables de entorno (seleccionando el archivo .env dependiendo del entorno)
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";
dotenv.config({ path: envFile });

// Configuración de rutas y middlewares
const configExpress = require("./config/express"); // Aquí puedes incluir cualquier configuración adicional
const routes = require("./routes"); // Importa las rutas definidas en /config/routes.js

const app = express(); // Crea la instancia de la aplicación Express

// Middlewares generales

// Middleware de seguridad: ayuda a proteger contra ataques comunes (XSS, clickjacking, etc.)
app.use(helmet());

// Middleware de CORS: permite que otras aplicaciones (como tu frontend) puedan acceder a esta API
app.use(cors()); // Esto es importante si tienes un frontend separado que hace solicitudes a tu backend

// Middleware para interpretar cuerpos de solicitudes en formato JSON
app.use(express.json());

// Middleware para logging de solicitudes HTTP, útil para monitoreo y depuración
app.use(morgan("dev")); // Configuración del logger para desarrollo

// Configuración personalizada de Express (puedes agregar más middlewares si los necesitas)
configExpress(app);

// Definir las rutas de la API
routes(app); // Aquí es donde se configuran todas las rutas de tu API

// Middleware de manejo de errores: captura errores inesperados en cualquier parte de la aplicación
app.use((err, req, res, next) => {
  console.error(err.stack); // Imprime el error en la consola
  res.status(500).json({ message: "Algo salió mal!" }); // Responde con un mensaje genérico de error
});

module.exports = app; // Exportamos la instancia de la aplicación Express para usarla en index.js
