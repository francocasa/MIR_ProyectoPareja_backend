// src/api/brands/brand.routes.js
const { Router } = require("express");
const { createBrand, getAllBrands } = require("./brand.controller");

const router = Router();

router.post("/", createBrand);
router.get("/", getAllBrands);

module.exports = router;
