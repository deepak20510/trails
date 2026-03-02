import React, { useState, useEffect } from "react";
import { X, Search, Filter, Star, MapPin, Briefcase, UserPlus, Loader, ChevronDown, Award, TrendingUp } from "lucide-react";
import ApiService from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const DiscoveryPanel = ({ isOpen, onClose }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();

  const [filters, setFilters] = useState({
    role: "",
    skill: "",
    location: "",
    minRating: "",
    minExperience: "",
    maxExperience: "",
    verified: false,
    sort: "rating_desc"
  });

  useEffect(() => {
    if (isOpen) {
      loadSkills();
      performSearch();
    }
  }, [isOpen]);

  const loadSkills = async () => {
    try {
      const response = await ApiService.request("/discovery/skills");
      setSkills(response.data || []);
    } catch (error) {
      console.error("Failed to load skills:", error);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await ApiService.request(`/discovery/search?${params}`);
      setResults(response.data || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      role: "",
      skill: "",
      location: "",
      minRating: "",
      minExperience: "",
      maxExperience: "",
      verified: false,
      sort: "rating_desc"
    });
  };

  const sendConnectionRequest = async (userId) => {
    try {
      await ApiService.connectUser(userId);
      alert("Connection request sent!");
    } catch (error) {
      alert(error.message || "Failed to send connection request");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel - Professional LinkedIn Style */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[900px] ${theme.cardBg} shadow-2xl z-50 overflow-hidden flex flex-col border-l ${theme.cardBorder}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme.cardBorder} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${theme.textPrimary}`}>Discover Professionals</h1>
              <p className={`text-xs ${theme.textMuted}`}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${theme.hoverBg} transition`}
          >
            <X className={`w-5 h-5 ${theme.textSecondary}`} />
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className={`px-6 py-4 border-b ${theme.cardBorder} space-y-3`}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textMuted}`} />
              <input
                type="text"
                placeholder="Search by location, skills, or name..."
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 ${theme.inputBg} border ${theme.inputBorder} rounded-lg ${theme.inputText} ${theme.inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 border ${theme.cardBorder} rounded-lg ${theme.hoverBg} flex items-center gap-2 transition`}
            >
              <Filter className={`w-5 h-5 ${theme.textSecondary}`} />
              <span className={`text-sm font-medium ${theme.textPrimary}`}>Filters</span>
              <ChevronDown className={`w-4 h-4 ${theme.textMuted} transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={performSearch}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm shadow-lg transition"
            >
              Search
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className={`p-4 ${theme.inputBg} rounded-lg border ${theme.cardBorder} space-y-4`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs font-semibold ${theme.textPrimary} mb-2`}>Role Type</label>
                  <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange("role", e.target.value)}
                    className={`w-full px-3 py-2 ${theme.inputBg} border ${theme.inputBorder} rounded-lg text-sm ${theme.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  >
                    <option value="">All Roles</option>
                    <option value="TRAINER">Trainers</option>
                    <option value="INSTITUTION">Institutions</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${theme.textPrimary} mb-2`}>Skill</label>
                  <select
                    value={filters.skill}
                    onChange={(e) => handleFilterChange("skill", e.target.value)}
                    className={`w-full px-3 py-2 ${theme.inputBg} border ${theme.inputBorder} rounded-lg text-sm ${theme.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                    disabled={filters.role === "INSTITUTION"}
                  >
                    <option value="">All Skills</option>
                    {skills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${theme.textPrimary} mb-2`}>Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange("minRating", e.target.value)}
                    className={`w-full px-3 py-2 ${theme.inputBg} border ${theme.inputBorder} rounded-lg text-sm ${theme.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  >
                    <option value="">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${theme.textPrimary} mb-2`}>Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className={`w-full px-3 py-2 ${theme.inputBg} border ${theme.inputBorder} rounded-lg text-sm ${theme.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  >
                    <option value="rating_desc">Highest Rated</option>
                    <option value="experience_desc">Most Experience</option>
                    <option value="newest">Recently Joined</option>
                  </select>
                </div>

                {filters.role === "TRAINER" && (
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => handleFilterChange("verified", e.target.checked)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${theme.textPrimary}`}>Verified Only</span>
                    </label>
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className={`text-sm ${theme.textSecondary} hover:${theme.accentColor} font-medium transition`}
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className={`flex-1 overflow-y-auto ${theme.bg} p-6`}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`${theme.cardBg} rounded-xl p-6 border ${theme.cardBorder} animate-pulse`}>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4" />
                      <div className="h-3 bg-gray-300 rounded w-1/2" />
                      <div className="h-3 bg-gray-300 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className={`${theme.cardBg} rounded-xl border ${theme.cardBorder} p-12 text-center`}>
              <div className={`w-20 h-20 rounded-full ${theme.inputBg} flex items-center justify-center mx-auto mb-4`}>
                <Search className={`w-10 h-10 ${theme.textMuted}`} />
              </div>
              <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-2`}>No results found</h3>
              <p className={`${theme.textMuted}`}>Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(result => (
                <div key={result.id} className={`${theme.cardBg} rounded-xl p-6 border ${theme.cardBorder} hover:shadow-lg transition group`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {result.firstName?.[0]}{result.lastName?.[0]}
                      </div>
                      {result.profile?.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                          <Award className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-base ${theme.textPrimary} truncate mb-1`}>
                        {result.firstName} {result.lastName}
                      </h3>
                      <p className={`text-sm ${theme.textSecondary} truncate mb-2`}>
                        {result.headline || result.role}
                      </p>
                      
                      {result.profile && (
                        <div className="flex items-center gap-3 flex-wrap">
                          {result.profile.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className={`text-sm font-semibold ${theme.textPrimary}`}>
                                {result.profile.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          
                          {result.profile.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className={`w-4 h-4 ${theme.textMuted}`} />
                              <span className={`text-xs ${theme.textSecondary}`}>
                                {result.profile.location}
                              </span>
                            </div>
                          )}

                          {result.profile.experience !== undefined && (
                            <div className="flex items-center gap-1">
                              <Briefcase className={`w-4 h-4 ${theme.textMuted}`} />
                              <span className={`text-xs ${theme.textSecondary}`}>
                                {result.profile.experience}y exp
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {result.profile?.skills && result.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.profile.skills.slice(0, 4).map(skill => (
                        <span key={skill} className={`px-3 py-1 ${theme.inputBg} ${theme.textSecondary} text-xs rounded-full font-medium border ${theme.cardBorder}`}>
                          {skill}
                        </span>
                      ))}
                      {result.profile.skills.length > 4 && (
                        <span className={`px-3 py-1 ${theme.inputBg} ${theme.textMuted} text-xs rounded-full font-medium`}>
                          +{result.profile.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => sendConnectionRequest(result.id)}
                    className="w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-medium text-sm shadow-lg transition group-hover:shadow-xl"
                  >
                    <UserPlus className="w-4 h-4" />
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DiscoveryPanel;
