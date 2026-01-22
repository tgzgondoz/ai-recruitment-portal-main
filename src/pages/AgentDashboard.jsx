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

const AgentDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

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
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Welcome back, <span className="font-medium text-gray-900">{user?.email?.split('@')[0]}</span>
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 hover:bg-black text-white flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <FaPlus className="text-sm" /> 
          <span className="whitespace-nowrap">Post New Job</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          title="Total Applications" 
          value={stats?.totalApplications || 0} 
          icon={<FaUsers className="w-5 h-5" />} 
        />
        <StatCard 
          title="High Matches" 
          value={stats?.pendingReviews || 0} 
          icon={<FaRobot className="w-5 h-5" />} 
        />
        <StatCard 
          title="Interviews" 
          value={stats?.interviewsScheduled || 0} 
          icon={<FaCalendarAlt className="w-5 h-5" />} 
        />
        <StatCard 
          title="Offers Sent" 
          value={stats?.offersSent || 0} 
          icon={<FaUserCheck className="w-5 h-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-medium text-gray-900">Recent Applications</h2>
              <p className="text-gray-500 text-sm mt-1">Track and manage candidate submissions</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveFilter(activeFilter === 'all' ? 'pending' : 'all')}
                >
                  <FaFilter className="text-gray-400" />
                  <span className="hidden sm:inline">{activeFilter === 'all' ? 'All Status' : 'Pending Only'}</span>
                  <span className="sm:hidden">Filter</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Applications List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Candidate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider hidden sm:table-cell">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider hidden md:table-cell">Applied</th>
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
          <div className="bg-gray-900 text-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gray-800 rounded-lg">
                <FaBullhorn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Pipeline Actions</h3>
                <p className="text-gray-300 text-sm">Quick actions to move candidates forward</p>
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
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Weekly Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Applications</span>
                <span className="font-medium text-gray-900">+24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Interviews Completed</span>
                <span className="font-medium text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Response Time</span>
                <span className="font-medium text-gray-900">2.4 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Offer Acceptance Rate</span>
                <span className="font-medium text-gray-900">78%</span>
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
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {app.users?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{app.users?.full_name || 'Anonymous'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-900">
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
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
          <FaCircle className="w-1.5 h-1.5 text-gray-900" /> 
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
const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 transition-colors hover:border-gray-300">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 bg-gray-100 text-gray-900 rounded-lg">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-medium text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ label, description, icon, highlight = false }) => (
  <button className={`
    w-full text-left p-4 rounded-lg transition-colors
    ${highlight 
      ? "bg-gray-800 hover:bg-gray-700 border border-gray-700" 
      : "bg-gray-800 hover:bg-gray-700"}
  `}>
    <div className="flex items-center gap-3">
      <div className={`
        p-2 rounded-lg
        ${highlight ? "bg-gray-700" : "bg-gray-800"}
      `}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-gray-300 text-xs mt-0.5">{description}</p>
      </div>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

export default AgentDashboard;