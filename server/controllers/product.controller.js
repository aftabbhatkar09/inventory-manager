import Product from "../models/product.model.js";
import Godown from "../models/godown.model.js";
import {
  getProductStockById,
  getStockMap,
  getGodownStockMap,
} from "../utils/stock.util.js";
import {
  assertOneOf,
  handleControllerError,
  parsePagination,
} from "../utils/validate.util.js";

const UNITS = ["pcs", "kg", "ltr"];

//Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, sku, category, unit } = req.body;

    if (!name?.trim() || !sku?.trim()) {
      return res.status(400).json({ message: "Name and SKU are required" });
    }

    if (unit !== undefined) {
      assertOneOf(unit, UNITS, "Unit");
    }

    const product = new Product({
      name,
      sku,
      category,
      unit,
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    handleControllerError(res, error, "Error creating product");
  }
};

// Get All Products with stock
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false }).sort({
      createdAt: -1,
    });

    const [stockMap, godownStockMap, godowns] = await Promise.all([
      getStockMap(),
      getGodownStockMap(),
      Godown.find({ isDeleted: false }),
    ]);

    const godownNameById = {};
    godowns.forEach((g) => {
      godownNameById[g._id.toString()] = g.name;
    });

    const result = products.map((product) => {
      const productId = product._id.toString();
      const perGodown = godownStockMap[productId] || {};

      const godownStock = Object.entries(perGodown)
        .filter(([, quantity]) => quantity !== 0)
        .map(([godownId, quantity]) => ({
          godownId,
          godownName: godownNameById[godownId] || "Unknown Godown",
          quantity,
        }));

      return {
        ...product.toObject(),
        stock: stockMap[productId] || 0,
        godownStock,
      };
    });

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get Products page (search + pagination) -- additive alongside
// getAllProducts, which every dropdown/dashboard consumer still uses
// unpaginated. Only the Products list page calls this one.
export const getProductsPaged = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const search = (req.query.search || "").trim();

    const filter = { isDeleted: false };

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { sku: regex }, { category: regex }];
    }

    const [total, products, stockMap, godownStockMap, godowns] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      getStockMap(),
      getGodownStockMap(),
      Godown.find({ isDeleted: false }),
    ]);

    const godownNameById = {};
    godowns.forEach((g) => {
      godownNameById[g._id.toString()] = g.name;
    });

    const data = products.map((product) => {
      const productId = product._id.toString();
      const perGodown = godownStockMap[productId] || {};

      const godownStock = Object.entries(perGodown)
        .filter(([, quantity]) => quantity !== 0)
        .map(([godownId, quantity]) => ({
          godownId,
          godownName: godownNameById[godownId] || "Unknown Godown",
          quantity,
        }));

      return {
        ...product.toObject(),
        stock: stockMap[productId] || 0,
        godownStock,
      };
    });

    res.json({ data, total, page, totalPages: Math.max(Math.ceil(total / limit), 1) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// Update Product
export const editProduct = async (req, res) => {
  try {
    const { name, sku, category, unit } = req.body;

    const { id } = req.params;

    if (!name?.trim() || !sku?.trim()) {
      return res.status(400).json({ message: "Name and SKU are required" });
    }

    if (unit !== undefined) {
      assertOneOf(unit, UNITS, "Unit");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, sku, category, unit },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    handleControllerError(res, error, "Error updating product");
  }
};

// Delete Product { Soft Delete}
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

// Get product stock
export const getProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await getProductStockById(id);

    res.json({ stock });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stock", error: error.message });
  }
};
