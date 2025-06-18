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
  ProgressBar,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faCheck,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { showToast } from "../components/common/ToastContainer";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Calculate password strength
    if (name === "password") {
      let strength = 0;
      if (value.length >= 6) strength += 25;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({ name, email, password });

      if (result.success) {
        showToast("Registration successful!", "success");
        navigate("/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "danger";
    if (passwordStrength < 50) return "warning";
    if (passwordStrength < 75) return "info";
    return "success";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak";
    if (passwordStrength < 50) return "Fair";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

  return (
    <Container fluid className="py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', marginTop: 0, background: "var(--gradient-secondary)" }}>
      <Row className="justify-content-center w-100">
        <Col xs={11} sm={10} md={9} lg={7} xl={6}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card
                className="border-0 shadow-lg"
                style={{ borderRadius: "var(--border-radius-xl)" }}
              >
                <Card.Body className="p-5">
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
                          background: "var(--gradient-secondary)",
                          boxShadow: "var(--shadow-lg)",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUserPlus}
                          className="text-white"
                          style={{ fontSize: "2rem" }}
                        />
                      </div>
                    </motion.div>
                    <h2
                      className="fw-bold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Create Account
                    </h2>
                    <p className="text-muted mb-0">
                      Join us and start managing your inventory
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

                  {/* Registration Form */}
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
                            icon={faUser}
                            className="me-2 text-muted"
                          />
                          Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
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
                            icon={faEnvelope}
                            className="me-2 text-muted"
                          />
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={email}
                          onChange={handleChange}
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
                      transition={{ delay: 0.5 }}
                    >
                      <Form.Group className="mb-3">
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
                            name="password"
                            value={password}
                            onChange={handleChange}
                            placeholder="Enter password (min 6 characters)"
                            required
                            minLength="6"
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
                        {password && (
                          <div className="mt-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">
                                Password Strength:
                              </small>
                              <small
                                className={`text-${getPasswordStrengthColor()}`}
                              >
                                {getPasswordStrengthText()}
                              </small>
                            </div>
                            <ProgressBar
                              variant={getPasswordStrengthColor()}
                              now={passwordStrength}
                              style={{ height: "4px" }}
                            />
                          </div>
                        )}
                      </Form.Group>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Form.Group className="mb-4">
                        <Form.Label
                          className="fw-semibold mb-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="me-2 text-muted"
                          />
                          Confirm Password
                        </Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                            className="form-control-modern pe-5"
                            style={{
                              padding: "12px 16px",
                              border: `2px solid ${
                                confirmPassword && password !== confirmPassword
                                  ? "var(--error-500)"
                                  : "var(--border-color)"
                              }`,
                              borderRadius: "var(--border-radius-lg)",
                              fontSize: "1rem",
                              transition: "all 0.3s ease",
                            }}
                          />
                          <Button
                            variant="link"
                            className="position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                            style={{ zIndex: 10, padding: "0 12px" }}
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            type="button"
                          >
                            <FontAwesomeIcon
                              icon={showConfirmPassword ? faEyeSlash : faEye}
                            />
                          </Button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <small className="text-danger mt-1 d-block">
                            Passwords do not match
                          </small>
                        )}
                      </Form.Group>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="d-grid mb-4">
                        <Button
                          type="submit"
                          disabled={isLoading || password !== confirmPassword}
                          className="btn-modern"
                          style={{
                            background: "var(--gradient-secondary)",
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
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faUserPlus}
                                className="me-2"
                              />
                              Create Account
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
                    transition={{ delay: 0.8 }}
                  >
                    <div className="border-top pt-4 mt-4">
                      <p
                        className="mb-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Already have an account?{" "}
                        <Link
                          to="/login"
                          className="text-decoration-none fw-semibold"
                          style={{ color: "var(--primary-600)" }}
                        >
                          Sign In
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
                          <FontAwesomeIcon
                            icon={faShieldAlt}
                            className="me-2"
                          />
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

export default Register;
