import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { candidateService } from '../services/candidateService';
import { useAuth } from '../context/AuthContext';
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaRobot, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaSpinner,
  FaSearch,
  FaFileAlt,
  FaCalendarAlt,
  FaUserCheck,
  FaEye
} from 'react-icons/fa';

const CandidateApplications = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ['candidate-applications', user?.id],
    queryFn: () => candidateService.getCandidateApplications(user?.id),
    enabled: !!user?.id
  });

  // Filter applications
  const filteredApps = applications?.filter(app => {
    const matchesSearch = 
      (app.job_listings?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.job_listings?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      app.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500">Loading your applications...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <FaTimesCircle className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading applications</h3>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">
            Track your job applications and interview progress
          </p>
        </div>
        
        {/* Stats Summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg font-medium">
            Total: {applications?.length || 0}
          </div>
          <div className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg font-medium">
            Active: {applications?.filter(a => ['applied', 'reviewing', 'shortlisted', 'interviewing'].includes(a.status)).length || 0}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input 
            className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
            placeholder="Search jobs or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all text-sm min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="applied">Applied</option>
          <option value="reviewing">Reviewing</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredApps?.length > 0 ? (
          filteredApps.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {applications?.length === 0 
                ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                : "No applications match your current filters. Try adjusting your search."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Application Card Component
const ApplicationCard = ({ application }) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied': return <FaClock className="w-4 h-4 text-gray-600" />;
      case 'reviewing': return <FaEye className="w-4 h-4 text-gray-600" />;
      case 'shortlisted': return <FaCheckCircle className="w-4 h-4 text-gray-600" />;
      case 'interviewing': return <FaCalendarAlt className="w-4 h-4 text-gray-600" />;
      case 'offered': return <FaUserCheck className="w-4 h-4 text-gray-600" />;
      case 'hired': return <FaCheckCircle className="w-4 h-4 text-gray-600" />;
      case 'rejected': return <FaTimesCircle className="w-4 h-4 text-gray-600" />;
      default: return <FaClock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {application.job_listings?.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1.5">
                  <FaBuilding className="w-3 h-3" />
                  {application.job_listings?.company_name || 'Company'}
                </span>
                <span className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  {application.job_listings?.location_city}
                </span>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                {getStatusIcon(application.status)}
                <span className="capitalize">{application.status}</span>
              </span>
              <span className="text-xs text-gray-500">
                Applied {new Date(application.applied_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Job Details */}
          <div className="flex flex-wrap gap-2 mb-4">
            {application.job_listings?.job_type && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                {application.job_listings.job_type}
              </span>
            )}
            {application.job_listings?.salary_min && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                ${application.job_listings.salary_min.toLocaleString()}+
              </span>
            )}
          </div>
        </div>

        {/* AI Score & Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3">
          {/* AI Score */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg min-w-[140px]">
            <div className="p-2 bg-gray-100 text-gray-900 rounded-lg">
              <FaRobot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">AI Fit Score</p>
              <p className="text-lg font-medium text-gray-900">
                {application.ats_score || '0'}%
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => {
              console.log('View application:', application.id);
            }}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm w-full sm:w-auto md:w-full"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Timeline Progress */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium text-gray-900">
            Current Stage: {application.status}
          </span>
          <span className="text-gray-400">
            Last updated: {new Date(application.updated_at || application.applied_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CandidateApplications;