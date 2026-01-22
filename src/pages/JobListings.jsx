import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import PostJobModal from '../components/jobs/PostJobModal';
import { 
  FaSearch, 
  FaFilter, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaDollarSign, 
  FaClock, 
  FaPlus, 
  FaChevronRight,
  FaEye,
  FaEdit,
  FaTrash,
  FaUsers
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const JobListings = () => {
  const { user, isCandidate, isAgent } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: 'all',
    status: 'active'
  });

  // Fetch Jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getAllJobs(filters),
    keepPreviousData: true
  });

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: (jobId) => jobService.submitApplication(jobId, user.id),
    onSuccess: () => {
      toast.success('Application submitted successfully');
      queryClient.invalidateQueries(['applications']);
    },
    onError: (err) => toast.error(err.message || 'Failed to apply')
  });

  // Delete Mutation (for agents)
  const deleteMutation = useMutation({
    mutationFn: (jobId) => jobService.deleteJob(jobId),
    onSuccess: () => {
      toast.success('Job deleted successfully');
      queryClient.invalidateQueries(['jobs']);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete job')
  });

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (job.description || '').toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesLocation = 
      !filters.location || 
      (job.location || '').toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesJobType = 
      filters.jobType === 'all' || 
      job.job_type === filters.jobType;
    
    const matchesStatus = 
      filters.status === 'all' || 
      job.status === filters.status;
    
    return matchesSearch && matchesLocation && matchesJobType && matchesStatus;
  });

  if (isLoading && !jobs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500">Loading job listings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900">
            {isAgent ? 'Job Management' : 'Job Board'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAgent 
              ? 'Manage your job postings and applications' 
              : 'Browse and apply to exciting opportunities'}
          </p>
        </div>
        
        {isAgent && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 hover:bg-black text-white flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input 
              type="text"
              placeholder="Search job titles..."
              className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input 
              type="text"
              placeholder="Location"
              className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          
          <select 
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
            value={filters.jobType}
            onChange={(e) => setFilters({...filters, jobType: e.target.value})}
          >
            <option value="all">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
            <option value="internship">Internship</option>
          </select>
          
          {isAgent && (
            <select 
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          )}
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs?.length > 0 ? (
          filteredJobs.map((job) => (
            <JobListItem 
              key={job.id}
              job={job}
              isAgent={isAgent}
              onApply={() => applyMutation.mutate(job.id)}
              onView={() => setSelectedJob(job)}
              onEdit={() => setSelectedJob(job)}
              onDelete={() => {
                if (window.confirm('Are you sure you want to delete this job?')) {
                  deleteMutation.mutate(job.id);
                }
              }}
              isApplying={applyMutation.isPending}
              isDeleting={deleteMutation.isPending}
            />
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <FaBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {jobs?.length === 0 
                ? "No jobs are currently available. Check back later!"
                : "No jobs match your current filters."}
            </p>
            {isAgent && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-900 hover:bg-black text-white inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span>Post Your First Job</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <PostJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        job={selectedJob}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
};

// Job List Item Component
const JobListItem = ({ job, isAgent, onApply, onView, onEdit, onDelete, isApplying, isDeleting }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-gray-100 text-gray-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1.5">
                  <FaBriefcase className="w-3 h-3" />
                  {job.company_name || 'Company'}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  {job.location || 'Location'}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5">
                  <FaClock className="w-3 h-3" />
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {isAgent && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                {job.status}
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {job.description?.substring(0, 150)}...
          </p>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm">
            {job.salary_min && (
              <span className="flex items-center gap-1.5 font-medium text-gray-900">
                <FaDollarSign className="w-3 h-3" />
                ${job.salary_min.toLocaleString()}+
              </span>
            )}
            {isAgent && job.applications_count > 0 && (
              <span className="flex items-center gap-1.5 text-gray-900">
                <FaUsers className="w-3 h-3" />
                {job.applications_count} applicants
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 min-w-[160px]">
          {isAgent ? (
            <>
              <button 
                onClick={onView}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-colors"
              >
                <FaEye className="w-3 h-3" />
                <span>View</span>
              </button>
              <button 
                onClick={onEdit}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-colors"
              >
                <FaEdit className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button 
                onClick={onDelete}
                disabled={isDeleting}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-colors"
              >
                <FaTrash className="w-3 h-3" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onApply}
                disabled={isApplying}
                className="bg-gray-900 hover:bg-black text-white flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <>
                    <FaClock className="w-3 h-3 animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <FaChevronRight className="w-3 h-3" />
                    <span>Apply Now</span>
                  </>
                )}
              </button>
              <button 
                onClick={onView}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-colors"
              >
                <FaEye className="w-3 h-3" />
                <span>View Details</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;