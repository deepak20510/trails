import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  User,
  Send,
  FileText,
  Edit,
  Trash2,
  Globe,
  Star,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ReviewModal from "../../components/ReviewModal";
import ReviewsListModal from "../../components/ReviewsListModal";
import ApiService from "../../services/api";

export default function PostCard({
  post,
  user,
  isLiked,
  isSaved,
  showComments,
  commentInput,
  onLike,
  onSave,
  onShare,
  onComment,
  onSubmitComment,
  onToggleComments,
  onDelete,
  onEdit,
  isOwnProfile = false,
  onReviewUpdate,
}) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const handleReviewSubmit = async (rating, review) => {
    try {
      const response = await ApiService.reviewPost(post.id, rating, review);
      
      // Optimistically update the post data without full refresh
      if (response.success && response.data) {
        const { averageRating, totalReviews } = response.data;
        // Update parent component's post data
        onReviewUpdate?.(post.id, { averageRating, totalReviews });
      }
      
      // Reload reviews if modal is open
      if (showReviewsModal) {
        loadReviews();
      }
    } catch (error) {
      throw error;
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await ApiService.getPostReviews(post.id);
      setAllReviews(response.data || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleShowReviews = () => {
    setShowReviewsModal(true);
    loadReviews();
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const truncateContent = (content, maxLength = 280) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  const getAuthorName = () => {
    if (!post.author) return "Anonymous";
    if (post.author.firstName) {
      return `${post.author.firstName} ${post.author.lastName || ""}`.trim();
    }
    if (post.author.institutionProfile?.name) return post.author.institutionProfile.name;
    if (post.author.name) return post.author.name;
    if (post.author.email) return post.author.email.split("@")[0];
    return "Anonymous";
  };

  const getAuthorRole = () => {
    if (!post.author) return "Member";
    if (post.author.role === "TRAINER") return "Trainer";
    if (post.author.role === "INSTITUTION") return "Institution";
    if (post.author.trainerProfile?.bio) return "Expert Trainer";
    if (post.author.title) return post.author.title;
    return post.author.role || "Member";
  };

  const authorName = getAuthorName();
  const authorInitial = authorName.charAt(0).toUpperCase();
  const authorAvatar = post.author?.profilePicture || post.author?.avatar;

  const isPDF = post.imageUrl?.toLowerCase().endsWith(".pdf") || post.type === "article";

  return (
    <>
      <div className={`${theme.cardBg} rounded-xl shadow-sm border ${theme.cardBorder} overflow-hidden hover:shadow-md transition-all duration-200 relative`}>
        {/* Rating Badge - Top Right */}
        {(post.averageRating > 0 || post.totalReviews > 0) && (
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={handleShowReviews}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
            >
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-sm">
                {post.averageRating > 0 ? post.averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-xs opacity-90">({post.totalReviews || 0})</span>
            </button>
          </div>
        )}
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">{authorInitial}</span>
              )}
            </div>

            {/* Author Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-sm ${theme.textPrimary} hover:${theme.accentColor} cursor-pointer transition-colors`}>
                  {authorName}
                </h3>
                {post.author?.role === "TRAINER" && (
                  <span className="text-xs bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full font-medium">
                    Trainer
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${theme.textMuted} mt-0.5`}>
                <span>{getAuthorRole()}</span>
                <span>·</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
                <span>·</span>
                <Globe size={10} />
              </div>
            </div>
          </div>

          {/* More Options */}
          {isOwnProfile ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`p-1.5 rounded-full ${theme.hoverBg} ${theme.textMuted} ${theme.hoverText} transition-colors`}
              >
                <MoreHorizontal size={18} />
              </button>

              {showDropdown && (
                <div className={`absolute right-0 mt-1 w-44 ${theme.cardBg} rounded-xl shadow-xl border ${theme.cardBorder} overflow-hidden z-20`}>
                  <button
                    onClick={() => { onEdit?.(post); setShowDropdown(false); }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2.5 text-sm ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} transition-colors`}
                  >
                    <Edit size={14} />
                    Edit Post
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this post?")) {
                        onDelete?.(post.id);
                      }
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={`p-1.5 rounded-full ${theme.hoverBg} ${theme.textMuted} ${theme.hoverText} transition-colors`}>
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <div className={`text-sm ${theme.textSecondary} leading-relaxed`}>
          {isExpanded || (post.content?.length || 0) <= 280 ? (
            <div className="whitespace-pre-wrap">{post.content}</div>
          ) : (
            <div>
              <div className="whitespace-pre-wrap">{truncateContent(post.content)}</div>
              <button
                onClick={() => setIsExpanded(true)}
                className={`${theme.accentColor} text-xs font-medium mt-1 hover:underline`}
              >
                ...see more
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Image or PDF */}
      {post.imageUrl && (
        <div className="px-4 pb-3">
          {isPDF ? (
            <a
              href={post.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-4 ${theme.hoverBg} rounded-xl border ${theme.cardBorder} transition-colors group`}
            >
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className={`font-medium text-sm ${theme.textPrimary}`}>PDF Document</p>
                <p className={`text-xs ${theme.accentColor} group-hover:underline`}>Click to open</p>
              </div>
            </a>
          ) : (
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full rounded-xl object-cover max-h-96"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
      )}

      {/* Engagement Stats */}
      {(post.averageRating > 0 || post.totalReviews > 0 || post.shares > 0) && (
        <div className={`px-4 py-2 border-t ${theme.divider} flex items-center justify-between`}>
          <div className={`flex items-center gap-3 text-xs ${theme.textMuted}`}>
            {post.averageRating > 0 && (
              <button onClick={handleShowReviews} className="flex items-center gap-1 hover:underline">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{post.averageRating.toFixed(1)}</span>
              </button>
            )}
          </div>
          <div className={`flex items-center gap-3 text-xs ${theme.textMuted}`}>
            {post.totalReviews > 0 && (
              <button onClick={handleShowReviews} className="hover:underline">
                {post.totalReviews} review{post.totalReviews !== 1 ? 's' : ''}
              </button>
            )}
            {post.shares > 0 && (
              <span>{post.shares} shares</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`px-2 py-1 border-t ${theme.divider}`}>
        <div className="flex items-center justify-around">
          <button
            onClick={() => setShowReviewModal(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-sm font-medium group ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText}`}
          >
            <Star className={`w-4 h-4 transition-transform group-hover:scale-110`} />
            <span>Rate</span>
          </button>

          <button
            onClick={onShare}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText} group`}
          >
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Share</span>
          </button>

          <button
            onClick={onSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${isSaved
                ? "text-amber-500 bg-amber-500/10"
                : `${theme.textSecondary} ${theme.hoverBg} ${theme.hoverText}`
              }`}
          >
            <Bookmark className={`w-4 h-4 group-hover:scale-110 transition-transform ${isSaved ? "fill-current" : ""}`} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className={`border-t ${theme.divider}`}>
          {/* Comment Input */}
          <div className="p-3">
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                {user?.name?.charAt(0) || user?.firstName?.charAt(0) || "U"}
              </div>

              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => onComment?.(e.target.value)}
                  placeholder="Write a comment..."
                  className={`flex-1 ${theme.inputBg} border ${theme.inputBorder} rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 ${theme.inputText} ${theme.inputPlaceholder} transition-all`}
                  onKeyDown={(e) => e.key === "Enter" && onSubmitComment?.()}
                />
                <button
                  onClick={onSubmitComment}
                  disabled={!commentInput?.trim()}
                  className={`${theme.accentColor} disabled:opacity-40 hover:opacity-80 transition-opacity`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Existing Comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="px-4 pb-4 space-y-3">
              {post.comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                    {(comment.author?.name || comment.author?.firstName || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className={`${theme.hoverBg} rounded-xl px-3 py-2.5`}>
                      <span className={`font-semibold text-xs ${theme.textPrimary}`}>
                        {comment.author?.name || comment.author?.firstName || "Anonymous"}
                      </span>
                      <p className={`text-sm ${theme.textSecondary} mt-0.5`}>{comment.content}</p>
                    </div>
                    <div className={`flex items-center gap-3 mt-1 ml-3 text-xs ${theme.textMuted}`}>
                      <span>{formatTimeAgo(comment.createdAt)}</span>
                      <button className={`hover:${theme.accentColor} transition-colors font-medium`}>Like</button>
                      <button className={`hover:${theme.accentColor} transition-colors font-medium`}>Reply</button>
                    </div>
                  </div>
                </div>
              ))}
              {post.comments.length > 3 && (
                <button className={`text-sm font-medium ${theme.accentColor} hover:underline ml-10`}>
                  View all {post.comments.length} comments
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>

    {/* Review Modal */}
    <ReviewModal
      isOpen={showReviewModal}
      onClose={() => setShowReviewModal(false)}
      onSubmit={handleReviewSubmit}
      existingReview={userReview}
    />

    {/* Reviews List Modal */}
    <ReviewsListModal
      isOpen={showReviewsModal}
      onClose={() => setShowReviewsModal(false)}
      reviews={allReviews}
      loading={loadingReviews}
      averageRating={post.averageRating}
      totalReviews={post.totalReviews}
      onAddReview={() => {
        setShowReviewsModal(false);
        setShowReviewModal(true);
      }}
    />
  </>
  );
}
