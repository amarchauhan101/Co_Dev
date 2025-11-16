const express = require('express');
const router = express.Router();
const {authuser} = require("../middlewares/auth")

const {createTask,updateTask, submitProof} = require("../controllers/taskcontroller")
 
router.post("/createtask/:projectId",authuser,createTask)
router.put("/updatetask/:taskId",authuser,updateTask)
router.post("/task/:taskId/proof", authuser,submitProof);



module.exports = router
