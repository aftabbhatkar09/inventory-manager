import Godown from "../models/godown.model.js";
import Product from "../models/product.model.js";
import { getGodownStockMap } from "../utils/stock.util.js";

// Create Godown
export const createGodown = async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const godown = new Godown({ name, address });
    const saved = await godown.save();

    res.status(201).json(saved);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating godown", error: error.message });
  }
};

// Get All Godowns
export const getAllGodowns = async (req, res) => {
  try {
    const godowns = await Godown.find({ isDeleted: false }).sort({
      createdAt: -1,
    });

    res.json(godowns);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching godowns", error: error.message });
  }
};

// Get Godown By ID
export const getGodownById = async (req, res) => {
  try {
    const godown = await Godown.findById(req.params.id);

    if (!godown || godown.isDeleted) {
      return res.status(404).json({ message: "Godown not found" });
    }

    res.json(godown);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching godown", error: error.message });
  }
};

// Update Godown
export const updateGodown = async (req, res) => {
  try {
    const { name, address } = req.body;
    const { id } = req.params;

    const updated = await Godown.findByIdAndUpdate(
      id,
      { name, address },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Godown not found" });
    }

    res.json(updated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating godown", error: error.message });
  }
};

// Delete Godown (Soft Delete)
export const deleteGodown = async (req, res) => {
  try {
    const { id } = req.params;

    const godown = await Godown.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    if (!godown) {
      return res.status(404).json({ message: "Godown not found" });
    }

    res.json({ message: "Godown deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting godown", error: error.message });
  }
};

// Get stock breakdown (per product) for one godown
export const getGodownStock = async (req, res) => {
  try {
    const { id } = req.params;

    const [godownStockMap, products] = await Promise.all([
      getGodownStockMap(),
      Product.find({ isDeleted: false }),
    ]);

    const result = products
      .map((product) => ({
        productId: product._id,
        productName: product.name,
        unit: product.unit,
        quantity: godownStockMap[product._id.toString()]?.[id] || 0,
      }))
      .filter((row) => row.quantity !== 0);

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching godown stock", error: error.message });
  }
};
