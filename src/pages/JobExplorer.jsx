import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../services/candidateService';
import { useAuth } from '../context/AuthContext';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaRobot, 
  FaSpinner,
  FaFilter,
  FaClock,
  FaMoneyBill,
  FaBuilding,
  FaChevronRight
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

const JobExplorer = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: 'all',
    salaryRange: 'all'
  });

  // Fetch Open Jobs
  const { data: jobs, isLoading, isError } = useQuery({
    queryKey: ['open-jobs', filters],
    queryFn: candidateService.getAllJobs
  });

  // Fetch Candidate Profile
  const { data: profile } = useQuery({
    queryKey: ['candidate-profile', user?.id],
    queryFn: () => candidateService.getCandidateProfile(user?.id),
    enabled: !!user?.id
  });

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: (jobId) => {
      const primaryDoc = profile?.candidate_documents?.find(d => d.is_primary) || profile?.candidate_documents?.[0];
      if (!primaryDoc) throw new Error("Please upload a resume in your profile first.");
      return candidateService.applyToJob(user.id, jobId, primaryDoc.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidate-applications']);
      toast.success('Application submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply for job');
    }
  });

  // Filter jobs
  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = 
      !filters.location || 
      (job.location_city || '').toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesJobType = 
      filters.jobType === 'all' || 
      job.job_type === filters.jobType;
    
    return matchesSearch && matchesLocation && matchesJobType;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-brand-light rounded-full"></div>
          <div className="w-12 h-12 border-3 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500 font-medium">Finding opportunities for you...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <FaRobot className="w-12 h-12 text-red-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Unable to load jobs</h3>
        <p className="text-gray-600">Please check your connection and try again</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Find Your Next <span className="text-brand-primary">Opportunity</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover jobs that match your skills and career goals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="dc-card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input 
              type="text"
              placeholder="Search jobs, companies, or skills..."
              className="dc-input pl-10 pr-4 py-2.5 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input 
                type="text"
                placeholder="Location"
                className="dc-input pl-10 pr-4 py-2.5 min-w-[180px]"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />
            </div>
            
            <select 
              className="dc-input py-2.5 min-w-[140px]"
              value={filters.jobType}
              onChange={(e) => setFilters({...filters, jobType: e.target.value})}
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing <span className="font-semibold">{filteredJobs?.length || 0}</span> jobs
          </span>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilters({ location: '', jobType: 'all', salaryRange: 'all' });
            }}
            className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs?.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onApply={() => applyMutation.mutate(job.id)}
              isApplying={applyMutation.isPending}
              hasResume={!!profile?.candidate_documents?.length}
            />
          ))
        ) : (
          <div className="col-span-full dc-card text-center py-12">
            <FaBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {jobs?.length === 0 
                ? "No jobs are currently available. Check back later!"
                : "No jobs match your current filters. Try adjusting your search."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ job, onApply, isApplying, hasResume }) => {
  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return 'bg-blue-100 text-blue-700';
      case 'part-time': return 'bg-green-100 text-green-700';
      case 'contract': return 'bg-purple-100 text-purple-700';
      case 'remote': return 'bg-amber-100 text-amber-700';
      case 'internship': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="dc-card hover:shadow-md transition-all h-full flex flex-col">
      {/* Job Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{job.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FaBuilding className="w-3 h-3" />
                {job.company_name || 'Company'}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {job.location_city || 'Location'}
              </span>
            </div>
          </div>
          <span className={cn(
            "text-xs font-medium px-2.5 py-1 rounded",
            getJobTypeColor(job.job_type)
          )}>
            {job.job_type || 'Full-time'}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {job.description?.substring(0, 120)}...
        </p>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-gray-600">
            <FaClock className="w-3 h-3" />
            {job.experience_level || 'Not specified'}
          </span>
          {job.salary_min && (
            <span className="flex items-center gap-1.5 font-semibold text-green-600">
              <FaMoneyBill className="w-3 h-3" />
              ${job.salary_min.toLocaleString()}+
            </span>
          )}
        </div>
      </div>

      {/* Skills Preview */}
      {job.required_skills?.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-1">
            {job.required_skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs font-medium rounded">
                +{job.required_skills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onApply}
            disabled={isApplying || !hasResume}
            className={cn(
              "dc-btn-primary flex-1 py-2.5 text-sm",
              (!hasResume || isApplying) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isApplying ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                <span>Applying...</span>
              </div>
            ) : !hasResume ? (
              <span>Upload Resume First</span>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaChevronRight className="w-3 h-3" />
                <span>Quick Apply</span>
              </div>
            )}
          </button>
          
          <button className="dc-btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm">
            <FaRobot className="w-3 h-3" />
            <span className="hidden sm:inline">AI Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobExplorer;