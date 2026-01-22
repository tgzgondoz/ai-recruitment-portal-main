import { 
  FaTimes, 
  FaFilePdf, 
  FaEnvelope, 
  FaLinkedin, 
  FaCheck, 
  FaTimesCircle, 
  FaClock,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaCalendar
} from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../services/jobService';
import toast from 'react-hot-toast';
import { cn, formatDate, getInitials } from '../lib/utils';

const CandidateDetail = ({ isOpen, onClose, application }) => {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (newStatus) => jobService.updateApplicationStatus(application.id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries(['applications']);
      toast.success('Application status updated');
      onClose();
    },
    onError: (err) => toast.error(err.message)
  });

  if (!isOpen || !application) return null;

  const statuses = [
    { label: 'Applied', value: 'applied', color: 'bg-blue-500', icon: <FaClock className="w-3 h-3" /> },
    { label: 'Reviewing', value: 'reviewing', color: 'bg-purple-500', icon: <FaEnvelope className="w-3 h-3" /> },
    { label: 'Shortlisted', value: 'shortlisted', color: 'bg-indigo-500', icon: <FaCheck className="w-3 h-3" /> },
    { label: 'Interviewing', value: 'interviewing', color: 'bg-pink-500', icon: <FaCalendar className="w-3 h-3" /> },
    { label: 'Offered', value: 'offered', color: 'bg-green-500', icon: <FaBriefcase className="w-3 h-3" /> },
    { label: 'Hired', value: 'hired', color: 'bg-emerald-500', icon: <FaCheck className="w-3 h-3" /> },
    { label: 'Rejected', value: 'rejected', color: 'bg-red-500', icon: <FaTimesCircle className="w-3 h-3" /> },
  ];

  const currentStatus = statuses.find(s => s.value === application.status) || statuses[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        className="relative w-full max-w-lg md:max-w-xl bg-white h-[95vh] md:h-full rounded-xl md:rounded-none shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-10 md:slide-in-from-right duration-300 overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 md:p-6 flex justify-between items-center z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
              {getInitials(application.candidate?.full_name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                {application.candidate?.full_name || 'Candidate'}
              </h2>
              <p className="text-sm text-brand-primary font-medium truncate">
                {application.job?.title || 'Position'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 flex-shrink-0"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto dc-no-scrollbar p-4 md:p-6 space-y-6">
          {/* Current Status */}
          <div className="dc-card">
            <h3 className="font-semibold text-gray-900 mb-4">Current Status</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg text-white",
                  currentStatus.color
                )}>
                  {currentStatus.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{currentStatus.label}</p>
                  <p className="text-sm text-gray-500">
                    Applied {formatDate(application.applied_at)}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                ATS Score: <span className="font-semibold text-gray-900">{application.ats_score || '0'}%</span>
              </span>
            </div>
          </div>

          {/* Status Actions */}
          <div className="dc-card">
            <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => statusMutation.mutate(status.value)}
                  disabled={application.status === status.value || statusMutation.isPending}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
                    application.status === status.value
                      ? 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-brand-primary hover:shadow-sm'
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg mb-2",
                    status.color
                  )}>
                    {status.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{status.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="dc-card">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a 
                href={`mailto:${application.candidate?.email}`}
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600">
                  <FaEnvelope className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{application.candidate?.email}</p>
                  <p className="text-xs text-gray-500">Email</p>
                </div>
              </a>

              {application.candidate?.linkedin_url && (
                <a 
                  href={application.candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600">
                    <FaLinkedin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">LinkedIn Profile</p>
                    <p className="text-xs text-gray-500">View Profile</p>
                  </div>
                </a>
              )}

              {application.candidate?.phone && (
                <a 
                  href={`tel:${application.candidate.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600">
                    <FaPhone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{application.candidate.phone}</p>
                    <p className="text-xs text-gray-500">Phone</p>
                  </div>
                </a>
              )}

              {application.candidate?.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                    <FaMapMarkerAlt className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{application.candidate.location}</p>
                    <p className="text-xs text-gray-500">Location</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {application.candidate?.skills?.length > 0 && (
            <div className="dc-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <FaGraduationCap className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-gray-900">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {application.candidate.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {application.candidate?.candidate_documents?.length > 0 && (
            <div className="dc-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <FaFilePdf className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Documents</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {application.candidate.candidate_documents.length} file(s)
                </span>
              </div>
              
              <div className="space-y-3">
                {application.candidate.candidate_documents.map((doc, index) => (
                  <a
                    key={doc.id || index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white border border-gray-300 rounded-lg">
                        <FaFilePdf className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {doc.filename || `Document ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">PDF • {formatDate(doc.uploaded_at)}</p>
                      </div>
                    </div>
                    <FaExternalLinkAlt className="text-gray-400 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClose}
              className="dc-btn-secondary flex-1 py-3"
            >
              Close
            </button>
            <button 
              onClick={() => {
                // Navigate to full application details
                console.log('View full application');
              }}
              className="dc-btn-primary flex-1 py-3"
            >
              View Full Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;