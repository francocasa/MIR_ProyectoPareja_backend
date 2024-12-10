const { Router } = require("express");
const {
  createAdmin,
  getAllAdmins,
  authenticateAdmin,
} = require("./admin.controller");

const router = Router();

// Ruta para crear un nuevo admin
router.post("/", createAdmin);

// Ruta para obtener todos los administradores
router.get("/", getAllAdmins);

// Ruta para autenticar un admin
router.post("/login", authenticateAdmin); // Nueva ruta para login

module.exports = router;
