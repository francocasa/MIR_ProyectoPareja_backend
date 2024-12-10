const Stripe = require("stripe");
const { PrismaClient } = require("@prisma/client");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

async function handlerCheckout(req, res) {
  console.log("Request Body:", req.body); // Agrega esto para depuración

  // Obtener los parámetros del body
  const {
    amount,
    paymentMethod,
    userEmail,
    name,
    phoneNumber,
    address,
    cartItems,
  } = req.body;

  // Validación de parámetros obligatorios
  if (
    !amount ||
    !paymentMethod ||
    !userEmail ||
    !name ||
    !phoneNumber ||
    !address ||
    !cartItems
  ) {
    return res.status(400).json({
      message:
        "Faltan parámetros obligatorios. Asegúrese de enviar 'amount', 'paymentMethod', 'userEmail', 'name', 'phoneNumber', 'address', y 'cartItems'.",
    });
  }

  try {
    // Crear el PaymentIntent con Stripe
    const payment = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe espera el monto en centavos
      currency: "usd",
      description: "Compra en el top-v29",
      payment_method: paymentMethod.id,
      confirm: true,
    });

    // Verificar si el pago fue exitoso
    if (payment.status !== "succeeded") {
      return res.status(400).json({
        message: "No se pudo realizar el pago",
        status: payment.status,
      });
    }

    // Crear o actualizar el usuario en la base de datos
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        name, // Actualizamos el nombre
        phoneNumber, // Actualizamos el teléfono
        address, // Actualizamos la dirección
      },
      create: {
        email: userEmail, // Si no existe, lo creamos con estos datos
        name,
        phoneNumber,
        address,
      },
    });

    // Crear o actualizar el carrito para el usuario (si no existe)
    let cart = await prisma.cart.findUnique({
      where: {
        userId: user.id, // Verificar si el usuario ya tiene un carrito
      },
    });

    if (!cart) {
      // Si no tiene un carrito, lo creamos
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
          items: {
            create: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true, // Incluir los ítems del carrito
        },
      });
    } else {
      // Si ya tiene un carrito, actualizamos los productos en el carrito
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }, // Eliminamos los productos anteriores del carrito
      });

      await prisma.cartItem.createMany({
        data: cartItems.map((item) => ({
          cartId: cart.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    }

    // Crear la transacción en la base de datos
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        userId: user.id, // Asociamos la transacción con el usuario
        // Puedes guardar aquí también el paymentIntentId si es necesario
        paymentIntentId: payment.id, // Guardamos el ID del PaymentIntent de Stripe
      },
    });

    return res.status(200).json({
      message: "Pago realizado con éxito",
      transactionId: transaction.id, // ID de la transacción en tu base de datos
      paymentIntentId: payment.id, // ID del PaymentIntent en Stripe
    });
  } catch (error) {
    console.error("🚀 error:", error); // Manejo de errores

    // Manejo de errores más específico de Stripe
    if (error.type === "StripeCardError") {
      return res.status(400).json({
        message: "Error con la tarjeta",
        details: error.message,
      });
    } else if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        message: "Error en la solicitud a Stripe",
        details: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Error interno del servidor",
        details: error.message,
      });
    }
  }
}

// Función para obtener todos los checkouts (transacciones)
async function getCheckouts(req, res) {
  try {
    // Recuperar todas las transacciones (checkouts) con los usuarios asociados
    const checkouts = await prisma.transaction.findMany({
      include: {
        user: true, // Incluir los datos del usuario relacionado
      },
    });

    return res.status(200).json(checkouts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener los checkouts." });
  }
}

module.exports = {
  handlerCheckout,
  getCheckouts, // GET para obtener los checkouts
};
