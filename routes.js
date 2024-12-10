const productRoutes = require("./api/products/product.routes.js");
const brandRoutes = require("./api/brands/brand.routes.js");
const sizeRoutes = require("./api/sizes/size.routes.js");
const materialRoutes = require("./api/materials/material.routes.js");
const cartRoutes = require("./api/cart/cart.routes.js");
const checkoutRoutes = require("./api/checkout/checkout.routes.js");
const imageRoutes = require("./api/images/image.routes.js"); // Agregar rutas de imágenes
const adminRoutes = require("./api/admins/admin.routes.js"); // Importar rutas de Admin

function routes(app) {
  app.use("/api/products", productRoutes);
  app.use("/api/brands", brandRoutes);
  app.use("/api/sizes", sizeRoutes);
  app.use("/api/materials", materialRoutes);
  app.use("/api/carts", cartRoutes);
  app.use("/api/checkouts", checkoutRoutes); // Aquí agregamos checkout como una nueva ruta
  app.use("/api/images", imageRoutes); // Rutas de imágenes
  app.use("/api/admins", adminRoutes); // Agregar las rutas de admins
}

module.exports = routes;
