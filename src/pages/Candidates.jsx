import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentService } from '../services/AgentService';
import { 
  FaRobot, 
  FaSearch, 
  FaUser, 
  FaCheckCircle, 
  FaSpinner,
  FaFilter,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';
import { cn, formatDate, getInitials } from '../lib/utils';

const Candidates = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState(0);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['agent-candidates'],
    queryFn: () => agentService.getRecentApplications()
  });

  // Filter candidates
  const filteredCandidates = applications?.filter(app => {
    const matchesSearch = 
      (app.users?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.users?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.jobs?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      app.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesScore = (app.ats_score || 0) >= scoreFilter;
    
    return matchesSearch && matchesStatus && matchesScore;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-brand-light rounded-full"></div>
          <div className="w-12 h-12 border-3 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500 font-medium">Loading talent pool...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Talent Pool</h1>
          <p className="text-gray-600 mt-1">
            Browse and manage all candidates
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
            Total: {applications?.length || 0}
          </div>
          <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium">
            Active: {applications?.filter(a => ['applied', 'reviewing', 'shortlisted', 'interviewing'].includes(a.status)).length || 0}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Candidate List */}
        <div className="lg:w-1/3">
          <div className="dc-card mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input 
                  type="text" 
                  placeholder="Search candidates..."
                  className="dc-input pl-10 pr-4 py-2.5 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="dc-input py-2.5 text-sm min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="applied">Applied</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Score Filter */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Minimum ATS Score: {scoreFilter}%</span>
                <span className="text-xs text-gray-500">{scoreFilter}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="10"
                value={scoreFilter}
                onChange={(e) => setScoreFilter(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
            </div>
          </div>

          {/* Candidate List */}
          <div className="dc-card max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredCandidates?.length > 0 ? (
              <div className="space-y-2">
                {filteredCandidates.map((app) => (
                  <CandidateListItem 
                    key={app.id}
                    candidate={app}
                    isSelected={selectedCandidate?.id === app.id}
                    onClick={() => setSelectedCandidate(app)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No candidates found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Candidate Detail */}
        <div className="lg:flex-1">
          {selectedCandidate ? (
            <CandidateDetailCard candidate={selectedCandidate} />
          ) : (
            <div className="dc-card h-full flex flex-col items-center justify-center text-center py-12">
              <FaUser className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Candidate</h3>
              <p className="text-gray-600">Choose a candidate from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Candidate List Item Component
const CandidateListItem = ({ candidate, isSelected, onClick }) => {
  const score = candidate.ats_score || 0;
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
        isSelected && "bg-blue-50 border-l-4 border-l-brand-primary"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(candidate.users?.full_name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {candidate.users?.full_name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500 truncate">{candidate.users?.email}</p>
          </div>
        </div>
        <div className={cn(
          "px-2 py-1 rounded text-xs font-semibold",
          getScoreColor(score)
        )}>
          {score}%
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="flex items-center gap-1 truncate">
          <FaBriefcase className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{candidate.jobs?.title || 'Position'}</span>
        </span>
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          getStatusStyle(candidate.status)
        )}>
          {candidate.status}
        </span>
      </div>
    </div>
  );
};

// Candidate Detail Card Component
const CandidateDetailCard = ({ candidate }) => {
  const score = candidate.ats_score || 0;

  return (
    <div className="dc-card">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center text-white text-xl font-bold">
            {getInitials(candidate.users?.full_name)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{candidate.users?.full_name || 'Candidate'}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1">
                <FaBriefcase className="w-3 h-3" />
                {candidate.jobs?.title || 'Position'}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                {candidate.users?.location || 'Location not specified'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="dc-btn-secondary px-4 py-2 text-sm">
            View Full Profile
          </button>
          <button className="dc-btn-primary px-4 py-2 text-sm">
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">ATS Match Score</p>
          <p className="text-2xl font-bold text-blue-700">{score}%</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className="text-lg font-bold text-green-700 capitalize">{candidate.status}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Applied</p>
          <p className="text-lg font-bold text-purple-700">
            {formatDate(candidate.applied_at)}
          </p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">AI Analysis</p>
          <div className="flex items-center gap-2">
            <FaRobot className="w-4 h-4 text-amber-600" />
            <span className="text-lg font-bold text-amber-700">Complete</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {candidate.users?.email && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                <FaEnvelope className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{candidate.users.email}</p>
                <p className="text-xs text-gray-500">Email</p>
              </div>
            </div>
          )}
          
          {candidate.users?.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                <FaPhone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{candidate.users.phone}</p>
                <p className="text-xs text-gray-500">Phone</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      {candidate.users?.skills?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.users.skills.map((skill, index) => (
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

      {/* Actions */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="dc-btn-primary flex-1 py-3">
            Move to Next Stage
          </button>
          <button className="dc-btn-secondary flex-1 py-3">
            Download Resume
          </button>
        </div>
      </div>
    </div>
  );
};

// Status Style Helper
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'applied': return 'bg-blue-100 text-blue-700';
    case 'reviewing': return 'bg-purple-100 text-purple-700';
    case 'shortlisted': return 'bg-indigo-100 text-indigo-700';
    case 'interviewing': return 'bg-pink-100 text-pink-700';
    case 'offered': return 'bg-green-100 text-green-700';
    case 'hired': return 'bg-emerald-100 text-emerald-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default Candidates;