import React from "react";
import { Modal, Button } from "react-bootstrap";

const CustomModal = ({
  show,
  onHide,
  title,
  children,
  saveButton = true,
  onSave,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {saveButton && (
          <Button variant="primary" onClick={onSave || onHide}>
            Save Changes
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
