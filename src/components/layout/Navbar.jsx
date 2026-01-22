import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  FaBell, 
  FaExchangeAlt, 
  FaSignOutAlt, 
  FaChevronDown, 
  FaBriefcase, 
  FaUserCircle, 
  FaMapMarkerAlt,
  FaBars
} from 'react-icons/fa';
import { cn } from '../../lib/utils';

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
    <nav className={cn(
      "sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md transition-all duration-300 w-full",
      scrolled ? "shadow-md border-b border-gray-100" : "border-b border-gray-100"
    )}>
      <div className="w-full px-4 md:px-8 h-full flex justify-between items-center">
        
        {/* Left: Mobile Toggle & Mobile Logo */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <FaBars className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 cursor-pointer md:hidden" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">D</div>
            <h1 className="text-lg font-bold text-gray-900">Dimensions</h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* User type switcher */}
          <button 
            onClick={() => switchUserType(isCandidate ? 'agent' : 'candidate')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all group"
          >
            <div className={cn("w-2 h-2 rounded-full", isCandidate ? "bg-green-500" : "bg-blue-500")} />
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{userType}</span>
            <FaExchangeAlt className="text-gray-400 group-hover:text-brand-primary text-[10px]" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              <FaBell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-gray-50 font-bold text-xs uppercase text-gray-500">Recent Updates</div>
                <div className="max-h-64 overflow-y-auto">
                  {recentItems.map(item => (
                    <div key={item.id} className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer text-sm">
                      {userType === 'agent' ? item.candidate_profiles?.full_name : item.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative group">
            <button className="flex items-center gap-2 p-1 border border-transparent hover:border-gray-200 rounded-full transition-all">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <FaChevronDown className="text-gray-400 text-[10px] hidden md:block" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all">
              <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl flex items-center gap-2">
                <FaSignOutAlt size={12} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;