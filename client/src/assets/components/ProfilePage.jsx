import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/api";
import PostCard from "./PostCard";
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Edit3,
  Plus,
  Star,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Mock profile data - replace with actual API call
      setProfile({
        ...user,
        headline:
          user?.role === "TRAINER"
            ? "Professional Trainer & Coach"
            : "Educational Institution",
        location: "San Francisco, CA",
        bio: "Passionate about education and helping others achieve their goals through quality training and mentorship.",
        experience: [
          {
            id: 1,
            title: "Senior Trainer",
            company: "Tech Academy",
            duration: "2020 - Present",
            description:
              "Leading training programs for web development and data science",
          },
        ],
        education: [
          {
            id: 1,
            degree: "Master of Education",
            school: "Stanford University",
            year: "2018",
          },
        ],
        skills: [
          "JavaScript",
          "React",
          "Node.js",
          "Python",
          "Data Science",
          "Machine Learning",
        ],
        languages: ["English", "Spanish"],
        achievements: [
          "Best Trainer 2023",
          "1000+ Students Trained",
          "5 Star Rating",
        ],
        stats: {
          posts: 45,
          connections: 1234,
          endorsements: 89,
          views: 5678,
        },
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.name}
              </h1>
              <p className="text-gray-600">{profile?.headline}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile?.location}
                </span>
                <span className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {profile?.role}
                </span>
              </div>
              <p className="mt-3 text-gray-700">{profile?.bio}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile?.stats.posts}
            </div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile?.stats.connections}
            </div>
            <div className="text-sm text-gray-500">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile?.stats.endorsements}
            </div>
            <div className="text-sm text-gray-500">Endorsements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile?.stats.views}
            </div>
            <div className="text-sm text-gray-500">Profile Views</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex border-b">
          {["posts", "experience", "education", "skills", "portfolio"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <div className="p-6">
          {activeTab === "posts" && <PostsTab />}
          {activeTab === "experience" && (
            <ExperienceTab experience={profile?.experience} />
          )}
          {activeTab === "education" && (
            <EducationTab education={profile?.education} />
          )}
          {activeTab === "skills" && <SkillsTab skills={profile?.skills} />}
          {activeTab === "portfolio" && <PortfolioTab />}
        </div>
      </div>
    </div>
  );
}

function PostsTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    loadMyPosts();
  }, []);

  const loadMyPosts = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMyPosts({ page: 1, limit: 10 });
      if (response.success) {
        // Normalize image URLs like FeedSection does
        const normalizedPosts = (response.data || []).map((post) => ({
          ...post,
          imageUrl: post.imageUrl
            ? post.imageUrl.startsWith("http")
              ? post.imageUrl
              : `${BACKEND_URL}${post.imageUrl}`
            : null,
        }));
        setPosts(normalizedPosts);
      } else {
        setError("Failed to load posts");
      }
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handleEditPost = (post) => {
    // TODO: Implement edit functionality
    console.log("Edit post:", post);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <button
          onClick={loadMyPosts}
          className="mt-2 text-blue-600 hover:text-blue-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">My Posts</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No posts yet. Create your first post to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              isLiked={false}
              isSaved={false}
              showComments={false}
              commentInput=""
              onLike={() => console.log("Like post:", post.id)}
              onSave={() => console.log("Save post:", post.id)}
              onShare={() => console.log("Share post:", post.id)}
              onComment={() => console.log("Comment on post:", post.id)}
              onSubmitComment={() => console.log("Submit comment")}
              onToggleComments={() => console.log("Toggle comments")}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              isOwnProfile={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExperienceTab({ experience }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Experience</h3>
        <button className="text-blue-600 hover:text-blue-700">
          + Add Experience
        </button>
      </div>
      {experience?.map((exp) => (
        <div key={exp.id} className="border-l-2 border-blue-500 pl-4">
          <h4 className="font-semibold">{exp.title}</h4>
          <p className="text-gray-600">{exp.company}</p>
          <p className="text-sm text-gray-500">{exp.duration}</p>
          <p className="mt-2">{exp.description}</p>
        </div>
      ))}
    </div>
  );
}

function EducationTab({ education }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Education</h3>
        <button className="text-blue-600 hover:text-blue-700">
          + Add Education
        </button>
      </div>
      {education?.map((edu) => (
        <div key={edu.id} className="flex items-start space-x-3">
          <GraduationCap className="w-5 h-5 text-blue-500 mt-1" />
          <div>
            <h4 className="font-semibold">{edu.degree}</h4>
            <p className="text-gray-600">{edu.school}</p>
            <p className="text-sm text-gray-500">{edu.year}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsTab({ skills }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Skills & Endorsements</h3>
        <button className="text-blue-600 hover:text-blue-700">
          + Add Skill
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills?.map((skill) => (
          <div
            key={skill}
            className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full"
          >
            <span className="text-sm">{skill}</span>
            <Star className="w-3 h-3 text-yellow-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Portfolio</h3>
        <button className="text-blue-600 hover:text-blue-700">
          + Add Project
        </button>
      </div>
      <div className="text-center py-8 text-gray-500">
        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No portfolio items yet. Showcase your best work here!</p>
      </div>
    </div>
  );
}
