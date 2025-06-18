import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, Table, Button, Form, Modal, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { categoriesAPI } from "../services/api";
import { showToast } from "../components/common/ToastContainer";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Get authentication context
  const { isAdmin } = useContext(AuthContext);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
      showToast("Failed to load categories", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (category = null) => {
    if (category) {
      setCurrentCategory(category);
      setFormData({ name: category.name, description: category.description });
    } else {
      setCurrentCategory(null);
      setFormData({ name: "", description: "" });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        if (currentCategory) {
          await categoriesAPI.update(currentCategory._id, formData);
          showToast("Category updated successfully", "success");
        } else {
          await categoriesAPI.create(formData);
          showToast("Category created successfully", "success");
        }
        handleCloseModal();
        await loadCategories();
      } catch (error) {
        console.error("Failed to save category:", error);
        showToast("Failed to save category", "danger");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteClick = (category) => {
    // Check if user is admin before showing delete modal
    if (!isAdmin) {
      showToast("Only administrators can delete categories", "error");
      return;
    }
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setLoading(true);
      await categoriesAPI.delete(categoryToDelete._id);
      showToast("Category deleted successfully", "success");
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      if (error.response?.status === 401) {
        showToast(
          "You don't have permission to delete categories. Admin access required.",
          "error"
        );
      } else {
        showToast("Failed to delete category", "danger");
      }
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div
      className="category-list"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "2rem",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-4 fw-bold text-gradient">
          <span
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Categories
          </span>
        </h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Category
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-3">Loading categories...</div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category._id}>
                      <td>{category.name}</td>
                      <td>{category.description}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleShowModal(category)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(category)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-3">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentCategory ? "Edit Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                placeholder="Enter category name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Category"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

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
          Are you sure you want to delete the category "{categoryToDelete?.name}
          "?
          <br />
          <small className="text-danger">This action cannot be undone.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Category
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategoryList;
