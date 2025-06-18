import React, { useContext, useState, useEffect } from "react";
import {
  Navbar as BootstrapNavbar,
  Container,
  Nav,
  NavDropdown,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxes,
  faUser,
  faSignOutAlt,
  faBars,
  faCog,
  faChartLine,
  faSun,
  faMoon,
  // faBell,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Navbar = ({ onSidebarToggle }) => {
  const { user, isAuthenticated, logout, isAdmin } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  // const [notifications] = useState(3); // Mock notification count
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-dropdown') && !event.target.closest('.btn-user-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <BootstrapNavbar
      expand="lg"
      className={`navbar royal-navbar ${isScrolled ? "scrolled" : ""}`}
      style={{
        background: isScrolled
          ? "linear-gradient(135deg, var(--primary-700) 0%, var(--primary-800) 100%)"
          : "linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)",
        transition: "all 0.3s ease",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${
          isScrolled ? "var(--primary-400)" : "var(--primary-500)"
        }`,
        overflow: "visible"
      }}
    >
      <Container fluid className="px-3 px-md-4 d-flex align-items-center justify-content-between" style={{ height: "100%" }}>
        {/* Left Section: Hamburger + Brand */}
        <div className="d-flex align-items-center">
          {/* Enhanced Hamburger Menu */}
          <button
            className="navbar-toggler d-lg-none me-2 p-1 p-md-2"
            aria-label="Open sidebar"
            onClick={onSidebarToggle}
            style={{
              border: "none",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--radius-md)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
              e.target.style.transform = "scale(1)";
            }}
          >
            <FontAwesomeIcon
              icon={faBars}
              className="text-white"
              style={{ fontSize: isMobile ? "1rem" : "1.2rem" }}
            />
          </button>

          {/* Enhanced Brand Section */}
          <Link
            to="/dashboard"
            className="navbar-brand d-flex align-items-center text-decoration-none"
            style={{ transition: "all var(--transition-fast)" }}
          >
            <div className="position-relative me-2 me-md-3">
              <img
                src="/logo icon.svg"
                alt="Inventory Logo"
                className="navbar-logo"
                style={{
                  height: isMobile ? "32px" : "42px",
                  width: "auto",
                  filter:
                    "brightness(1.2) drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))",
                  transition: "all var(--transition-fast)",
                }}
              />
              {/* Animated glow effect */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)",
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                }}
              />
            </div>

            <div className="d-flex flex-column">
              <span
                className="text-white fw-bold mb-0"
                style={{ fontSize: isMobile ? "1.1rem" : "1.4rem", lineHeight: "1.2" }}
              >
                <FontAwesomeIcon
                  icon={faBoxes}
                  className="me-2"
                  style={{
                    color: "var(--warning-400)",
                    filter: "drop-shadow(0 0 4px rgba(255, 215, 0, 0.5))",
                  }}
                />
                <span className="d-none d-sm-inline">Inventory</span>
              </span>
              <small
                className="text-white-50 d-none d-lg-block"
                style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
              >
                Management System
              </small>
            </div>
          </Link>
        </div>

        {/* Right Section: Navigation & User Menu */}
        <Nav className="ms-auto d-flex align-items-center">
          {isAuthenticated ? (
            <>
              {/* Enhanced User Dropdown */}
              <div className="position-relative">
                <button 
                  onClick={toggleDropdown}
                  className="btn p-0 border-0 bg-transparent btn-user-dropdown"
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                      style={{ width: isMobile ? "32px" : "36px", height: isMobile ? "32px" : "36px" }}
                    >
                      <FontAwesomeIcon
                        icon={faUser}
                        style={{
                          color: "var(--primary-600)",
                          fontSize: isMobile ? "0.8rem" : "0.9rem",
                        }}
                      />
                    </div>
                  </div>
                </button>
                <div 
                  className={`dropdown-menu dropdown-menu-end user-dropdown ${showDropdown ? 'show' : ''}`}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: isMobile ? '40px' : '45px',
                    zIndex: 1050,
                    width: isMobile ? '200px' : '240px'
                  }}
                >
                <div className="px-3 py-2 border-bottom d-flex align-items-center">
                  <div>
                    <div className="fw-semibold text-dark">
                      {user?.name || "User"}
                    </div>
                    <small className="text-muted d-none d-sm-inline-block">
                      {user?.email || "user@example.com"}
                    </small>
                  </div>
                </div>

                  <button
                    className="dropdown-item d-flex align-items-center py-2"
                    onClick={() => {
                      toggleTheme();
                      setShowDropdown(false);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={theme === 'light' ? faMoon : faSun}
                      className={`me-3 ${theme === 'light' ? 'text-secondary' : 'text-warning'}`}
                    />
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>

                  <Link
                    to="/profile"
                    className="dropdown-item d-flex align-items-center py-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className="me-3 text-primary"
                    />
                    <span>Profile Settings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="dropdown-item d-flex align-items-center py-2"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FontAwesomeIcon
                        icon={faCog}
                        className="me-3 text-secondary"
                      />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <div className="dropdown-divider"></div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="dropdown-item d-flex align-items-center py-2 text-danger"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Authentication Links */
            <div className="d-flex align-items-center gap-2">
              <Nav.Link
                as={Link}
                to="/login"
                className="btn btn-outline-light btn-sm px-2 px-md-3 py-1 py-md-2 me-1 me-md-2"
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "var(--radius-md)",
                  transition: "all var(--transition-fast)",
                  textDecoration: "none",
                  fontSize: isMobile ? "0.8rem" : "0.875rem"
                }}
              >
                Login
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/register"
                className="btn btn-light btn-sm px-2 px-md-3 py-1 py-md-2"
                style={{
                  borderRadius: "var(--radius-md)",
                  transition: "all var(--transition-fast)",
                  textDecoration: "none",
                  color: "var(--primary-600)",
                  fontWeight: "500",
                  fontSize: isMobile ? "0.8rem" : "0.875rem"
                }}
              >
                Register
              </Nav.Link>
            </div>
          )}
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
