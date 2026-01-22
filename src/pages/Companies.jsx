import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { 
  FaBuilding, 
  FaPlus, 
  FaGlobe, 
  FaArrowRight, 
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaBriefcase,
  FaUsers,
  FaSpinner
} from 'react-icons/fa';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');

  const { data: companies, isLoading, isError } = useQuery({
    queryKey: ['companies-list'],
    queryFn: () => jobService.getCompanies()
  });

  // Filter companies
  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = 
      industryFilter === 'all' || 
      (company.industry || '').toLowerCase() === industryFilter.toLowerCase();
    
    return matchesSearch && matchesIndustry;
  });

  // Get unique industries for filter
  const industries = companies ? 
    [...new Set(companies.map(c => c.industry).filter(Boolean))] : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500">Loading companies...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <FaBuilding className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Unable to load companies</h3>
        <p className="text-gray-600">Please check your connection and try again</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900">Partner Companies</h1>
          <p className="text-gray-600 mt-1">
            Manage {companies?.length || 0} corporate clients and partners
          </p>
        </div>
        
        <button className="bg-gray-900 hover:bg-black text-white flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors">
          <FaPlus className="w-4 h-4" />
          <span>Add New Company</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input 
              type="text"
              placeholder="Search companies..."
              className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all text-sm min-w-[140px]"
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies?.length > 0 ? (
          filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))
        ) : (
          <div className="col-span-full bg-white border border-gray-200 rounded-lg p-8 text-center">
            <FaBuilding className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">
              {companies?.length === 0 
                ? "No companies are currently registered."
                : "No companies match your search criteria."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Company Card Component
const CompanyCard = ({ company }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors h-full flex flex-col">
      {/* Company Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-medium text-lg">
            {company.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{company.name}</h3>
            {company.industry && (
              <p className="text-sm text-gray-600">{company.industry}</p>
            )}
          </div>
        </div>
        
        {company.website && (
          <a 
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Visit website"
          >
            <FaGlobe className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Company Details */}
      <div className="mb-6 space-y-3">
        {company.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
            <span>{company.location}</span>
          </div>
        )}
        
        {company.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {company.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <FaBriefcase className="w-3 h-3 text-gray-900" />
            <span className="text-xs font-medium text-gray-700">Active Jobs</span>
          </div>
          <p className="text-lg font-medium text-gray-900">{company.openJobsCount || 0}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <FaUsers className="w-3 h-3 text-gray-900" />
            <span className="text-xs font-medium text-gray-700">Employees</span>
          </div>
          <p className="text-lg font-medium text-gray-900">
            {company.employee_count ? `${company.employee_count}+` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-colors">
          <span>View Company Details</span>
          <FaArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default Companies;