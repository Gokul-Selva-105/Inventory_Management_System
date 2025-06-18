import React, { useState, useEffect } from "react";
import {
  Toast,
  ToastContainer as BootstrapToastContainer,
} from "react-bootstrap";

// Create a custom event for showing toasts
export const showToast = (message, type = "success") => {
  const event = new CustomEvent("show-toast", { detail: { message, type } });
  window.dispatchEvent(event);
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const { message, type } = event.detail;
      const id = Date.now();
      setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        );
      }, 5000);
    };

    window.addEventListener("show-toast", handleShowToast);
    return () => window.removeEventListener("show-toast", handleShowToast);
  }, []);

  const handleClose = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <BootstrapToastContainer
      position="top-end"
      className="p-3"
      style={{ zIndex: 1060 }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          onClose={() => handleClose(toast.id)}
          bg={toast.type}
          className="mb-2"
          delay={5000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">
              {toast.type === "success" ? "Success" : "Error"}
            </strong>
          </Toast.Header>
          <Toast.Body className={toast.type === "success" ? "" : "text-white"}>
            {toast.message}
          </Toast.Body>
        </Toast>
      ))}
    </BootstrapToastContainer>
  );
};

export default ToastContainer;
