import React, { useContext, lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ToastContainer from "./components/common/ToastContainer";
import "./App.css";

const AppRoutes = lazy(() => import("./routes/AppRoutes"));

const AppContent = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Check if current route is login or registration page
  const isAuthPage = ["/login", "/register", "/admin-register"].includes(location.pathname);

  useEffect(() => {
    fetch("/api/qr-events")
      .then((res) => res.json())
      .then(setEvents);
  }, []);

  // Sidebar toggle handler for mobile
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <div className="app-container">
      <ToastContainer />
      {isAuthenticated && !isAuthPage && (
        <>
          <Navbar onSidebarToggle={handleSidebarToggle} />
          <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
        </>
      )}
      <div
        className={`main-content-area ${isAuthenticated && !isAuthPage ? "with-sidebar" : ""}`}
        style={isAuthPage ? {marginTop: 0} : {}}
      >
        <Suspense
          fallback={
            <div className="text-center py-5">
              <div className="epic-loader mx-auto mb-3"></div>
              <p className="mt-3 text-primary">Loading your dashboard...</p>
            </div>
          }
        >
          <AppRoutes />
          {isAuthenticated && events.length > 0 && (
            <div className="mt-4">
              <h5>Event History</h5>
              {/* Table code here if needed */}
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
