import React, { useContext, useEffect, useState } from "react";
import { Nav, Offcanvas, Accordion, Button } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faBoxes,
  faTags,
  faPlus,
  faQrcode,
  faCalendar,
  faSignOutAlt,
  faUserPlus,
  faList,
  faTimes,
  faChevronRight,
  faUser,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = ({ open = false, onClose, mobile = false }) => {
  const { isAuthenticated, isAdmin, user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (!isAuthenticated) return null;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      path: "/dashboard",
      icon: faTachometerAlt,
      label: "Dashboard",
      description: "Overview & Analytics",
    },
    {
      path: "/products",
      icon: faBoxes,
      label: "Products",
      description: "Manage Inventory",
    },
    {
      path: "/categories",
      icon: faTags,
      label: "Categories",
      description: "Product Categories",
    },
    {
      path: "/qr-scanner",
      icon: faQrcode,
      label: "QR Scanner",
      description: "Scan Products",
    },
    {
      path: "/schedule",
      icon: faCalendar,
      label: "Schedule",
      description: "Task Management",
    },
  ];

  const adminItems = [
    {
      path: "/product/new",
      icon: faPlus,
      label: "Add Product",
      description: "Create New Item",
    },
    {
      path: "/user-management",
      icon: faUserPlus,
      label: "User Management",
      description: "Add New Users",
    },
  ];

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const renderNavItem = (item, index) => (
    <Nav.Item key={index}>
      <Nav.Link
        as={NavLink}
        to={item.path}
        className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
        onClick={onClose}
        end={item.path === "/dashboard"}
      >
        <div className="d-flex align-items-center w-100">
          <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />
          <div className="flex-grow-1">
            <div className="fw-semibold">{item.label}</div>
            {!mobile && (
              <small
                className="text-muted d-block"
                style={{ fontSize: "0.75rem", lineHeight: "1.2" }}
              >
                {item.description}
              </small>
            )}
          </div>
          {isActive(item.path) && (
            <FontAwesomeIcon
              icon={faChevronRight}
              className="ms-auto"
              style={{ fontSize: "0.75rem", opacity: 0.7 }}
            />
          )}
        </div>
      </Nav.Link>
    </Nav.Item>
  );

  // Mobile compact sidebar
  if (mobile) {
    return (
      <div className="mobile-sidebar mb-4">
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <FontAwesomeIcon icon={faBars} className="me-2" />
              <span className="fw-semibold">Menu</span>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <Nav className="flex-column">
                {navigationItems.map((item, index) => renderNavItem(item, index))}
                {isAdmin && adminItems.map((item, index) => renderNavItem(item, index))}
              </Nav>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    );
  }

  const sidebarContent = (
    <div className="h-100 d-flex flex-column">
      {/* Navigation Header */}
      <div className="px-4 py-3 border-bottom border-light">
        <h6 className="text-gradient mb-0 fw-bold">Navigation</h6>
      </div>

      {/* Main Navigation */}
      <div className="flex-grow-1 overflow-auto">
        <Nav className="flex-column px-2 py-3">
          {navigationItems.map((item, index) => renderNavItem(item, index))}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <hr className="mx-3 my-3 border-light" />
              <div className="px-3 mb-2">
                <small
                  className="text-muted fw-semibold text-uppercase"
                  style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
                >
                  Admin Tools
                </small>
              </div>
              {adminItems.map((item, index) => renderNavItem(item, index))}
            </>
          )}
        </Nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {open && isMobile && (
        <div
          className="sidebar-overlay show"
          onClick={onClose}
          style={{ zIndex: 1040, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }}
        />
      )}

      {/* Mobile Sidebar */}
      <Offcanvas
        show={open && isMobile}
        onHide={onClose}
        placement="start"
        className="sidebar-offcanvas"
        style={{ zIndex: 1050, width: "320px" }}
        backdrop={false}
      >
        <Offcanvas.Header className="border-bottom border-light px-4 py-3">
          <Offcanvas.Title className="text-gradient fw-bold d-flex align-items-center">
            <FontAwesomeIcon icon={faBoxes} className="me-2" />
            Inventory System
          </Offcanvas.Title>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-circle p-2"
            onClick={onClose}
            style={{ width: "36px", height: "36px" }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">{sidebarContent}</Offcanvas.Body>
      </Offcanvas>

      {/* Desktop Sidebar */}
      <div
        className={`sidebar-container d-none d-lg-block ${open ? "open" : ""}`}
        style={{
          width: window.innerWidth >= 1400 ? "320px" : "280px",
          top: "var(--navbar-height)",
          height: "calc(100vh - var(--navbar-height))",
        }}
      >
        <div className="sidebar-sticky h-100">{sidebarContent}</div>
      </div>
    </>
  );
};

export default Sidebar;
