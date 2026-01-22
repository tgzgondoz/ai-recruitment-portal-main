import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { documentService } from '../services/documentService';
import { supabase } from '../lib/supabase';
import { 
  FaFileUpload, 
  FaSearch, 
  FaClock, 
  FaRocket, 
  FaSpinner, 
  FaCheckCircle, 
  FaStar,
  FaBriefcase,
  FaChartLine,
  FaUser,
  FaExternalLinkAlt,
  FaPlus
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('applications');

  // Fetch Profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch CV
  const { data: cvRecord } = useQuery({
    queryKey: ['cv', user?.id],
    queryFn: () => documentService.getPrimaryCV(user?.id),
    enabled: !!user?.id
  });

  // Fetch Applications
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['candidate-applications', user?.id],
    queryFn: () => jobService.getCandidateApplications(user?.id),
    enabled: !!user?.id
  });

  // Fetch Recommendations
  const { data: recommendations } = useQuery({
    queryKey: ['recommended-jobs', profile?.skills],
    queryFn: () => jobService.getRecommendedJobs(profile?.skills || []),
    enabled: !!profile?.skills
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setIsUploading(true);
      if (file.size > 5 * 1024 * 1024) throw new Error("File too large (Max 5MB)");

      const { error: profileError } = await supabase
        .from('candidate_profiles')
        .upsert({ 
          id: user.id, 
          full_name: profile?.full_name || user.email.split('@')[0],
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (profileError) {
        console.error("Profile Sync Error:", profileError);
        throw new Error("Could not create profile record: " + profileError.message);
      }

      return await documentService.uploadCV(user.id, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cv', user?.id]);
      queryClient.invalidateQueries(['profile', user?.id]);
      toast.success('CV uploaded successfully');
    },
    onError: (error) => {
      console.error("Dashboard Error:", error);
      toast.error(error.message || 'Upload failed');
    },
    onSettled: () => setIsUploading(false)
  });

  // Calculate Profile Strength
  const calculateStrength = () => {
    let score = 0;
    if (profile?.full_name) score += 20;
    if (profile?.bio) score += 20;
    if (profile?.linkedin_url) score += 20;
    if (profile?.skills?.length >= 3) score += 20;
    if (cvRecord) score += 20; 
    return score;
  };

  const profileStrength = calculateStrength();

  if (profileLoading || appsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gray-900 p-6 md:p-8 lg:p-10 rounded-xl text-white overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Candidate'}!
            </h1>
            <p className="text-gray-300 text-sm md:text-base mb-6">
              You're currently tracking {applications?.length || 0} active applications
            </p>
            <Link 
              to="/jobs" 
              className="bg-white text-gray-900 hover:bg-gray-100 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FaSearch className="w-4 h-4" />
              <span>Browse Jobs</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
              <FaRocket className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              className={`
                px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors
                ${activeTab === 'applications'
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"}
              `}
              onClick={() => setActiveTab('applications')}
            >
              <span className="flex items-center gap-2">
                <FaBriefcase className="w-4 h-4" />
                Applications ({applications?.length || 0})
              </span>
            </button>
            <button
              className={`
                px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors
                ${activeTab === 'recommendations'
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"}
              `}
              onClick={() => setActiveTab('recommendations')}
            >
              <span className="flex items-center gap-2">
                <FaStar className="w-4 h-4" />
                Recommendations ({recommendations?.length || 0})
              </span>
            </button>
          </div>

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {applications?.length > 0 ? (
                applications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <FaBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-6">Start your job search and apply to positions</p>
                  <Link 
                    to="/jobs" 
                    className="bg-gray-900 hover:bg-black text-white inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <FaSearch className="w-4 h-4" />
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations?.length > 0 ? (
                recommendations.slice(0, 4).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : (
                <div className="col-span-full bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <FaStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                  <p className="text-gray-600">
                    {profile?.skills?.length > 0 
                      ? "We're finding jobs that match your skills..." 
                      : "Add skills to your profile to get personalized recommendations"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Strength Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 text-gray-900 rounded-lg">
                <FaChartLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Profile Strength</h3>
                <p className="text-sm text-gray-600">{profileStrength}% complete</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{profileStrength}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500 bg-gray-900"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
            </div>

            <Link 
              to="/profile" 
              className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-lg transition-colors text-center block"
            >
              {profileStrength === 100 ? 'View Profile' : 'Complete Profile'}
            </Link>
          </div>

          {/* CV Upload Card */}
          <div className="bg-gray-900 text-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-800 text-white rounded-lg">
                {isUploading ? (
                  <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  <FaFileUpload className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-medium">Resume</h3>
                <p className="text-sm text-gray-300">
                  {cvRecord ? 'Uploaded' : 'Not uploaded yet'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              {cvRecord ? (
                <div className="flex items-center gap-2 text-gray-300 mb-2">
                  <FaCheckCircle className="w-4 h-4" />
                  <span className="text-sm">Your CV is live</span>
                </div>
              ) : (
                <p className="text-gray-300 text-sm mb-4">
                  Upload your resume to get better recommendations
                </p>
              )}
            </div>

            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-gray-600 transition-colors">
                <span className="text-sm font-medium">
                  {isUploading ? 'Uploading...' : cvRecord ? 'Update Resume' : 'Upload Resume'}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadMutation.mutate(file);
                  }} 
                />
              </div>
            </label>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Applications</span>
                <span className="font-medium text-gray-900">{applications?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Applications</span>
                <span className="font-medium text-gray-900">
                  {applications?.filter(a => ['applied', 'reviewing', 'shortlisted', 'interviewing'].includes(a.status)).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profile Views</span>
                <span className="font-medium text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recommendations</span>
                <span className="font-medium text-gray-900">{recommendations?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Application Card Component
const ApplicationCard = ({ application }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {application.job_listings?.title || 'Position'}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span>{application.job_listings?.company_name || 'Company'}</span>
                <span className="text-gray-300">•</span>
                <span>{application.job_listings?.location_city || 'Location'}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                {application.status}
              </span>
              <span className="text-xs text-gray-500">
                Applied {new Date(application.applied_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* AI Score */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium px-2.5 py-1 rounded bg-gray-100 text-gray-900">
                {application.ats_score || '0'}% Match
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link 
          to={`/applications/${application.id}`}
          className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <FaExternalLinkAlt className="w-3 h-3" />
          <span>View Details</span>
        </Link>
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ job }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors h-full">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 mb-1 truncate">{job.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{job.company_name || 'Company'}</span>
                <span className="text-gray-300">•</span>
                <span>{job.location_city}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
              Match
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {job.description?.substring(0, 100)}...
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap gap-1 mb-4">
            {job.required_skills?.slice(0, 3).map((skill, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded"
              >
                {skill}
              </span>
            ))}
            {job.required_skills?.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-400 text-xs font-medium rounded">
                +{job.required_skills.length - 3}
              </span>
            )}
          </div>

          <Link 
            to={`/jobs/${job.id}`}
            className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 rounded-lg transition-colors text-center block"
          >
            View Job
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;