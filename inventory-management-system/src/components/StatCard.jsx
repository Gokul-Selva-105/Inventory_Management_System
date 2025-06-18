import React from "react";

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`card shadow-sm bg-${color} bg-gradient text-white mb-3`}>
      <div
        className="card-body d-flex align-items-center"
        style={{
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <div className="me-3">{icon}</div>
        <div>
          <h5 className="card-title mb-1">{title}</h5>
          <h2 className="card-text mb-0">{value}</h2>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
