const express = require('express');
const router = express.Router();
const {authuser} = require("../middlewares/auth")
const {createproject,getprojects,getsingleuserproject,adduser,getprojectdetail,gettaskfromproject,sendProjectRequest,respondToProjectRequest,getUserProjectRequests,profileprojectupdate,getUserProfile, getProjectCommits, getRepoFiles, getFileContent} = require("../controllers/projectcontroller")

router.post("/create",authuser,createproject)
router.get("/getallproject",authuser,getprojects)
router.get("/getproject",authuser,getsingleuserproject)
router.put("/adduser",authuser,adduser)
router.get("/getproject/:projectId",authuser,getprojectdetail)
router.get("/gettask/:projectId",authuser,gettaskfromproject)
//send request to join project
router.post('/request', authuser, sendProjectRequest);
//respond to project request
router.post('/request/respond', authuser, respondToProjectRequest);
//get all project requests
router.get('/requests', authuser, getUserProjectRequests);
router.put('/updateproject/:projectId',authuser,profileprojectupdate)
router.get("/getuserprofile/:userId",authuser,getUserProfile)

router.get("/project/:projectId/files", getRepoFiles);
router.get("/project/:projectId/file", getFileContent);

router.get("/project/:projectId/commits", getProjectCommits);



module.exports = router