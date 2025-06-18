import React, { useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignInAlt,
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { showToast } from "../components/common/ToastContainer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        showToast("Login successful!", "success");
        navigate("/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="py-5 d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        marginTop: 0,
        background: "var(--gradient-primary)",
      }}
    >
      <Row className="justify-content-center w-100">
        <Col xs={11} sm={10} md={8} lg={6} xl={5} xxl={4}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card
              className="border-0 shadow-lg"
              style={{ borderRadius: "var(--border-radius-xl)" }}
            >
              <Card.Body className="p-4 p-sm-5">
                {/* Header Section */}
                <div className="text-center mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="mb-4"
                  >
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{
                        width: "80px",
                        height: "80px",
                        background: "var(--gradient-primary)",
                        boxShadow: "var(--shadow-lg)",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faSignInAlt}
                        className="text-white"
                        style={{ fontSize: "2rem" }}
                      />
                    </div>
                  </motion.div>
                  <h2
                    className="fw-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Welcome Back
                  </h2>
                  <p className="text-muted mb-0">
                    Sign in to your account to continue
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4"
                  >
                    <Alert
                      variant="danger"
                      className="border-0 rounded-3"
                      style={{
                        backgroundColor: "var(--error-50)",
                        color: "var(--error-700)",
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Form.Group className="mb-4">
                      <Form.Label
                        className="fw-semibold mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="me-2 text-muted"
                        />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="form-control-modern"
                        style={{
                          padding: "12px 16px",
                          border: "2px solid var(--border-color)",
                          borderRadius: "var(--border-radius-lg)",
                          fontSize: "1rem",
                          transition: "all 0.3s ease",
                        }}
                      />
                    </Form.Group>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Form.Group className="mb-4">
                      <Form.Label
                        className="fw-semibold mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <FontAwesomeIcon
                          icon={faLock}
                          className="me-2 text-muted"
                        />
                        Password
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="form-control-modern pe-5"
                          style={{
                            padding: "12px 16px",
                            border: "2px solid var(--border-color)",
                            borderRadius: "var(--border-radius-lg)",
                            fontSize: "1rem",
                            transition: "all 0.3s ease",
                          }}
                        />
                        <Button
                          variant="link"
                          className="position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                          style={{ zIndex: 10, padding: "0 12px" }}
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                          />
                        </Button>
                      </div>
                    </Form.Group>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="d-grid mb-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="btn-modern"
                        style={{
                          background: "var(--gradient-primary)",
                          border: "none",
                          padding: "14px 24px",
                          borderRadius: "var(--border-radius-lg)",
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "white",
                          boxShadow: "var(--shadow-md)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              className="me-2"
                            />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faSignInAlt}
                              className="me-2"
                            />
                            Sign In
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </Form>

                {/* Footer Links */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="border-top pt-4 mt-4">
                    <p
                      className="mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="text-decoration-none fw-semibold"
                        style={{ color: "var(--primary-600)" }}
                      >
                        Create Account
                      </Link>
                    </p>
                    <p className="mb-0">
                      <Link
                        to="/admin-register"
                        className="text-decoration-none d-inline-flex align-items-center"
                        style={{
                          color: "var(--secondary-600)",
                          fontSize: "0.9rem",
                        }}
                      >
                        <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                        Admin Registration
                      </Link>
                    </p>
                  </div>
                </motion.div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
    // </div>
  );
};

export default Login;
