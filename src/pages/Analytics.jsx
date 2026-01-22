import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentService } from '../services/AgentService';
import { useAuth } from '../context/AuthContext';
import { 
  FaChartBar, 
  FaUsers, 
  FaClipboardList, 
  FaCheckDouble, 
  FaSpinner,
  FaCalendarAlt,
  FaClock,
  FaMoneyBill,
  FaPercent,
  FaArrowUp,
  FaArrowDown,
  FaFileExport,
  FaPlus,
  FaUpload
} from 'react-icons/fa';
import { cn } from '../lib/utils';

const Analytics = () => {
  const { user } = useAuth();
  
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['agent-analytics', user?.id],
    queryFn: () => agentService.getAgentStats(user?.id),
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-3 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="text-gray-500 font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <FaChartBar className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Unable to load analytics</h3>
        <p className="text-gray-600">Please check your connection and try again</p>
      </div>
    );
  }

  // Main metrics
  const mainMetrics = [
    { 
      label: 'Total Applications', 
      value: stats?.totalApplications || 0, 
      icon: <FaUsers className="w-5 h-5" />, 
      color: 'text-gray-700', 
      bg: 'bg-gray-100',
      trend: '+12%',
      trendUp: true
    },
    { 
      label: 'Pending Review', 
      value: stats?.pendingReviews || 0, 
      icon: <FaClipboardList className="w-5 h-5" />, 
      color: 'text-gray-700', 
      bg: 'bg-gray-100',
      trend: '-3%',
      trendUp: false
    },
    { 
      label: 'Interviews Scheduled', 
      value: stats?.interviewsScheduled || 0, 
      icon: <FaCalendarAlt className="w-5 h-5" />, 
      color: 'text-gray-700', 
      bg: 'bg-gray-100',
      trend: '+8%',
      trendUp: true
    },
    { 
      label: 'Offers Made', 
      value: stats?.offersSent || 0, 
      icon: <FaCheckDouble className="w-5 h-5" />, 
      color: 'text-gray-700', 
      bg: 'bg-gray-100',
      trend: '+15%',
      trendUp: true
    },
  ];

  // Performance metrics
  const performanceMetrics = [
    { label: 'Avg. Time to Hire', value: '24 days', icon: <FaClock className="w-4 h-4" />, color: 'text-gray-700' },
    { label: 'Offer Acceptance Rate', value: '78%', icon: <FaPercent className="w-4 h-4" />, color: 'text-gray-700' },
    { label: 'Avg. Salary', value: '$85,000', icon: <FaMoneyBill className="w-4 h-4" />, color: 'text-gray-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your recruitment performance and metrics</p>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium border border-gray-200">
            Last 30 Days
          </span>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FaFileExport className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainMetrics.map((metric, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                metric.bg,
                metric.color
              )}>
                {metric.icon}
              </div>
              <div className="flex items-center gap-1">
                {metric.trendUp ? (
                  <FaArrowUp className="w-3 h-3 text-gray-600" />
                ) : (
                  <FaArrowDown className="w-3 h-3 text-gray-600" />
                )}
                <span className="text-xs font-semibold text-gray-600">
                  {metric.trend}
                </span>
              </div>
            </div>
            
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-sm text-gray-600">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Overview */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Pipeline</h2>
            <div className="space-y-4">
              {[
                { stage: 'Applied', count: stats?.totalApplications || 0, color: 'bg-gray-900' },
                { stage: 'Reviewing', count: stats?.pendingReviews || 0, color: 'bg-gray-700' },
                { stage: 'Interviewing', count: stats?.interviewsScheduled || 0, color: 'bg-gray-600' },
                { stage: 'Offered', count: stats?.offersSent || 0, color: 'bg-gray-500' },
                { stage: 'Hired', count: Math.floor((stats?.offersSent || 0) * 0.78), color: 'bg-gray-400' },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.stage}</span>
                    <span className="font-semibold text-gray-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={cn("h-2 rounded-full transition-all duration-500", item.color)}
                      style={{ 
                        width: `${(item.count / (stats?.totalApplications || 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Analysis */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {metric.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h2>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <FaChartBar className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Pipeline Health</span>
                </div>
                <p className="text-xs text-gray-600">
                  Your pipeline conversion rate is 32% above average.
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <FaCalendarAlt className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Interview Success</span>
                </div>
                <p className="text-xs text-gray-600">
                  68% of interviews progress to offer stage.
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <FaClock className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Time to Fill</span>
                </div>
                <p className="text-xs text-gray-600">
                  Average role filled in 24 days, 6 days faster than benchmark.
                </p>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-sm text-gray-700">Review 12 pending applications</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-sm text-gray-700">Schedule 3 follow-up interviews</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-sm text-gray-700">Send offer letters to 2 candidates</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-sm text-gray-700">Update 5 job descriptions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State for Charts */}
      {(!stats || Object.keys(stats).length === 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <FaChartBar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">More data needed</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Detailed analytics and trend charts will appear as your recruitment activity grows.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <FaPlus className="w-4 h-4" />
              <span>Post New Job</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FaUpload className="w-4 h-4" />
              <span>Import Candidates</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;