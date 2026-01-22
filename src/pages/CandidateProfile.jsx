import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import { documentService } from '../services/documentService';
import { 
  FaTimes, FaSave, FaSpinner, FaCloudUploadAlt, 
  FaFilePdf, FaCheckCircle, FaTrashAlt,
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaPen
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const CandidateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', 
    headline: '', 
    bio: '', 
    skills: [], 
    skillInput: '',
    location: '',
    phone: '',
    linkedin_url: ''
  });

  // Fetch Profile Data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => jobService.getProfile(user.id),
    enabled: !!user?.id
  });

  // Fetch CV Record
  const { data: cvRecord, refetch: refetchCV } = useQuery({
    queryKey: ['cv', user?.id],
    queryFn: () => documentService.getPrimaryCV(user.id),
    enabled: !!user?.id
  });

  // Initialize form data
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({ 
        ...prev, 
        ...profile, 
        skillInput: '',
        skills: profile.skills || []
      }));
    }
  }, [profile]);

  // Save Profile Mutation
  const profileMutation = useMutation({
    mutationFn: (data) => jobService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to update profile')
  });

  // Handle CV Upload
  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      setUploading(true);
      await documentService.uploadCV(user.id, file);
      toast.success('CV uploaded successfully');
      refetchCV();
      queryClient.invalidateQueries(['cv', user?.id]);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // Handle Delete CV
  const handleDeleteCV = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;

    try {
      setUploading(true);
      const filePath = cvRecord.file_url?.split('/').pop();
      if (filePath) {
        await documentService.deleteCV(user.id, filePath);
      }
      toast.success('Resume removed');
      refetchCV();
      queryClient.invalidateQueries(['cv', user?.id]);
    } catch (err) {
      toast.error('Failed to delete resume');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && formData.skillInput.trim()) {
      e.preventDefault();
      const newSkill = formData.skillInput.trim();
      if (!formData.skills.includes(newSkill)) {
        setFormData({ 
          ...formData, 
          skills: [...formData.skills, newSkill], 
          skillInput: '' 
        });
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = () => {
    const dataToSubmit = {
      id: user.id,
      full_name: formData.full_name,
      headline: formData.headline,
      bio: formData.bio,
      skills: formData.skills,
      location: formData.location,
      phone: formData.phone,
      linkedin_url: formData.linkedin_url
    };
    profileMutation.mutate(dataToSubmit);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your professional information</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={profileMutation.isPending}
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {profileMutation.isPending ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaSave className="w-4 h-4" />
          )}
          <span>Save Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-900 text-white rounded-lg flex items-center justify-center text-2xl font-medium">
                {formData.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  className="text-2xl font-medium text-gray-900 w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  value={formData.full_name || ''}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Your Full Name"
                />
                <input
                  className="text-sm text-gray-600 font-medium w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 mt-1"
                  value={formData.headline || ''}
                  onChange={e => setFormData({...formData, headline: e.target.value})}
                  placeholder="Professional Headline"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
                <input
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  value={formData.location || ''}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                <input
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  value={formData.phone || ''}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 (123) 456-7890"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">LinkedIn Profile</label>
              <input
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                value={formData.linkedin_url || ''}
                onChange={e => setFormData({...formData, linkedin_url: e.target.value})}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Professional Bio</label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all h-40"
                value={formData.bio || ''}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about your experience, skills, and career goals..."
                rows={5}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Skills & CV */}
        <div className="space-y-6">
          {/* Skills Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-100 text-gray-900 rounded-lg">
                <FaGraduationCap className="w-4 h-4" />
              </div>
              <h3 className="font-medium text-gray-900">Skills</h3>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills?.map(skill => (
                  <span 
                    key={skill} 
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-900 text-sm rounded-lg"
                  >
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all pr-10"
                  placeholder="Type skill and press Enter"
                  value={formData.skillInput}
                  onChange={e => setFormData({...formData, skillInput: e.target.value})}
                  onKeyDown={handleAddSkill}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (formData.skillInput.trim()) {
                      handleAddSkill({ key: 'Enter', preventDefault: () => {} });
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-4 h-4 rotate-45" />
                </button>
              </div>
            </div>
          </div>

          {/* CV Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 text-gray-900 rounded-lg">
                  <FaFilePdf className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-gray-900">Resume / CV</h3>
              </div>
              {cvRecord && (
                <button
                  onClick={handleDeleteCV}
                  disabled={uploading}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Delete resume"
                >
                  <FaTrashAlt className="w-4 h-4" />
                </button>
              )}
            </div>

            {cvRecord ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="w-4 h-4 text-gray-900" />
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {cvRecord.file_name || 'Resume.pdf'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Uploaded</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg mb-4">
                <FaCloudUploadAlt className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600 mb-2">No resume uploaded</p>
                <p className="text-xs text-gray-500">Upload a PDF to get AI analysis</p>
              </div>
            )}

            <label className="block">
              <div className={`
                w-full px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-center cursor-pointer transition-colors
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                <div className="flex items-center justify-center gap-2">
                  {uploading ? (
                    <FaSpinner className="animate-spin" />
                  ) : cvRecord ? (
                    <>
                      <FaCloudUploadAlt className="w-4 h-4" />
                      <span>Update Resume</span>
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt className="w-4 h-4" />
                      <span>Upload Resume</span>
                    </>
                  )}
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleCVUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Profile Completion */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Profile Completion</h3>
            <div className="space-y-3">
              {[
                { label: 'Full Name', completed: !!formData.full_name },
                { label: 'Headline', completed: !!formData.headline },
                { label: 'Bio', completed: !!formData.bio },
                { label: 'Skills', completed: formData.skills?.length >= 3 },
                { label: 'Resume', completed: !!cvRecord },
                { label: 'Contact Info', completed: !!formData.location || !!formData.phone },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center
                    ${item.completed ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}
                  `}>
                    {item.completed ? (
                      <FaCheckCircle className="w-3 h-3" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;