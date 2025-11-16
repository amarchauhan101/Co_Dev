const express = require("express");
const router = express.Router();
const axios = require("axios");
const {
  createuser,
  updateuserprofile,
  logout,
  login,
  getprofile,
  getalluser,
  getdeveloperProfile,
  updateguideline,
  refreshToken,
} = require("../controllers/usercontroller");
const { getallusers } = require("../controllers/alluser");
const { body } = require("express-validator");
const { authuser } = require("../middlewares/auth");

// ✅ Register Route
router.post(
  "/register",
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  createuser
);
router.post("/refresh-token", refreshToken);
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

router.get("/getdevprofile/:id", authuser, getdeveloperProfile);

router.get("/leaderboard", authuser, getallusers);

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

router.put("/updateguide", authuser, updateguideline);

module.exports = router;
