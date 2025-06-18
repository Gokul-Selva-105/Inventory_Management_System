import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-4">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            <FontAwesomeIcon icon={faHome} className="me-2" />
            Go to Dashboard
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
