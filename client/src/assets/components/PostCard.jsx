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
} from "lucide-react";

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
  onToggleComments
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {post.author?.profilePicture ? (
                <img 
                  src={post.author.profilePicture} 
                  alt={post.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                  {post.author?.name || "Anonymous User"}
                </h3>
                {post.author?.headline && (
                  <span className="text-gray-500 text-sm">•</span>
                )}
                {post.author?.headline && (
                  <span className="text-gray-600 text-sm">
                    {post.author.headline}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>{post.author?.title || "Member"}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <div className="text-gray-800 leading-relaxed">
          {isExpanded || post.content.length <= 300 ? (
            <div className="whitespace-pre-wrap">{post.content}</div>
          ) : (
            <div>
              <div className="whitespace-pre-wrap">{truncateContent(post.content)}</div>
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium mt-2"
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
          {post.imageUrl.toLowerCase().endsWith(".pdf") ||
          post.type === "article" ? (
            <a
              href={post.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
            >
              <FileText className="w-12 h-12 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">PDF Document</p>
                <p className="text-sm text-blue-600">Click to open</p>
              </div>
            </a>
          ) : (
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full rounded-lg object-cover max-h-96"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/800x400?text=Image+Unavailable";
              }}
            />
          )}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{post.likes || 0}</span>
            </div>
            {post.commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentCount}</span>
              </div>
            )}
            {post.shares > 0 && (
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                <span>{post.shares}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-around">
          <button
            onClick={onLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              isLiked 
                ? "text-blue-600 bg-blue-50 hover:bg-blue-100" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">Like</span>
          </button>

          <button
            onClick={onToggleComments}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>

          <button
            onClick={onSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              isSaved 
                ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">Save</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          {/* Comment Input */}
          <div className="p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => onComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && onSubmitComment()}
                />
                <button
                  onClick={onSubmitComment}
                  disabled={!commentInput.trim()}
                  className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors"
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
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.author?.profilePicture ? (
                      <img 
                        src={comment.author.profilePicture} 
                        alt={comment.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {comment.author?.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{comment.content}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 ml-3">
                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                        Like
                      </button>
                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {post.comments.length > 3 && (
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all {post.comments.length} comments
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
