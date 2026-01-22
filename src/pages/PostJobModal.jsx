import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaBriefcase, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaFileAlt,
  FaCalendar,
  FaGlobe,
  FaSpinner
} from 'react-icons/fa';

const PostJobModal = ({ isOpen, onClose, onSubmit, job, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    location_city: '',
    location_country: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    job_type: 'full-time',
    experience_level: 'mid-level',
    required_skills: [],
    skillInput: '',
    is_remote: false,
    application_deadline: ''
  });

  const [loading, setLoading] = useState(false);

  // Initialize form if editing existing job
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        location_city: job.location_city || '',
        location_country: job.location_country || '',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        salary_currency: job.salary_currency || 'USD',
        job_type: job.job_type || 'full-time',
        experience_level: job.experience_level || 'mid-level',
        required_skills: job.required_skills || [],
        skillInput: '',
        is_remote: job.is_remote || false,
        application_deadline: job.application_deadline || ''
      });
    }
  }, [job]);

  if (!isOpen) return null;

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && formData.skillInput.trim()) {
      e.preventDefault();
      if (!formData.required_skills.includes(formData.skillInput.trim())) {
        setFormData({
          ...formData,
          required_skills: [...formData.required_skills, formData.skillInput.trim()],
          skillInput: ''
        });
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      required_skills: formData.required_skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submissionData = {
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        location: `${formData.location_city}, ${formData.location_country}`,
        location_city: formData.location_city,
        location_country: formData.location_country
      };

      await onSubmit(submissionData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center z-20">
          <div>
            <h2 className="text-xl sm:text-2xl font-medium text-gray-900">
              {job ? 'Edit Job' : 'Post New Job'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {job ? 'Update job details' : 'Create a new job listing'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400 w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FaBriefcase className="w-4 h-4" />
                Job Title
              </label>
              <input 
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  City
                </label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  placeholder="e.g. San Francisco"
                  value={formData.location_city}
                  onChange={e => setFormData({...formData, location_city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FaGlobe className="w-4 h-4" />
                  Country
                </label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  placeholder="e.g. United States"
                  value={formData.location_country}
                  onChange={e => setFormData({...formData, location_country: e.target.value})}
                />
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FaDollarSign className="w-4 h-4" />
                  Min Salary
                </label>
                <input 
                  type="number"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  placeholder="e.g. 80000"
                  value={formData.salary_min}
                  onChange={e => setFormData({...formData, salary_min: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FaDollarSign className="w-4 h-4" />
                  Max Salary
                </label>
                <input 
                  type="number"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  placeholder="e.g. 120000"
                  value={formData.salary_max}
                  onChange={e => setFormData({...formData, salary_max: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Currency</label>
                <select 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  value={formData.salary_currency}
                  onChange={e => setFormData({...formData, salary_currency: e.target.value})}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Job Type</label>
                <select 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  value={formData.job_type}
                  onChange={e => setFormData({...formData, job_type: e.target.value})}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Experience Level</label>
                <select 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  value={formData.experience_level}
                  onChange={e => setFormData({...formData, experience_level: e.target.value})}
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid-level">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            {/* Remote Work & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input 
                  type="checkbox"
                  id="is_remote"
                  checked={formData.is_remote}
                  onChange={e => setFormData({...formData, is_remote: e.target.checked})}
                  className="w-4 h-4 text-gray-900 rounded focus:ring-gray-800"
                />
                <label htmlFor="is_remote" className="text-sm font-medium text-gray-700">
                  Remote Position
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FaCalendar className="w-4 h-4" />
                  Application Deadline
                </label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  value={formData.application_deadline}
                  onChange={e => setFormData({...formData, application_deadline: e.target.value})}
                />
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Required Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.required_skills.map(skill => (
                  <span 
                    key={skill} 
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg"
                  >
                    {skill}
                    <button 
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 pl-3 pr-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  placeholder="Type skill and press Enter"
                  value={formData.skillInput}
                  onChange={e => setFormData({...formData, skillInput: e.target.value})}
                  onKeyDown={handleAddSkill}
                />
                <button
                  type="button"
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

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FaFileAlt className="w-4 h-4" />
                Job Description
              </label>
              <textarea 
                required
                rows={6}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                placeholder="Describe the role, responsibilities, requirements, and benefits..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className={`
                    flex-1 py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      <span>{job ? 'Updating...' : 'Posting...'}</span>
                    </>
                  ) : (
                    <>
                      {job ? <FaFileAlt className="w-4 h-4" /> : <FaBriefcase className="w-4 h-4" />}
                      <span>{job ? 'Update Job' : 'Post Job'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJobModal;