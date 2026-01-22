import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  FaBell, 
  FaExchangeAlt, 
  FaSignOutAlt, 
  FaChevronDown, 
  FaBars
} from 'react-icons/fa';

const Navbar = ({ onMenuClick }) => {
  const { user, signOut, isCandidate, userType, switchUserType } = useAuth();
  const navigate = useNavigate();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const table = userType === 'agent' ? 'applications' : 'job_listings';
      const select = userType === 'agent' 
        ? 'id, applied_at, candidate_profiles(full_name), job_listings(title)'
        : 'id, title, created_at, location_city, location_country, salary_min, salary_currency';
      
      const { data } = await supabase
        .from(table)
        .select(select)
        .order(userType === 'agent' ? 'applied_at' : 'created_at', { ascending: false })
        .limit(5);
      setRecentItems(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isNotifOpen) fetchRecent();
  }, [isNotifOpen, userType]);

  return (
    <nav className={`
      sticky top-0 z-40 h-16 bg-white border-b border-gray-200 transition-all duration-300 w-full
      ${scrolled ? 'shadow-sm' : ''}
    `}>
      <div className="w-full px-4 md:px-6 h-full flex justify-between items-center">
        
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          

          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-medium">
              D
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-medium text-gray-900 leading-none">Dimensions</h1>
              <p className="text-xs text-gray-500">Candidate Portal</p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          {/* User type switcher */}
          <button 
            onClick={() => switchUserType(isCandidate ? 'agent' : 'candidate')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
          >
            <span className="text-xs font-medium text-gray-900">
              {userType === 'agent' ? 'Recruiter View' : 'Candidate View'}
            </span>
            <FaExchangeAlt className="text-gray-500 text-xs" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)} 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <FaBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gray-900 rounded-full"></span>
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Recent Updates</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                  ) : recentItems.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No updates</div>
                  ) : (
                    recentItems.map(item => (
                      <div 
                        key={item.id} 
                        className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="text-sm text-gray-900">
                          {userType === 'agent' ? item.candidate_profiles?.full_name : item.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {userType === 'agent' ? item.job_listings?.title : item.location_city}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <FaChevronDown className="text-gray-500 text-sm hidden sm:block" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                <div className="text-xs text-gray-500 mt-1">{userType === 'agent' ? 'Recruiter' : 'Candidate'}</div>
              </div>
              <button 
                onClick={handleSignOut} 
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <FaSignOutAlt size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;