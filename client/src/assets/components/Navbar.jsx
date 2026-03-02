import { useState, useRef, useEffect } from "react";
import {
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  BookOpen,
  DollarSign,
  UserPlus,
  BarChart3,
  Search,
  TrendingUp,
  CreditCard,
  Building2,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Star,
  Home,
  Compass,
} from "lucide-react";
import { DASHBOARD_CONFIG, USER_TYPES } from "../../config/dashboardConfig";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";
import MessagingPanel from "../../components/MessagingPanel";
import DiscoveryPanel from "../../components/DiscoveryPanel";

const ICON_MAP = {
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  BookOpen,
  DollarSign,
  UserPlus,
  BarChart3,
  Search,
  TrendingUp,
  CreditCard,
  Building2,
  Home,
};

export default function Navbar({ userType = USER_TYPES.STUDENT }) {
  const config = DASHBOARD_CONFIG[userType];
  const navItems = config.navbar.navItems;
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (iconName) => ICON_MAP[iconName] || Users;

  const handleNavItemClick = (item) => {
    setActiveItem(item.id);
    // Route specific nav items
    if (item.id === "messaging") {
      setShowMessaging(true);
    } else if (item.id === "notifications") {
      setShowNotifications(!showNotifications);
    }
  };

  const handleSearchClick = () => {
    setShowDiscovery(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getProfileRoute = () => {
    if (userType === USER_TYPES.STUDENT) return "/student/profile";
    if (userType === USER_TYPES.TRAINER) return "/trainer/profile";
    return "/institute/profile";
  };

  const getDashboardRoute = () => {
    if (userType === USER_TYPES.STUDENT) return "/student";
    if (userType === USER_TYPES.TRAINER) return "/trainer";
    return "/institute";
  };

  const displayName = user?.name || user?.firstName
    ? `${user.firstName || ""}${user.lastName ? " " + user.lastName : ""}`.trim() || user.name
    : "User";

  const avatarUrl = user?.avatar || user?.profilePicture;

  return (
    <header className={`${theme.navbarBg} shadow-lg sticky top-0 z-50 transition-all duration-300 border-b ${theme.navbarBorder}`}>
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex justify-between items-center gap-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
          onClick={() => navigate(getDashboardRoute())}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="text-white w-5 h-5" />
          </div>
          <h1 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold text-xl tracking-tight">
            Tutroid
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.textMuted} w-4 h-4`} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={handleSearchClick}
            placeholder="Search trainers, courses, institutes..."
            className={`${theme.inputBg} border ${theme.inputBorder} pl-10 pr-4 py-2 rounded-full w-full outline-none text-sm ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 cursor-pointer`}
            readOnly
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {/* Quick Actions - Removed, using navbar items instead */}
          <NotificationBell />

          {/* Nav Items */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const IconComponent = getIcon(item.icon);
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 group min-w-[56px] ${isActive
                      ? `${theme.accentBg}/10 ${theme.accentColor}`
                      : `${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText}`
                    }`}
                >
                  <div className="relative">
                    <IconComponent size={20} />
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className={`w-px h-8 ${theme.divider} mx-2 hidden md:block`}></div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`relative p-2 rounded-full transition-all duration-300 ${isDarkMode
                ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                : "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
              }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <div className="relative w-4 h-4">
              <Sun
                size={16}
                className={`absolute inset-0 transition-all duration-300 ${isDarkMode ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                  }`}
              />
              <Moon
                size={16}
                className={`absolute inset-0 transition-all duration-300 ${isDarkMode ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                  }`}
              />
            </div>
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all duration-300 ${theme.hoverBg} border ${showUserMenu ? theme.cardBorder : "border-transparent"}`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className={`text-xs font-semibold ${theme.textPrimary} leading-tight max-w-[80px] truncate`}>
                  {displayName}
                </p>
                <p className={`text-[10px] ${theme.textMuted} capitalize`}>
                  {userType}
                </p>
              </div>
              <ChevronDown size={14} className={`${theme.textMuted} transition-transform duration-200 hidden md:block ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className={`absolute right-0 top-full mt-2 w-56 ${theme.cardBg} rounded-xl shadow-2xl border ${theme.cardBorder} overflow-hidden z-50`}>
                {/* Profile Banner */}
                <div className={`px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b ${theme.divider}`}>
                  <p className={`font-semibold text-sm ${theme.textPrimary} truncate`}>{displayName}</p>
                  <p className={`text-xs ${theme.textMuted} truncate`}>{user?.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${userType === USER_TYPES.TRAINER ? "bg-indigo-500/20 text-indigo-400" :
                      userType === USER_TYPES.INSTITUTE ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-blue-500/20 text-blue-400"
                    }`}>
                    {userType}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { navigate(getProfileRoute()); setShowUserMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} transition-colors`}
                  >
                    <User size={15} />
                    View Profile
                  </button>
                  <button
                    onClick={() => { navigate(getDashboardRoute()); setShowUserMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} transition-colors`}
                  >
                    <Home size={15} />
                    Dashboard
                  </button>
                  {userType === USER_TYPES.TRAINER && (
                    <button
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} transition-colors`}
                    >
                      <Star size={15} />
                      My Reviews
                    </button>
                  )}
                </div>

                <div className={`border-t ${theme.divider} py-1`}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panels */}
      <MessagingPanel isOpen={showMessaging} onClose={() => setShowMessaging(false)} />
      <DiscoveryPanel isOpen={showDiscovery} onClose={() => setShowDiscovery(false)} />
    </header>
  );
}
