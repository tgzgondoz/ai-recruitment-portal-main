import React, { useState, useEffect } from 'react';
import { FaUserShield, FaPlus, FaTrashAlt, FaBuilding, FaEnvelope, FaUserTie } from 'react-icons/fa';
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
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Control</h1>
          <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">RecruitAI Workforce Management</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <FaPlus /> ADD RECRUITER
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] uppercase font-black text-gray-400 tracking-tighter">Recruiter Details</th>
              <th className="px-8 py-5 text-[10px] uppercase font-black text-gray-400 tracking-tighter">Company Association</th>
              <th className="px-8 py-5 text-[10px] uppercase font-black text-gray-400 tracking-tighter">Status</th>
              <th className="px-8 py-5 text-right text-[10px] uppercase font-black text-gray-400 tracking-tighter">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan="4" className="py-20 text-center text-gray-400 font-bold">Loading Data...</td></tr>
            ) : agents.length === 0 ? (
               <tr><td colSpan="4" className="py-20 text-center text-gray-400 font-bold uppercase text-xs">No active recruiters found</td></tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-lg">
                        {agent.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-900">{agent.full_name}</div>
                        <div className="text-xs text-gray-500 font-medium">{agent.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-900 font-black">
                      <FaBuilding className="text-blue-500" size={12} />
                      {agent.company_name || "UNASSIGNED"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg">ACTIVE</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => handleDeleteAgent(agent.id, agent.full_name)} className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <FaTrashAlt size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddAgentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAgents} />
    </div>
  );
};

export default AdminDashboard;