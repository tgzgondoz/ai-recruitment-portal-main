import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaShieldAlt } from 'react-icons/fa';

const AdminRoute = () => {
  const { user, userType, loading } = useAuth();
  
  // The Admin email you specified
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "masogashie@gmail.com";

  // Show a clean loading state while checking the session and profile
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse text-sm">Verifying Admin Permissions...</p>
      </div>
    );
  }

  /**
   * SECURITY CHECK:
   * 1. Must be logged in (user)
   * 2. Email must match your admin email OR the userType must be 'admin' from the database
   */
  const hasAdminAccess = user && (user.email === ADMIN_EMAIL || userType === 'admin');

  if (!hasAdminAccess) {
    // If not an admin, redirect to the standard user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If admin, render the child routes (AdminDashboard)
  return <Outlet />;
};

export default AdminRoute;