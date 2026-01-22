import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaUser,
  FaBriefcase,
  FaFileAlt,
  FaUsers,
  FaChartLine,
  FaCog,
  FaBuilding,
  FaBell,
} from "react-icons/fa";
import { cn } from "../../lib/utils";

const Sidebar = ({ closeMobileMenu }) => {
  const { isCandidate, isAgent, isAdmin } = useAuth();

  const candidateLinks = [
    { to: "/dashboard", icon: <FaHome />, label: "Dashboard" },
    { to: "/profile", icon: <FaUser />, label: "My Profile" },
    { to: "/jobs", icon: <FaBriefcase />, label: "Job Explorer" },
    { to: "/applications", icon: <FaFileAlt />, label: "Applications" },
  ];

  const agentLinks = [
    { to: "/dashboard", icon: <FaHome />, label: "Dashboard" },
    { to: "/jobs", icon: <FaBriefcase />, label: "Manage Jobs" },
    { to: "/applications", icon: <FaFileAlt />, label: "Applications" },
    { to: "/candidates", icon: <FaUsers />, label: "Talent Pool" },
    { to: "/companies", icon: <FaBuilding />, label: "Companies" },
    { to: "/analytics", icon: <FaChartLine />, label: "Analytics" },
  ];

  const adminLinks = [
    { to: "/admin/settings", icon: <FaCog />, label: "Settings" },
    { to: "/admin/notifications", icon: <FaBell />, label: "Notifications" },
  ];

  const links = isAgent ? agentLinks : candidateLinks;

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      closeMobileMenu?.();
    }
  };

  return (
    <aside className="w-full h-full bg-white flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            DC
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Dimensions</h2>
            <p className="text-xs text-gray-500 -mt-1">Consultancy</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {isAgent ? "Recruiter Portal" : "Candidate Portal"}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto dc-no-scrollbar">
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Main Menu
          </h3>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                      "hover:bg-gray-50 active:scale-[0.98]",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-brand-primary border-l-4 border-brand-primary"
                        : "text-gray-700"
                    )
                  }
                >
                  <span className={cn(
                    "w-5 h-5 transition-colors",
                    "group-hover:text-brand-primary group-hover:scale-110"
                  )}>
                    {link.icon}
                  </span>
                  <span className="font-medium text-sm">{link.label}</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              Administration
            </h3>
            <ul className="space-y-1">
              {adminLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                        "hover:bg-gray-50 active:scale-[0.98]",
                        isActive
                          ? "bg-gradient-to-r from-purple-50 to-pink-50 text-brand-secondary border-l-4 border-brand-secondary"
                          : "text-gray-700"
                      )
                    }
                  >
                    <span className="w-5 h-5">{link.icon}</span>
                    <span className="font-medium text-sm">{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mobile close button */}
        <div className="md:hidden mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={closeMobileMenu}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium text-sm">Close Menu</span>
          </button>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {isAgent ? "RP" : "CP"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {isAgent ? "Recruiter Access" : "Candidate Access"}
              </p>
              <p className="text-[10px] text-gray-500">Active Session</p>
            </div>
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isAgent ? "bg-brand-secondary" : "bg-brand-success"
            )} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;