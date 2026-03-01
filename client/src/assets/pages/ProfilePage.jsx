import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EditProfileModal from "../components/EditProfileModal";
import PostCard from "../components/PostCard";
import ApiService from "../../services/api";
import {
  ArrowLeft,
  MapPin,
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  TrendingUp,
  Users,
  Star,
  BookOpen,
  MessageSquare,
  Plus,
  Pencil,
  Camera,
  CheckCircle2,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { DASHBOARD_CONFIG, USER_TYPES } from "../../config/dashboardConfig";

export default function ProfilePage({ userType = USER_TYPES.STUDENT }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const config = DASHBOARD_CONFIG[userType];
  const profile = config.leftSidebar.profile;

  // State for edit modal and posts
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Load posts when component mounts, ID changes, or when navigating back to profile
  useEffect(() => {
    if (userType === USER_TYPES.TRAINER || userType === USER_TYPES.INSTITUTE) {
      loadPosts();
    }
  }, [id, userType, location.key]); // location.key triggers on navigation

  // Listen for custom event to refresh posts (called from feed after posting)
  useEffect(() => {
    const handleRefreshPosts = () => {
      if (
        userType === USER_TYPES.TRAINER ||
        userType === USER_TYPES.INSTITUTE
      ) {
        loadPosts();
      }
    };

    // Add event listener
    window.addEventListener("refreshPosts", handleRefreshPosts);

    // Cleanup
    return () => {
      window.removeEventListener("refreshPosts", handleRefreshPosts);
    };
  }, [userType, id]);

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      let response;

      if (id) {
        // Load posts for specific trainer by ID
        response = await ApiService.getPosts({
          authorId: id,
          page: 1,
          limit: 10,
        });
      } else {
        // Load current user's posts (for own profile)
        response = await ApiService.getMyPosts({ page: 1, limit: 10 });
      }

      if (response.success) {
        // Normalize image URLs
        const normalizedPosts = (response.data || []).map((post) => ({
          ...post,
          imageUrl: post.imageUrl
            ? post.imageUrl.startsWith("http")
              ? post.imageUrl
              : `${BACKEND_URL}${post.imageUrl}`
            : null,
        }));
        setPosts(normalizedPosts);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handleEditPost = (post) => {
    console.log("Edit post:", post);
  };

  // Profile data based on user type
  const getProfileData = () => {
    if (userType === USER_TYPES.STUDENT) {
      return {
        name: profile.name,
        headline:
          "Computer Science Student | Aspiring Software Developer | AI & ML Enthusiast",
        location: "Odisha, India",
        education: [
          {
            school: "NIST University",
            degree: "Bachelor of Technology - BTech, Computer Science",
            years: "2023 - 2027",
            logo: "https://via.placeholder.com/50",
          },
          {
            school: "Xavier School",
            degree: "Higher Secondary Education",
            years: "2021 - 2023",
            logo: "https://via.placeholder.com/50",
          },
        ],
        experience: [],
        skills: [
          "React",
          "JavaScript",
          "Python",
          "Machine Learning",
          "Node.js",
          "Git",
          "Tailwind CSS",
        ],
        connections: 64,
        profileViews: 30,
        analytics: {
          views: 31,
          impressions: 0,
          appearances: 4,
        },
        activity: {
          followers: 12,
          posts: 0,
        },
      };
    }

    if (userType === USER_TYPES.TRAINER) {
      return {
        name: profile.name,
        headline:
          "JavaScript Expert | Full Stack Developer | Technical Instructor | 5+ Years Experience",
        location: "Bangalore, India",
        education: [
          {
            school: "IIT Delhi",
            degree: "Master of Technology - MTech, Computer Science",
            years: "2018 - 2020",
            logo: "https://via.placeholder.com/50",
          },
        ],
        experience: [
          {
            title: "Senior Technical Trainer",
            company: "Tech Academy",
            type: "Full-time",
            years: "2022 - Present",
            duration: "3 yrs",
            logo: "https://via.placeholder.com/50",
          },
          {
            title: "Software Developer",
            company: "Infosys",
            type: "Full-time",
            years: "2020 - 2022",
            duration: "2 yrs",
            logo: "https://via.placeholder.com/50",
          },
        ],
        skills: [
          "JavaScript",
          "React",
          "Node.js",
          "MongoDB",
          "AWS",
          "Docker",
          "System Design",
          "Mentoring",
        ],
        students: 250,
        courses: 12,
        rating: 4.8,
        analytics: {
          views: 156,
          impressions: 1240,
          appearances: 45,
        },
        activity: {
          followers: 892,
          posts: 24,
        },
      };
    }

    // Institute
    return {
      name: profile.name,
      headline:
        "Leading Educational Institution | Technology Training & Certification | 5000+ Students Trained",
      location: "Hyderabad, India",
      founded: "2015",
      employees: "200-500",
      website: "www.techacademy.edu",
      education: [],
      programs: [
        {
          name: "Full Stack Web Development",
          students: 1200,
          duration: "6 months",
        },
        {
          name: "Data Science & AI",
          students: 800,
          duration: "8 months",
        },
        {
          name: "Cloud Computing",
          students: 650,
          duration: "4 months",
        },
      ],
      skills: [
        "Software Development",
        "Data Science",
        "Cloud Computing",
        "DevOps",
        "Cybersecurity",
        "AI/ML",
      ],
      trainers: 45,
      students: 1200,
      rating: 4.6,
      analytics: {
        views: 523,
        impressions: 4560,
        appearances: 127,
      },
      activity: {
        followers: 5600,
        posts: 89,
      },
    };
  };

  const data = editableData || getProfileData();

  const isStudent = userType === USER_TYPES.STUDENT;
  const isTrainer = userType === USER_TYPES.TRAINER;
  const isInstitute = userType === USER_TYPES.INSTITUTE;

  // Handler to save edited profile
  const handleSaveProfile = (updatedData) => {
    setEditableData(updatedData);
  };

  return (
    <div
      className={`${theme.bg} min-h-screen pb-10 transition-colors duration-300`}
    >
      {/* Header */}
      <header
        className={`${theme.navbarBg} shadow-sm sticky top-0 z-50 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 ${theme.textSecondary} ${theme.hoverText} transition-colors duration-300`}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Building2 className={`${theme.accentColor} w-6 h-6`} />
            <span className="font-bold text-xl bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Tutroid
            </span>
          </div>
          <button
            className={`p-2 rounded-lg ${theme.hoverBg} ${theme.hoverText} transition-all duration-300`}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto mt-6 px-6">
        {/* Profile Card */}
        <div
          className={`${theme.cardBg} rounded-xl shadow-lg overflow-hidden border ${theme.cardBorder} transition-all duration-300`}
        >
          {/* Cover Image */}
          <div
            className={`h-48 relative overflow-hidden bg-linear-to-r from-slate-400 to-slate-500`}
          >
            {data.coverImage && (
              <img
                src={data.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className={`absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all duration-300`}
            >
              <Camera size={18} />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <div className="relative">
                <img
                  src={data.avatar || profile.avatar}
                  alt={data.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg object-cover"
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className={`absolute bottom-0 right-0 p-2 rounded-full ${theme.cardBg} ${theme.cardBorder} border shadow-md ${theme.textSecondary} hover:${theme.accentColor} transition-all duration-300`}
                >
                  <Camera size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                className={`px-4 py-2 rounded-full font-medium ${theme.accentBg} text-white hover:opacity-90 transition-all duration-300`}
              >
                {isInstitute ? "Follow" : "Connect"}
              </button>
              <button
                className={`px-4 py-2 rounded-full font-medium border ${theme.cardBorder} ${theme.textPrimary} ${theme.hoverBg} transition-all duration-300`}
              >
                Message
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className={`p-2 rounded-lg ${theme.hoverBg} ${theme.hoverText} transition-all duration-300`}
              >
                <Pencil size={20} />
              </button>
            </div>

            {/* Info */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h1 className={`text-2xl font-bold ${theme.textPrimary}`}>
                  {data.name}
                </h1>
                <CheckCircle2 className={`${theme.accentColor} w-6 h-6`} />
                {isStudent && (
                  <span className={`${theme.textMuted} text-sm`}>(He/Him)</span>
                )}
              </div>
              <p className={`${theme.textSecondary} mt-1 leading-relaxed`}>
                {data.headline}
              </p>

              <div
                className={`flex items-center gap-4 mt-3 text-sm ${theme.textMuted}`}
              >
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {data.location}
                </span>
                {isInstitute && (
                  <>
                    <span>•</span>
                    <span>{data.founded} Founded</span>
                    <span>•</span>
                    <span>{data.employees} employees</span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div
                className={`flex items-center gap-4 mt-3 text-sm ${theme.accentColor} font-medium`}
              >
                {isStudent && (
                  <>
                    <span>{data.connections} connections</span>
                  </>
                )}
                {isTrainer && (
                  <>
                    <span>{data.students} students trained</span>
                    <span>•</span>
                    <span>{data.courses} courses</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-current" />
                      {data.rating} rating
                    </span>
                  </>
                )}
                {isInstitute && (
                  <>
                    <span>{data.trainers} trainers</span>
                    <span>•</span>
                    <span>{data.students} students</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-current" />
                      {data.rating} rating
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Analytics */}
            <div
              className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${theme.textPrimary}`}>
                  Analytics
                </h2>
                <span className={`text-sm ${theme.textMuted}`}>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Private to you
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`p-3 rounded-lg ${theme.hoverBg} transition-all duration-300`}
                >
                  <div className={`text-xl font-bold ${theme.textPrimary}`}>
                    {data.analytics.views}
                  </div>
                  <div className={`text-sm ${theme.textMuted}`}>
                    Profile views
                  </div>
                  <div className={`text-xs ${theme.textMuted} mt-1`}>
                    Past 7 days
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg ${theme.hoverBg} transition-all duration-300`}
                >
                  <div className={`text-xl font-bold ${theme.textPrimary}`}>
                    {data.analytics.impressions}
                  </div>
                  <div className={`text-sm ${theme.textMuted}`}>
                    Post impressions
                  </div>
                  <div className={`text-xs ${theme.textMuted} mt-1`}>
                    Past 7 days
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg ${theme.hoverBg} transition-all duration-300`}
                >
                  <div className={`text-xl font-bold ${theme.textPrimary}`}>
                    {data.analytics.appearances}
                  </div>
                  <div className={`text-sm ${theme.textMuted}`}>
                    Search appearances
                  </div>
                  <div className={`text-xs ${theme.textMuted} mt-1`}>
                    Past 7 days
                  </div>
                </div>
              </div>

              <button
                className={`mt-4 text-sm ${theme.accentColor} font-medium hover:underline`}
              >
                Show all analytics →
              </button>
            </div>

            {/* Posts - Only for Trainer & Institute */}
            {(isTrainer || isInstitute) && (
              <div
                className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${theme.textPrimary}`}>
                    Posts
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`${theme.accentColor} font-medium`}>
                      {posts.length} posts
                    </span>
                    {!id && ( // Show Create Post button only on own profile
                      <button
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("openCreatePostModal"),
                          )
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Plus size={16} />
                        Create Post
                      </button>
                    )}
                  </div>
                </div>

                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full" />
                  </div>
                ) : posts.length === 0 ? (
                  <div
                    className={`${theme.textMuted} text-sm text-center py-8`}
                  >
                    <p>No posts yet</p>
                    <p className="mt-1">Posts shared will be displayed here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        user={{ id }} // Pass the trainer ID
                        isLiked={false}
                        isSaved={false}
                        showComments={false}
                        commentInput=""
                        onLike={() => console.log("Like post:", post.id)}
                        onSave={() => console.log("Save post:", post.id)}
                        onShare={() => console.log("Share post:", post.id)}
                        onComment={() =>
                          console.log("Comment on post:", post.id)
                        }
                        onSubmitComment={() => console.log("Submit comment")}
                        onToggleComments={() => console.log("Toggle comments")}
                        onDelete={handleDeletePost}
                        onEdit={handleEditPost}
                        isOwnProfile={false} // Not own profile when viewing other trainer's profile
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Experience - Only for Trainer & Institute */}
            {isTrainer && (
              <div
                className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${theme.textPrimary}`}>
                    Experience
                  </h2>
                  <button
                    className={`p-2 rounded-full ${theme.hoverBg} ${theme.hoverText} transition-all duration-300`}
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {data.experience.map((exp, index) => (
                    <div key={index} className="flex gap-3">
                      <img
                        src={exp.logo}
                        alt={exp.company}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className={`font-semibold ${theme.textPrimary}`}>
                          {exp.title}
                        </h3>
                        <p className={`text-sm ${theme.textSecondary}`}>
                          {exp.company}
                        </p>
                        <p className={`text-sm ${theme.textMuted}`}>
                          {exp.years}
                        </p>
                        <p className={`text-xs ${theme.textMuted}`}>
                          {exp.type} • {exp.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isInstitute && (
              <div
                className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${theme.textPrimary}`}>
                    Training Programs
                  </h2>
                  <button
                    className={`p-2 rounded-full ${theme.hoverBg} ${theme.hoverText} transition-all duration-300`}
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {data.programs.map((prog, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${theme.hoverBg} transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${theme.textPrimary}`}>
                          {prog.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500`}
                        >
                          Active
                        </span>
                      </div>
                      <p className={`text-sm ${theme.textMuted} mt-1`}>
                        {prog.students} students enrolled • {prog.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education - Only for Student & Trainer */}
            {!isInstitute && data.education.length > 0 && (
              <div
                className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${theme.textPrimary}`}>
                    Education
                  </h2>
                  <div className="flex gap-2">
                    <button
                      className={`p-2 rounded-full ${theme.hoverBg} ${theme.hoverText} transition-all duration-300`}
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      className={`p-2 rounded-full ${theme.hoverBg} ${theme.hoverText} transition-all duration-300`}
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {data.education.map((edu, index) => (
                    <div key={index} className="flex gap-3">
                      <img
                        src={edu.logo}
                        alt={edu.school}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className={`font-semibold ${theme.textPrimary}`}>
                          {edu.school}
                        </h3>
                        <p className={`text-sm ${theme.textSecondary}`}>
                          {edu.degree}
                        </p>
                        <p className={`text-sm ${theme.textMuted}`}>
                          {edu.years}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            <div
              className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${theme.textPrimary}`}>
                  Skills
                </h2>
                <button
                  className={`px-3 py-1.5 rounded-full border ${theme.cardBorder} ${theme.accentColor} font-medium text-sm hover:${theme.hoverBg} transition-all duration-300`}
                >
                  Add skills
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      isStudent
                        ? "bg-blue-500/10 text-blue-500"
                        : isTrainer
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-purple-500/10 text-purple-500"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div
              className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
            >
              <h2 className={`text-lg font-semibold ${theme.textPrimary} mb-4`}>
                Interests
              </h2>
              <div className="flex gap-3">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium bg-emerald-600 text-white`}
                >
                  {isStudent
                    ? "Top Voices"
                    : isTrainer
                      ? "Companies"
                      : "Students"}
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${theme.cardBorder} ${theme.textSecondary} ${theme.hoverBg} transition-all duration-300`}
                >
                  Companies
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${theme.cardBorder} ${theme.textSecondary} ${theme.hoverBg} transition-all duration-300`}
                >
                  Groups
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-1 space-y-6">
            {/* People you may know */}
            <div
              className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
            >
              <h3 className={`font-semibold ${theme.textPrimary} mb-4`}>
                {isStudent
                  ? "People you may know"
                  : isTrainer
                    ? "Students you may know"
                    : "Trainers you may know"}
              </h3>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <img
                      src={`https://i.pravatar.cc/50?img=${i + 10}`}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4
                        className={`font-medium text-sm ${theme.textPrimary}`}
                      >
                        {isStudent
                          ? ["Raj Kumar", "Priya Singh", "Amit Sharma"][i - 1]
                          : isTrainer
                            ? ["Deepak Mahato", "Neha Gupta", "Rahul Verma"][
                                i - 1
                              ]
                            : ["John Trainer", "Sarah Lee", "Mike Chen"][i - 1]}
                      </h4>
                      <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                        {isStudent
                          ? [
                              "Software Engineer at Google",
                              "Data Scientist at Amazon",
                              "Product Manager at Flipkart",
                            ][i - 1]
                          : isTrainer
                            ? [
                                "Computer Science Student",
                                "Aspiring Developer",
                                "Web Development Enthusiast",
                              ][i - 1]
                            : [
                                "JavaScript Expert",
                                "Python Specialist",
                                "Full Stack Developer",
                              ][i - 1]}
                      </p>
                      <button
                        className={`mt-2 px-4 py-1.5 rounded-full text-sm font-medium border ${theme.cardBorder} ${theme.accentColor} hover:${theme.hoverBg} transition-all duration-300`}
                      >
                        {isInstitute ? "Hire" : "Connect"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className={`mt-4 text-sm ${theme.textMuted} hover:${theme.textPrimary} transition-colors duration-300 flex items-center gap-1`}
              >
                Show all →
              </button>
            </div>

            {/* You might like */}
            <div
              className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
            >
              <h3 className={`font-semibold ${theme.textPrimary} mb-4`}>
                {isStudent
                  ? "Pages you might like"
                  : isTrainer
                    ? "Institutes hiring now"
                    : "Top training partners"}
              </h3>

              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <img
                      src={`https://via.placeholder.com/50`}
                      alt="Page"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4
                        className={`font-medium text-sm ${theme.textPrimary}`}
                      >
                        {isStudent
                          ? ["Apna College", "Infosys Springboard"][i - 1]
                          : isTrainer
                            ? ["Tech Academy", "Edureka"][i - 1]
                            : ["Google for Education", "Microsoft Learn"][
                                i - 1
                              ]}
                      </h4>
                      <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                        {isStudent
                          ? ["184,992 followers", "707,448 followers"][i - 1]
                          : isTrainer
                            ? [
                                "45 trainers • 1200 students",
                                "120+ trainers • 5000+ students",
                              ][i - 1]
                            : [
                                "Corporate Training Partner",
                                "Certification Provider",
                              ][i - 1]}
                      </p>
                      <button
                        className={`mt-2 px-4 py-1.5 rounded-full text-sm font-medium border ${theme.cardBorder} ${theme.accentColor} hover:${theme.hoverBg} transition-all duration-300`}
                      >
                        + Follow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile language */}
            <div
              className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${theme.textPrimary}`}>
                    Profile language
                  </h3>
                  <p className={`text-sm ${theme.textMuted} mt-1`}>English</p>
                </div>
                <button
                  className={`p-2 rounded-full ${theme.hoverBg} ${theme.hoverText} transition-all duration-300`}
                >
                  <Pencil size={18} />
                </button>
              </div>
            </div>

            {/* Public profile & URL */}
            <div
              className={`${theme.cardBg} rounded-xl shadow-lg p-5 border ${theme.cardBorder} transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${theme.textPrimary}`}>
                    Public profile & URL
                  </h3>
                  <p
                    className={`text-sm ${theme.textMuted} mt-1 truncate max-w-45`}
                  >
                    www.tutroid.com/in/
                    {data.name.toLowerCase().replace(/\s+/g, "-")}
                  </p>
                </div>
                <button
                  className={`p-2 rounded-full ${theme.hoverBg} ${theme.hoverText} transition-all duration-300`}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userType={userType}
        profileData={data}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
