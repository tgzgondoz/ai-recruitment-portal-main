import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { agentService } from '../../services/AgentService';
import { 
  FaUsers, FaBriefcase, FaChartLine, FaBell, FaFilter,
  FaSearch, FaPlus, FaSpinner, FaCircle
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const AgentDashboard = () => {
  const { user } = useAuth();

  // Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['agent-stats', user?.id],
    queryFn: () => agentService.getAgentStats(user?.id),
    enabled: !!user?.id
  });

  // Fetch Applications
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['recent-applications', user?.id],
    queryFn: () => agentService.getRecentApplications(user?.id),
    enabled: !!user?.id
  });

  if (statsLoading || appsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        <p className="text-gray-500 font-medium">Loading your recruitment data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600">Managing talent for {user?.email}</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <FaPlus /> Post New Job
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Apps" value={stats?.totalApplications} icon={<FaUsers />} color="blue" />
        <StatCard title="Pending Review" value={stats?.pendingReviews} icon={<FaBell />} color="yellow" />
        <StatCard title="Interviews" value={stats?.interviewsScheduled} icon={<FaChartLine />} color="purple" />
        <StatCard title="Offers Sent" value={stats?.offersSent} icon={<FaBriefcase />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Recent Applications</h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications?.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{app.candidate_profiles?.user?.full_name}</p>
                        <p className="text-xs text-gray-500">{app.candidate_profiles?.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{app.jobs?.title}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold uppercase px-2 py-1 rounded-full ${getStatusStyle(app.status)}`}>
                        <FaCircle className="text-[6px]" /> {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(app.applied_at))} ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700">
              Browse Talent Pool
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700">
              Active Job Postings
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700">
              Schedule Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'applied': return 'bg-blue-100 text-blue-700';
    case 'interviewing': return 'bg-purple-100 text-purple-700';
    case 'offered': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default AgentDashboard;