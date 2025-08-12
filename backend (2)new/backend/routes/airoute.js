const express = require('express');
const router = express.Router();
const { generate } = require("../controllers/aicontroller");
const { authuser } = require("../middlewares/auth");

router.get("/get-result",authuser,generate)


module.exports = router