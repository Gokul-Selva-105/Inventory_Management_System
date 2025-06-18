import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { stockHistoryAPI } from "../../services/api";
import { showToast } from "../common/ToastContainer";

const StockUpdateModal = ({ show, onHide, product, onStockUpdate }) => {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (quantity === 0) {
      newErrors.quantity = "Quantity change cannot be zero";
    }
    if (!reason.trim()) {
      newErrors.reason = "Reason is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await stockHistoryAPI.create({
          productId: product._id, // Change from product.id to product._id
          changeAmount: parseInt(quantity),
          reason: reason
        });
        showToast(`Stock updated successfully for ${product.name}`, "success");
        onStockUpdate();
        handleClose();
      } catch (error) {
        console.error("Failed to update stock:", error);
        showToast(error.response?.data?.message || "Failed to update stock", "danger");
      }
    }
  };

  const handleClose = () => {
    setQuantity(0);
    setReason("");
    setErrors({});
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Stock: {product?.name}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Current Stock</Form.Label>
            <Form.Control type="text" value={product?.quantity || 0} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Change Amount</Form.Label>
            <Form.Control
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              isInvalid={!!errors.quantity}
              placeholder="Enter positive value to add, negative to remove"
            />
            <Form.Control.Feedback type="invalid">
              {errors.quantity}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Enter a positive number to add stock or a negative number to
              remove stock.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              isInvalid={!!errors.reason}
              placeholder="Enter reason for stock change"
            />
            <Form.Control.Feedback type="invalid">
              {errors.reason}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-flex justify-content-between">
            <div>
              <strong>New Stock:</strong>{" "}
              {(product?.quantity || 0) + parseInt(quantity || 0)}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Update Stock
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StockUpdateModal;
