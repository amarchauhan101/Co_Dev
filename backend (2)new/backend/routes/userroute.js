// const express = require('express');
// const router = express.Router();
// const {createuser,updateuserprofile, logout} = require("../controllers/usercontroller");
// const {login} = require("../controllers/usercontroller");
// const { body } = require('express-validator');
// const {getprofile,getalluser} = require("../controllers/usercontroller")
// const {authuser} = require("../middlewares/auth")

// router.post("/Register",
//     body("email").isEmail().withMessage("Please enter valid email address"),
//     body("password").isLength({min : 6}).withMessage("password must be at least 6 characters"),
//     createuser)

// router.post("/login",
//     login
// )
// router.put("/updateprofile",authuser,updateuserprofile);

// router.get("/logout",authuser,logout)

// router.get("/getprofile",authuser,getprofile)

// router.get("/allusers",authuser,getalluser)

// router.get("/get-data", async (req, res) => {
//     try {
//       const response = await axios.get(`https://api.example.com/data`, {
//         headers: {
//           "Authorization": `Bearer ${process.env.API_KEY}`,
//         },
//       });
//       res.json(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error.message);
//       res.status(500).json({ error: "Failed to fetch data" });
//     }
//   });

// module.exports = router


const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createuser, updateuserprofile, logout, login, getprofile, getalluser,getdeveloperProfile, updateguideline  } = require("../controllers/usercontroller");
const { getallusers } = require("../controllers/alluser");
const { body } = require('express-validator');
const { authuser } = require("../middlewares/auth");


// ✅ Register Route
router.post("/register",
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    createuser
);

// ✅ Login Route
router.post("/login", login);

// ✅ Update Profile Route (Protected)
router.put("/updateprofile", authuser, updateuserprofile);

// ✅ Logout Route (Protected)
router.get("/logout", authuser, logout);

// ✅ Get Profile (Protected)
router.get("/getprofile", authuser, getprofile);

// ✅ Get All Users (Protected)
router.get("/allusers", authuser, getalluser);

router.get("/getdevprofile/:id",authuser,getdeveloperProfile);

router.get("/leaderboard",authuser,getallusers);

// // ✅ Fetch Data from External API
// router.get("/get-data", async (req, res) => {
//     try {
//         const response = await axios.get(`https://api.example.com/data`, {
//             headers: {
//                 "Authorization": `Bearer ${process.env.ROUTE_API_KEY}`,
//             },
//         });
//         res.json(response.data);
//     } catch (error) {
//         console.error("Error fetching data:", error.message);
//         res.status(500).json({ error: "Failed to fetch data" });
//     }
// });

router.put("/updateguide",authuser,updateguideline)

module.exports = router;
