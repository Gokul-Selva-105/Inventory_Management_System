import React, { useState } from "react";
import { Button, Badge, Container, Row } from "react-bootstrap";
import CustomModal from "../components/CustomModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faTags } from "@fortawesome/free-solid-svg-icons";

const Categories = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([
    { id: 1, name: "Electronics", color: "primary" },
    { id: 2, name: "Clothing", color: "success" },
    { id: 3, name: "Furniture", color: "warning" },
  ]);

  const handleAddCategory = () => {
    setShowModal(true);
  };

  return (
    <Container
      fluid
      className="modern-ui"
      style={{
        padding: "2rem",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-4 fw-bold text-gradient">
          <FontAwesomeIcon icon={faTags} className="me-3" />
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
        <Button
          variant="primary"
          onClick={handleAddCategory}
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)",
            border: "none",
            boxShadow: "0 4px 6px rgba(79, 70, 229, 0.3)",
          }}
        >
          <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
          Add Category
        </Button>
      </div>
      <Row className="row-cols-1 row-cols-md-3 g-4">
        {categories.map((category) => (
          <div key={category.id} className="col">
            <div
              className="card shadow-sm"
              style={{
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow =
                  "0 10px 20px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 .125rem .25rem rgba(0,0,0,.075)";
              }}
            >
              <div className="card-body">
                <h5 className="card-title">{category.name}</h5>
                <Badge bg={category.color} className="me-1">
                  {category.name}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </Row>
      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Add New Category"
        saveButton={false}
      >
        {/* Add category form will be implemented here */}
      </CustomModal>
    </Container>
  );
};

export default Categories;
