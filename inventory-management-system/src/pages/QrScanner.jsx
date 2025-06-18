import React, { useRef, useState, useEffect } from "react";
import jsQR from "jsqr";
import { productsAPI } from "../services/api";
import { Spinner, Alert, Button, Card, Form, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  // faQrcode,
  faSearch,
  faCamera,
  faSpinner,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { showToast } from "../utils/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LOCATIONS = {
  bangalore: "Bangalore",
  erode: "Erode",
};

const QrScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [qrText, setQrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    productNumber: "",
    action: "send", // send or receive
    location: "",
    notes: "",
    from: "",
    to: "",
  });

  useEffect(() => {
    if (scanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [scanning]);

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", true);
      videoRef.current.play();

      requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error("Camera access failed:", err);
      setError(
        "Camera access failed. Please allow permission or use manual entry below."
      );
      showToast(
        "Camera access denied. You can use manual entry below.",
        "error"
      );
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      requestAnimationFrame(scanFrame);
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      const scanned = code.data.trim();
      setQrText(scanned);
      setScanning(false);
      stopCamera();
      fetchProduct(scanned);
    } else {
      requestAnimationFrame(scanFrame);
    }
  };

  const fetchProduct = async (productNumber) => {
    try {
      setLoading(true);
      setError("");
      const res = await productsAPI.getByNumber(productNumber);

      if (res?.data) {
        setProduct(res.data);
        // Pre-fill form data with product information
        setFormData((prev) => ({
          ...prev,
          productNumber: res.data.productNumber,
          from: LOCATIONS[res.data.location] || res.data.location,
          location: res.data.location,
        }));
        showToast("Product found!", "success");
      } else {
        setError("Product not found for QR code");
        showToast("Product not found", "error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching product");
      showToast("Error finding product", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual search
  const handleManualSearch = async (e) => {
    e.preventDefault();

    if (!formData.productNumber.trim()) {
      setError("Please enter a product number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Fetch product details
      const response = await productsAPI.getByNumber(
        formData.productNumber.trim()
      );

      if (response.data) {
        setProduct(response.data);
        // Pre-fill form data with product information
        setFormData((prev) => ({
          ...prev,
          productNumber: response.data.productNumber,
          from: LOCATIONS[response.data.location] || response.data.location,
          location: response.data.location,
        }));
        showToast("Product found!", "success");
      } else {
        setError("Product not found");
        showToast("Product not found", "error");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Error finding product. Please try again.");
      showToast("Error finding product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setQrText("");
    setProduct(null);
    setError("");
    setScanning(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product) {
      setError("Please scan or enter a product first");
      return;
    }

    if (!formData.location) {
      setError("Please select a location");
      return;
    }

    if (!formData.from.trim() || !formData.to.trim()) {
      setError("Please enter both 'From' and 'To' fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        productId: product._id,
        action: formData.action,
        location: formData.location,
        notes: formData.notes,
        from: formData.from,
        to: formData.to,
      };

      await axios.post("/api/products/movement", payload);

      // Reset form and show success
      setProduct(null);
      setFormData({
        productNumber: "",
        action: "send",
        location: "",
        notes: "",
        from: "",
        to: "",
      });

      showToast("Product movement recorded successfully!", "success");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Error recording movement. Please try again.");
      showToast("Error recording movement", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 text-center">
      <ToastContainer />
      <h4 className="text-primary">QR Code Product Scanner</h4>

      {!scanning && !product && (
        <Button onClick={() => setScanning(true)} variant="primary">
          Start Camera
        </Button>
      )}

      {scanning && (
        <>
          <video
            ref={videoRef}
            style={{ width: "100%", maxWidth: "400px", marginTop: "1rem" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Scanning...
          </p>
        </>
      )}

      {/* Manual Input Section */}
      <div className="mb-4 mt-3">
        <Form.Group>
          <Form.Label style={{ color: "var(--text-primary)" }}>
            Or Enter Product Number Manually
          </Form.Label>
          <div className="d-flex gap-2 justify-content-center">
            <Form.Control
              type="text"
              value={formData.productNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  productNumber: e.target.value,
                }))
              }
              placeholder="Enter product number"
              disabled={loading}
              style={{ maxWidth: "300px" }}
              className="bg-light text-dark"
            />
            <Button
              variant="primary"
              onClick={handleManualSearch}
              disabled={loading || !formData.productNumber.trim()}
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faSearch} />
              )}
            </Button>
          </div>
        </Form.Group>
      </div>

      {loading && (
        <div className="mt-3">
          <Spinner animation="border" />
          <p style={{ color: "var(--text-primary)" }}>
            Fetching product info...
          </p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {product && (
        <Card
          className="mt-4 text-start"
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "var(--bg-tertiary)",
          }}
        >
          <Card.Header
            style={{
              backgroundColor: "var(--primary-700)",
              color: "var(--text-on-dark)",
            }}
          >
            <strong>Product Details</strong>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p style={{ color: "var(--text-primary)" }}>
                  <strong>Product Number:</strong> {product.productNumber}
                </p>
                <p style={{ color: "var(--text-primary)" }}>
                  <strong>Name:</strong> {product.name}
                </p>
                <p style={{ color: "var(--text-primary)" }}>
                  <strong>Quantity:</strong> {product.quantity}
                </p>
                <p style={{ color: "var(--text-primary)" }}>
                  <strong>Location:</strong>{" "}
                  {LOCATIONS[product.location] || product.location}
                </p>
              </Col>
              <Col md={6}>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "var(--text-primary)" }}>
                      Action
                    </Form.Label>
                    <Form.Select
                      value={formData.action}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          action: e.target.value,
                        }))
                      }
                      required
                      className="bg-light text-dark"
                    >
                      <option value="send">Send Product</option>
                      <option value="receive">Receive Product</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "var(--text-primary)" }}>
                      Location
                    </Form.Label>
                    <Form.Select
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      required
                      className="bg-light text-dark"
                    >
                      <option value="">Select Location</option>
                      {Object.entries(LOCATIONS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "var(--text-primary)" }}>
                      From
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.from}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                      placeholder="Sender or current location"
                      required
                      className="bg-light text-dark"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "var(--text-primary)" }}>
                      To
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.to}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      placeholder="Receiver or destination location"
                      required
                      className="bg-light text-dark"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Add any notes about this movement"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-100"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-2"
                        />
                        {formData.action === "send"
                          ? "Send Product"
                          : "Receive Product"}
                      </>
                    )}
                  </Button>
                </Form>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {(qrText || product || error) && (
        <div className="mt-4">
          <Button variant="light" onClick={handleRestart} className="btn-lg">
            <FontAwesomeIcon icon={faCamera} className="me-2" />
            Scan Another
          </Button>
        </div>
      )}
    </div>
  );
};

export default QrScanner;
