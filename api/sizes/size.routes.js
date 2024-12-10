// src/api/sizes/size.routes.js
const { Router } = require("express");
const { createSize, getAllSizes } = require("./size.controller");

const router = Router();

router.post("/", createSize);
router.get("/", getAllSizes);

module.exports = router;
