import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Dropdown,
  DropdownButton,
  Pagination,
  Badge,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faBoxOpen,
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils/toast";

// Constants for product status
const STATUS_LABELS = {
  available: "Available",
  in_transit: "In Transit",
  sent: "Sent",
  received: "Received",
};

const STATUS_COLORS = {
  available: "success",
  in_transit: "warning",
  sent: "info",
  received: "primary",
};

// Constants for locations
const LOCATIONS = {
  bangalore: "Bangalore",
  erode: "Erode",
};

// Use these imports from your real API service
import { productsAPI, categoriesAPI } from "../services/api";
import StockUpdateModal from "../components/products/StockUpdateModal";
import ProductStatusModal from "../components/products/ProductStatusModal";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedProductForStatus, setSelectedProductForStatus] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    status: "",
    sortBy: "name",
    page: 1,
    perPage: 10,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

  // Load products and categories on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Import useContext at the top of the file
  const { isAdmin } = React.useContext(AuthContext);

  const handleDeleteClick = (product) => {
    // Check if user is admin before showing delete modal
    if (!isAdmin) {
      showToast("Only administrators can delete products", "error");
      return;
    }
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await productsAPI.delete(productToDelete._id);
      showToast("Product deleted successfully", "success");
      loadProducts(); // Reload the products after deletion
    } catch (error) {
      console.error("Error deleting product:", error);
      if (error.response?.status === 401) {
        showToast(
          "You don't have permission to delete products. Admin access required.",
          "error"
        );
      } else {
        showToast("Failed to delete product", "error");
      }
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  // Filter and sort products when dependencies change
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.productNumber.toLowerCase().includes(searchTerm)
      );
    }

    // Apply location filter
    if (filters.location) {
      result = result.filter(
        (product) =>
          product.location.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((product) => product.status === filters.status);
    }

    // Apply sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue = a[filters.sortBy];
        let bValue = b[filters.sortBy];

        // Handle date sorting
        if (filters.sortBy === "createdAt" || filters.sortBy === "updatedAt") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle string sorting
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      });
    }

    // Apply pagination
    const startIndex = (filters.page - 1) * filters.perPage;
    const endIndex = startIndex + filters.perPage;
    result = result.slice(startIndex, endIndex);

    setFilteredProducts(result);
  }, [products, filters]);

  // Update filters when search input changes
  const handleSearchChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1, // Reset to first page when search changes
    }));
  };

  // Update location filter
  const handleLocationChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      location: e.target.value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  // Update status filter
  const handleStatusChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      status: e.target.value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  // Update sort
  const handleSortChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: e.target.value,
      page: 1, // Reset to first page when sort changes
    }));
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  const openStatusModal = (product) => {
    setSelectedProductForStatus(product);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = () => {
    loadProducts(); // Reload products after status update
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} />;
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} />
    ) : (
      <FontAwesomeIcon icon={faSortDown} />
    );
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Products</h1>
        <Button variant="primary" onClick={() => navigate("/products/add")}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name or product number"
                  value={filters.search}
                  onChange={handleSearchChange}
                />
                <Form.Text className="text-muted">
                  Search by product name or product number
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Select
                  value={filters.location}
                  onChange={handleLocationChange}
                >
                  <option value="">All Locations</option>
                  {Object.entries(LOCATIONS).map(([key, label]) => (
                    <option key={`location-${key}`} value={key}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={handleStatusChange}
                >
                  <option value="">All Status</option>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={`status-${key}`} value={key}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <Form.Select value={filters.sortBy} onChange={handleSortChange}>
                  <option value="name">Name</option>
                  <option value="productNumber">Product Number</option>
                  <option value="location">Location</option>
                  <option value="quantity">Quantity</option>
                  <option value="updatedAt">Last Updated</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : filteredProducts.length === 0 ? (
            <Alert variant="info">
              {filters.search || filters.location || filters.status
                ? "No products match your search criteria"
                : "No products found"}
            </Alert>
          ) : (
            <div>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Product Number</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.productNumber}</td>
                      <td>{product.name}</td>
                      <td>{LOCATIONS[product.location] || product.location}</td>
                      <td>{product.quantity}</td>
                      <td>
                        <Badge bg={STATUS_COLORS[product.status]}>
                          {STATUS_LABELS[product.status]}
                        </Badge>
                      </td>
                      <td>
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/product/${product._id}/edit`)
                          }
                          className="me-2"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {!loading && !error && products.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {filteredProducts.length} of {products.length}{" "}
                    products
                    {filters.search && ` matching "${filters.search}"`}
                  </div>
                  <Pagination>
                    <Pagination.Prev
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={filters.page === 1}
                    />
                    {Array.from(
                      { length: Math.ceil(products.length / filters.perPage) },
                      (_, i) => i + 1
                    ).map((pageNum) => (
                      <Pagination.Item
                        key={`page-${pageNum}`}
                        active={pageNum === filters.page}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, page: pageNum }))
                        }
                      >
                        {pageNum}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.min(
                            Math.ceil(products.length / filters.perPage),
                            prev.page + 1
                          ),
                        }))
                      }
                      disabled={
                        filters.page ===
                        Math.ceil(products.length / filters.perPage)
                      }
                    />
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the product "{productToDelete?.name}"?
          <br />
          <small className="text-muted">
            Product Number: {productToDelete?.productNumber}
          </small>
          <br />
          <small className="text-danger">This action cannot be undone.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Stock Update Modal */}
      {selectedProduct && (
        <StockUpdateModal
          show={showStockModal}
          onHide={() => setShowStockModal(false)}
          product={selectedProduct}
          onStockUpdate={loadProducts}
        />
      )}

      {/* Product Status Modal */}
      <ProductStatusModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        product={selectedProductForStatus}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default ProductList;
