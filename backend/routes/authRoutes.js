const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { registerValidation, loginValidation } = require("../validators/authValidator");

const router = express.Router();

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);

module.exports = router;