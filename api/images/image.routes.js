const { Router } = require("express");
const { uploadImage } = require("./image.controller");

const router = Router();

// Ruta para subir la imagen
router.post("/upload", uploadImage);

module.exports = router;
