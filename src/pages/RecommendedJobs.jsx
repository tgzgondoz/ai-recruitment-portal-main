import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { 
  FaBolt, 
  FaArrowRight, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaMoneyBill,
  FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const RecommendedJobs = ({ candidateSkills, maxItems = 3 }) => {
  const { data: recommendations, isLoading, isError } = useQuery({
    queryKey: ['recommended-jobs', candidateSkills],
    queryFn: () => jobService.getRecommendedJobs(candidateSkills),
    enabled: candidateSkills?.length > 0
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FaBolt className="text-amber-500 animate-pulse" />
          <h3 className="font-semibold text-gray-900 text-sm">Loading recommendations...</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(maxItems)].map((_, i) => (
            <div key={i} className="dc-card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !recommendations?.length) {
    return null; // Don't show anything if no recommendations
  }

  const displayedJobs = recommendations.slice(0, maxItems);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-lg">
            <FaBolt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Recommended Jobs</h3>
            <p className="text-sm text-gray-600">Based on your skills and profile</p>
          </div>
        </div>
        {recommendations.length > maxItems && (
          <Link 
            to="/jobs"
            className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium flex items-center gap-1"
          >
            View all
            <FaArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayedJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ job }) => {
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
    <div className="dc-card hover:shadow-md transition-all h-full flex flex-col group">
      {/* Job Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors truncate">
              {job.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {job.company_name || job.company?.name || 'Company'}
            </p>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded flex-shrink-0",
            getJobTypeColor(job.job_type)
          )}>
            {job.job_type || 'Full-time'}
          </span>
        </div>

        {/* Job Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt className="w-3 h-3" />
              {job.location_city || job.location || 'Location'}
            </span>
            {job.salary_min && (
              <span className="flex items-center gap-1">
                <FaMoneyBill className="w-3 h-3" />
                ${job.salary_min.toLocaleString()}+
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Skills Preview */}
      {job.required_skills?.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {job.required_skills.slice(0, 2).map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs font-medium rounded">
                +{job.required_skills.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <Link 
          to={`/jobs/${job.id}`}
          className="dc-btn-secondary w-full text-center flex items-center justify-center gap-2 py-2 text-sm group-hover:bg-brand-primary group-hover:text-white transition-colors"
        >
          <span>View Details</span>
          <FaArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default RecommendedJobs;