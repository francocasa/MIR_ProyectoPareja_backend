// src/api/sizes/size.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createSize(req, res) {
  const { name, measurement } = req.body;
  try {
    const newSize = await prisma.size.create({
      data: { name, measurement },
    });
    res.status(201).json(newSize);
  } catch (error) {
    console.error("Error creando tamaño:", error);
    res.status(400).json({ message: error.message });
  }
}

async function getAllSizes(req, res) {
  try {
    const sizes = await prisma.size.findMany();
    res.status(200).json(sizes);
  } catch (error) {
    console.error("Error obteniendo tamaños:", error);
    res.status(500).json({ message: "Error al obtener tamaños" });
  }
}

module.exports = { createSize, getAllSizes };
