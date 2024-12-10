// src/api/brands/brand.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createBrand(req, res) {
  const { name } = req.body;
  try {
    const newBrand = await prisma.brand.create({ data: { name } });
    res.status(201).json(newBrand);
  } catch (error) {
    console.error("Error creando marca:", error);
    res.status(400).json({ message: error.message });
  }
}

async function getAllBrands(req, res) {
  try {
    const brands = await prisma.brand.findMany();
    res.status(200).json(brands);
  } catch (error) {
    console.error("Error obteniendo marcas:", error);
    res.status(500).json({ message: "Error al obtener marcas" });
  }
}

module.exports = { createBrand, getAllBrands };
