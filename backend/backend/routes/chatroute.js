const express = require('express');
const router = express.Router();

const { createMessage,getMessages,getuserinproject } = require("../controllers/chatcontroller");
const { authuser } = require("../middlewares/auth");
const parser = require('../utils/storage');

router.post("/message/:projectId", authuser, createMessage);
router.get("/getmessage/:projectId", authuser, getMessages);
router.get("/getuserinproject/:projectId",getuserinproject)


module.exports = router