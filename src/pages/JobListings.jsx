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
import { cn, formatDate } from '../lib/utils';

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
      toast.success('Application submitted successfully!');
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
          <div className="w-12 h-12 border-3 border-brand-light rounded-full"></div>
          <div className="w-12 h-12 border-3 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500 font-medium">Loading job listings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
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
            className="dc-btn-primary flex items-center gap-2 px-6 py-3"
          >
            <FaPlus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="dc-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input 
              type="text"
              placeholder="Search job titles..."
              className="dc-input pl-10 pr-4 py-2.5 w-full"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input 
              type="text"
              placeholder="Location"
              className="dc-input pl-10 pr-4 py-2.5 w-full"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          
          <select 
            className="dc-input py-2.5"
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
              className="dc-input py-2.5"
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
          <div className="dc-card text-center py-12">
            <FaBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {jobs?.length === 0 
                ? "No jobs are currently available. Check back later!"
                : "No jobs match your current filters."}
            </p>
            {isAgent && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="dc-btn-primary inline-flex items-center gap-2 mt-4"
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
      case 'active': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'closed': return 'bg-red-100 text-red-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="dc-card hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
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
                  {formatDate(job.created_at)}
                </span>
              </div>
            </div>
            
            {isAgent && (
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                getStatusColor(job.status)
              )}>
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
              <span className="flex items-center gap-1.5 font-semibold text-green-600">
                <FaDollarSign className="w-3 h-3" />
                ${job.salary_min.toLocaleString()}+
              </span>
            )}
            {isAgent && job.applications_count > 0 && (
              <span className="flex items-center gap-1.5 text-blue-600">
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
                className="dc-btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                <FaEye className="w-3 h-3" />
                <span>View</span>
              </button>
              <button 
                onClick={onEdit}
                className="dc-btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                <FaEdit className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button 
                onClick={onDelete}
                disabled={isDeleting}
                className="dc-btn-secondary text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2 py-2.5 text-sm"
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
                className="dc-btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
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
                className="dc-btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm"
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