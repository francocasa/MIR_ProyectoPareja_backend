// src/api/checkout/checkout.routes.js

const { Router } = require("express");
const { handlerCheckout, getCheckouts } = require("./checkout.controller");

const router = Router();

// Ruta POST para crear un checkout
router.post("/", handlerCheckout);

// Ruta GET para obtener todos los checkouts (transacciones)
router.get("/", getCheckouts); // Aquí agregas el endpoint GET

module.exports = router;
