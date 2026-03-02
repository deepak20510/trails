import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import SignupPage from "../pages/SignupPage";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/StudentHome";
import ProfilePage from "../pages/ProfilePage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminDashboard from "../../components/AdminDashboard";
import { USER_TYPES } from "../../config/dashboardConfig";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <Dashboard userType={USER_TYPES.STUDENT} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer"
          element={
            <ProtectedRoute requiredRole="TRAINER">
              <Dashboard userType={USER_TYPES.TRAINER} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute"
          element={
            <ProtectedRoute requiredRole="INSTITUTION">
              <Dashboard userType={USER_TYPES.INSTITUTE} />
            </ProtectedRoute>
          }
        />

        {/* Protected Profile Routes */}
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <ProfilePage userType={USER_TYPES.STUDENT} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage userType={USER_TYPES.STUDENT} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/profile"
          element={
            <ProtectedRoute>
              <ProfilePage userType={USER_TYPES.TRAINER} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage userType={USER_TYPES.TRAINER} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/profile"
          element={
            <ProtectedRoute>
              <ProfilePage userType={USER_TYPES.INSTITUTE} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage userType={USER_TYPES.INSTITUTE} />
            </ProtectedRoute>
          }
        />


        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
