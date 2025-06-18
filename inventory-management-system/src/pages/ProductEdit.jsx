import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Image,
  Container,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
// Replace these imports
// import {
//   getProductById,
//   createProduct,
//   updateProduct,
//   getCategories,
// } from "../services/mockDataService";
// With these imports
import { productsAPI, categoriesAPI } from "../services/api";
import { showToast } from "../components/common/ToastContainer";

const LOCATIONS = {
  BANGALORE: "bangalore",
  ERODE: "erode",
};

const LOCATION_LABELS = {
  [LOCATIONS.BANGALORE]: "Bangalore",
  [LOCATIONS.ERODE]: "Erode",
};

const generateProductNumber = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `PRD-${timestamp}-${random}`;
};

const ProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    productNumber: generateProductNumber(),
    name: "",
    description: "",
    quantity: 1,
    price: 0,
    category: "",
    purchaseLocation: LOCATIONS.BANGALORE, // Default to Bangalore
    location: LOCATIONS.BANGALORE, // Default to Bangalore
    notes: "",
    history: [], // Track product movement history
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const scannerRef = useRef(null);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    // Get user's location (you can implement this based on your authentication system)
    const getUserLocation = async () => {
      try {
        const response = await fetch("/api/user/location");
        if (response.ok) {
          const { location } = await response.json();
          setFormData((prev) => ({
            ...prev,
            location:
              location === "erode" ? LOCATIONS.ERODE : LOCATIONS.BANGALORE,
          }));
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
        // Default to Bangalore if there's an error
        setFormData((prev) => ({
          ...prev,
          location: LOCATIONS.BANGALORE,
        }));
      }
    };

    getUserLocation();

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    // Load categories
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error("Error loading categories:", error);
        showToast("Failed to load categories", "danger");
      }
    };

    fetchCategories();
  }, []);

  // Load html5-qrcode script dynamically
  useEffect(() => {
    if (window.Html5QrcodeScanner) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/html5-qrcode";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptLoaded(false);
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize scanner when script is loaded and showScanner is true
  useEffect(() => {
    let scanner;
    if (showScanner && scriptLoaded && window.Html5QrcodeScanner) {
      try {
        scanner = new window.Html5QrcodeScanner("qr-reader-add", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        });
        scanner.render((decodedText) => {
          setFormData((prev) => ({ ...prev, name: decodedText }));
          setShowScanner(false);
          scanner.clear();
        });
        scannerRef.current = scanner;
      } catch (err) {
        setShowScanner(false);
      }
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [showScanner, scriptLoaded]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setNameError("Product name is required");
      return false;
    }
    if (!formData.category.trim()) {
      setError("Category is required");
      return false;
    }
    if (formData.quantity < 1) {
      setError("Quantity must be at least 1");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear errors when user starts typing
    if (name === "name") {
      setNameError("");
    }
    if (
      name === "category" ||
      name === "quantity" ||
      name === "purchaseLocation"
    ) {
      setError("");
    }

    // Update form data
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // If purchase location changes, update the location field
      if (name === "purchaseLocation") {
        newData.location = value;
      }

      return newData;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF)");
        return;
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should not exceed 2MB");
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setFormData((prev) => ({ ...prev, imageUrl: event.target.result }));
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare product data
      const productData = {
        ...formData,
        // Set location based on purchase location
        location: formData.purchaseLocation,
        // Add initial history entry
        history: [
          {
            type: "created",
            from: formData.purchaseLocation,
            to: formData.purchaseLocation,
            quantity: formData.quantity,
            timestamp: new Date().toISOString(),
            notes: "Product created",
          },
        ],
      };

      if (id) {
        await productsAPI.update(id, productData);
        showToast("Product updated successfully", "success");
      } else {
        await productsAPI.create(productData);
        showToast("Product added successfully", "success");
      }
      navigate("/products");
    } catch (error) {
      console.error("Error saving product:", error);
      showToast(error.message || "Error saving product", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setFormData(response.data);
      setImagePreview(response.data.imageUrl);
    } catch (error) {
      console.error("Error loading product:", error);
      showToast("Product not found", "danger");
      navigate("/products");
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">{id ? "Edit Product" : "Add New Product"}</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.productNumber}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Auto-generated unique identifier
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!error || !!nameError}
                    placeholder="Enter unique product name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {error || nameError}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    isInvalid={!!error}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {error}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    isInvalid={!!error}
                  />
                  <Form.Control.Feedback type="invalid">
                    {error}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    isInvalid={!!error}
                  />
                  <Form.Control.Feedback type="invalid">
                    {error}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Location</Form.Label>
                  <Form.Select
                    name="purchaseLocation"
                    value={formData.purchaseLocation}
                    onChange={handleChange}
                    isInvalid={!!error}
                    required
                  >
                    <option value="">Select Purchase Location</option>
                    <option value={LOCATIONS.BANGALORE}>
                      {LOCATION_LABELS[LOCATIONS.BANGALORE]}
                    </option>
                    <option value={LOCATIONS.ERODE}>
                      {LOCATION_LABELS[LOCATIONS.ERODE]}
                    </option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {error}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Where did you purchase this product?
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate("/products")}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductEdit;
