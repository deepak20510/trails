import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  GraduationCap,
  Building2,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { USER_TYPES } from "../../config/dashboardConfig";
import { useAuth } from "../../context/AuthContext";

const userTypeConfig = {
  [USER_TYPES.STUDENT]: {
    icon: GraduationCap,
    title: "Student",
    description: "Learn from expert trainers and advance your career",
    features: [
      "Access to 10,000+ courses",
      "Personalized learning paths",
      "Certification upon completion",
      "Job placement assistance",
      "24/7 community support",
    ],
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    selectedBg: "bg-blue-600",
  },
  [USER_TYPES.TRAINER]: {
    icon: User,
    title: "Trainer",
    description: "Share your expertise and earn from teaching",
    features: [
      "Create and sell courses",
      "Set your own rates",
      "Schedule flexibility",
      "Student analytics dashboard",
      "Instant payment processing",
    ],
    color: "indigo",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    selectedBg: "bg-indigo-600",
  },
  [USER_TYPES.INSTITUTE]: {
    icon: Building2,
    title: "Institution",
    description: "Manage your faculty and expand your reach",
    features: [
      "Manage multiple trainers",
      "Bulk student enrollment",
      "Custom branding options",
      "Enterprise reporting",
      "API access for integration",
    ],
    color: "emerald",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    selectedBg: "bg-emerald-600",
  },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, error, clearError, user } = useAuth();
  const [selectedType, setSelectedType] = useState(USER_TYPES.STUDENT);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    organization: "",
    agreeTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    clearError();

    try {
      // Only include fields that have actual values
      const signupData = {};

      // Always include required fields
      signupData.email = formData.email;
      signupData.password = formData.password;
      // Backend expects STUDENT | TRAINER | INSTITUTION (uppercase)
      const roleMap = {
        [USER_TYPES.STUDENT]: "STUDENT",
        [USER_TYPES.TRAINER]: "TRAINER",
        [USER_TYPES.INSTITUTE]: "INSTITUTION",
      };
      signupData.role = roleMap[selectedType] || "STUDENT";

      // Only include optional fields if they have values
      if (formData.phone && formData.phone.trim()) {
        signupData.phone = formData.phone;
      }
      if (formData.organization && formData.organization.trim()) {
        signupData.organization = formData.organization;
      }
      if (formData.agreeTerms !== undefined && formData.agreeTerms !== null) {
        signupData.agreeTerms = formData.agreeTerms;
      }

      const response = await signup(signupData);

      const userRole = response.data?.user?.role?.toLowerCase();

      const roleRoutes = {
        student: "/student",
        trainer: "/trainer",
        institution: "/institute",
        admin: "/admin",
      };

      navigate(roleRoutes[userRole] || "/student");
    } catch {
      // Error already handled inside AuthContext
    } finally {
      setIsLoading(false);
    }
  };
  const selectedConfig = userTypeConfig[selectedType];
  const SelectedIcon = selectedConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">🎓</div>
            <h1 className="text-xl font-bold text-gray-800">Tutroid</h1>
          </div>
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                step === 1
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span className="font-medium">Select Type</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                step === 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span className="font-medium">Your Details</span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - User Type Selection */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Join as a...
              </h2>
              <p className="text-gray-600 mb-8">
                Select how you want to use our platform. You can always change
                this later.
              </p>

              <div className="space-y-4">
                {Object.values(USER_TYPES).map((type) => {
                  const config = userTypeConfig[type];
                  const Icon = config.icon;
                  const isSelected = selectedType === type;

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                        isSelected
                          ? `${config.borderColor} ${config.bgColor} ring-2 ring-offset-2 ring-${config.color}-500`
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0`}
                        >
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {config.title}
                            </h3>
                            {isSelected && (
                              <div
                                className={`w-6 h-6 rounded-full ${config.selectedBg} flex items-center justify-center`}
                              >
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mt-1">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-8 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Continue as {selectedConfig.title}
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Right - Features Preview */}
            <div
              className={`${selectedConfig.bgColor} rounded-3xl p-8 border ${selectedConfig.borderColor}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl ${selectedConfig.iconBg} ${selectedConfig.iconColor} flex items-center justify-center`}
                >
                  <SelectedIcon size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">
                    {selectedConfig.title} Benefits
                  </h3>
                  <p className="text-gray-500">
                    Everything you need to succeed
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedConfig.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full ${selectedConfig.selectedBg} flex items-center justify-center shrink-0`}
                    >
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-white/50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Free to get started.</span> No
                  credit card required. Upgrade anytime.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-2"
            >
              ← Back to selection
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 rounded-xl ${selectedConfig.iconBg} ${selectedConfig.iconColor} flex items-center justify-center`}
                >
                  <SelectedIcon size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create {selectedConfig.title} Account
                  </h2>
                  <p className="text-gray-500">
                    Join thousands of {selectedConfig.title.toLowerCase()}s
                    already on the platform
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-600 text-sm font-medium">
                        {error}
                      </p>
                      <p className="text-red-500 text-xs mt-1">
                        {error.includes("already registered")
                          ? "This email is already registered. Try logging in or use a different email address."
                          : "Registration failed. Please check your information and try again."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>

                  {selectedType === USER_TYPES.INSTITUTE && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        placeholder="Your institution name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        required
                      />
                    </div>
                  )}

                  {selectedType === USER_TYPES.TRAINER && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expertise Area
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        placeholder="e.g., Web Development"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                    required
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Create Account
                  <ArrowRight size={20} />
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
