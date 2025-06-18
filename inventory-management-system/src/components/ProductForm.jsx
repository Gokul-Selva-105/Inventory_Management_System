import React, { useState, useRef } from "react";
import { Form, FloatingLabel, Spinner, Alert } from "react-bootstrap";
import { uploadImage } from "../services/imageService";

const ProductForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    category: "",
    description: "",
    image: "",
    state: "Available",
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const imageUrl = await uploadImage(file);
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        setErrors((prev) => ({ ...prev, image: "" }));
      } catch (error) {
        setErrors((prev) => ({ ...prev, image: error.message }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (!formData.category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div
      className="modern-ui"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
        borderRadius: "15px",
      }}
    >
      <Form onSubmit={handleSubmit}>
        <FloatingLabel controlId="name" label="Product Name" className="mb-3">
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </FloatingLabel>

        <FloatingLabel controlId="quantity" label="Quantity" className="mb-3">
          <Form.Control
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            isInvalid={!!errors.quantity}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.quantity}
          </Form.Control.Feedback>
        </FloatingLabel>

        <FloatingLabel controlId="category" label="Category" className="mb-3">
          <Form.Control
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            isInvalid={!!errors.category}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.category}
          </Form.Control.Feedback>
        </FloatingLabel>

        <FloatingLabel controlId="state" label="State" className="mb-3">
          <Form.Select
            name="state"
            value={formData.state}
            onChange={handleChange}
          >
            <option value="Available">Available</option>
            <option value="In Transit">In Transit</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Sold">Sold</option>
            <option value="Damaged">Damaged</option>
          </Form.Select>
        </FloatingLabel>

        <FloatingLabel
          controlId="description"
          label="Description"
          className="mb-3"
        >
          <Form.Control
            as="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ height: "100px" }}
          />
        </FloatingLabel>

        <div className="mb-3">
          <FloatingLabel controlId="image" label="Product Image">
            <Form.Control
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              disabled={isUploading}
              style={{ paddingTop: "2rem" }}
            />
            {isUploading && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" variant="primary" />
              </div>
            )}
          </FloatingLabel>
          {formData.image && (
            <div className="mt-2 text-center">
              <img
                src={formData.image}
                alt="Preview"
                className="img-thumbnail"
                style={{ maxHeight: "200px" }}
              />
            </div>
          )}
          {errors.image && (
            <Alert variant="danger" className="mt-2">
              {errors.image}
            </Alert>
          )}
        </div>

        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Save Product
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ProductForm;
