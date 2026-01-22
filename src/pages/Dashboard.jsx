import { useAuth } from '../context/AuthContext';
import AgentDashboard from './AgentDashboard';
import CandidateDashboard from './CandidateDashboard';
import { Navigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const Dashboard = () => {
  const { user, loading, isAgent } = useAuth();

  // Prevent rendering while loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500">Loading Dashboard...</p>
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-1">
              Welcome back, {user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-gray-600">
              {isAgent 
                ? 'Monitor your talent pipeline and manage applications'
                : 'Track your applications and find new opportunities'}
            </p>
          </div>
          
          <div className="px-3 py-1.5 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm font-medium">
            {isAgent ? 'Recruiter Mode' : 'Candidate Mode'}
          </div>
        </div>
      </div>

      {/* Dashboard Switcher */}
      {isAgent ? <AgentDashboard /> : <CandidateDashboard />}
    </div>
  );
};

export default Dashboard;