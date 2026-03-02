import { useState, useRef, useEffect } from "react";
import { DASHBOARD_CONFIG, USER_TYPES } from "../../config/dashboardConfig";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/api";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  X,
  Plus,
  Send,
  ThumbsUp,
  User,
  FileText,
  Image,
  Link2,
  Video,
} from "lucide-react";
import PostCard from "./PostCard";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export default function FeedSection({ userType = USER_TYPES.STUDENT }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortType, setSortType] = useState("recent");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Interaction states
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});

  /* ================= LOAD POSTS ================= */

  useEffect(() => {
    loadPosts();
  }, []);

  // Listen for custom events to open create post modal
  useEffect(() => {
    const handleOpenCreatePostModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener("openCreatePostModal", handleOpenCreatePostModal);

    return () => {
      window.removeEventListener(
        "openCreatePostModal",
        handleOpenCreatePostModal,
      );
    };
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getPosts?.();
      if (response?.success) {
        const normalizedPosts = (response.data || []).map((post) => ({
          ...post,
          imageUrl: post.imageUrl
            ? post.imageUrl.startsWith("http")
              ? post.imageUrl
              : `${BACKEND_URL}${post.imageUrl}`
            : null,
          author: post.author ? {
            ...post.author,
            profilePicture: post.author.profilePicture
              ? post.author.profilePicture.startsWith("http")
                ? post.author.profilePicture
                : `${BACKEND_URL}${post.author.profilePicture}`
              : null,
          } : null,
        }));

        setPosts(normalizedPosts);
      } else {
        // Add mock data for demonstration
        setPosts([
          {
            id: 1,
            content:
              "Just completed an amazing course on React Hooks! The way useState and useEffect work together is fascinating. Highly recommend it to anyone looking to level up their React skills. 🚀\n\n#React #WebDevelopment #Learning",
            author: {
              name: "Sarah Johnson",
              headline: "Frontend Developer",
              title: "Senior Developer",
              profilePicture: null,
            },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            likes: 24,
            commentCount: 8,
            shares: 3,
            comments: [
              {
                id: 101,
                content:
                  "Great choice! React Hooks really changed the game for component composition.",
                author: {
                  name: "Mike Chen",
                  profilePicture: null,
                },
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              },
              {
                id: 102,
                content:
                  "I'm taking this course too! The useEffect cleanup patterns are mind-blowing.",
                author: {
                  name: "Emily Davis",
                  profilePicture: null,
                },
                createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              },
            ],
          },
          {
            id: 2,
            content:
              "🎯 Career milestone: Just landed my first frontend developer role! Thank you to this amazing community for all the support and resources. The journey from bootcamp to professional has been incredible.\n\nSpecial shoutout to everyone who reviewed my portfolio and gave feedback. You know who you are! 🙏",
            author: {
              name: "Alex Rodriguez",
              headline: "Frontend Developer",
              title: "Junior Developer",
              profilePicture: null,
            },
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
            likes: 156,
            commentCount: 42,
            shares: 18,
            comments: [
              {
                id: 201,
                content: "Congratulations! 🎉 Your hard work paid off!",
                author: {
                  name: "Lisa Wang",
                  profilePicture: null,
                },
                createdAt: new Date(
                  Date.now() - 2 * 60 * 60 * 1000,
                ).toISOString(),
              },
            ],
          },
          {
            id: 3,
            content:
              "Hot take: CSS-in-JS is not always the answer. Sometimes plain CSS with good naming conventions is more maintainable and performant. Fight me! 😄",
            author: {
              name: "David Kim",
              headline: "Full Stack Engineer",
              title: "Tech Lead",
              profilePicture: null,
            },
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
            likes: 89,
            commentCount: 31,
            shares: 12,
            imageUrl:
              "https://via.placeholder.com/800x400?text=CSS+vs+CSS-in-JS",
          },
          {
            id: 4,
            content:
              "Pro tip: Use console.table() instead of console.log() when debugging arrays of objects. It's a game-changer for readability! 📊\n\nExample: console.table(usersArray) will give you a nice formatted table.",
            author: {
              name: "Rachel Green",
              headline: "JavaScript Enthusiast",
              title: "Senior Developer",
              profilePicture: null,
            },
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
            likes: 234,
            commentCount: 19,
            shares: 45,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      // Add mock data as fallback
      setPosts([
        {
          id: 1,
          content: "Welcome to our learning community! 🎓",
          author: {
            name: "Admin",
            headline: "Community Manager",
            title: "Admin",
            profilePicture: null,
          },
          createdAt: new Date().toISOString(),
          likes: 10,
          commentCount: 2,
          shares: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE POST ================= */

  const handlePostSubmit = async () => {
    if ((!postText.trim() && !selectedImage) || isSubmitting) return;

    if (!user?.id) {
      alert("Please log in");
      return;
    }

    if (!["TRAINER", "INSTITUTION"].includes(user.role)) {
      alert("Only trainers and institutions can post");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      /* ========= FILE UPLOAD ========= */
      if (selectedImage instanceof File) {
        const title = postText.trim() ? `Post-${Date.now()}` : "Post File";

        const uploadResponse = await ApiService.uploadFile(
          selectedImage,
          title,
        );

        // ✅ STOP if upload fails
        if (!uploadResponse?.success) {
          throw new Error("Upload failed");
        }

        const BACKEND_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000";

        imageUrl = `${BACKEND_URL}/materials/${uploadResponse.data.filename}`;
      }

      /* ========= POST DATA ========= */

      const isPdf = selectedImage?.type === "application/pdf";

      const cleanedContent = postText.trim();

      if (!cleanedContent && !imageUrl) {
        throw new Error("Post cannot be empty");
      }

      const postData = {
        content: cleanedContent || " ",
        type: imageUrl ? (isPdf ? "article" : "image") : "text",
      };

      if (imageUrl) {
        postData.imageUrl = imageUrl;
      }

      /* ========= CREATE POST ========= */

      const response = await ApiService.createPost(postData);

      if (!response?.success) {
        throw new Error("Post creation failed");
      }

      /* ========= RESET ========= */

      setPostText("");
      setSelectedImage(null);
      setImagePreview(null);
      setIsModalOpen(false);

      await loadPosts();

      // Refresh posts in profile page if trainer is viewing their own profile
      window.dispatchEvent(new CustomEvent("refreshPosts"));
    } catch (error) {
      console.error("Failed to create post:", error);
      alert(error.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Only images are supported");
    }
    e.target.value = "";
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedImage(file);
      setImagePreview("pdf"); // Use "pdf" as sentinel for PDF preview
    } else {
      alert("Only PDF files are supported");
    }
    e.target.value = "";
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  /* ================= SORT POSTS ================= */

  const sortedPosts = [...posts].sort((a, b) =>
    sortType === "top"
      ? (b.likes || 0) - (a.likes || 0)
      : new Date(b.createdAt) - new Date(a.createdAt),
  );

  // ================= POST INTERACTIONS =================

  const handleReviewUpdate = (postId, reviewData) => {
    // Optimistically update the specific post without full refresh
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { 
              ...post, 
              averageRating: reviewData.averageRating,
              totalReviews: reviewData.totalReviews 
            }
          : post
      )
    );
  };

  const handleLike = async (postId) => {
    try {
      const isLiked = likedPosts.has(postId);

      // Optimistic UI update
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (isLiked) newSet.delete(postId);
        else newSet.add(postId);
        return newSet;
      });

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes: isLiked ? Math.max(0, (post.likes || 0) - 1) : (post.likes || 0) + 1 }
            : post,
        ),
      );

      // Real API call
      if (isLiked) {
        await ApiService.unlikePost(postId);
      } else {
        await ApiService.likePost(postId);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert optimistic update on error
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        const isLiked = newSet.has(postId);
        if (isLiked) newSet.delete(postId);
        else newSet.add(postId);
        return newSet;
      });
    }
  };

  const handleSave = async (postId) => {
    try {
      const isSaved = savedPosts.has(postId);

      setSavedPosts((prev) => {
        const newSet = new Set(prev);
        if (isSaved) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      // API call would go here
      // await ApiService.toggleSave(postId);
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const handleComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    try {
      // API call would go here
      // const response = await ApiService.addComment(postId, { content: commentText });

      // For now, update UI optimistically
      const newComment = {
        id: Date.now(),
        content: commentText,
        author: user,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: [...(post.comments || []), newComment],
              commentCount: (post.commentCount || 0) + 1,
            }
            : post,
        ),
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleShare = async (postId) => {
    try {
      // API call would go here
      // await ApiService.sharePost(postId);

      // For now, just update share count
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, shares: (post.shares || 0) + 1 }
            : post,
        ),
      );
    } catch (error) {
      console.error("Failed to share post:", error);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10">
      {/* ================= CREATE POST BAR ================= */}
      {user && ["TRAINER", "INSTITUTION"].includes(user?.role) && (
        <div className={`${theme.cardBg} rounded-xl shadow-sm border ${theme.cardBorder} p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {(user?.name || user?.firstName || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex-1 text-left px-4 py-2.5 ${theme.inputBg} border ${theme.inputBorder} rounded-full text-sm ${theme.textMuted} hover:border-blue-400 transition-all`}
            >
              {DASHBOARD_CONFIG[userType]?.feedSection?.placeholder || "Share something..."}
            </button>
          </div>
          <div className={`flex gap-1 mt-3 pt-3 border-t ${theme.divider}`}>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} transition-all`}
            >
              <Image size={14} className="text-emerald-500" />
              Photo
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} transition-all`}
            >
              <FileText size={14} className="text-red-500" />
              Document
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} transition-all`}
            >
              <Video size={14} className="text-blue-500" />
              Video
            </button>
          </div>
        </div>
      )}

      {/* ================= SORT ================= */}
      <div className={`flex justify-between items-center px-1`}>
        <div className={`flex items-center gap-2 text-xs font-semibold ${theme.textSecondary}`}>
          <span>Sort by</span>
          <select
            name="sortType"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className={`${theme.inputBg} border ${theme.inputBorder} rounded-lg px-2 py-1 text-xs ${theme.inputText} outline-none cursor-pointer`}
          >
            <option value="recent">Recent</option>
            <option value="top">Most Popular</option>
          </select>
        </div>
      </div>

      {/* ================= FEED ================= */}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${theme.cardBg} rounded-xl border ${theme.cardBorder} p-4 animate-pulse`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-full ${theme.isDarkMode ? "bg-neutral-700" : "bg-gray-200"}`}></div>
                <div className="space-y-2">
                  <div className={`h-3 rounded ${theme.isDarkMode ? "bg-neutral-700" : "bg-gray-200"} w-32`}></div>
                  <div className={`h-2 rounded ${theme.isDarkMode ? "bg-neutral-700" : "bg-gray-200"} w-20`}></div>
                </div>
              </div>
              <div className={`h-3 rounded ${theme.isDarkMode ? "bg-neutral-700" : "bg-gray-200"} mb-2`}></div>
              <div className={`h-3 rounded ${theme.isDarkMode ? "bg-neutral-700" : "bg-gray-200"} w-3/4`}></div>
            </div>
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className={`${theme.cardBg} rounded-xl border ${theme.cardBorder} p-12 text-center`}>
          <div className="text-4xl mb-3">📬</div>
          <p className={`font-semibold ${theme.textPrimary} mb-1`}>No posts yet</p>
          <p className={`text-sm ${theme.textMuted}`}>Be the first to share something!</p>
        </div>
      ) : (
        sortedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            user={user}
            isLiked={likedPosts.has(post.id)}
            isSaved={savedPosts.has(post.id)}
            showComments={showComments[post.id]}
            commentInput={commentInputs[post.id] || ""}
            onLike={() => handleLike(post.id)}
            onSave={() => handleSave(post.id)}
            onShare={() => handleShare(post.id)}
            onComment={(text) =>
              setCommentInputs((prev) => ({ ...prev, [post.id]: text }))
            }
            onSubmitComment={() => handleComment(post.id)}
            onToggleComments={() =>
              setShowComments((prev) => ({
                ...prev,
                [post.id]: !prev[post.id],
              }))
            }
            onReviewUpdate={handleReviewUpdate}
          />
        ))
      )}

      {/* ================= CREATE POST MODAL ================= */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start pt-16 z-50 px-4">
          <div className={`${theme.cardBg} w-full max-w-xl rounded-2xl shadow-2xl border ${theme.cardBorder} overflow-hidden`}>
            {/* Modal Header */}
            <div className={`flex justify-between items-center px-5 py-4 border-b ${theme.divider}`}>
              <h3 className={`font-bold text-lg ${theme.textPrimary}`}>Create Post</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPostText("");
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className={`p-2 rounded-full ${theme.hoverBg} ${theme.textMuted} ${theme.hoverText} transition-colors`}
              >
                <X size={18} />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 px-5 py-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {(user?.name || user?.firstName || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className={`font-semibold text-sm ${theme.textPrimary}`}>
                  {user?.name || user?.firstName || "Anonymous User"}
                </div>
                <div className={`text-xs ${theme.textMuted}`}>Post to anyone • 🌐 Public</div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-5 pb-3">
              <textarea
                name="postText"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows="4"
                className={`w-full border-none outline-none resize-none text-base ${theme.inputText} ${theme.inputPlaceholder} bg-transparent placeholder:${theme.textMuted}`}
                placeholder="What do you want to talk about?"
              />

              {/* Image / PDF Preview */}
              {imagePreview && (
                <div className="mt-3 relative">
                  {imagePreview === "pdf" && selectedImage ? (
                    <div className={`flex items-center gap-3 p-4 ${theme.hoverBg} rounded-xl border ${theme.cardBorder}`}>
                      <FileText className="w-10 h-10 text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${theme.textPrimary} truncate`}>
                          {selectedImage.name}
                        </p>
                        <p className={`text-xs ${theme.textMuted}`}>PDF document</p>
                      </div>
                      <button onClick={removeImage} className={`${theme.textMuted} hover:text-red-500 p-1`}>
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full rounded-xl max-h-64 object-cover"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Media Options */}
            <div className={`px-5 py-3 border-t ${theme.divider}`}>
              <div className="flex items-center gap-2">
                <label className={`flex items-center gap-2 text-xs font-medium ${theme.textSecondary} hover:${theme.accentColor} cursor-pointer transition-colors px-3 py-2 rounded-lg ${theme.hoverBg}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Photo
                </label>

                <label className={`flex items-center gap-2 text-xs font-medium ${theme.textSecondary} hover:${theme.accentColor} cursor-pointer transition-colors px-3 py-2 rounded-lg ${theme.hoverBg}`}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <FileText className="w-4 h-4 text-red-500" />
                  PDF
                </label>
              </div>
            </div>

            {/* Post Button */}
            <div className={`flex justify-between items-center px-5 py-3 border-t ${theme.divider}`}>
              <span className={`text-xs ${postText.length > 650 ? "text-red-500" : theme.textMuted}`}>
                {postText.length}/700
              </span>
              <button
                disabled={(!postText.trim() && !selectedImage) || postText.length > 700 || isSubmitting}
                onClick={handlePostSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-full disabled:bg-blue-400/50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors font-semibold text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Posting...
                  </span>
                ) : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
