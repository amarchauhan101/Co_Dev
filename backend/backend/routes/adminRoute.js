const router = require("express").Router();
const { authuser } = require("../middlewares/auth");
const {firstSuperAdmin,registerWithInvitation,getAllTasks,verifyTask,getAllProjectRequests,getAllAdmins,demoteAdmin,adminInvite,promoteAdmin,adminDashboard,getAllUsers,getUserDetails,updateUserStatus,updateUserPoints,getAllProjects,getProjectDetails,deleteProject} = require("../controllers/admincontroller");

// Public routes (no authentication required)
router.post("/admin/firstsuperadmin", firstSuperAdmin);
router.post("/admin/registerwithinvite", registerWithInvitation);

// Admin & Super Admin routes (authentication required)
router.post("/admin/admin-invite", authuser, adminInvite);
router.post("/admin/promote-user", authuser, promoteAdmin);

// Dashboard
router.get("/admin/dashboard", authuser, adminDashboard);

// User management
router.get("/admin/users", authuser, getAllUsers);
router.get("/admin/users/:userId", authuser, getUserDetails);
router.put("/admin/users/:userId/status", authuser, updateUserStatus);
router.put("/admin/users/:userId/points", authuser, updateUserPoints);

// Project management
router.get("/admin/projects", authuser, getAllProjects);
router.get("/admin/projects/:projectId", authuser, getProjectDetails);
router.delete("/admin/projects/:projectId", authuser, deleteProject);

// Task management
router.get("/admin/tasks", authuser, getAllTasks);
router.put("/admin/tasks/:taskId/verify", authuser, verifyTask);

// Request management
router.get("/admin/requests", authuser, getAllProjectRequests);

// Super Admin only routes
router.put("/admin/demote-admin/:adminId", authuser, demoteAdmin);
router.get("/admin/admins", authuser, getAllAdmins);

module.exports = router;
