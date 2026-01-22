import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { agentService } from '../services/AgentService';
import PostJobModal from './PostJobModal';
import { 
  FaUsers, 
  FaBriefcase, 
  FaChartLine, 
  FaSearch, 
  FaPlus, 
  FaSpinner, 
  FaCircle, 
  FaRobot,
  FaFilter,
  FaCalendarAlt,
  FaUserCheck,
  FaBullhorn
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

const AgentDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Access Vite environment variables correctly
  const appName = import.meta.env.VITE_APP_NAME || 'Dimensions Consultancy';

  // 1. Fetch Aggregated Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['agent-stats', user?.id],
    queryFn: () => agentService.getAgentStats(user?.id),
    enabled: !!user?.id
  });

  // 2. Fetch Recent Applications
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['recent-applications', user?.id],
    queryFn: () => agentService.getRecentApplications(user?.id),
    enabled: !!user?.id
  });

  // 3. Mutation for Posting a New Job
  const postJobMutation = useMutation({
    mutationFn: (newJob) => agentService.createJob(user.id, newJob),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-stats', user?.id]);
      queryClient.invalidateQueries(['recent-applications', user?.id]);
      setIsModalOpen(false);
    }
  });

  // Filter applications
  const filteredApps = applications?.filter(app => {
    const matchesSearch = 
      app.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' || 
      app.status?.toLowerCase() === activeFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  if (statsLoading || appsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-light rounded-full"></div>
          <div className="w-16 h-16 border-4 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500 font-semibold uppercase text-sm tracking-wider">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Welcome back, <span className="font-semibold text-brand-primary">{user?.email?.split('@')[0]}</span>
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="dc-btn-primary flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <FaPlus className="text-sm" /> 
          <span className="whitespace-nowrap">Post New Job</span>
        </button>
      </div>

      {/* Stats Grid - Mobile responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          title="Total Applications" 
          value={stats?.totalApplications || 0} 
          icon={<FaUsers className="w-5 h-5" />} 
          color="blue" 
          trend="+12%"
        />
        <StatCard 
          title="High Matches" 
          value={stats?.pendingReviews || 0} 
          icon={<FaRobot className="w-5 h-5" />} 
          color="purple" 
          trend="AI Powered"
        />
        <StatCard 
          title="Interviews" 
          value={stats?.interviewsScheduled || 0} 
          icon={<FaCalendarAlt className="w-5 h-5" />} 
          color="indigo" 
        />
        <StatCard 
          title="Offers Sent" 
          value={stats?.offersSent || 0} 
          icon={<FaUserCheck className="w-5 h-5" />} 
          color="green" 
          trend="+5 this week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2 dc-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Applications</h2>
              <p className="text-gray-500 text-sm mt-1">Track and manage candidate submissions</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="dc-input pl-10 pr-4 py-2.5 text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setActiveFilter(activeFilter === 'all' ? 'pending' : 'all')}
                >
                  <FaFilter className="text-gray-400" />
                  <span className="hidden sm:inline">{activeFilter === 'all' ? 'All Status' : 'Pending Only'}</span>
                  <span className="sm:hidden">Filter</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Applications List - Mobile friendly */}
          <div className="overflow-x-auto dc-table-container">
            <table className="dc-table">
              <thead className="dc-table-header">
                <tr>
                  <th className="dc-table-header-cell">Candidate</th>
                  <th className="dc-table-header-cell hidden sm:table-cell">Position</th>
                  <th className="dc-table-header-cell">Status</th>
                  <th className="dc-table-header-cell hidden md:table-cell">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApps?.length > 0 ? (
                  filteredApps.map((app) => (
                    <ApplicationRow key={app.id} app={app} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaBriefcase className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-medium">No applications found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions Card */}
          <div className="dc-card bg-gradient-to-br from-brand-dark to-gray-900 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-white/10 rounded-lg">
                <FaBullhorn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Pipeline Actions</h3>
                <p className="text-white/70 text-sm">Quick actions to move candidates forward</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <ActionButton 
                label="Review High Matches" 
                description="Candidates with 80%+ AI score"
                icon={<FaRobot className="w-4 h-4" />}
                highlight
              />
              <ActionButton 
                label="Schedule Interviews" 
                description="3 pending interviews"
                icon={<FaCalendarAlt className="w-4 h-4" />}
              />
              <ActionButton 
                label="Browse Talent Pool" 
                description="200+ active candidates"
                icon={<FaUsers className="w-4 h-4" />}
              />
              <ActionButton 
                label="Analytics Report" 
                description="Weekly performance"
                icon={<FaChartLine className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Stats Summary Card */}
          <div className="dc-card">
            <h3 className="font-semibold text-gray-900 mb-4">Weekly Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Applications</span>
                <span className="font-semibold text-gray-900">+24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Interviews Completed</span>
                <span className="font-semibold text-green-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Response Time</span>
                <span className="font-semibold text-blue-600">2.4 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Offer Acceptance Rate</span>
                <span className="font-semibold text-purple-600">78%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      <PostJobModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => postJobMutation.mutate(data)}
        isLoading={postJobMutation.isPending}
      />
    </div>
  );
};

// Application Row Component
const ApplicationRow = ({ app }) => {
  const scoreColor = app.ats_score >= 80 ? 'bg-green-100 text-green-700' : 
                    app.ats_score >= 60 ? 'bg-blue-100 text-blue-700' : 
                    'bg-yellow-100 text-yellow-700';

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {app.users?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{app.users?.full_name || 'Anonymous'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                scoreColor
              )}>
                <FaRobot className="w-2 h-2" /> 
                {app.ats_score || '0'}% Match
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 hidden sm:table-cell">
        <div>
          <p className="font-medium text-gray-900 text-sm">{app.jobs?.title}</p>
          <p className="text-xs text-gray-500">{app.jobs?.location_city}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full",
          getStatusStyle(app.status)
        )}>
          <FaCircle className="w-1.5 h-1.5" /> 
          <span className="capitalize">{app.status}</span>
        </span>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <span className="text-sm text-gray-500">
          {app.applied_at ? `${formatDistanceToNow(new Date(app.applied_at))} ago` : 'Recently'}
        </span>
      </td>
    </tr>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div className={cn(
      "dc-card p-4 sm:p-5 border-2 transition-all hover:shadow-md",
      colorClasses[color]
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          "p-2.5 rounded-lg",
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'purple' ? 'bg-purple-100' :
          'bg-indigo-100'
        )}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            color === 'blue' ? 'bg-blue-100 text-blue-700' :
            color === 'green' ? 'bg-green-100 text-green-700' :
            color === 'purple' ? 'bg-purple-100 text-purple-700' :
            'bg-indigo-100 text-indigo-700'
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ label, description, icon, highlight = false }) => (
  <button className={cn(
    "w-full text-left p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
    highlight 
      ? "bg-white/10 hover:bg-white/15 border border-white/20" 
      : "bg-white/5 hover:bg-white/10"
  )}>
    <div className="flex items-center gap-3">
      <div className={cn(
        "p-2 rounded-lg",
        highlight ? "bg-white/20" : "bg-white/10"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-white/60 text-xs mt-0.5">{description}</p>
      </div>
      <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

// Status Style Helper
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'applied': return 'bg-blue-100 text-blue-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'reviewing': return 'bg-purple-100 text-purple-700';
    case 'shortlisted': return 'bg-indigo-100 text-indigo-700';
    case 'interviewing': return 'bg-pink-100 text-pink-700';
    case 'offered': return 'bg-green-100 text-green-700';
    case 'hired': return 'bg-emerald-100 text-emerald-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default AgentDashboard;