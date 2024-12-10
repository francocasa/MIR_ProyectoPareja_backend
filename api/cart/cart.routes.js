// src/api/cart/cart.routes.js
const { Router } = require("express");
const { createCart, getCartByUserId } = require("./cart.controller");

const router = Router();

// Ruta para crear un carrito para un usuario
router.post("/", createCart);

// Ruta para obtener el carrito de un usuario por userId
router.get("/:userId", getCartByUserId);

module.exports = router;
