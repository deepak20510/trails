import { useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { X, Camera, Upload, User, Briefcase, MapPin, GraduationCap, Building2 } from "lucide-react";
import ApiService from "../../services/api";

export default function EditProfileModal({ isOpen, onClose, userType, profileData, onSave }) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState(profileData);
  const [profilePreview, setProfilePreview] = useState(profileData.avatar || null);
  const [coverPreview, setCoverPreview] = useState(profileData.coverImage || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "profile") {
          setProfilePreview(reader.result);
          setFormData((prev) => ({ ...prev, avatar: reader.result }));
        } else {
          setCoverPreview(reader.result);
          setFormData((prev) => ({ ...prev, coverImage: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Split name for backend
      let firstName = formData.name;
      let lastName = "";

      if (!isInstitute && formData.name.includes(" ")) {
        const parts = formData.name.split(" ");
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      }

      // Call API to save profile (using general endpoint)
      const response = await ApiService.updateGeneralProfile({
        ...formData,
        firstName,
        lastName,
        profilePicture: formData.avatar, // map for backend
      });

      if (response.success) {
        onSave(response.data);
        onClose();
      } else {
        setError(response.message || "Failed to save profile");
      }

    } catch (err) {
      setError(err.message || "Failed to save profile. Please try again.");
      console.error("Profile save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isStudent = userType === "student";
  const isTrainer = userType === "trainer";
  const isInstitute = userType === "institute";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border ${theme.cardBorder} ${theme.cardBg} transition-all duration-300`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${theme.divider} ${theme.cardBg}`}
        >
          <h2 className={`text-xl font-bold ${theme.textPrimary}`}>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${theme.hoverBg} ${theme.hoverText} transition-all duration-300`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Photo Upload Section */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>
              Photos
            </h3>

            {/* Cover Photo Upload */}
            <div className="relative">
              <label className={`block text-sm font-medium ${theme.textSecondary} mb-2`}>
                Cover Photo
              </label>
              <div
                className={`relative h-40 rounded-xl overflow-hidden border-2 border-dashed ${theme.cardBorder} ${theme.hoverBg} transition-all duration-300 cursor-pointer group`}
                onClick={() => coverInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Upload className={`w-8 h-8 ${theme.textMuted} mb-2`} />
                    <span className={`text-sm ${theme.textMuted}`}>
                      Click to upload cover photo
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="text-white w-8 h-8" />
                </div>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "cover")}
                className="hidden"
              />
            </div>

            {/* Profile Photo Upload */}
            <div className="flex items-center gap-4">
              <label className={`block text-sm font-medium ${theme.textSecondary}`}>
                Profile Photo
              </label>
              <div
                className="relative cursor-pointer group"
                onClick={() => profileInputRef.current?.click()}
              >
                <div
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 ${theme.cardBorder} ${theme.cardBg} shadow-lg`}
                >
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex items-center justify-center w-full h-full ${theme.inputBg}`}
                    >
                      <User className={`w-10 h-10 ${theme.textMuted}`} />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="text-white w-6 h-6" />
                </div>
              </div>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "profile")}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>
              Basic Info
            </h3>

            {/* Name */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.textSecondary} mb-2`}
              >
                {isInstitute ? "Institute Name" : "Full Name"}
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:outline-none transition-all duration-300`}
                placeholder={isInstitute ? "Institute name" : "Your full name"}
              />
            </div>

            {/* Headline */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.textSecondary} mb-2`}
              >
                Headline
              </label>
              <input
                type="text"
                value={formData.headline || ""}
                onChange={(e) => handleInputChange("headline", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:outline-none transition-all duration-300`}
                placeholder="Professional headline"
              />
            </div>

            {/* Location */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.textSecondary} mb-2 flex items-center gap-2`}
              >
                <MapPin size={16} />
                Location
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:outline-none transition-all duration-300`}
                placeholder="City, Country"
              />
            </div>

            {/* Role specific fields */}
            {isStudent && (
              <div>
                <label
                  className={`block text-sm font-medium ${theme.textSecondary} mb-2 flex items-center gap-2`}
                >
                  <GraduationCap size={16} />
                  Education
                </label>
                <input
                  type="text"
                  value={formData.education?.[0]?.school || ""}
                  onChange={(e) =>
                    handleInputChange("education", [
                      { ...formData.education?.[0], school: e.target.value },
                    ])
                  }
                  className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:outline-none transition-all duration-300`}
                  placeholder="University name"
                />
              </div>
            )}

            {isTrainer && (
              <div>
                <label
                  className={`block text-sm font-medium ${theme.textSecondary} mb-2 flex items-center gap-2`}
                >
                  <Briefcase size={16} />
                  Current Position
                </label>
                <input
                  type="text"
                  value={formData.experience?.[0]?.title || ""}
                  onChange={(e) =>
                    handleInputChange("experience", [
                      { ...formData.experience?.[0], title: e.target.value },
                    ])
                  }
                  className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:outline-none transition-all duration-300`}
                  placeholder="Job title"
                />
              </div>
            )}

            {isInstitute && (
              <>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme.textSecondary} mb-2`}
                  >
                    Founded Year
                  </label>
                  <input
                    type="text"
                    value={formData.founded || ""}
                    onChange={(e) => handleInputChange("founded", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:outline-none transition-all duration-300`}
                    placeholder="Year founded"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${theme.textSecondary} mb-2`}
                  >
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.website || ""}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:outline-none transition-all duration-300`}
                    placeholder="www.example.com"
                  />
                </div>
              </>
            )}

            {/* Skills */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.textSecondary} mb-2`}
              >
                Skills (comma separated)
              </label>
              <textarea
                value={formData.skills?.join(", ") || ""}
                onChange={(e) =>
                  handleInputChange(
                    "skills",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:outline-none transition-all duration-300 resize-none`}
                placeholder="React, JavaScript, Python, etc."
              />
            </div>

            {/* About/Bio */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.textSecondary} mb-2`}
              >
                About
              </label>
              <textarea
                value={formData.about || ""}
                onChange={(e) => handleInputChange("about", e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} focus:border-blue-400 focus:outline-none transition-all duration-300 resize-none`}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`sticky bottom-0 z-10 flex flex-col gap-3 p-6 border-t ${theme.divider} ${theme.cardBg}`}
        >
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl font-medium ${theme.textSecondary} ${theme.hoverBg} transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
