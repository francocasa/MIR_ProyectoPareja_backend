const cloudinary = require("../../config/cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Para eliminar archivos locales
const prisma = require("../../config/prisma"); // Asegúrate de importar tu cliente Prisma

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Dirección donde se guardarán las imágenes localmente antes de subirlas a Cloudinary
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Renombramos la imagen para evitar conflictos de nombres
  },
});

const upload = multer({ storage: storage }).single("image"); // "image" es el nombre del campo en el formulario

// Controlador para subir la imagen a Cloudinary y asociarla con un producto
// Controlador para subir la imagen a Cloudinary y asociarla con un producto
async function uploadImage(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error con multer:", err);
      return res.status(500).json({ message: "Error al cargar la imagen" });
    }

    // Verifica que el archivo esté presente
    if (!req.file) {
      console.error("No se recibió ningún archivo");
      return res
        .status(400)
        .json({ message: "No se ha recibido ningún archivo de imagen" });
    }

    console.log("Archivo recibido:", req.file); // Depuración

    try {
      // Subir la imagen a Cloudinary
      console.log("Subiendo imagen a Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_images", // Puedes especificar una carpeta en tu Cloudinary
      });

      console.log("Imagen subida a Cloudinary:", result); // Depuración

      // Obtener la URL de la imagen subida
      const imageUrl = result.secure_url;

      // Aquí asumimos que el `productId` viene en los datos de la solicitud, como parte de `req.body`
      const { productId } = req.body;

      console.log("productId recibido:", productId); // Depuración

      // Verifica que el `productId` esté presente
      if (!productId) {
        return res.status(400).json({ message: "Product ID es requerido" });
      }

      // Convierte el productId a número entero
      const productIdInt = parseInt(productId);

      // Verifica si el productId es un número válido
      if (isNaN(productIdInt)) {
        return res
          .status(400)
          .json({ message: "Product ID no es un número válido" });
      }

      // Actualiza el producto en la base de datos con la URL de la imagen
      const updatedProduct = await prisma.product.update({
        where: { id: productIdInt }, // Busca el producto por su ID (como número)
        data: { imageUrl }, // Actualiza el campo imageUrl con la URL obtenida de Cloudinary
      });

      console.log("Producto actualizado:", updatedProduct); // Depuración

      // Elimina el archivo local de la carpeta `uploads/`
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo local:", err);
        } else {
          console.log("Archivo local eliminado con éxito");
        }
      });

      // Responde con el producto actualizado
      res.status(200).json({
        message: "Imagen subida y asociada al producto exitosamente",
        product: updatedProduct, // Devolver el producto con la URL de la imagen actualizada
      });
    } catch (uploadError) {
      console.error("Error al subir la imagen a Cloudinary:", uploadError);
      res
        .status(500)
        .json({ message: "Error al subir la imagen a Cloudinary" });
    }
  });
}

module.exports = { uploadImage };
