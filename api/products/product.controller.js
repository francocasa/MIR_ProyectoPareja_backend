const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const prisma = new PrismaClient();

// Esquema de validación con Zod para crear un producto
const createProductSchema = z.object({
  name: z.string().min(1, "El nombre del producto es obligatorio"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  description: z.string().optional(),
  stock: z.number().min(0, "El stock no puede ser negativo"),
  sizeId: z.number().int().min(1, "El tamaño debe ser un ID válido"),
  brandId: z.number().int().min(1, "La marca debe ser un ID válido"),
  materialId: z.number().int().min(1, "El material debe ser un ID válido"),
  categoryId: z.number().int().min(1, "La categoría debe ser un ID válido"), // Añadido categoryId
  imageUrl: z.string().url().optional(), // Si se usa un URL para la imagen
});

async function createProduct(req, res) {
  try {
    // Validar los datos de la solicitud con Zod
    const data = createProductSchema.parse(req.body);

    // Verificar que el tamaño, marca, material y categoría existan en la base de datos
    const sizeExists = await prisma.size.findUnique({
      where: { id: data.sizeId },
    });
    const brandExists = await prisma.brand.findUnique({
      where: { id: data.brandId },
    });
    const materialExists = await prisma.material.findUnique({
      where: { id: data.materialId },
    });
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId }, // Verificamos que la categoría exista
    });

    if (!sizeExists)
      return res.status(400).json({ message: "Tamaño no válido" });
    if (!brandExists)
      return res.status(400).json({ message: "Marca no válida" });
    if (!materialExists)
      return res.status(400).json({ message: "Material no válido" });
    if (!categoryExists)
      return res.status(400).json({ message: "Categoría no válida" });

    // Crear el nuevo producto con las relaciones correspondientes
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        stock: data.stock,
        sizeId: data.sizeId,
        brandId: data.brandId,
        materialId: data.materialId,
        categoryId: data.categoryId, // Asignamos la categoría
        imageUrl: data.imageUrl || "", // Si no se proporciona una imagen, se usa un valor vacío
      },
    });

    res.status(201).json({
      message: "Producto creado exitosamente",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(400).json({ message: error.errors || error.message });
  }
}

async function getAllProducts(req, res) {
  console.log(`getAllProducts`);
  try {
    const products = await prisma.product.findMany({
      include: { size: true, brand: true, material: true, category: true }, // Incluir la categoría
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
}

async function getProductById(req, res) {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { size: true, brand: true, material: true, category: true }, // Incluir la categoría
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    res.status(500).json({ message: "Error al obtener el producto" });
  }
}
async function updateProduct(req, res) {
  //const { id } = req.params;

  // Esquema de validación de datos para la actualización (usamos el mismo esquema que para crear un producto)
  const updateProductSchema = createProductSchema.partial(); // Permite campos opcionales

  //async function updateProduct(req, res) {
  const { id } = req.params;

  try {
    // 1. Validar los datos de la solicitud con Zod
    console.log("req.body");
    console.log(req.body);
    const data = updateProductSchema.parse(req.body); // Validar la entrada del producto

    console.log("data");
    console.log(data);
    // 2. Verificar si el producto existe en la base de datos
    const productExists = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!productExists) {
      console.error(`Producto con ID ${id} no encontrado`);
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // 3. Verificar que las relaciones (size, brand, material, category) sean válidas
    let sizeExists = null,
      brandExists = null,
      materialExists = null,
      categoryExists = null;

    if (data.sizeId) {
      sizeExists = await prisma.size.findUnique({
        where: { id: data.sizeId },
      });
      if (!sizeExists)
        return res.status(400).json({ message: "Tamaño no válido" });
    }

    if (data.brandId) {
      brandExists = await prisma.brand.findUnique({
        where: { id: data.brandId },
      });
      if (!brandExists)
        return res.status(400).json({ message: "Marca no válida" });
    }

    if (data.materialId) {
      materialExists = await prisma.material.findUnique({
        where: { id: data.materialId },
      });
      if (!materialExists)
        return res.status(400).json({ message: "Material no válido" });
    }

    if (data.categoryId) {
      categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!categoryExists)
        return res.status(400).json({ message: "Categoría no válida" });
    }

    // 4. Actualizar el producto solo con los valores que se pasaron en la solicitud
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name ?? productExists.name, // Mantener el valor actual si no se pasa uno nuevo
        price: data.price ?? productExists.price,
        description: data.description ?? productExists.description,
        stock: data.stock ?? productExists.stock,
        sizeId: data.sizeId ?? productExists.sizeId,
        brandId: data.brandId ?? productExists.brandId,
        materialId: data.materialId ?? productExists.materialId,
        categoryId: data.categoryId ?? productExists.categoryId,
        imageUrl: data.imageUrl ?? productExists.imageUrl, // Solo se cambia si se pasa un nuevo valor
      },
    });

    console.log(`Producto con ID ${id} actualizado exitosamente`);
    res.status(200).json({
      message: "Producto actualizado exitosamente",
      product: updatedProduct,
    });
  } catch (error) {
    // 5. Manejo de errores en la actualización
    console.error("Error actualizando producto:", error);

    // Verifica si el error es un error de validación
    if (error.errors) {
      return res
        .status(400)
        .json({ message: error.errors || "Error de validación" });
    }

    // Si es un error general, responder con un error 500
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
  //}
}

module.exports = {
  updateProduct,
  createProduct,
  getAllProducts,
  getProductById,
};
