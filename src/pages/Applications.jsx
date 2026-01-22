import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import { 
  FaSearch, 
  FaFilter, 
  FaUser, 
  FaEye, 
  FaCheckCircle, 
  FaChartLine,
  FaSort,
  FaEllipsisH,
  FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { cn, formatDate } from '../lib/utils';
const Applications = () => {
  const { user, isAgent } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [minMatch, setMinMatch] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', user?.id, isAgent],
    queryFn: () => isAgent 
      ? jobService.getAgentApplications(user.id) 
      : jobService.getCandidateApplications(user.id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => jobService.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['applications']);
      toast.success('Application status updated');
    },
    onError: () => toast.error('Failed to update status')
  });

  // Helper: Calculate ATS Score
  const calculateScore = (app) => {
    const required = app.job?.required_skills || [];
    const candidateSkills = app.candidate?.skills || [];
    if (required.length === 0) return 0;
    const matches = required.filter(s => 
      candidateSkills.map(c => c.toLowerCase()).includes(s.toLowerCase())
    );
    return Math.round((matches.length / required.length) * 100);
  };

  // Filter and sort applications
  const filteredApps = applications
    .filter(app => {
      const matchesSearch = 
        (app.job?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.candidate?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.candidate?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesScore = calculateScore(app) >= minMatch;
      
      const matchesStatus = 
        statusFilter === 'all' || 
        app.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesScore && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return calculateScore(b) - calculateScore(a);
        case 'newest':
          return new Date(b.applied_at) - new Date(a.applied_at);
        case 'oldest':
          return new Date(a.applied_at) - new Date(b.applied_at);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-brand-light rounded-full"></div>
          <div className="w-12 h-12 border-3 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500 font-medium">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Talent Pipeline</h1>
          <p className="text-gray-600 mt-1">
            {filteredApps.length} {filteredApps.length === 1 ? 'application' : 'applications'} to review
          </p>
        </div>
        
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input 
              className="dc-input pl-10 pr-4 py-2.5 w-full"
              placeholder="Search candidates or roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dc-input py-2.5 text-sm min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="offered">Offered</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="dc-input py-2.5 text-sm min-w-[120px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score">Highest Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* ATS Threshold Slider */}
      <div className="dc-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <FaChartLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">ATS Match Threshold</h3>
              <p className="text-sm text-gray-600">Filter candidates below {minMatch}% match score</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="10"
              value={minMatch}
              onChange={(e) => setMinMatch(parseInt(e.target.value))}
              className="flex-1 md:w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div className="px-3 py-2 bg-brand-primary text-white rounded-lg font-semibold text-sm min-w-[60px] text-center">
              {minMatch}%
            </div>
          </div>
        </div>
      </div>

      {/* Applications Grid/Table */}
      <div className="dc-card p-0 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="dc-table">
              <thead className="dc-table-header">
                <tr>
                  <th className="dc-table-header-cell">Candidate</th>
                  <th className="dc-table-header-cell">Position</th>
                  <th className="dc-table-header-cell">Match Score</th>
                  <th className="dc-table-header-cell">Status</th>
                  <th className="dc-table-header-cell">Applied</th>
                  <th className="dc-table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <ApplicationRow 
                      key={app.id} 
                      app={app} 
                      onSelect={setSelectedApp}
                      calculateScore={calculateScore}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaUser className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-medium">No applications found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {filteredApps.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredApps.map((app) => (
                <MobileApplicationCard 
                  key={app.id}
                  app={app}
                  onSelect={setSelectedApp}
                  calculateScore={calculateScore}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <FaUser className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No applications found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      <ApplicationDetailsModal 
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
};

// Desktop Row Component
const ApplicationRow = ({ app, onSelect, calculateScore }) => {
  const score = calculateScore(app);
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {app.candidate?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{app.candidate?.full_name || 'Anonymous'}</p>
            <p className="text-sm text-gray-500 truncate max-w-[150px]">
              {app.candidate?.email || 'No email'}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-gray-900 text-sm">{app.job?.title}</p>
        <p className="text-xs text-gray-500">{app.job?.location_city}</p>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                score >= 80 ? "bg-green-500" :
                score >= 60 ? "bg-blue-500" :
                score >= 40 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className={cn(
            "text-sm font-semibold px-2 py-0.5 rounded",
            getScoreColor(score)
          )}>
            {score}%
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full",
          getStatusStyle(app.status)
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {app.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-gray-500">
          {formatDate(app.applied_at)}
        </span>
      </td>
      <td className="px-4 py-4">
        <button 
          onClick={() => onSelect(app)}
          className="dc-btn-primary flex items-center gap-2 px-3 py-1.5 text-sm"
        >
          <FaEye className="w-3 h-3" />
          <span>View</span>
        </button>
      </td>
    </tr>
  );
};

// Mobile Card Component
const MobileApplicationCard = ({ app, onSelect, calculateScore }) => {
  const score = calculateScore(app);
  
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
            {app.candidate?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-gray-900 truncate">
                {app.candidate?.full_name || 'Anonymous'}
              </p>
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded",
                score >= 80 ? "bg-green-100 text-green-700" :
                score >= 60 ? "bg-blue-100 text-blue-700" :
                "bg-yellow-100 text-yellow-700"
              )}>
                {score}%
              </span>
            </div>
            <p className="text-sm text-gray-700 font-medium truncate mb-1">
              {app.job?.title}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{app.job?.location_city}</span>
              <span>•</span>
              <span>{formatDate(app.applied_at)}</span>
            </div>
            <div className="mt-2">
              <span className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full",
                getStatusStyle(app.status)
              )}>
                {app.status}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onSelect(app)}
          className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg"
        >
          <FaEye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

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

export default Applications;