import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import ChatBot from './components/ai/ChatBot';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateProfile from './pages/CandidateProfile';
import JobListings from './pages/JobListings';
import Applications from './pages/Applications';
import JobDetails from './pages/JobDetails';
import Analytics from './pages/Analytics';
import Companies from './pages/Companies';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium text-sm">Initializing session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" containerStyle={{ top: 80 }} />

      <Router>
        {/* The ChatBot is now integrated globally for authenticated users */}
        {user && <ChatBot />} 

        <Routes>
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to={userType === 'admin' ? "/admin" : "/dashboard"} replace />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/dashboard" replace />} 
          />

          {/* Main Application Protected Routes */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to={userType === 'admin' ? "/admin" : "/dashboard"} replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Admin ONLY Routes */}
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboard />} />
              {/* TIP: You can add a "Seed AI Data" button inside the AdminDashboard 
                component using the seedDimensionsData function we created.
              */}
            </Route>
            
            <Route path="candidates" element={<Candidates />} />
            <Route path="companies" element={<Companies />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<CandidateProfile />} />
            <Route path="jobs" element={<JobListings />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route path="applications" element={<Applications />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;