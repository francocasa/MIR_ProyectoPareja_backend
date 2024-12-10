// src/api/materials/material.routes.js
const { Router } = require("express");
const { createMaterial, getAllMaterials } = require("./material.controller");

const router = Router();

router.post("/", createMaterial);
router.get("/", getAllMaterials);

module.exports = router;
