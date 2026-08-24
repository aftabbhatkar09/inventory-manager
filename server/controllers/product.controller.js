import Product from "../models/Product.model.js";
import Transaction from "../models/transaction.model.js";

//Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, sku, category, unit } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ message: "Name and SKU are required" });
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
    res
      .status(400)
      .json({ message: "Error creating product", error: error.message });
  }
};

// Get All Products with stock
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false }).sort({
      createdAt: -1,
    });

    const transactions = await Transaction.find();

    const stockMap = {};

    transactions.forEach((txn) => {
      txn.products.forEach((item) => {
        const productId = item.product.toString();

        if (!stockMap[productId]) {
          stockMap[productId] = 0;
        }

        if (txn.type === "purchase") {
          stockMap[productId] += item.quantity;
        } else if (txn.type === "sale") {
          stockMap[productId] -= item.quantity;
        }
      });
    });

    const result = products.map((product) => ({
      ...product.toObject(),
      stock: stockMap[product._id.toString()] || 0,
    }));

    res.json(result);
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
    res
      .status(400)
      .json({ message: "Error updating product", error: error.message });
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
