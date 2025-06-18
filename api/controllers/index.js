// This file contains all controllers for the API

// Import models
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import StockHistory from "../models/stockHistoryModel.js";
import ProductMovement from "../models/productMovementModel.js";
import generateToken from "../utils/generateToken.js";

// Product Controller
export const productController = {
  // Get all products
  getProducts: async (req, res) => {
    try {
      const products = await Product.find({});
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create a new product
  createProduct: async (req, res) => {
    try {
      const { name, location, productNumber, ...otherData } = req.body;

      // Validate location if provided
      if (location) {
        const validLocations = ["bangalore", "erode", "in_transit", "garage"];
        if (!validLocations.includes(location.toLowerCase())) {
          return res.status(400).json({
            message:
              "Invalid location. Must be one of: bangalore, erode, in_transit, garage",
          });
        }
      }

      // Check for existing product with same name (case-insensitive)
      const existingProductByName = await Product.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });

      if (existingProductByName) {
        return res.status(400).json({
          message: "A product with this name already exists (case-insensitive)",
        });
      }

      // Check for existing product with same product number
      const existingProductByNumber = await Product.findOne({
        productNumber: { $regex: new RegExp(`^${productNumber}$`, "i") },
      });

      if (existingProductByNumber) {
        return res.status(400).json({
          message: "A product with this product number already exists",
        });
      }

      const product = new Product({
        name,
        productNumber,
        location: location || "garage",
        ...otherData,
      });

      const createdProduct = await product.save();
      res.status(201).json(createdProduct);
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern.name) {
          return res.status(400).json({
            message: "A product with this name already exists",
          });
        }
        if (error.keyPattern.productNumber) {
          return res.status(400).json({
            message: "A product with this product number already exists",
          });
        }
      }
      res.status(400).json({ message: error.message });
    }
  },

  // Quick add product (create if not found by name) for seamless QR workflow
  quickAddProduct: async (req, res) => {
    const { name, category, quantity, description, productNumber } = req.body;
    if (!name || !category || quantity === undefined || !productNumber) {
      return res.status(400).json({
        message: "Name, category, quantity, and product number are required.",
      });
    }
    try {
      // Check if product exists by name or product number
      let product = await Product.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${name}$`, "i") } },
          { productNumber: { $regex: new RegExp(`^${productNumber}$`, "i") } },
        ],
      });

      if (!product) {
        // Create new product if not found
        product = new Product({
          name,
          category,
          quantity,
          description,
          productNumber,
        });
        await product.save();
      }
      res.status(201).json(product);
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern.name) {
          return res.status(400).json({
            message: "A product with this name already exists",
          });
        }
        if (error.keyPattern.productNumber) {
          return res.status(400).json({
            message: "A product with this product number already exists",
          });
        }
      }
      res.status(400).json({ message: error.message });
    }
  },

  // Update a product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate location if provided
      if (updateData.location) {
        const validLocations = ["bangalore", "erode", "in_transit", "garage"];
        if (!validLocations.includes(updateData.location.toLowerCase())) {
          return res.status(400).json({
            message:
              "Invalid location. Must be one of: bangalore, erode, in_transit, garage",
          });
        }
      }

      // Get current product data
      const currentProduct = await Product.findById(id);
      if (!currentProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // If updating product number, check for uniqueness
      if (
        updateData.productNumber &&
        updateData.productNumber !== currentProduct.productNumber
      ) {
        const existingProduct = await Product.findOne({
          productNumber: {
            $regex: new RegExp(`^${updateData.productNumber}$`, "i"),
          },
          _id: { $ne: id },
        });
        if (existingProduct) {
          return res.status(400).json({
            message: "A product with this product number already exists",
          });
        }
      }

      // If updating location, ensure previousLocation is set
      if (
        updateData.location &&
        updateData.location !== currentProduct.location
      ) {
        updateData.previousLocation = currentProduct.location;
      }

      // Handle history updates separately
      const historyUpdate = updateData.$push;
      delete updateData.$push;

      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          $set: updateData,
          ...(historyUpdate && { $push: historyUpdate }),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error.code === 11000) {
        if (error.keyPattern.name) {
          return res.status(400).json({
            message: "A product with this name already exists",
          });
        }
        if (error.keyPattern.productNumber) {
          return res.status(400).json({
            message: "A product with this product number already exists",
          });
        }
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a product
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Use deleteOne instead of remove() which is deprecated
      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: "Product removed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update product status
  updateProductStatus: async (req, res) => {
    try {
      const { productId } = req.params;
      const { status, eventId, notes } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Validate status
      const validStatuses = [
        "Available",
        "Sent",
        "In Use",
        "Received",
        "Damaged",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Update product status and history
      product.status = status;
      product.currentEvent = eventId || null;

      // Add to status history
      product.statusHistory.push({
        status,
        event: eventId,
        timestamp: new Date(),
        notes: notes || `Status changed to ${status}`,
      });

      // If status is "Received", update location back to default
      if (status === "Received") {
        product.location = "garage";
        product.previousLocation = product.location;
      }

      await product.save();

      // Populate the event reference if it exists
      const populatedProduct = await Product.findById(productId)
        .populate("currentEvent")
        .populate("statusHistory.event");

      res.json(populatedProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get product status history
  getProductStatusHistory: async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await Product.findById(productId)
        .populate("statusHistory.event")
        .select("statusHistory");

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product.statusHistory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Check if product name is unique
  checkProductName: async (req, res) => {
    try {
      const { name, excludeId } = req.query;

      if (!name) {
        return res.status(400).json({ message: "Product name is required" });
      }

      console.log("Checking product name:", name); // Debug log

      // First, get all products to debug
      const allProducts = await Product.find({});
      console.log("All products in database:", allProducts); // Debug log

      // Build query to check for existing product with same name
      const query = {
        name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive match
      };

      // If excludeId is provided, exclude that product from the check
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      console.log("Search query:", query); // Debug log

      const existingProduct = await Product.findOne(query);
      console.log("Found existing product:", existingProduct); // Debug log

      // If no product found, name is unique
      const isUnique = !existingProduct;
      console.log("Is name unique:", isUnique); // Debug log

      res.json({
        isUnique,
        debug: {
          searchedName: name,
          totalProducts: allProducts.length,
          foundProduct: existingProduct
            ? {
                id: existingProduct._id,
                name: existingProduct.name,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Error checking product name:", error); // Debug log
      res.status(500).json({
        message: error.message,
        error: error.toString(),
      });
    }
  },

  // Get product by product number
  getProductByNumber: async (req, res) => {
    try {
      const { productNumber } = req.params;
      const product = await Product.findOne({ productNumber: productNumber });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Record product movement
  recordProductMovement: async (req, res) => {
    try {
      const { productId, action, location, notes, from, to } = req.body;
      if (!productId || !action || !location || !from || !to) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Validation: prevent duplicate consecutive send/receive
      if (action === "send") {
        if (product.status === "Sent") {
          return res.status(400).json({
            message:
              "Product is already sent and not yet received. Cannot send again.",
          });
        }
      }
      if (action === "receive") {
        if (product.status !== "Sent") {
          return res.status(400).json({
            message: "Product must be sent before it can be received.",
          });
        }
      }
      // Update product location and status
      product.previousLocation = product.location;
      product.location = location;
      product.status = action === "send" ? "Sent" : "Available";
      // Add to statusHistory
      product.statusHistory.push({
        status: product.status,
        notes: `From: ${from}, To: ${to}. ${notes || ""}`,
        timestamp: new Date(),
      });
      await product.save();
      // Create a new ProductMovement document
      await ProductMovement.create({
        productId: product._id,
        productNumber: product.productNumber,
        productName: product.name,
        from,
        to,
        action,
        notes,
        timestamp: new Date(),
      });
      const successMsg =
        action === "receive"
          ? "Product received successfully!"
          : "Movement recorded";
      res.json({ message: successMsg, product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getRecentProductMovements: async (req, res) => {
    try {
      console.log("getRecentProductMovements called");
      const movements = await ProductMovement.find({})
        .sort({ timestamp: -1 })
        .limit(20);
      console.log("Movements found:", movements);
      res.json(movements);
    } catch (error) {
      console.error("Error in getRecentProductMovements:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a product movement
  deleteProductMovement: async (req, res) => {
    try {
      const movement = await ProductMovement.findById(req.params.id);
      if (!movement) {
        return res.status(404).json({ message: "Movement record not found" });
      }

      // Use deleteOne instead of remove() which is deprecated
      await ProductMovement.deleteOne({ _id: req.params.id });
      res.json({ message: "Movement record removed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

// Category Controller
export const categoryController = {
  // Get all categories
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find({});
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get category by ID
  getCategoryById: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create a new category
  createCategory: async (req, res) => {
    try {
      const category = new Category(req.body);
      const createdCategory = await category.save();
      res.status(201).json(createdCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update a category
  updateCategory: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Update fields
      Object.keys(req.body).forEach((key) => {
        category[key] = req.body[key];
      });

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete a category
  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Check if any products are using this category
      const productCount = await Product.countDocuments({
        category: category.name,
      });
      if (productCount > 0) {
        return res.status(400).json({
          message: `Cannot delete category. It is being used by ${productCount} products.`,
        });
      }

      // Use deleteOne instead of remove() which is deprecated
      await Category.deleteOne({ _id: req.params.id });
      res.json({ message: "Category removed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

// User Controller
export const userController = {
  // Register a new user
  registerUser: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
      });

      // Generate JWT token
      const token = generateToken(user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Login user
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      // Check if user exists and password matches
      if (user && (await user.matchPassword(password))) {
        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token,
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get user profile
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update user profile
  updateUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update fields
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // Generate new JWT token
      const token = generateToken(updatedUser._id);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Register an admin user
  registerAdminUser: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new admin user with isAdmin set to true
      const user = await User.create({
        name,
        email,
        password,
        isAdmin: true, // Set isAdmin to true directly
      });

      // Generate JWT token
      const token = generateToken(user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

// Stock History Controller
export const stockHistoryController = {
  // Get all stock history entries
  getStockHistory: async (req, res) => {
    try {
      const stockHistory = await StockHistory.find({}).populate(
        "productId",
        "name"
      );
      res.json(stockHistory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get stock history for a specific product
  getProductStockHistory: async (req, res) => {
    try {
      const stockHistory = await StockHistory.find({
        productId: req.params.productId,
      }).populate("productId", "name");
      res.json(stockHistory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create a new stock history entry
  createStockHistory: async (req, res) => {
    try {
      const { productId, changeAmount, reason } = req.body;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Create stock history entry
      const stockHistory = new StockHistory({
        productId,
        changeAmount,
        reason,
        updatedBy: req.user ? req.user._id : null,
      });

      // Update product quantity
      product.quantity += Number(changeAmount);
      if (product.quantity < 0) {
        return res
          .status(400)
          .json({ message: "Stock quantity cannot be negative" });
      }

      // Save both stock history and updated product
      const createdStockHistory = await stockHistory.save();
      await product.save();

      res.status(201).json(createdStockHistory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
