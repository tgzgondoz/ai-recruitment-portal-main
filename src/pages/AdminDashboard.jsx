import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import AddAgentModal from './AddAgentModal';

const AdminDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (err) {
      toast.error("Failed to load recruiters");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId, agentName) => {
    if (!window.confirm(`Are you sure you want to remove ${agentName}?`)) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', agentId);
      if (error) throw error;
      toast.success("Agent removed");
      setAgents(agents.filter(a => a.id !== agentId));
    } catch (err) {
      toast.error("Could not delete agent");
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Recruiter Management</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
          >
            <FaPlus /> Add Recruiter
          </button>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium text-gray-900 uppercase tracking-wider">Recruiter Details</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-900 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-gray-500">
                      Loading recruiters...
                    </td>
                  </tr>
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-gray-500">
                      No recruiters found
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center font-medium">
                            {agent.full_name?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{agent.full_name || 'No Name'}</div>
                            <div className="text-sm text-gray-500">{agent.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">
                          {agent.company_name || "Not assigned"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                          ACTIVE
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteAgent(agent.id, agent.full_name)}
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                          title="Delete recruiter"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddAgentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAgents} />
    </div>
  );
};

export default AdminDashboard;