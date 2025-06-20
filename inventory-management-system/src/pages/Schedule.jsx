import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Card,
  Button,
  Form,
  Table,
  Alert,
  Spinner,
  Row,
  Col,
  InputGroup,
  Container,
  Modal,
} from "react-bootstrap";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faSearch,
  // faCamera,
  faSpinner,
  faCheckCircle,
  faCalendarAlt,
  faExclamationTriangle,
  faTimes,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
// import axios from "axios";
import { showToast } from "../utils/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { productsAPI, qrEventsAPI } from "../services/api";

// Available locations
const LOCATIONS = {
  bangalore: "Bangalore",
  erode: "Erode",
  in_transit: "In Transit",
  garage: "Garage",
};

const Schedule = () => {
  // Scanner state
  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Product state
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState({
    product: "",
    productName: "",
    location: "",
    eventType: "Send",
    notes: "",
  });
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Get authentication context
  const { isAdmin } = useContext(AuthContext);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchScheduledEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qr-events/scheduled");
      const data = await res.json();
      // Fetch product details for each event
      const eventsWithProductNames = await Promise.all(
        data.map(async (event) => {
          try {
            const productRes = await productsAPI.getByNumber(event.product);
            return {
              ...event,
              productName: productRes.data?.name || "Unknown Product",
            };
          } catch (error) {
            console.error("Error fetching product details:", error);
            return {
              ...event,
              productName: "Unknown Product",
            };
          }
        })
      );
      setScheduledEvents(eventsWithProductNames);
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to load scheduled events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledEvents();
  }, []);

  // Start scanning with camera access
  const startScanner = () => {
    if (scanner) {
      scanner.clear();
    }

    setError(""); // Clear any previous errors

    try {
      const newScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        false
      );

      newScanner.render(onScanSuccess, onScanError);
      setScanner(newScanner);
      setScanning(true);
    } catch (err) {
      console.error("Scanner initialization failed:", err);
      const errorMessage =
        "Camera access is required for QR scanning. Please follow these steps:\n" +
        "1. Check that your device has a camera\n" +
        "2. Make sure you've allowed camera access in your browser settings\n" +
        "3. If using Windows, ensure camera privacy settings allow browser access\n" +
        "4. Try closing other applications that might be using the camera\n" +
        "5. Refresh the page and try again";

      setError(errorMessage);
      showToast("Camera access denied. Check browser permissions.", "error");
    }
  };

  // Stop scanning
  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
  };

  // After fetching product, update form
  const setProductAndForm = (productObj) => {
    setProduct(productObj);
    setForm((prev) => ({
      ...prev,
      product: productObj.productNumber,
      location: productObj.location,
      productName: productObj.name || "",
    }));
    setShowProductForm(true);
  };

  // Handle successful scan
  const onScanSuccess = async (decodedText) => {
    try {
      // Stop scanner after successful scan
      stopScanner();

      // Set the scanned data to the input field
      setForm((prev) => ({ ...prev, product: decodedText }));

      // Set loading state
      setProductLoading(true);
      setError("");

      // Fetch product details using productsAPI
      const response = await productsAPI.getByNumber(decodedText);

      if (response.data) {
        // Update product state and form data
        setProductAndForm(response.data);
        showToast("Product found!", "success");
      } else {
        setError("Product not found");
        showToast("Product not found", "error");
        setShowProductForm(false);
      }
    } catch (err) {
      console.error("Scan error:", err);
      setError("Error finding product. Please try again.");
      showToast("Error finding product", "error");
      setShowProductForm(false);
    } finally {
      setProductLoading(false);
    }
  };

  // Handle scan error
  const onScanError = (error) => {
    console.error("Scan error:", error);
  };

  // Handle manual search
  const handleManualSearch = async () => {
    if (!form.product.trim()) {
      setError("Please enter a product number");
      return;
    }

    try {
      setProductLoading(true);
      setError("");

      const response = await productsAPI.getByNumber(form.product.trim());

      if (response.data) {
        setProductAndForm(response.data);
        showToast("Product found!", "success");
      } else {
        setError("Product not found");
        showToast("Product not found", "error");
        setShowProductForm(false);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Error finding product. Please try again.");
      showToast("Error finding product", "error");
      setShowProductForm(false);
    } finally {
      setProductLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // If changing the product number field, hide the form until validated
    if (e.target.name === "product") {
      setShowProductForm(false);
      setProduct(null);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleScheduleEvent = async () => {
    if (!product) {
      setError("Please scan or enter a valid product number first");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const productName =
        form.productName || (product ? product.name : "Unknown Product");
      const res = await fetch("/api/qr-events/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productName,
          scheduledDate: selectedDate,
          time: new Date(),
        }),
      });
      if (!res.ok) throw new Error("Failed to schedule event");
      setSuccess("Event scheduled successfully!");
      setForm({
        product: "",
        productName: "",
        location: "",
        eventType: "Send",
        notes: "",
      });
      setProduct(null);
      setShowProductForm(false);
      fetchScheduledEvents();
      showToast("Event scheduled successfully!", "success");
    } catch (err) {
      setError("Failed to schedule event: " + err.message);
      showToast("Failed to schedule event", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEventClick = (event) => {
    // Check if user is admin before showing delete modal
    if (!isAdmin) {
      showToast("Only administrators can delete scheduled events", "error");
      return;
    }
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleDeleteEventConfirm = async () => {
    if (!eventToDelete) return;

    try {
      // Call the API to delete the event
      await qrEventsAPI.delete(eventToDelete._id);
      
      // Update the state to remove the deleted event
      const updatedEvents = scheduledEvents.filter(
        (e) => e._id !== eventToDelete._id
      );
      setScheduledEvents(updatedEvents);
      showToast("Event deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("Failed to delete event. Please try again.", "error");
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  return (
    <div
      className="schedule-page"
      style={{
        background: "#f8f9fa",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <Container fluid className="px-3 px-md-4">
        <div className="text-center mb-4">
          <h1 className="display-4 fw-bold text-white mb-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="me-3" />
            Schedule Events
          </h1>
          <p className="lead text-white-50">
            Manage your product scheduling with ease
          </p>
        </div>

        {/* Schedule New Event Card */}
        <Row className="justify-content-center mb-4">
          <Col lg={isMobile ? 12 : 8} xl={isMobile ? 12 : 6}>
            <Card
              className="shadow border-0"
              style={{
                borderRadius: "8px",
                background: "white",
                border: "1px solid #dee2e6",
              }}
            >
              <Card.Header
                className="border-0 text-center"
                style={{
                  background: "#495057",
                  color: "white",
                  borderRadius: "8px 8px 0 0",
                  padding: "1.5rem",
                }}
              >
                <h4 className="mb-0 text-white fw-bold">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Schedule New Event
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                {error && (
                  <Alert
                    variant="danger"
                    className="mb-3 border-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                      color: "white",
                      borderRadius: "15px",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="me-2"
                    />
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert
                    variant="success"
                    className="mb-3 border-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
                      color: "white",
                      borderRadius: "15px",
                    }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    {success}
                  </Alert>
                )}

                <Form>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold text-dark mb-3" style={{ fontSize: "1.1rem" }}>
                      <FontAwesomeIcon icon={faSearch} className="me-2 text-primary" />
                      Product Number
                    </Form.Label>
                    <InputGroup className="shadow-sm">
                      <Form.Control
                        type="text"
                        name="product"
                        value={form.product}
                        onChange={handleChange}
                        placeholder="Enter product number or scan QR code"
                        required
                        style={{
                          borderRadius: "8px 0 0 8px",
                          border: "2px solid #6c757d",
                          padding: "14px 18px",
                          fontSize: "1rem",
                          fontWeight: "500",
                          background: "#f8f9fa",
                          color: "#495057",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                        }}
                        onFocus={(e) => {
                          e.target.style.border = "2px solid #495057";
                          e.target.style.background = "white";
                        }}
                        onBlur={(e) => {
                          e.target.style.border = "2px solid #6c757d";
                          e.target.style.background = "#f8f9fa";
                        }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={handleManualSearch}
                        disabled={productLoading}
                        style={{
                          border: "2px solid #6c757d",
                          borderLeft: "none",
                          borderRight: "none",
                          background: "#e9ecef",
                          color: "#495057",
                          padding: "14px 18px",
                          fontWeight: "600",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#dee2e6";
                          e.target.style.color = "#212529";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#e9ecef";
                          e.target.style.color = "#495057";
                        }}
                      >
                        {productLoading ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <FontAwesomeIcon icon={faSearch} />
                        )}
                      </Button>
                      <Button
                        onClick={startScanner}
                        disabled={scanning}
                        style={{
                          borderRadius: "0 8px 8px 0",
                          background: "#495057",
                          border: "2px solid #495057",
                          color: "white",
                          padding: "14px 18px",
                          fontWeight: "600",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#343a40";
                          e.target.style.borderColor = "#343a40";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#495057";
                          e.target.style.borderColor = "#495057";
                        }}
                      >
                        <FontAwesomeIcon icon={scanning ? faTimes : faQrcode} />
                      </Button>
                    </InputGroup>
                  </Form.Group>



                  {scanning && (
                    <div className="mb-4 text-center">
                      <div
                        id="qr-reader"
                        style={{
                          width: "100%",
                          borderRadius: "15px",
                          overflow: "hidden",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        }}
                      ></div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={stopScanner}
                        className="mt-3"
                        style={{
                          borderRadius: "20px",
                          padding: "8px 20px",
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                        Cancel Scanning
                      </Button>
                    </div>
                  )}

                  {product && (
                    <Alert
                      className="mb-4 border-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
                        color: "white",
                        borderRadius: "15px",
                        padding: "1rem 1.5rem",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-3 fs-4"
                        />
                        <div>
                          <strong className="d-block">Product Found!</strong>
                          <span>
                            {product.name} ({product.productNumber})
                          </span>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {showProductForm && (
                    <>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark mb-2">
                          Event Date
                        </Form.Label>
                        <div
                          className="calendar-container"
                          style={{
                            background: "white",
                            borderRadius: "15px",
                            padding: "1rem",
                            border: "2px solid #e9ecef",
                          }}
                        >
                          <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            minDate={new Date()}
                            className="w-100 border-0"
                          />
                        </div>
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold text-dark mb-2">
                              Event Type
                            </Form.Label>
                            <Form.Select
                              name="eventType"
                              value={form.eventType}
                              onChange={handleChange}
                              required
                              style={{
                                borderRadius: "15px",
                                border: "2px solid #e9ecef",
                                padding: "12px 16px",
                              }}
                            >
                              <option value="Send">Send</option>
                              <option value="Receive">Receive</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Inspection">Inspection</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold text-dark mb-2">
                              Location
                            </Form.Label>
                            <Form.Select
                              name="location"
                              value={form.location}
                              onChange={handleChange}
                              required
                              style={{
                                borderRadius: "15px",
                                border: "2px solid #e9ecef",
                                padding: "12px 16px",
                              }}
                            >
                              <option value="">Select Location</option>
                              <option value="bangalore">Bangalore</option>
                              <option value="erode">Erode</option>
                              <option value="in_transit">In Transit</option>
                              <option value="garage">Garage</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark mb-2">
                          Notes
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="notes"
                          value={form.notes}
                          onChange={handleChange}
                          placeholder="Add any additional notes"
                          style={{
                            borderRadius: "15px",
                            border: "2px solid #e9ecef",
                            padding: "12px 16px",
                          }}
                        />
                      </Form.Group>

                      <Button
                        onClick={handleScheduleEvent}
                        disabled={saving}
                        className="w-100"
                        style={{
                          background:
                            "linear-gradient(to right, #00acc1 0%, #26c6da 100%)",
                          border: "none",
                          borderRadius: "15px",
                          padding: "12px 24px",
                          fontSize: "1.1rem",
                          fontWeight: "600",
                        }}
                      >
                        {saving ? (
                          <>
                            <FontAwesomeIcon
                              icon={faSpinner}
                              spin
                              className="me-2"
                            />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="me-2"
                            />
                            Schedule Event
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Upcoming Events Table */}
        <Row className="justify-content-center">
          <Col lg={isMobile ? 12 : 10} xl={isMobile ? 12 : 8}>
            <Card
              className="shadow-lg border-0"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
              }}
            >
              <Card.Header
                className="border-0 text-center"
                style={{
                  background:
                    "linear-gradient(to right, #00acc1 0%, #26c6da 100%)",
                  borderRadius: "20px 20px 0 0",
                  padding: "1.5rem",
                }}
              >
                <h4 className="mb-0 text-white fw-bold">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Upcoming Scheduled Events
                </h4>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: "#667eea" }} />
                    <p className="mt-3 text-muted">
                      Loading scheduled events...
                    </p>
                  </div>
                ) : scheduledEvents.length === 0 ? (
                  <div className="text-center py-5">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-muted mb-3"
                      style={{ fontSize: "3rem" }}
                    />
                    <p className="text-muted mb-0">
                      No upcoming scheduled events found.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                          borderBottom: "2px solid #e9ecef",
                        }}
                      >
                        <tr>
                          <th className="border-0 py-3 px-4 fw-bold text-dark">
                            Date
                          </th>
                          <th className="border-0 py-3 px-4 fw-bold text-dark">
                            Product #
                          </th>
                          <th className="border-0 py-3 px-4 fw-bold text-dark">
                            Product Name
                          </th>
                          <th className="border-0 py-3 px-4 fw-bold text-dark">
                            Type
                          </th>
                          <th className="border-0 py-3 px-4 fw-bold text-dark">
                            Location
                          </th>
                          <th className="border-0 py-3 px-4 fw-bold text-dark">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduledEvents.map((event, index) => (
                          <tr
                            key={event._id}
                            style={{
                              background:
                                index % 2 === 0
                                  ? "rgba(0, 172, 193, 0.05)"
                                  : "white",
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <td className="border-0 py-3 px-4">
                              <span
                                className="badge"
                                style={{
                                  background:
                                    "linear-gradient(to right, #00acc1 0%, #26c6da 100%)",
                                  color: "white",
                                  padding: "8px 12px",
                                  borderRadius: "10px",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {new Date(
                                  event.scheduledDate
                                ).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="border-0 py-3 px-4 fw-semibold">
                              {event.product}
                            </td>
                            <td className="border-0 py-3 px-4 text-muted">
                              {event.productName}
                            </td>
                            <td className="border-0 py-3 px-4">
                              <span
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "8px",
                                  fontSize: "0.8rem",
                                  color: "white",
                                  background:
                                    event.eventType === "Send"
                                      ? "linear-gradient(to right, #66bb6a 0%, #81c784 100%)"
                                      : event.eventType === "Receive"
                                      ? "linear-gradient(to right, #00acc1 0%, #26c6da 100%)"
                                      : event.eventType === "Maintenance"
                                      ? "linear-gradient(to right, #ffa726 0%, #ffb74d 100%)"
                                      : "linear-gradient(to right, #29b6f6 0%, #4fc3f7 100%)",
                                }}
                              >
                                {event.eventType}
                              </span>
                            </td>
                            <td className="border-0 py-3 px-4">
                              {LOCATIONS[event.location] || event.location}
                            </td>
                            <td className="border-0 py-3 px-4">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete event"
                                onClick={() => handleDeleteEventClick(event)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer />

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
          Are you sure you want to delete this scheduled event?
          <br />
          <small className="text-muted">Event: {eventToDelete?.title}</small>
          <br />
          <small className="text-danger">This action cannot be undone.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteEventConfirm}>
            Delete Event
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Schedule;
