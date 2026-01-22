import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { 
  FaRocket, 
  FaPlus, 
  FaTimes, 
  FaMagic, 
  FaUser, 
  FaGraduationCap,
  FaBriefcase,
  FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

const CandidateOnboarding = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');

  const profileMutation = useMutation({
    mutationFn: (data) => jobService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('Profile completed successfully!');
      // In a real app, you might redirect here
    },
    onError: () => toast.error('Failed to update profile')
  });

  const addSkill = (e) => {
    e.preventDefault();
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = () => {
    profileMutation.mutate({
      id: user.id,
      skills,
      bio,
      experience,
      education,
      full_name: user.user_metadata?.full_name || user.email.split('@')[0]
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-2",
                step >= 1 ? "bg-brand-primary" : "bg-gray-300"
              )}>
                1
              </div>
              <span className="text-xs font-medium text-gray-600">Skills</span>
            </div>
            
            <div className="flex-1 h-1 mx-4">
              <div className={cn(
                "h-full rounded-full transition-all duration-300",
                step >= 2 ? "bg-brand-primary" : "bg-gray-300"
              )} />
            </div>
            
            <div className="text-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-2",
                step >= 2 ? "bg-brand-primary" : "bg-gray-300"
              )}>
                2
              </div>
              <span className="text-xs font-medium text-gray-600">Experience</span>
            </div>
            
            <div className="flex-1 h-1 mx-4">
              <div className={cn(
                "h-full rounded-full transition-all duration-300",
                step >= 3 ? "bg-brand-primary" : "bg-gray-300"
              )} />
            </div>
            
            <div className="text-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-2",
                step >= 3 ? "bg-brand-primary" : "bg-gray-300"
              )}>
                3
              </div>
              <span className="text-xs font-medium text-gray-600">Complete</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="dc-card p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl text-white mb-4">
              <FaRocket className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {step === 1 && 'Add Your Skills'}
              {step === 2 && 'Tell Us About Yourself'}
              {step === 3 && 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600">
              {step === 1 && 'Add your top skills to get matched with relevant jobs'}
              {step === 2 && 'Share your experience and education background'}
              {step === 3 && 'Review and complete your profile'}
            </p>
          </div>

          {/* Step 1: Skills */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="dc-label flex items-center gap-2">
                  <FaGraduationCap className="w-4 h-4" />
                  Add Your Skills
                </label>
                <form onSubmit={addSkill} className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="e.g., React, Python, Project Management"
                    className="dc-input flex-1"
                  />
                  <button 
                    type="submit"
                    disabled={!currentSkill.trim()}
                    className="dc-btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </form>
                
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span 
                      key={skill} 
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                      <button 
                        onClick={() => removeSkill(skill)}
                        className="hover:text-blue-900"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                {skills.length === 0 && (
                  <p className="text-gray-500 text-sm italic mt-2">
                    Add at least 3 skills for better job matches
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Experience & Bio */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="dc-label flex items-center gap-2">
                  <FaBriefcase className="w-4 h-4" />
                  Professional Summary
                </label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="dc-input h-32"
                  placeholder="Briefly describe your professional background, achievements, and career goals..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="dc-label">Years of Experience</label>
                  <select 
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="dc-input"
                  >
                    <option value="">Select experience</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                
                <div>
                  <label className="dc-label">Highest Education</label>
                  <select 
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="dc-input"
                  >
                    <option value="">Select education</option>
                    <option value="high_school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Profile Ready</p>
                    <p className="text-sm text-green-600">
                      Your profile is complete and ready for job matches
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-600 mb-2">Skills Added</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span 
                        key={skill} 
                        className="px-3 py-1 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {bio && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-600 mb-2">Professional Summary</p>
                    <p className="text-gray-700">{bio}</p>
                  </div>
                )}
                
                {(experience || education) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {experience && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-600 mb-2">Experience</p>
                        <p className="text-gray-700">{experience} years</p>
                      </div>
                    )}
                    
                    {education && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-600 mb-2">Education</p>
                        <p className="text-gray-700">{education}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="dc-btn-secondary flex-1 py-3"
              >
                Back
              </button>
            )}
            
            <button 
              onClick={handleNext}
              disabled={
                (step === 1 && skills.length < 3) ||
                (step === 2 && !bio.trim()) ||
                profileMutation.isPending
              }
              className={cn(
                "flex-1 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all",
                step === 3 
                  ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90"
                  : "dc-btn-primary"
              )}
            >
              {profileMutation.isPending ? (
                <>
                  <FaMagic className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : step === 3 ? (
                <>
                  <FaCheckCircle className="w-4 h-4" />
                  Complete Profile
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateOnboarding;