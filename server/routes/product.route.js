import express from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  editProduct,
  deleteProduct,
  getProductStock,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/createProduct", createProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/getProductById/:id", getProductById);
router.get("/getProductStock/:id", getProductStock);
router.put("/editProduct/:id", editProduct);
router.delete("/deleteProduct/:id", deleteProduct);

export default router;
