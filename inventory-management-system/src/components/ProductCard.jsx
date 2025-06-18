import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div
      className="card shadow-lg mb-4"
      style={{
        border: "none",
        borderRadius: "15px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        height: "100%", // Make all cards the same height
        transition: "transform 0.3s ease", // Add smooth hover effect
      }}
    >
      <div className="position-relative" style={{ overflow: "hidden" }}>
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
            height: "180px", // Slightly reduced height for mobile
            objectFit: "cover",
            width: "100%",
          }}
          onError={(e) => {
            // Fallback image if the product image fails to load
            e.target.src = "https://via.placeholder.com/150?text=No+Image";
          }}
        />
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold text-truncate">{product.name}</h5>
        <p 
          className="card-text text-muted mb-3"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: "0.9rem",
          }}
        >
          {product.description}
        </p>
        <div className="mt-auto">
          <span
            className={`badge ${product.quantity > 0 ? "bg-success" : "bg-danger"}`}
            style={{ fontSize: "0.8rem", padding: "0.4em 0.6em" }}
          >
            {product.quantity > 0 ? `In Stock: ${product.quantity}` : "Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
