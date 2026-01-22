import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentService } from '../services/AgentService';
import { 
  FaRobot, 
  FaSearch, 
  FaUser, 
  FaSpinner,
  FaFilter,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';

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
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500">Loading talent pool...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900">Talent Pool</h1>
          <p className="text-gray-600 mt-1">
            Browse and manage all candidates
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg font-medium">
            Total: {applications?.length || 0}
          </div>
          <div className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg font-medium">
            Active: {applications?.filter(a => ['applied', 'reviewing', 'shortlisted', 'interviewing'].includes(a.status)).length || 0}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Candidate List */}
        <div className="lg:w-1/3">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input 
                  type="text" 
                  placeholder="Search candidates..."
                  className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all text-sm min-w-[120px]"
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
              />
            </div>
          </div>

          {/* Candidate List */}
          <div className="bg-white border border-gray-200 rounded-lg max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredCandidates?.length > 0 ? (
              <div className="divide-y divide-gray-200">
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
            <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col items-center justify-center text-center py-12">
              <FaUser className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Candidate</h3>
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
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 cursor-pointer transition-colors hover:bg-gray-50
        ${isSelected ? "bg-gray-100 border-l-4 border-l-gray-900" : ""}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {getInitials(candidate.users?.full_name)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {candidate.users?.full_name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500 truncate">{candidate.users?.email}</p>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-900">
          {score}%
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="flex items-center gap-1 truncate">
          <FaBriefcase className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{candidate.jobs?.title || 'Position'}</span>
        </span>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          {candidate.status}
        </span>
      </div>
    </div>
  );
};

// Candidate Detail Card Component
const CandidateDetailCard = ({ candidate }) => {
  const score = candidate.ats_score || 0;
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xl font-medium">
            {getInitials(candidate.users?.full_name)}
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">{candidate.users?.full_name || 'Candidate'}</h2>
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
          <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm">
            View Full Profile
          </button>
          <button className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors text-sm">
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">ATS Match Score</p>
          <p className="text-2xl font-medium text-gray-900">{score}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className="text-lg font-medium text-gray-900 capitalize">{candidate.status}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Applied</p>
          <p className="text-lg font-medium text-gray-900">
            {new Date(candidate.applied_at).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">AI Analysis</p>
          <div className="flex items-center gap-2">
            <FaRobot className="w-4 h-4 text-gray-600" />
            <span className="text-lg font-medium text-gray-900">Complete</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {candidate.users?.email && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-gray-100 text-gray-900 rounded-lg">
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
              <div className="p-2 bg-gray-100 text-gray-900 rounded-lg">
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
          <h3 className="font-medium text-gray-900 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.users.skills.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg"
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
          <button className="flex-1 py-3 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors">
            Move to Next Stage
          </button>
          <button className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            Download Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default Candidates;