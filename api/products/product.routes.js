const { Router } = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct, // Importar la nueva función para actualizar productos
} = require("./product.controller");

const router = Router();

router.post("/", createProduct); // Crear producto
router.get("/", getAllProducts); // Obtener todos los productos
router.get("/:id", getProductById); // Obtener un producto por ID
router.put("/:id", updateProduct); // Actualizar un producto por ID (ruta PUT)

module.exports = router;
