import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../services/jobService';
import { FaTimes, FaLinkedin, FaEnvelope, FaStickyNote, FaCheckCircle, FaBriefcase, FaCode } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CandidateDetail = ({ isOpen, onClose, application }) => {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (application) setNote(application.internal_notes || '');
  }, [application]);

  const noteMutation = useMutation({
    mutationFn: () => jobService.updateInternalNotes(application.id, note),
    onSuccess: () => {
      queryClient.invalidateQueries(['applications']);
      toast.success('Notes Synced');
    }
  });

  if (!isOpen || !application) return null;
  const { candidate, auth_user, job } = application;

  // Verification Logic
  const isVerified = candidate?.linkedin_url && candidate?.skills?.length >= 3 && candidate?.bio?.length > 50;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-8 border-b bg-gray-50/50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-black text-gray-900">{candidate?.full_name || 'Incomplete Profile'}</h2>
                {isVerified ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-black uppercase bg-green-50 px-2 py-1 rounded-md border border-green-100">
                    <FaCheckCircle size={10} /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-black uppercase bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Basic</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="text-xs text-gray-500 font-bold flex items-center gap-1"><FaEnvelope size={10}/> {auth_user?.email}</span>
                {candidate?.linkedin_url && (
                  <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] text-white font-black bg-[#0077b5] px-3 py-1 rounded-lg hover:bg-[#005a87]">
                    <FaLinkedin size={10} /> LINKEDIN
                  </a>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-400"><FaTimes /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Applying For</p>
              <p className="text-sm font-bold text-blue-600">{job?.title}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
              <p className="text-sm font-bold text-gray-800 uppercase">{application.status}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FaBriefcase className="text-blue-500"/> Headline & Bio
            </h3>
            <p className="text-lg font-bold text-gray-800 leading-tight">{candidate?.headline || "No headline provided"}</p>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">{candidate?.bio || "No bio provided"}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FaCode className="text-blue-500"/> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate?.skills?.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FaStickyNote className="text-yellow-500"/> Private Notes
            </h3>
            <textarea 
              className="w-full p-4 bg-yellow-50/30 border-2 border-yellow-100 rounded-2xl text-sm h-32 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
              placeholder="Jot down interview thoughts..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button 
              onClick={() => noteMutation.mutate()}
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              {noteMutation.isPending ? 'Saving...' : 'Update Notes'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;