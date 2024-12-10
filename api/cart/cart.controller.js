// src/api/cart/cart.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear un carrito para un usuario
async function createCart(req, res) {
  const { userId } = req.body;

  // Validación de userId
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "userId inválido o faltante" });
  }

  try {
    const newCart = await prisma.cart.create({
      data: { userId },
    });
    res.status(201).json(newCart);
  } catch (error) {
    console.error("Error creando carrito:", error);
    res.status(400).json({ message: error.message });
  }
}

// Obtener carrito por userId
async function getCartByUserId(req, res) {
  const { userId } = req.params;

  // Validar que userId sea un número entero
  if (isNaN(userId)) {
    return res
      .status(400)
      .json({ message: "userId debe ser un número válido" });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) },
      include: { items: true }, // Esto incluirá los items del carrito
    });

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error obteniendo carrito:", error);
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
}

module.exports = { createCart, getCartByUserId };
