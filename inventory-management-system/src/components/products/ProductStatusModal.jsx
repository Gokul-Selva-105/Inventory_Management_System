import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Badge, Table } from "react-bootstrap";
import { productsAPI } from "../../services/api";
import { showToast } from "../common/ToastContainer";

const ProductStatusModal = ({ show, onHide, product, onStatusUpdate }) => {
  const [status, setStatus] = useState(product?.status || "Available");
  const [notes, setNotes] = useState("");
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && product?._id) {
      loadStatusHistory();
    }
  }, [show, product?._id]);

  const loadStatusHistory = async () => {
    try {
      const response = await productsAPI.getStatusHistory(product._id);
      setStatusHistory(response.data);
    } catch (error) {
      console.error("Failed to load status history:", error);
      showToast("Failed to load status history", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productsAPI.updateStatus(product._id, {
        status,
        notes: notes.trim(),
      });
      showToast(`Status updated to ${status}`, "success");
      onStatusUpdate();
      handleClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      showToast(
        error.response?.data?.message || "Failed to update status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus(product?.status || "Available");
    setNotes("");
    onHide();
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      Available: "success",
      Sent: "primary",
      "In Use": "warning",
      Received: "info",
      Damaged: "danger",
    };
    return variants[status] || "secondary";
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Update Status: {product?.name}
          <Badge bg={getStatusBadgeVariant(product?.status)} className="ms-2">
            {product?.status}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>New Status</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="Available">Available</option>
              <option value="Sent">Sent</option>
              <option value="In Use">In Use</option>
              <option value="Received">Received</option>
              <option value="Damaged">Damaged</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
            />
          </Form.Group>

          <h6 className="mt-4 mb-3">Status History</h6>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {statusHistory.map((history, index) => (
                <tr key={index}>
                  <td>{new Date(history.timestamp).toLocaleString()}</td>
                  <td>
                    <Badge bg={getStatusBadgeVariant(history.status)}>
                      {history.status}
                    </Badge>
                  </td>
                  <td>{history.notes}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || status === product?.status}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductStatusModal;
