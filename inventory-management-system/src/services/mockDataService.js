// Mock data service to simulate backend functionality
// This will be replaced with actual API calls when connecting to a backend

// Initial mock data
let mockProducts = [
  {
    id: 1,
    name: "Laptop",
    sku: "TECH-001",
    category: "Electronics",
    quantity: 15,
    price: 999.99,
    description: "High-performance laptop with 16GB RAM and 512GB SSD",
    imageUrl: "/src/assets/images/laptop.jpg",
    createdAt: new Date("2023-01-15").toISOString(),
    updatedAt: new Date("2023-03-20").toISOString(),
  },
  {
    id: 2,
    name: "Office Chair",
    sku: "FURN-002",
    category: "Furniture",
    quantity: 8,
    price: 199.99,
    description: "Ergonomic office chair with lumbar support",
    imageUrl: "/src/assets/images/chair.jpg",
    createdAt: new Date("2023-02-10").toISOString(),
    updatedAt: new Date("2023-02-10").toISOString(),
  },
  {
    id: 3,
    name: "Wireless Mouse",
    sku: "TECH-003",
    category: "Electronics",
    quantity: 25,
    price: 29.99,
    description: "Bluetooth wireless mouse with adjustable DPI",
    imageUrl: "/src/assets/images/mouse.jpg",
    createdAt: new Date("2023-01-20").toISOString(),
    updatedAt: new Date("2023-04-05").toISOString(),
  },
  {
    id: 4,
    name: "Desk Lamp",
    sku: "LIGHT-004",
    category: "Lighting",
    quantity: 12,
    price: 49.99,
    description: "LED desk lamp with adjustable brightness",
    imageUrl: "/src/assets/images/lamp.jpg",
    createdAt: new Date("2023-03-15").toISOString(),
    updatedAt: new Date("2023-03-15").toISOString(),
  },
];

let mockCategories = [
  {
    id: 1,
    name: "Electronics",
    description: "Electronic devices and accessories",
  },
  { id: 2, name: "Furniture", description: "Office and home furniture" },
  { id: 3, name: "Lighting", description: "Lamps and lighting fixtures" },
  {
    id: 4,
    name: "Stationery",
    description: "Office supplies and stationery items",
  },
];

let mockStockHistory = [
  {
    id: 1,
    productId: 1,
    changeAmount: 5,
    reason: "Initial stock",
    date: new Date("2023-01-15").toISOString(),
  },
  {
    id: 2,
    productId: 1,
    changeAmount: 10,
    reason: "Restocking",
    date: new Date("2023-03-20").toISOString(),
  },
  {
    id: 3,
    productId: 2,
    changeAmount: 8,
    reason: "Initial stock",
    date: new Date("2023-02-10").toISOString(),
  },
  {
    id: 4,
    productId: 3,
    changeAmount: 25,
    reason: "Initial stock",
    date: new Date("2023-01-20").toISOString(),
  },
  {
    id: 5,
    productId: 4,
    changeAmount: 12,
    reason: "Initial stock",
    date: new Date("2023-03-15").toISOString(),
  },
];

// Helper to generate new IDs
const getNewId = (collection) => {
  return Math.max(...collection.map((item) => item.id), 0) + 1;
};

// Product Services
export const getProducts = () => {
  return [...mockProducts];
};

export const getProductById = (id) => {
  return mockProducts.find((product) => product.id === parseInt(id)) || null;
};

export const createProduct = (productData) => {
  const newProduct = {
    ...productData,
    id: getNewId(mockProducts),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockProducts.push(newProduct);
  return newProduct;
};

export const updateProduct = (id, productData) => {
  const index = mockProducts.findIndex(
    (product) => product.id === parseInt(id)
  );
  if (index === -1) return null;

  const updatedProduct = {
    ...mockProducts[index],
    ...productData,
    updatedAt: new Date().toISOString(),
  };

  mockProducts[index] = updatedProduct;
  return updatedProduct;
};

export const deleteProduct = (id) => {
  const index = mockProducts.findIndex(
    (product) => product.id === parseInt(id)
  );
  if (index === -1) return false;

  mockProducts.splice(index, 1);
  return true;
};

// Category Services
export const getCategories = () => {
  return [...mockCategories];
};

export const getCategoryById = (id) => {
  return (
    mockCategories.find((category) => category.id === parseInt(id)) || null
  );
};

export const createCategory = (categoryData) => {
  const newCategory = {
    ...categoryData,
    id: getNewId(mockCategories),
  };
  mockCategories.push(newCategory);
  return newCategory;
};

export const updateCategory = (id, categoryData) => {
  const index = mockCategories.findIndex(
    (category) => category.id === parseInt(id)
  );
  if (index === -1) return null;

  const updatedCategory = {
    ...mockCategories[index],
    ...categoryData,
  };

  mockCategories[index] = updatedCategory;
  return updatedCategory;
};

export const deleteCategory = (id) => {
  const index = mockCategories.findIndex(
    (category) => category.id === parseInt(id)
  );
  if (index === -1) return false;

  // Check if any products are using this category
  const productsUsingCategory = mockProducts.filter(
    (product) => product.category === mockCategories[index].name
  );

  if (productsUsingCategory.length > 0) {
    return {
      success: false,
      message: "Cannot delete category that is in use by products",
    };
  }

  mockCategories.splice(index, 1);
  return { success: true };
};

// Stock History Services
export const getStockHistory = (productId = null) => {
  if (productId) {
    return mockStockHistory.filter(
      (record) => record.productId === parseInt(productId)
    );
  }
  return [...mockStockHistory];
};

export const addStockRecord = (productId, changeAmount, reason) => {
  const newRecord = {
    id: getNewId(mockStockHistory),
    productId: parseInt(productId),
    changeAmount,
    reason,
    date: new Date().toISOString(),
  };

  mockStockHistory.push(newRecord);

  // Update product quantity
  const productIndex = mockProducts.findIndex(
    (product) => product.id === parseInt(productId)
  );
  if (productIndex !== -1) {
    mockProducts[productIndex].quantity += changeAmount;
    mockProducts[productIndex].updatedAt = new Date().toISOString();
  }

  return newRecord;
};

// Dashboard Statistics
export const getDashboardStats = () => {
  return {
    totalProducts: mockProducts.length,
    totalCategories: mockCategories.length,
    lowStockProducts: mockProducts.filter((product) => product.quantity < 10)
      .length,
    recentChanges: mockStockHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5),
  };
};
