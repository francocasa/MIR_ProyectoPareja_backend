// src/api/materials/material.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createMaterial(req, res) {
  const { name } = req.body;
  try {
    const newMaterial = await prisma.material.create({ data: { name } });
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error("Error creando material:", error);
    res.status(400).json({ message: error.message });
  }
}

async function getAllMaterials(req, res) {
  try {
    const materials = await prisma.material.findMany();
    res.status(200).json(materials);
  } catch (error) {
    console.error("Error obteniendo materiales:", error);
    res.status(500).json({ message: "Error al obtener materiales" });
  }
}

module.exports = { createMaterial, getAllMaterials };
