import React from "react";
import { Link } from "react-router-dom";
import { House, Box, List, Gear, Bell } from "bootstrap-icons-react";

const SidebarNav = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-sticky">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              <House className="icon" />
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/products" className="nav-link">
              <Box className="icon" />
              Products
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/categories" className="nav-link">
              <List className="icon" />
              Categories
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/notifications" className="nav-link">
              <Bell className="icon" />
              Notifications
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/settings" className="nav-link">
              <Gear className="icon" />
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SidebarNav;
