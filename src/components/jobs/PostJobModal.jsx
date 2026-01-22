import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PostJobModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full-time',
    salary_min: '',
    salary_max: '',
    skills_input: '',
    skills_required: []
  });

  const mutation = useMutation({
    mutationFn: (newJob) => jobService.createJob(newJob),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
      toast.success('Job published!');
      onClose();
      setFormData({ title: '', description: '', location: '', job_type: 'full-time', salary_min: '', salary_max: '', skills_input: '', skills_required: [] });
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        
        {/* FIXED HEADER */}
        <div className="shrink-0 px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Create Job Post</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ ...formData, agent_id: user.id });
          }} 
          className="flex-1 overflow-y-auto p-8 space-y-6"
        >
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Job Title</label>
            <input 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</label>
              <input 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Remote or City"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            {/* Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.job_type}
                onChange={e => setFormData({...formData, job_type: e.target.value})}
              >
                <option value="full-time">Full-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
            <textarea 
              required
              rows="5"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Detail the role and expectations..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Min Salary</label>
              <input 
                type="number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.salary_min}
                onChange={e => setFormData({...formData, salary_min: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Max Salary</label>
              <input 
                type="number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.salary_max}
                onChange={e => setFormData({...formData, salary_max: e.target.value})}
              />
            </div>
          </div>
        </form>

        {/* FIXED FOOTER */}
        <div className="shrink-0 p-6 border-t border-gray-100 bg-gray-50/50">
          <button 
            type="submit"
            onClick={(e) => {
              // Manual trigger because button is outside the <form> tags sometimes 
              // but here we can just put it inside the form or use form attribute
              const form = document.querySelector('form');
              form.requestSubmit();
            }}
            disabled={mutation.isPending}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all disabled:opacity-50"
          >
            {mutation.isPending ? 'Publishing...' : 'Publish Job Listing'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostJobModal;