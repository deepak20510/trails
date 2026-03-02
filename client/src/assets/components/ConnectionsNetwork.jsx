import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageCircle,
  MoreVertical,
  X,
  User,
} from "lucide-react";

export default function ConnectionsNetwork() {
  const { theme } = useTheme();
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("connections");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === "find" && searchQuery.length > 2) {
      handleSearch();
    }
  }, [searchQuery, activeTab]);

  const handleSearch = async () => {
    try {
      const res = await ApiService.searchPeople({ query: searchQuery });
      if (res.success) setSearchResults(res.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadConnections(),
        loadSuggestions(),
        loadPendingRequests()
      ]);
    } catch (error) {
      console.error("Failed to load networking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      const res = await ApiService.getMyNetwork();
      if (res.success) setConnections(res.data);
    } catch (error) {
      console.error("Failed to load connections:", error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const res = await ApiService.getNetworkingSuggestions();
      if (res.success) setSuggestions(res.data);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const res = await ApiService.getPendingConnections();
      if (res.success) setPendingRequests(res.data);
    } catch (error) {
      console.error("Failed to load pending requests:", error);
    }
  };

  const handleConnect = async (userId) => {
    try {
      const res = await ApiService.connectUser(userId);
      if (res.success) {
        setSuggestions(prev => prev.filter(u => u.id !== userId));
        setSearchResults(prev => prev.filter(u => u.id !== userId));
        loadPendingRequests();
      }
    } catch (error) {
      console.error("Failed to send connection request:", error);
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      const res = await ApiService.respondToConnection(requestId, status);
      if (res.success) {
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        if (status === "ACCEPTED") loadConnections();
      }
    } catch (error) {
      console.error("Failed to respond to request:", error);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this connection?")) return;
    try {
      const res = await ApiService.removeConnection(userId);
      if (res.success) {
        setConnections(prev => prev.filter(u => u.id !== userId));
        loadSuggestions();
      }
    } catch (error) {
      console.error("Failed to remove connection:", error);
    }
  };

  const filteredConnections = connections.filter(conn => {
    const name = `${conn.firstName || ""} ${conn.lastName || ""}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className={`max-w-6xl mx-auto p-6 ${theme.bg}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${theme.textPrimary} mb-2`}>Network</h1>
        <p className={`${theme.textMuted}`}>Grow your professional network with trainers and institutions</p>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Connections", value: connections.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pending", value: pendingRequests.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Suggestions", value: suggestions.length, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Profile Views", value: "1.2k", icon: Star, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <div key={i} className={`${theme.cardBg} rounded-2xl shadow-sm border ${theme.cardBorder} p-5 transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted} mb-1`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${theme.textPrimary}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className={`${theme.cardBg} rounded-2xl shadow-xl border ${theme.cardBorder} overflow-hidden`}>
        <div className={`flex border-b ${theme.divider} px-4`}>
          {["connections", "suggestions", "pending", "find"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-semibold capitalize transition-all relative ${activeTab === tab
                ? "text-blue-600"
                : `${theme.textMuted} hover:${theme.textPrimary}`
                }`}
            >
              {tab === "find" ? "Find People" : tab}
              {tab === "pending" && pendingRequests.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {pendingRequests.length}
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>


        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`${theme.cardBg} rounded-xl border ${theme.cardBorder} p-5 animate-pulse`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === "connections" && (
                <ConnectionsTab
                  connections={filteredConnections}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onRemove={handleRemove}
                  theme={theme}
                />
              )}
              {activeTab === "suggestions" && (
                <SuggestionsTab
                  suggestions={suggestions}
                  onConnect={handleConnect}
                  theme={theme}
                />
              )}
              {activeTab === "pending" && (
                <PendingRequestsTab
                  requests={pendingRequests}
                  onRespond={handleRespond}
                  theme={theme}
                />
              )}
              {activeTab === "find" && (
                <FindPeopleTab
                  query={searchQuery}
                  setQuery={setSearchQuery}
                  results={searchResults}
                  onConnect={handleConnect}
                  theme={theme}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FindPeopleTab({ query, setQuery, results, onConnect, theme }) {
  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
        <input
          type="text"
          placeholder="Search for trainers, institutions, or students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
        />
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20">
          <Search className={`w-16 h-16 mx-auto mb-4 ${theme.textMuted} opacity-20`} />
          <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Search to find people</h3>
          <p className={`${theme.textMuted}`}>Enter a name or headline to start searching</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              theme={theme}
              action={
                <button
                  onClick={() => onConnect(user.id)}
                  className="w-full mt-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Connect
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectionsTab({ connections, searchTerm, setSearchTerm, onRemove, theme }) {
  if (connections.length === 0 && !searchTerm) {
    return (
      <div className="text-center py-20">
        <Users className={`w-16 h-16 mx-auto mb-4 ${theme.textMuted} opacity-20`} />
        <h3 className={`text-xl font-bold ${theme.textPrimary}`}>No connections yet</h3>
        <p className={`${theme.textMuted}`}>Start growing your network by exploring suggestions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
        <input
          type="text"
          placeholder="Search connections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            theme={theme}
            action={
              <button
                onClick={() => onRemove(user.id)}
                className={`w-full mt-4 py-2 rounded-xl text-sm font-semibold border ${theme.cardBorder} ${theme.textMuted} hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all`}
              >
                Remove
              </button>
            }
          />
        ))}
      </div>
    </div>
  );
}

function SuggestionsTab({ suggestions, onConnect, theme }) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-20">
        <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${theme.textMuted} opacity-20`} />
        <h3 className={`text-xl font-bold ${theme.textPrimary}`}>No suggestions right now</h3>
        <p className={`${theme.textMuted}`}>Check back later for more professional matches</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suggestions.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          theme={theme}
          action={
            <button
              onClick={() => onConnect(user.id)}
              className="w-full mt-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Connect
            </button>
          }
        />
      ))}
    </div>
  );
}

function PendingRequestsTab({ requests, onRespond, theme }) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-20">
        <Clock className={`w-16 h-16 mx-auto mb-4 ${theme.textMuted} opacity-20`} />
        <h3 className={`text-xl font-bold ${theme.textPrimary}`}>No pending requests</h3>
        <p className={`${theme.textMuted}`}>When someone wants to connect, you'll see them here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((request) => (
        <UserCard
          key={request.id}
          user={request.sender}
          theme={theme}
          action={
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onRespond(request.id, "REJECTED")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${theme.cardBorder} ${theme.textMuted} hover:bg-gray-50 transition-all`}
              >
                Ignore
              </button>
              <button
                onClick={() => onRespond(request.id, "ACCEPTED")}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
              >
                Accept
              </button>
            </div>
          }
        />
      ))}
    </div>
  );
}

function UserCard({ user, theme, action }) {
  const profile = user.trainerProfile || user.institutionProfile || user.studentProfile;
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
  const navigate = useNavigate();

  const handleProfileClick = () => {
    const rolePath = user.role.toLowerCase() === "institution" ? "institute" : user.role.toLowerCase();
    navigate(`/${rolePath}/profile/${user.id}`);
  };

  return (
    <div className={`${theme.cardBg} rounded-2xl border ${theme.cardBorder} p-5 hover:shadow-xl transition-all group`}>
      <div className="flex items-start gap-4 cursor-pointer" onClick={handleProfileClick}>
        <div className="relative">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-105 transition-transform">
              {name.charAt(0)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-neutral-800 rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${theme.textPrimary} truncate group-hover:text-blue-500 transition-colors`}>{name}</h4>
          <p className={`text-sm ${theme.textMuted} truncate mb-2`}>{user.headline || profile?.bio || user.role}</p>
          <div className={`flex items-center gap-1.5 text-[11px] font-medium ${theme.textMuted}`}>
            <MapPin className="w-3 h-3" />
            <span>{user.location || profile?.location || "Remote"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dashed border-gray-100 dark:border-neutral-700">
        <div className="flex flex-wrap gap-1.5">
          {(profile?.skills || ["Professional", user.role]).slice(0, 3).map((skill, i) => (
            <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 capitalize`}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {action}
    </div>
  );
}

