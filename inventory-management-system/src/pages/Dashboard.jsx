import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Container,
  Spinner,
  Alert,
  Button,
  Modal,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import CopyButton from "../components/CopyButton";
import {
  faBoxes,
  faExclamationTriangle,
  // faMapMarkerAlt,
  faTruck,
  // faBoxOpen,
  faChartLine,
  faArrowUp,
  faArrowDown,
  faClock,
  faWarehouse,
  faShippingFast,
  faCheckCircle,
  faTimesCircle,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { showToast } from "../utils/toast";
import { productsAPI } from "../services/api";

const LOCATIONS = {
  BANGALORE: "bangalore",
  ERODE: "erode",
};

const LOCATION_LABELS = {
  [LOCATIONS.BANGALORE]: "Bangalore",
  [LOCATIONS.ERODE]: "Erode",
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    recentChanges: [],
    locationStats: {
      [LOCATIONS.BANGALORE]: 0,
      [LOCATIONS.ERODE]: 0,
    },
    movementStats: {
      sent: 0,
      received: 0,
      inTransit: 0,
    },
  });
  const [locationItems, setLocationItems] = useState({
    [LOCATIONS.BANGALORE]: [],
    [LOCATIONS.ERODE]: [],
  });
  const [productMovements, setProductMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState(null);
  const intervalRef = useRef();

  // Get authentication context
  const { isAdmin } = useContext(AuthContext);

  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Get products with their history
      const productsRes = await fetch("/api/products?includeHistory=true");
      if (!productsRes.ok) throw new Error("Failed to fetch products");
      const products = await productsRes.json();

      // Get recent events
      const eventsRes = await fetch("/api/qr-events");
      if (!eventsRes.ok) throw new Error("Failed to fetch events");
      const events = await eventsRes.json();

      // Calculate movement statistics
      const movementStats = {
        sent: events.filter((e) => e.eventType === "send").length,
        received: events.filter((e) => e.eventType === "receive").length,
        inTransit: events.filter((e) => e.eventType === "send" && !e.received)
          .length,
      };

      // Calculate location stats
      const locationStats = Object.values(LOCATIONS).reduce((acc, location) => {
        acc[location] = products.filter(
          (p) => p.location.toLowerCase() === location.toLowerCase()
        ).length;
        return acc;
      }, {});

      // Group products by location
      const locationItems = Object.values(LOCATIONS).reduce((acc, location) => {
        acc[location] = products
          .filter((p) => p.location.toLowerCase() === location.toLowerCase())
          .map((product) => ({
            ...product,
            lastMovement: product.history?.[product.history.length - 1] || null,
          }));
        return acc;
      }, {});

      // Update all stats
      setStats({
        totalProducts: products.length,
        lowStockProducts: products.filter((p) => p.quantity < 5).length,
        recentChanges: events.slice(0, 5),
        locationStats,
        movementStats,
      });

      setLocationItems(locationItems);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductMovements = async () => {
    try {
      const response = await axios.get("/api/products/movements");
      setProductMovements(response.data);
    } catch (error) {
      console.error("Error fetching product movements:", error);
    }
  };

  const handleDeleteMovementClick = (movement) => {
    // Check if user is admin before showing delete modal
    if (!isAdmin) {
      showToast("Only administrators can delete movement records", "error");
      return;
    }
    setMovementToDelete(movement);
    setShowDeleteModal(true);
  };

  const handleDeleteMovementConfirm = async () => {
    if (!movementToDelete) return;

    try {
      await productsAPI.deleteMovement(movementToDelete._id);
      showToast("Record deleted successfully", "success");
      fetchProductMovements(); // Refresh the movements list
    } catch (error) {
      console.error("Error deleting record:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast(
          "You don't have permission to delete records. Admin access required.",
          "error"
        );
      } else {
        showToast("Failed to delete record. Please try again.", "error");
      }
    } finally {
      setShowDeleteModal(false);
      setMovementToDelete(null);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardData(), fetchProductMovements()]);
  };

  useEffect(() => {
    refreshData();
    intervalRef.current = setInterval(() => {
      fetchDashboardData();
      fetchProductMovements();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalRef.current);
  }, []);

  // Enhanced stat card component
  const StatCard = ({
    title,
    value,
    icon,
    color,
    trend,
    subtitle,
    loading,
  }) => (
    <Card className="stat-card h-100 border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <h6 className="text-muted mb-0 fw-medium">{title}</h6>
              {trend && (
                <Badge
                  bg={
                    trend > 0 ? "success" : trend < 0 ? "danger" : "secondary"
                  }
                  className="ms-2 px-2 py-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  <FontAwesomeIcon
                    icon={
                      trend > 0 ? faArrowUp : trend < 0 ? faArrowDown : faClock
                    }
                    className="me-1"
                  />
                  {Math.abs(trend)}%
                </Badge>
              )}
            </div>
            {loading ? (
              <Spinner animation="border" size="sm" className="text-primary" />
            ) : (
              <h2
                className="mb-1 fw-bold"
                style={{ color: `var(--${color}-600)` }}
              >
                {value.toLocaleString()}
              </h2>
            )}
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div
            className="rounded-3 p-3 d-flex align-items-center justify-content-center"
            style={{
              background: `linear-gradient(135deg, var(--${color}-100) 0%, var(--${color}-200) 100%)`,
              width: "60px",
              height: "60px",
            }}
          >
            <FontAwesomeIcon
              icon={icon}
              style={{
                color: `var(--${color}-600)`,
                fontSize: "1.5rem",
              }}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading && stats.totalProducts === 0) {
    return (
      <Container fluid className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h5 className="text-muted">Loading dashboard data...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="dashboard-container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1
            className="display-5 fw-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            <FontAwesomeIcon
              icon={faChartLine}
              className="me-3"
              style={{ color: "var(--primary-600)" }}
            />
            Inventory Dashboard
          </h1>
          <p className="text-muted mb-0">Real-time overview</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-md-block">
            <small className="text-muted d-block">Last updated</small>
            <small className="fw-medium">
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </small>
          </div>
          <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            onClick={refreshData}
            disabled={loading}
          >
            <FontAwesomeIcon
              icon={faSync}
              className={loading ? "fa-spin" : ""}
            />
            <span className="d-none d-sm-inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4 border-0 shadow-sm">
          <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
          {error}
        </Alert>
      )}

      {/* Enhanced Stats Cards Row */}
      <Row className="mb-5 g-4">
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={faBoxes}
            color="primary"
            trend={5}
            subtitle="Active inventory items"
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Low Stock Alert"
            value={stats.lowStockProducts}
            icon={faExclamationTriangle}
            color="warning"
            trend={-2}
            subtitle="Items below threshold"
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="In Transit"
            value={stats.movementStats.inTransit}
            icon={faShippingFast}
            color="info"
            subtitle="Items being moved"
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            title="Completed Moves"
            value={stats.movementStats.received}
            icon={faCheckCircle}
            color="success"
            trend={8}
            subtitle="This month"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Quick Actions & Location Overview */}
      <Row className="mb-5 g-4">
        {/* Location Stats */}
        {Object.entries(LOCATIONS).map(([key, location]) => (
          <Col xs={12} md={6} key={key}>
            <Card
              className="location-card h-100 border-0 shadow-sm"
              data-type={location}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5
                      className="fw-bold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FontAwesomeIcon
                        icon={faWarehouse}
                        className="me-2"
                        style={{ color: "var(--secondary-600)" }}
                      />
                      {LOCATION_LABELS[location]}
                    </h5>
                    <p className="text-muted mb-0">Warehouse Location</p>
                  </div>
                  <Badge
                    bg="secondary"
                    className="px-3 py-2"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {stats.locationStats[location]} items
                  </Badge>
                </div>

                <div className="progress mb-3" style={{ height: "8px" }}>
                  <div
                    className="progress-bar bg-gradient"
                    style={{
                      width: `${
                        (stats.locationStats[location] / stats.totalProducts) *
                        100
                      }%`,
                      background:
                        "linear-gradient(90deg, var(--secondary-500) 0%, var(--secondary-600) 100%)",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between text-sm">
                  <span className="text-muted">
                    {(
                      (stats.locationStats[location] / stats.totalProducts) *
                      100
                    ).toFixed(1)}
                    % of total
                  </span>
                  <span
                    className="fw-medium"
                    style={{ color: "var(--secondary-600)" }}
                  >
                    {stats.locationStats[location]} / {stats.totalProducts}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Enhanced Movement Tracking Section */}
      <Row className="mb-5">
        <Col xs={12}>
          <Card className="border-0 shadow-sm" data-type="movement">
            <Card.Header className="bg-white border-0 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "var(--dark)" }}>
                    <FontAwesomeIcon
                      icon={faTruck}
                      className="me-3"
                      style={{ color: "var(--info-600)" }}
                    />
                    Movement Tracking
                  </h4>
                  <p className="text-muted mb-0">
                    Real-time product movement history
                  </p>
                </div>
                <Badge
                  bg="info"
                  className="px-3 py-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  {productMovements.length} movements
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {productMovements.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon
                    icon={faTruck}
                    className="text-muted mb-3"
                    style={{ fontSize: "3rem", opacity: 0.3 }}
                  />
                  <h6 className="text-muted">No recent product movements</h6>
                  <p className="text-muted mb-0">
                    Movement data will appear here when products are transferred
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 modern-table">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 py-3 fw-semibold">Product</th>
                        <th className="border-0 py-3 fw-semibold d-none d-md-table-cell">
                          Product Number
                        </th>
                        <th className="border-0 py-3 fw-semibold">Route</th>
                        <th className="border-0 py-3 fw-semibold">Status</th>
                        <th className="border-0 py-3 fw-semibold d-none d-lg-table-cell">
                          Notes
                        </th>
                        <th className="border-0 py-3 fw-semibold d-none d-xl-table-cell">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productMovements.slice(0, 10).map((move, idx) => (
                        <tr key={move._id || idx} className="border-bottom">
                          <td className="py-3">
                            <div
                              className="fw-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {move.productName}
                            </div>
                          </td>
                          <td className="py-3 d-none d-md-table-cell">
                            <div className="d-flex align-items-center">
                              <code
                                className="px-2 py-1 rounded"
                                style={{
                                  background: "var(--bg-tertiary)",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {move.productNumber}
                              </code>
                              <CopyButton text={move.productNumber} />
                              <Button
                                variant="link"
                                className="text-danger p-0 ms-2"
                                title="Delete record"
                                onClick={() => handleDeleteMovementClick(move)}
                              >
                                <FontAwesomeIcon icon={faTrash} size="sm" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <span
                                className="badge me-2"
                                style={{
                                  background: "var(--bg-tertiary)",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {move.from}
                              </span>
                              <FontAwesomeIcon
                                icon={faArrowRight}
                                className="text-muted mx-2"
                                style={{ fontSize: "0.8rem" }}
                              />
                              <span
                                className="badge"
                                style={{
                                  background: "var(--bg-tertiary)",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {move.to}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge
                              bg={
                                move.action === "send"
                                  ? "warning"
                                  : move.action === "receive"
                                  ? "success"
                                  : "info"
                              }
                              className="px-3 py-2"
                            >
                              {move.action}
                            </Badge>
                          </td>
                          <td className="py-3 d-none d-lg-table-cell">
                            <span className="text-dark">
                              {move.notes || "No notes"}
                            </span>
                          </td>
                          <td className="py-3 d-none d-xl-table-cell">
                            <div className="text-dark">
                              {move.timestamp ? (
                                <>
                                  <div>
                                    {new Date(
                                      move.timestamp
                                    ).toLocaleDateString()}
                                  </div>
                                  <small>
                                    {new Date(
                                      move.timestamp
                                    ).toLocaleTimeString()}
                                  </small>
                                </>
                              ) : (
                                "No timestamp"
                              )}
                            </div>
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

      {/* Recently Received Products Section */}
      <Row className="mb-5">
        <Col xs={12}>
          <Card className="border-0 shadow-sm" data-type="received">
            <Card.Header className="bg-white border-0 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4
                    className="fw-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="me-3"
                      style={{ color: "var(--success-600)" }}
                    />
                    Recently Received
                  </h4>
                  <p className="text-muted mb-0">
                    Latest incoming inventory items
                  </p>
                </div>
                <Badge
                  bg="success"
                  className="px-3 py-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  {
                    productMovements.filter((m) => m.action === "receive")
                      .length
                  }{" "}
                  received
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {productMovements.filter((m) => m.action === "receive").length ===
              0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-muted mb-3"
                    style={{ fontSize: "3rem", opacity: 0.3 }}
                  />
                  <h6 className="text-muted">No recently received products</h6>
                  <p className="text-muted mb-0">
                    Received items will appear here
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 modern-table">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 py-3 fw-semibold">Product</th>
                        <th className="border-0 py-3 fw-semibold d-none d-md-table-cell">
                          Product Number
                        </th>
                        <th className="border-0 py-3 fw-semibold">Source</th>
                        <th className="border-0 py-3 fw-semibold">
                          Destination
                        </th>
                        <th className="border-0 py-3 fw-semibold d-none d-lg-table-cell">
                          Notes
                        </th>
                        <th className="border-0 py-3 fw-semibold d-none d-xl-table-cell">
                          Received At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productMovements
                        .filter((m) => m.action === "receive")
                        .slice(0, 5)
                        .map((move, idx) => (
                          <tr key={move._id || idx} className="border-bottom">
                            <td className="py-3">
                              <div
                                className="fw-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {move.productName}
                              </div>
                            </td>
                            <td className="py-3 d-none d-md-table-cell">
                              <div className="d-flex align-items-center">
                                <code
                                  className="px-2 py-1 rounded"
                                  style={{
                                    background: "var(--bg-tertiary)",
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  {move.productNumber}
                                </code>
                                <CopyButton text={move.productNumber} />
                                <Button
                                  variant="link"
                                  className="text-danger p-0 ms-2"
                                  title="Delete record"
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this record?"
                                      )
                                    ) {
                                      try {
                                        await axios.delete(
                                          `/api/products/movements/${move._id}`
                                        );
                                        showToast(
                                          "Record deleted successfully",
                                          "success"
                                        );
                                        fetchProductMovements(); // Refresh the movements list
                                      } catch (error) {
                                        console.error(
                                          "Error deleting record:",
                                          error
                                        );
                                        if (error.response?.status === 401) {
                                          showToast(
                                            "You don't have permission to delete records. Admin access required.",
                                            "error"
                                          );
                                        } else {
                                          showToast(
                                            "Failed to delete record",
                                            "error"
                                          );
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <FontAwesomeIcon icon={faTrash} size="sm" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-3">
                              <span
                                className="badge"
                                style={{
                                  background: "var(--bg-tertiary)",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {move.from}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="badge bg-success-subtle text-success">
                                {move.to}
                              </span>
                            </td>
                            <td className="py-3 d-none d-lg-table-cell">
                              <span className="text-muted">
                                {move.notes || "No notes"}
                              </span>
                            </td>
                            <td className="py-3 d-none d-xl-table-cell">
                              <div className="text-muted">
                                {move.timestamp ? (
                                  <>
                                    <div>
                                      {new Date(
                                        move.timestamp
                                      ).toLocaleDateString()}
                                    </div>
                                    <small>
                                      {new Date(
                                        move.timestamp
                                      ).toLocaleTimeString()}
                                    </small>
                                  </>
                                ) : (
                                  "No timestamp"
                                )}
                              </div>
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

      {/* Enhanced Location Inventory Details */}
      {Object.entries(LOCATIONS).map(([key, location]) => (
        <Row className="mb-5" key={key}>
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4
                      className="fw-bold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FontAwesomeIcon
                        icon={faWarehouse}
                        className="me-3"
                        style={{ color: "var(--secondary-600)" }}
                      />
                      {LOCATION_LABELS[location]} Inventory
                    </h4>
                    <p className="text-muted mb-0">
                      Detailed inventory breakdown for this location
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <Badge
                      bg="secondary"
                      className="px-3 py-2"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {locationItems[location]?.length || 0} items
                    </Badge>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {!locationItems[location] ||
                locationItems[location].length === 0 ? (
                  <div className="text-center py-5">
                    <FontAwesomeIcon
                      icon={faWarehouse}
                      className="text-muted mb-3"
                      style={{ fontSize: "3rem", opacity: 0.3 }}
                    />
                    <h6 className="text-muted">No products in this location</h6>
                    <p className="text-muted mb-0">
                      Products will appear here when added to{" "}
                      {LOCATION_LABELS[location]}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0 modern-table">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 py-3 fw-semibold">Product</th>
                          <th className="border-0 py-3 fw-semibold d-none d-md-table-cell">
                            Product Number
                          </th>
                          <th className="border-0 py-3 fw-semibold">
                            Stock Level
                          </th>
                          <th className="border-0 py-3 fw-semibold d-none d-lg-table-cell">
                            Last Movement
                          </th>
                          <th className="border-0 py-3 fw-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {locationItems[location].map((product) => (
                          <tr key={product._id} className="border-bottom">
                            <td className="py-3">
                              <div
                                className="fw-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {product.name}
                              </div>
                            </td>
                            <td className="py-3 d-none d-md-table-cell">
                              <div className="d-flex align-items-center">
                                <code
                                  className="px-2 py-1 rounded"
                                  style={{
                                    background: "var(--bg-tertiary)",
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  {product.productNumber}
                                </code>
                                <CopyButton text={product.productNumber} />
                                <Button
                                  variant="link"
                                  className="text-danger p-0 ms-2"
                                  title="Delete product"
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this product?"
                                      )
                                    ) {
                                      try {
                                        await axios.delete(
                                          `/api/products/${product._id}`
                                        );
                                        showToast(
                                          "Product deleted successfully",
                                          "success"
                                        );
                                        refreshData(); // Refresh all dashboard data
                                      } catch (error) {
                                        console.error(
                                          "Error deleting product:",
                                          error
                                        );
                                        if (error.response?.status === 401) {
                                          showToast(
                                            "You don't have permission to delete products. Admin access required.",
                                            "error"
                                          );
                                        } else {
                                          showToast(
                                            "Failed to delete product",
                                            "error"
                                          );
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <FontAwesomeIcon icon={faTrash} size="sm" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <Badge
                                  bg={
                                    product.quantity < 5
                                      ? "warning"
                                      : product.quantity < 10
                                      ? "info"
                                      : "success"
                                  }
                                  className="px-3 py-2 me-2"
                                >
                                  {product.quantity}
                                </Badge>
                                {product.quantity < 5 && (
                                  <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    className="text-warning"
                                    title="Low stock alert"
                                  />
                                )}
                              </div>
                            </td>
                            <td className="py-3 d-none d-lg-table-cell">
                              {product.lastMovement ? (
                                <div>
                                  <div className="fw-medium text-sm">
                                    {product.lastMovement.type} to{" "}
                                    {product.lastMovement.to}
                                  </div>
                                  <small className="text-muted">
                                    {new Date(
                                      product.lastMovement.timestamp
                                    ).toLocaleDateString()}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">
                                  No movement history
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              <Badge
                                bg={
                                  product.status === "Available"
                                    ? "success"
                                    : product.status === "Sent"
                                    ? "warning"
                                    : product.status === "In Transit"
                                    ? "info"
                                    : "secondary"
                                }
                                className="px-3 py-2"
                              >
                                {product.status}
                              </Badge>
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
      ))}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this movement record?
          <br />
          <small className="text-muted">
            Product: {movementToDelete?.productName} (
            {movementToDelete?.productNumber})
          </small>
          <br />
          <small className="text-danger">This action cannot be undone.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteMovementConfirm}>
            Delete Record
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
