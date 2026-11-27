import Hero from "./pages/Hero";
import "./App.css";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import React, { useEffect } from "react";
import axios from "axios";
import SessionTimeoutWatcher from "./components/SessionTimeoutWatcher";
import { detectDeviceIp, getCachedDeviceIp } from "./utils/clientIp";

/** Send already-logged-in users away from public pages */
const PublicOnly = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    detectDeviceIp();

    const requestInterceptor = axios.interceptors.request.use((config) => {
      const deviceIp = getCachedDeviceIp();
      if (deviceIp) {
        config.headers = config.headers || {};
        config.headers["X-Client-Device-IP"] = deviceIp;
      }
      return config;
    });

    // Global interceptor for 401 Unauthorized (Session Expired)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("edms_dashboard_nav");
          navigate("/login", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return (
    <>
      <SessionTimeoutWatcher />
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnly>
              <Hero />
            </PublicOnly>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
