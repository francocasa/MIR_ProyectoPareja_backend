const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear un nuevo administrador
async function createAdmin(req, res) {
  const { username, password } = req.body;

  // Validación de los datos
  if (!username || !password) {
    return res
      .status(400)
      .json({
        message: "El nombre de usuario y la contraseña son obligatorios.",
      });
  }

  try {
    // Verificar si ya existe un admin con el mismo nombre de usuario
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Este nombre de usuario ya está en uso." });
    }

    // Crear el nuevo administrador
    const newAdmin = await prisma.admin.create({
      data: { username, password }, // Aquí, la contraseña se almacena tal cual sin cifrado
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error("Error creando admin:", error);
    res.status(500).json({ message: "Error al crear el administrador." });
  }
}

// Obtener todos los administradores
async function getAllAdmins(req, res) {
  try {
    const admins = await prisma.admin.findMany();
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error obteniendo admins:", error);
    res.status(500).json({ message: "Error al obtener administradores" });
  }
}

// Función de autenticación para el login del admin (sin cifrado)
async function authenticateAdmin(req, res) {
  const { username, password } = req.body;

  try {
    // Buscar al administrador en la base de datos
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    // Comparar la contraseña (sin cifrado)
    if (admin.password !== password) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Si las credenciales son correctas, devolver el admin
    return res.status(200).json({ message: "Autenticación exitosa", admin });
  } catch (error) {
    console.error("Error autenticando al admin:", error);
    return res
      .status(500)
      .json({ message: "Error al autenticar al administrador" });
  }
}

module.exports = { createAdmin, getAllAdmins, authenticateAdmin };
