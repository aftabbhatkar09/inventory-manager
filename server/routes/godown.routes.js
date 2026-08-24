import express from "express";

import {
  createGodown,
  getAllGodowns,
  getGodownById,
  updateGodown,
  deleteGodown,
  getGodownStock,
} from "../controllers/godown.controller.js";

const router = express.Router();

router.post("/createGodown", createGodown);
router.get("/getAllGodowns", getAllGodowns);
router.get("/getGodownById/:id", getGodownById);
router.get("/getGodownStock/:id", getGodownStock);
router.put("/editGodown/:id", updateGodown);
router.delete("/deleteGodown/:id", deleteGodown);

export default router;
