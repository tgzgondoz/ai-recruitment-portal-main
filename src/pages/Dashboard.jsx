import { useAuth } from '../context/AuthContext';
import AgentDashboard from './AgentDashboard';
import CandidateDashboard from './CandidateDashboard';
import { Navigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { cn } from '../lib/utils';

const Dashboard = () => {
  const { user, loading, isAgent } = useAuth();

  // Prevent rendering while loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-brand-light rounded-full"></div>
          <div className="w-16 h-16 border-4 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className={cn(
        "mb-6 md:mb-8 p-4 md:p-6 rounded-xl md:rounded-2xl",
        isAgent 
          ? "bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
      )}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-gray-600">
              {isAgent 
                ? 'Monitor your talent pipeline and manage applications'
                : 'Track your applications and find new opportunities'}
            </p>
          </div>
          
          <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium">
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