import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaPaperPlane, 
  FaArrowLeft, 
  FaExclamationTriangle, 
  FaSpinner,
  FaClock,
  FaExternalLinkAlt,
  FaShare
} from 'react-icons/fa';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Job Data
  const { data: job, isLoading: jobLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id),
    retry: 1
  });

  // Fetch User Profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => jobService.getProfile(user?.id),
    enabled: !!user?.id
  });

  // Application Mutation
  const applyMutation = useMutation({
    mutationFn: (score) => jobService.applyForJob(id, user.id, score),
    onSuccess: () => {
      toast.success('Application submitted successfully');
      queryClient.invalidateQueries(['candidate-applications']);
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply for job');
    }
  });

  // Calculate Match Score
  const calculateMatch = () => {
    if (!job?.required_skills || !profile?.skills) return { score: 0, missing: [], matches: [] };
    
    const jobSkills = job.required_skills.map(s => s.toLowerCase());
    const userSkills = profile.skills.map(s => s.toLowerCase());
    
    const matches = jobSkills.filter(s => userSkills.includes(s));
    const missing = jobSkills.filter(s => !userSkills.includes(s));
    
    const score = Math.round((matches.length / jobSkills.length) * 100);
    return { score, matches, missing };
  };

  const matchData = calculateMatch();
  const hasApplied = false; // You would check this from user's applications

  if (jobLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500">Loading job details...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <FaExclamationTriangle className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Job not found</h3>
        <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate(-1)}
          className="bg-gray-900 hover:bg-black text-white inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        
        <div className="flex items-center gap-3">
          <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors">
            <FaShare className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors">
            <FaExternalLinkAlt className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Job Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-medium text-gray-900">{job.title}</h1>
              {job.is_remote && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  Remote
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-2">
                <FaBuilding className="w-4 h-4 text-gray-900" />
                {job.company?.name || 'Company'}
              </span>
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-4 h-4 text-gray-900" />
                {job.location}
              </span>
              <span className="flex items-center gap-2">
                <FaClock className="w-4 h-4 text-gray-900" />
                {job.job_type || 'Full-time'}
              </span>
              {job.salary_min && (
                <span className="flex items-center gap-2">
                  <FaMoneyBillWave className="w-4 h-4 text-gray-900" />
                  ${job.salary_min.toLocaleString()}+
                </span>
              )}
            </div>
          </div>
          
          {/* Match Score */}
          <div className="p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-lg text-center min-w-[120px]">
            <p className="text-2xl md:text-3xl font-medium text-gray-900 mb-1">
              {matchData.score}%
            </p>
            <p className="text-xs font-medium text-gray-600">Your Match</p>
          </div>
        </div>

        {/* Quick Apply Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={() => applyMutation.mutate(matchData.score)}
            disabled={applyMutation.isPending || hasApplied}
            className={`
              w-full md:w-auto bg-gray-900 hover:bg-black text-white flex items-center justify-center gap-3 px-8 py-3 text-lg rounded-lg font-medium transition-colors
              ${(applyMutation.isPending || hasApplied) ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {applyMutation.isPending ? (
              <FaSpinner className="animate-spin" />
            ) : hasApplied ? (
              <>
                <FaCheckCircle className="w-5 h-5" />
                <span>Applied</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="w-5 h-5" />
                <span>Apply Now</span>
              </>
            )}
          </button>
          {hasApplied && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              You've already applied to this position
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <FaCheckCircle className="w-5 h-5 text-gray-900 mt-1 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Benefits</h2>
              <ul className="space-y-3">
                {job.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <FaCheckCircle className="w-5 h-5 text-gray-900 mt-1 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills Match Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Skills Match Analysis</h3>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Match Score</span>
                <span className="font-medium">{matchData.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500 bg-gray-900"
                  style={{ width: `${matchData.score}%` }}
                />
              </div>
            </div>

            {matchData.missing.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {matchData.missing.slice(0, 5).map(skill => (
                      <span 
                        key={skill} 
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {matchData.missing.length > 5 && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                        +{matchData.missing.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Consider updating your profile with missing skills
                      </p>
                      <button 
                        onClick={() => navigate('/profile')}
                        className="text-gray-700 hover:text-gray-900 text-sm font-medium mt-1"
                      >
                        Update Profile →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Perfect match! You have all required skills.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Job Details Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Job Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-medium text-gray-900">{job.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Employment Type</p>
                <p className="font-medium text-gray-900">{job.job_type || 'Full-time'}</p>
              </div>
              {job.salary_min && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                  <p className="font-medium text-gray-900">
                    ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString() || 'Competitive'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Posted</p>
                <p className="font-medium text-gray-900">{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          {job.company && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">About the Company</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-medium">
                    {job.company.name?.[0] || 'C'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{job.company.name}</p>
                    <p className="text-sm text-gray-600">{job.company.industry}</p>
                  </div>
                </div>
                {job.company.description && (
                  <p className="text-sm text-gray-600">
                    {job.company.description.substring(0, 120)}...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;