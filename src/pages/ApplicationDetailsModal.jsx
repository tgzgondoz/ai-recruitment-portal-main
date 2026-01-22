import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { 
  FaTimes, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaExternalLinkAlt, 
  FaFilePdf, 
  FaLinkedin, 
  FaStickyNote, 
  FaSave, 
  FaSpinner,
  FaDownload,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendar,
  FaUser,
  FaBriefcase,
  FaGraduationCap
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { cn, formatDate } from '../lib/utils';

const ApplicationDetailsModal = ({ application, onClose }) => {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(application?.internal_notes || '');
  const modalRef = useRef(null);
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Sync state if application prop changes
  useEffect(() => {
    setNotes(application?.internal_notes || '');
  }, [application]);

  // Handle click outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const notesMutation = useMutation({
    mutationFn: (newNotes) => jobService.updateApplicationNotes(application.id, newNotes),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-applications']);
      toast.success('Notes updated successfully');
    },
    onError: () => toast.error('Failed to save notes')
  });

  if (!application) return null;

  // ATS Logic
  const candidateSkills = application.candidate?.skills || [];
  const requiredSkills = application.job?.required_skills || [];
  const matchedSkills = requiredSkills.filter(skill => 
    candidateSkills.some(s => s.toLowerCase() === skill.toLowerCase())
  );
  const matchScore = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
    : 0;

  // Calculate match color
  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg md:max-w-2xl bg-white h-[95vh] md:h-full rounded-xl md:rounded-none shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-10 md:slide-in-from-right duration-300 overflow-hidden"
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 md:p-6 flex justify-between items-center z-20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-brand-primary to-brand-secondary text-white rounded-xl flex items-center justify-center font-bold text-lg md:text-xl flex-shrink-0">
              {application.candidate?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {application.candidate?.full_name || 'Candidate'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-500 truncate">{application.job?.title}</p>
                <span className="hidden md:inline text-gray-300">•</span>
                <p className="text-xs text-brand-primary font-medium hidden md:block">
                  {application.job?.location_city}, {application.job?.location_country}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 md:p-3 hover:bg-gray-100 rounded-lg md:rounded-xl transition-colors text-gray-400 flex-shrink-0"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto dc-no-scrollbar p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* ATS Match Score */}
            <div className={cn(
              "dc-card p-4 text-center border-2",
              getMatchColor(matchScore)
            )}>
              <p className="text-xs font-semibold text-gray-600 mb-1">ATS Match</p>
              <p className="text-2xl md:text-3xl font-bold">{matchScore}%</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    matchScore >= 80 ? "bg-green-500" :
                    matchScore >= 60 ? "bg-blue-500" :
                    matchScore >= 40 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>

            {/* Application Status */}
            <div className="dc-card p-4 text-center border-2 border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-1">Status</p>
              <div className="flex items-center justify-center gap-2">
                <span className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-semibold capitalize px-3 py-1 rounded-full",
                  getStatusStyle(application.status)
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {application.status || 'Applied'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Applied {formatDate(application.applied_at)}
              </p>
            </div>
          </div>

          {/* Recruiter Workspace */}
          <div className="dc-card bg-gradient-to-br from-blue-50 to-indigo-50/50 border-2 border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FaStickyNote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Internal Notes</h3>
                  <p className="text-sm text-gray-600">Private feedback and observations</p>
                </div>
              </div>
              {notes !== application.internal_notes && (
                <button 
                  onClick={() => notesMutation.mutate(notes)}
                  disabled={notesMutation.isPending}
                  className="dc-btn-primary flex items-center gap-2 px-4 py-2 text-sm min-w-[80px]"
                >
                  {notesMutation.isPending ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSave className="w-3 h-3" />
                  )}
                  <span>Save</span>
                </button>
              )}
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here... (feedback, salary expectations, interview impressions, etc.)"
              className="dc-input w-full h-32 resize-none"
              rows="4"
            />
          </div>

          {/* Skill Breakdown */}
          <div className="dc-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <FaCheckCircle className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900">Skills Analysis</h3>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Skills Match</span>
                <span className="font-semibold">{matchedSkills.length}/{requiredSkills.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    matchScore >= 80 ? "bg-green-500" :
                    matchScore >= 60 ? "bg-blue-500" :
                    matchScore >= 40 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {requiredSkills.map(skill => {
                const isMatched = matchedSkills.includes(skill);
                return (
                  <div 
                    key={skill} 
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg text-sm",
                      isMatched 
                        ? "bg-green-50 text-green-700 border border-green-100" 
                        : "bg-red-50 text-red-700 border border-red-100"
                    )}
                  >
                    {isMatched ? (
                      <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <FaExclamationCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className="font-medium">{skill}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents Section */}
          <div className="dc-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <FaFilePdf className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-gray-900">Documents</h3>
              </div>
              {application.candidate?.candidate_documents?.length > 0 && (
                <span className="text-xs font-semibold text-brand-primary">
                  {application.candidate.candidate_documents.length} file(s)
                </span>
              )}
            </div>

            {application.candidate?.candidate_documents?.length > 0 ? (
              <div className="space-y-3">
                {application.candidate.candidate_documents.map((doc, index) => (
                  <div 
                    key={doc.id || index}
                    className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all cursor-pointer active:scale-[0.98]"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white border border-gray-300 rounded-lg">
                        <FaFilePdf className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {doc.filename || `Document ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doc.file_type || 'PDF'} • {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <FaExternalLinkAlt className="text-gray-400 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FaFilePdf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No documents attached</p>
                <p className="text-sm text-gray-400 mt-1">Candidate hasn't uploaded any files yet</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button className="dc-card p-3 text-center hover:bg-blue-50 transition-colors active:scale-[0.98] group">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg w-10 h-10 mx-auto mb-2 group-hover:bg-blue-200">
                <FaPhone className="w-4 h-4 mx-auto" />
              </div>
              <span className="text-xs font-medium text-gray-700">Contact</span>
            </button>
            
            <button className="dc-card p-3 text-center hover:bg-green-50 transition-colors active:scale-[0.98] group">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg w-10 h-10 mx-auto mb-2 group-hover:bg-green-200">
                <FaCalendar className="w-4 h-4 mx-auto" />
              </div>
              <span className="text-xs font-medium text-gray-700">Schedule</span>
            </button>
            
            <button className="dc-card p-3 text-center hover:bg-purple-50 transition-colors active:scale-[0.98] group">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg w-10 h-10 mx-auto mb-2 group-hover:bg-purple-200">
                <FaEnvelope className="w-4 h-4 mx-auto" />
              </div>
              <span className="text-xs font-medium text-gray-700">Email</span>
            </button>
            
            <button className="dc-card p-3 text-center hover:bg-amber-50 transition-colors active:scale-[0.98] group">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg w-10 h-10 mx-auto mb-2 group-hover:bg-amber-200">
                <FaDownload className="w-4 h-4 mx-auto" />
              </div>
              <span className="text-xs font-medium text-gray-700">Download</span>
            </button>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => {
                // Action: Move to next stage
                toast.success('Moved to next stage');
              }}
              className="dc-btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <FaCheckCircle className="w-4 h-4" />
              <span>Move to Next Stage</span>
            </button>
            
            <button 
              onClick={onClose}
              className="dc-btn-secondary flex-1 py-3"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Style Helper
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'applied': return 'bg-blue-100 text-blue-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'reviewing': return 'bg-purple-100 text-purple-700';
    case 'shortlisted': return 'bg-indigo-100 text-indigo-700';
    case 'interviewing': return 'bg-pink-100 text-pink-700';
    case 'offered': return 'bg-green-100 text-green-700';
    case 'hired': return 'bg-emerald-100 text-emerald-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default ApplicationDetailsModal;