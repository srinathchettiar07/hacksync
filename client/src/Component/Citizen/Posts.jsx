import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Share,
  MoreHorizontal,
  MapPin,
  Clock,
  Send,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // comments cache: { [postId]: [{id,user,text,timestamp}, ...] }
  const [commentsCache, setCommentsCache] = useState({});
  // per-post comment text
  const [commentTextMap, setCommentTextMap] = useState({});
  // loading states
  const [commentLoading, setCommentLoading] = useState({});
  const [postingComment, setPostingComment] = useState({});
  const [togglingUpvote, setTogglingUpvote] = useState({});
  // per-post open comment section
  const [openComments, setOpenComments] = useState({});
  // per-post slider index
  const [imageIndex, setImageIndex] = useState({});

  const apiBase = "http://localhost:3000";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/citizen/posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to fetch posts (${res.status})`);
      }

      const json = await res.json();
      setPosts(json.posts || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      setCommentLoading((p) => ({ ...p, [postId]: true }));

      const res = await fetch(`${apiBase}/citizen/complaint/${postId}/comments`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to fetch comments (${res.status})`);
      }

      const json = await res.json();
      setCommentsCache((p) => ({ ...p, [postId]: json.comments || [] }));
    } catch (err) {
      console.error("Error fetching comments:", err);
      setCommentsCache((p) => ({ ...p, [postId]: [] }));
    } finally {
      setCommentLoading((p) => ({ ...p, [postId]: false }));
    }
  };

  const handleToggleUpvote = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to upvote posts");
        return;
      }

      setTogglingUpvote((p) => ({ ...p, [postId]: true }));

      const res = await fetch(`${apiBase}/citizen/complaint/${postId}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to toggle upvote (${res.status})`);
      }

      const json = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, upvotes: json.count ?? p.upvotes, hasUpvoted: !!json.upvoted } : p
        )
      );
    } catch (err) {
      console.error("Error toggling upvote:", err);
      alert("Failed to upvote. Please try again.");
    } finally {
      setTogglingUpvote((p) => ({ ...p, [postId]: false }));
    }
  };

  const handleAddComment = async (postId) => {
    const text = (commentTextMap[postId] || "").trim();
    if (!text) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to comment");
        return;
      }

      setPostingComment((p) => ({ ...p, [postId]: true }));

      const res = await fetch(`${apiBase}/citizen/complaint/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ comment: text }),
      });

      if (!res.ok) {
        const textErr = await res.text();
        throw new Error(textErr || `Failed to post comment (${res.status})`);
      }

      const json = await res.json();
      const newComment = json.comment;
      const commentCount = json.commentCount;

      setCommentsCache((p) => {
        const existing = p[postId] || [];
        return { ...p, [postId]: [newComment, ...existing] };
      });

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: commentCount ?? p.commentCount } : p))
      );

      setCommentTextMap((p) => ({ ...p, [postId]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment. Please try again.");
    } finally {
      setPostingComment((p) => ({ ...p, [postId]: false }));
    }
  };

  const toggleCommentSection = async (postId) => {
    const isOpen = openComments[postId];
    if (isOpen) {
      setOpenComments((p) => ({ ...p, [postId]: false }));
    } else {
      if (!commentsCache[postId]) {
        await fetchComments(postId);
      }
      setOpenComments((p) => ({ ...p, [postId]: true }));
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return postTime.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    }
  };

  // Image slider handlers
  const handlePrevImage = (postId, total) => {
    setImageIndex((p) => ({
      ...p,
      [postId]: p[postId] > 0 ? p[postId] - 1 : total - 1,
    }));
  };

  const handleNextImage = (postId, total) => {
    setImageIndex((p) => ({
      ...p,
      [postId]: p[postId] < total - 1 ? p[postId] + 1 : 0,
    }));
  };

  // UI render
  if (loading) {
    return <div className="text-center py-10">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        {error} <button onClick={fetchPosts}>Retry</button>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return <div className="text-center py-10 text-gray-600">No posts yet.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white p-6 rounded-2xl mb-6 shadow-lg"
        >
          <h1 className="text-2xl font-bold mb-2">Community Feed</h1>
          <p className="text-blue-100">
            See what issues your neighbors are reporting and show your support
          </p>
        </motion.div>

        {posts.map((post, index) => {
          const images = post.images || (post.image ? [post.image] : []);
          const currentIndex = imageIndex[post.id] || 0;

          // console.log(post.user);

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50">
                <div className="flex items-center">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-[#1E3A8A] shadow-sm"
                  />
                  <div>
                    <h3 className="font-medium text-gray-800">{post.user.name}</h3>
                    <div className="flex items-center text-xs text-gray-500">
                      {/* <MapPin size={12} className="mr-1" />{" "} */}
                      {/* <span className="truncate max-w-xs">{post.user.location}</span> */}

                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      post.status
                    )} mr-3`}
                  >
                    {post.status}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* Image slider */}
              {images.length > 0 && (
                <div className="relative">
                  <img
                    src={images[currentIndex]}
                    alt="Post"
                    className="w-full h-72 object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => handlePrevImage(post.id, images.length)}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => handleNextImage(post.id, images.length)}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-2 w-full flex justify-center space-x-1">
                        {images.map((_, i) => (
                          <span
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i === currentIndex ? "bg-white" : "bg-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-4 right-4">
                    <span className="text-xs font-medium bg-gray-800 text-white px-2 py-1 rounded">
                      {post.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Caption + Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleUpvote(post.id)}
                      className={`flex items-center transition p-2 rounded-xl ${
                        post.hasUpvoted
                          ? "bg-blue-100 text-[#1E3A8A]"
                          : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#1E3A8A]"
                      }`}
                      disabled={!!togglingUpvote[post.id]}
                    >
                      {togglingUpvote[post.id] ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : post.hasUpvoted ? (
                        <ChevronDown size={20} className="mr-1" />
                      ) : (
                        <ChevronUp size={20} className="mr-1" />
                      )}
                      <span className="font-medium">{post.upvotes}</span>
                    </button>

                    <button
                      onClick={() => toggleCommentSection(post.id)}
                      className={`flex items-center bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#1E3A8A] transition p-2 rounded-xl ${
                        openComments[post.id] ? "bg-blue-50 text-[#1E3A8A]" : ""
                      }`}
                    >
                      <MessageCircle size={18} className="mr-1" />
                      <span>{post.commentCount}</span>
                    </button>

                    <button className="bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#1E3A8A] transition p-2 rounded-xl">
                      <Share size={18} />
                    </button>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    <Clock size={12} className="mr-1" />
                    {formatTime(post.timestamp)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                  <p className="text-gray-800">{post.caption}</p>
                </div>

                {/* Comments area */}
                {openComments[post.id] && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    {commentLoading[post.id] ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 text-[#1E3A8A] animate-spin" />
                      </div>
                    ) : commentsCache[post.id] &&
                      commentsCache[post.id].length > 0 ? (
                      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                        {commentsCache[post.id].map((comment) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex"
                          >
                            <div className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100 shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-gray-800">
                                  {comment.user}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(comment.timestamp)}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm">
                                {comment.text}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                        <MessageCircle
                          size={24}
                          className="text-gray-400 mx-auto mb-2"
                        />
                        <p className="text-gray-500 text-sm">
                          No comments yet. Be the first to comment!
                        </p>
                      </div>
                    )}

                    {/* Add Comment input */}
                    <div className="flex items-center mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <input
                        type="text"
                        value={commentTextMap[post.id] || ""}
                        onChange={(e) =>
                          setCommentTextMap((p) => ({
                            ...p,
                            [post.id]: e.target.value,
                          }))
                        }
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-3 focus:outline-none bg-transparent"
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            (commentTextMap[post.id] || "").trim()
                          ) {
                            handleAddComment(post.id);
                          }
                        }}
                        disabled={!!postingComment[post.id]}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={
                          !((commentTextMap[post.id] || "").trim()) ||
                          !!postingComment[post.id]
                        }
                        className="bg-[#1E3A8A] text-white p-3 hover:bg-[#233876] disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {postingComment[post.id] ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Posts;
