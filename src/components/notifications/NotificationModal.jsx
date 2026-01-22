import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Briefcase, User } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose, isAgent }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchRecentActivity();
  }, [isOpen]);

  const fetchRecentActivity = async () => {
    setLoading(true);
    if (isAgent) {
      // Fetch last 5 applications for Agent
      const { data } = await supabase
        .from('applications')
        .select(`
          id, 
          applied_at,
          candidate_profiles(full_name),
          job_listings(title)
        `)
        .order('applied_at', { ascending: false })
        .limit(5);
      setItems(data || []);
    } else {
      // Fetch last 5 jobs for Candidate
      const { data } = await supabase
        .from('job_listings')
        .select('id, title, created_at, companies(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      setItems(data || []);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-[100] overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Recent Activity</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">×</button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer last:border-b-0">
              <div className="flex gap-3">
                <div className="mt-1">
                  {isAgent ? (
                    <User size={16} className="text-gray-600" />
                  ) : (
                    <Briefcase size={16} className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {isAgent ? item.candidate_profiles?.full_name : item.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isAgent ? `Applied for ${item.job_listings?.title}` : `New opening at ${item.companies?.name || 'Partner'}`}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-300 mb-2">
              <Briefcase size={32} className="mx-auto" />
            </div>
            <p className="text-sm text-gray-400">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;