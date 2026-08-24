import express from "express";

import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { requireSuperAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// requireAuth is already applied where this router is mounted -- every
// route here additionally requires the super_admin role.
router.use(requireSuperAdmin);

router.post("/createUser", createUser);
router.get("/getAllUsers", getAllUsers);
router.get("/getUserById/:id", getUserById);
router.put("/editUser/:id", updateUser);
router.delete("/deleteUser/:id", deleteUser);

export default router;
