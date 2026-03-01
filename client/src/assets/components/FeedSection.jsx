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
} from "lucide-react";
import PostCard from "./PostCard";

export default function FeedSection({ userType = USER_TYPES.STUDENT }) {
  const { user } = useAuth();

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

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getPosts?.();
      if (response?.success) {
        setPosts(response.data || []);
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

    // Check if user is authenticated
    if (!user?.id) {
      alert("Please log in to create posts");
      return;
    }

    // Check if user has permission to create posts (only TRAINER and INSTITUTION)
    if (!["TRAINER", "INSTITUTION"].includes(user?.role)) {
      alert("Only trainers and institutions can create posts");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload file if selected
      if (selectedImage && selectedImage instanceof File) {
        try {
          const title = postText.trim()
            ? `Post Attachment - ${postText.substring(0, 20)}`
            : "Untitled Post";
          const uploadResponse = await ApiService.uploadFile(
            selectedImage,
            title,
          );
          if (uploadResponse.success) {
            imageUrl = `/materials/${uploadResponse.data.filename}`;
          }
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          alert("Failed to upload image. Post will be created without image.");
        }
      }

      const isPdf = selectedImage?.type === "application/pdf";
      const postData = {
        content: postText,
        type: imageUrl ? (isPdf ? "article" : "image") : "text",
      };

      // Only send imageUrl if it's a valid URL string (stores file URL for both images and PDFs)
      if (imageUrl && typeof imageUrl === "string") {
        postData.imageUrl = imageUrl;
      }

      const response = await ApiService.createPost?.(postData);

      if (response?.success) {
        setPostText("");
        setSelectedImage(null);
        setImagePreview(null);
        setIsModalOpen(false);
        await loadPosts();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post. Please try again.");
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

  const handleLike = async (postId) => {
    try {
      const isLiked = likedPosts.has(postId);

      // Update UI optimistically
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1,
              }
            : post,
        ),
      );

      // API call would go here
      // await ApiService.toggleLike(postId);
    } catch (error) {
      console.error("Failed to like post:", error);
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
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div className="text-xs font-bold flex items-center">
          <span className="mr-2">Sort by</span>
          <select
            name="sortType"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="bg-transparent cursor-pointer text-sm"
          >
            <option value="recent">Recent</option>
            <option value="top">Most Popular</option>
          </select>
        </div>

        {user && ["TRAINER", "INSTITUTION"].includes(user?.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Create Post
          </button>
        )}
      </div>

      {/* ================= FEED ================= */}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full" />
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No posts available.
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
          />
        ))
      )}

      {/* ================= CREATE POST MODAL ================= */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">Create Post</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPostText("");
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {user?.name || "Anonymous User"}
                </div>
                <div className="text-sm text-gray-500">Post to anyone</div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-4">
              <textarea
                name="postText"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows="4"
                className="w-full border-none outline-none resize-none text-gray-700 placeholder-gray-400 text-lg"
                placeholder="What do you want to talk about?"
              />

              {/* Image / PDF Preview */}
              {imagePreview && (
                <div className="mt-4 relative">
                  {imagePreview === "pdf" && selectedImage ? (
                    <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg border border-gray-200">
                      <FileText className="w-12 h-12 text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {selectedImage.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          PDF document
                        </p>
                      </div>
                      <button
                        onClick={removeImage}
                        className="text-gray-500 hover:text-red-600 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-lg max-h-64 object-cover"
                    />
                  )}
                  {imagePreview !== "pdf" && (
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Media Options */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-4 py-3 border-t border-gray-100">
                <label className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Photo</span>
                </label>

                <label className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">PDF</span>
                </label>

                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm">Event</span>
                </button>

                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm">Article</span>
                </button>
              </div>
            </div>

            {/* Post Button */}
            <div className="flex justify-between items-center p-4 border-t border-gray-100">
              <span className="text-sm text-gray-400">
                {postText.length}/700 characters
              </span>
              <button
                disabled={
                  (!postText.trim() && !selectedImage) ||
                  postText.length > 700 ||
                  isSubmitting
                }
                onClick={handlePostSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-full disabled:bg-gray-300 hover:bg-blue-700 transition-colors font-medium"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
