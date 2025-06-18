import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ToastContainer from "../common/ToastContainer";
import "./Layout.css";

const NAVBAR_HEIGHT = 56;
const SIDEBAR_WIDTH = 240;

const Layout = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 992;

  return (
    <div className="app-container">
      {/* Navbar at the top, fixed */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1051,
          height: NAVBAR_HEIGHT,
        }}
      >
        <Navbar />
      </div>
      
      {/* Content container with sidebar and main content */}
      <div className="content-container" style={{ marginTop: NAVBAR_HEIGHT }}>
        {/* Sidebar: fixed on desktop, hidden on mobile */}
        {isDesktop && (
          <div
            className="sidebar"
            style={{
              position: "fixed",
              top: NAVBAR_HEIGHT,
              left: 0,
              width: SIDEBAR_WIDTH,
              height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
              zIndex: 1050,
              overflowY: "auto",
            }}
          >
            <Sidebar />
          </div>
        )}
        
        {/* Main content: margin-left on desktop, full width on mobile */}
        <main
          className="main-content p-3"
          style={{
            background: "#f8f9fa",
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            width: "100%",
            marginLeft: isDesktop ? SIDEBAR_WIDTH : 0,
            transition: "margin-left 0.3s ease",
          }}
        >
          <div className="container-fluid py-2">
            {!isDesktop && (
              <div className="d-lg-none mb-4">
                <Sidebar mobile={true} />
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Layout;
