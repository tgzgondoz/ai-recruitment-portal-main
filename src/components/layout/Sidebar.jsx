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
  FaTimes,
} from "react-icons/fa";

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
  ];

  const links = isAgent ? agentLinks : candidateLinks;

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      closeMobileMenu?.();
    }
  };

  return (
    <aside className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center font-medium">
            D
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-900">Dimensions</h2>
            <p className="text-xs text-gray-500">Candidate Portal</p>
          </div>
        </div>
        <div className="text-xs font-medium text-gray-700">
          {isAgent ? "Recruiter Portal" : "Candidate Portal"}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
            Main Menu
          </h3>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `
                      flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                      hover:bg-gray-50
                      ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'}
                    `
                  }
                >
                  <span className="w-5 h-5">
                    {link.icon}
                  </span>
                  <span className="text-sm">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
              Administration
            </h3>
            <ul className="space-y-1">
              {adminLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `
                        flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                        hover:bg-gray-50
                        ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'}
                      `
                    }
                  >
                    <span className="w-5 h-5">
                      {link.icon}
                    </span>
                    <span className="text-sm">{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="px-3 py-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
              {isAgent ? "R" : "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {isAgent ? "Recruiter" : "Candidate"}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
          </div>
        </div>

        {/* Mobile close button */}
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={closeMobileMenu}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
            <span className="text-sm">Close Menu</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;