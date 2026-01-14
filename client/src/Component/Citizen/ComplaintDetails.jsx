// ComplaintDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router";
import {
  BarChart3,
  Image as ImageIcon,
  MessageCircle,
  Heart,
  Clock,
  User,
  MapPin,
  Send,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const apiBase = "http://localhost:3000";

const ComplaintDetail = () => {
  const { complaintId } = useParams();
  const [complaintData, setComplaintData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [imageIndex, setImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [togglingUpvote, setTogglingUpvote] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false); // quick way to re-fetch after actions

  // Fetch complaint detail
  useEffect(() => {
    if (!complaintId) return;
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBase}/citizen/complaint/${complaintId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Failed to fetch (${res.status})`);
        }
        const json = await res.json();
        setComplaintData(json);
        setImageIndex(0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "Failed to load complaint");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [complaintId, refreshToggle]);

  // Derived values and charts
  const images = complaintData?.images?.map((i) => i.imageUrl) || [];
  const comments = complaintData?.comments || [];
  const complaint = complaintData?.complaint || null;
  const upvotes = complaintData?.upvotes ?? 0;
  const alreadyUpvoted = !!complaintData?.alreadyUpvoted;
  const analysis = complaintData?.analysis || {
    totalImages: images.length,
    totalComments: comments.length,
    totalUpvotes: upvotes,
    ageInDays: 0,
    engagementLevel: "Low",
  };

  // Doughnut for engagement breakdown
  const doughnutData = useMemo(() => {
    const imgs = analysis.totalImages || 0;
    const cms = analysis.totalComments || 0;
    const ups = analysis.totalUpvotes || 0;
    return {
      labels: ["Images", "Comments", "Upvotes"],
      datasets: [
        {
          data: [imgs, cms, ups],
          backgroundColor: ["#60A5FA", "#7C3AED", "#FB7185"],
          borderWidth: 1,
        },
      ],
    };
  }, [analysis]);

  // Bar: comments per last 7 days
  const barData = useMemo(() => {
    const days = 7;
    const buckets = Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const labels = buckets.map((d) =>
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );

    const counts = buckets.map((bucketStart, i) => {
      const bucketEnd = new Date(bucketStart);
      bucketEnd.setDate(bucketEnd.getDate() + 1);
      return comments.filter((c) => {
        const t = new Date(c.timestamp || c.createdAt || c.createdAt);
        return t >= bucketStart && t < bucketEnd;
      }).length;
    });

    return {
      labels,
      datasets: [
        {
          label: "Comments (last 7 days)",
          data: counts,
          backgroundColor: "#60A5FA",
        },
      ],
    };
  }, [comments]);

  // Helpers
  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  };

  const engagementBadge = (level) => {
    switch ((level || "").toLowerCase()) {
      case "high":
        return "text-green-700 bg-green-100";
      case "medium":
        return "text-yellow-700 bg-yellow-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  // Image slider controls
  const prevImage = () => {
    if (images.length === 0) return;
    setImageIndex((idx) => (idx - 1 + images.length) % images.length);
  };
  const nextImage = () => {
    if (images.length === 0) return;
    setImageIndex((idx) => (idx + 1) % images.length);
  };

  // Upvote toggle (REST)
  const toggleUpvote = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to upvote.");
      return;
    }
    if (!complaintId) return;
    try {
      setTogglingUpvote(true);
      const res = await fetch(`${apiBase}/citizen/complaint/${complaintId}/upvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed (${res.status})`);
      }
      const json = await res.json();
      // update local state without full refetch
      setComplaintData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          upvotes: json.count ?? prev.upvotes,
          alreadyUpvoted: !!json.upvoted,
        };
      });
    } catch (err) {
      console.error("Upvote error", err);
      alert("Could not toggle upvote. Try again.");
    } finally {
      setTogglingUpvote(false);
    }
  };

  // Add comment (REST)
  const postComment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to comment.");
      return;
    }
    const text = (newComment || "").trim();
    if (!text) return;
    try {
      setPostingComment(true);
      const res = await fetch(`${apiBase}/citizen/complaint/${complaintId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: text }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed (${res.status})`);
      }
      const json = await res.json();
      // prepend new comment locally
      setComplaintData((prev) => {
        if (!prev) return prev;
        const newComments = [json.comment, ...(prev.comments || [])];
        return {
          ...prev,
          comments: newComments,
          analysis: {
            ...(prev.analysis || {}),
            totalComments: (prev.analysis?.totalComments || 0) + 1,
          },
        };
      });
      setNewComment("");
      // bump refreshToggle if you prefer to re-fetch fresh data
      setRefreshToggle((v) => !v);
    } catch (err) {
      console.error("Comment error", err);
      alert("Could not post comment. Try again.");
    } finally {
      setPostingComment(false);
    }
  };

  // Loading / error
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-b-2 border-gray-900 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading complaint...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="max-w-xl text-center p-6 bg-white rounded-xl shadow">
          <p className="text-red-600 font-medium mb-2">Error</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setRefreshToggle((v) => !v)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Complaint not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{complaint.category} Issue</h1>
            <p className="text-sm text-gray-500">Reported {formatTime(complaint.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleUpvote}
            disabled={togglingUpvote}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 border ${
              alreadyUpvoted ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span className="font-medium">{upvotes}</span>
          </button>
          <button
            onClick={() => setShowLightbox(true)}
            className="px-3 py-2 rounded-lg bg-white border border-gray-200"
            title="Open gallery"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Gallery + caption */}
        <div className="lg:col-span-2 space-y-4">
          {/* Gallery */}
          <div className="bg-white rounded-xl overflow-hidden border">
            {images.length > 0 ? (
              <div className="relative">
                <img
                  src={images[imageIndex]}
                  alt={`evidence-${imageIndex}`}
                  className="w-full h-[420px] object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      aria-label="prev image"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      aria-label="next image"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
                    >
                      <ChevronRight />
                    </button>

                    {/* thumbnails */}
                    <div className="absolute left-4 right-4 bottom-3 flex justify-center space-x-2">
                      {images.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => setImageIndex(i)}
                          className={`w-10 h-10 rounded overflow-hidden border ${
                            i === imageIndex ? "border-white ring-2 ring-blue-400" : "border-transparent"
                          }`}
                        >
                          <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ImageIcon className="mx-auto mb-3 w-10 h-10" />
                <p>No images provided for this complaint</p>
              </div>
            )}
          </div>

          {/* Caption & metadata */}
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-gray-800 whitespace-pre-line">{complaint.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <div className="flex items-center text-sm text-gray-600 space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>{complaint.user?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{complaint.address || "Location not provided"}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{analysis.ageInDays} days ago</span>
              </div>
              <div className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${engagementBadge(analysis.engagementLevel)}`}>
                {analysis.engagementLevel} engagement
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Discussion</h3>
                <span className="text-sm text-gray-500">({analysis.totalComments})</span>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-3 max-h-64 overflow-auto pr-2">
              {comments.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  No comments yet — be the first to comment.
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{c.user}</div>
                        <div className="text-xs text-gray-500">{formatTime(c.timestamp)}</div>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700 text-sm">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add comment */}
            <div className="mt-4 flex items-center gap-3">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-300"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newComment.trim()) postComment();
                }}
              />
              <button
                onClick={postComment}
                disabled={!newComment.trim() || postingComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {postingComment ? "Posting..." : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: analysis + map */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" /> Visual Evidence
            </h4>
            <div className="mt-3 text-sm text-gray-600">
              {analysis.totalImages > 2 ? "Excellent visual documentation." : "Consider adding more images for clarity."}
            </div>
            <div className="mt-4">
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" /> Activity (7 days)
            </h4>
            <div className="mt-3 h-40">
              <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
            <div className="mt-3 text-sm text-gray-600">Comments distribution over the last 7 days.</div>
          </div>

          <div className="bg-white rounded-xl p-4 border">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" /> Location
            </h4>
            <div className="mt-3">
              {complaint.locationLat && complaint.locationLong ? (
                <div className="w-full h-56 border rounded overflow-hidden">
                  <iframe
                    title="complaint-location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.google.com/maps?q=${complaint.locationLat},${complaint.locationLong}&z=16&output=embed`}
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-600">{complaint.address || "No location provided"}</div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl p-4 border">
            <h4 className="font-semibold text-gray-800">Recommended Actions</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>- Assign to dept: <strong className="capitalize">{complaint.category}</strong></li>
              <li>- {analysis.ageInDays > 5 ? "Escalate due to pending time." : "Monitor for timely resolution."}</li>
              <li>- Notify the reporter about updates & ETA.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lightbox modal for gallery */}
      {showLightbox && images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow"
              aria-label="Close"
            >
              <X />
            </button>
            <div className="relative">
              <img src={images[imageIndex]} alt={`light-${imageIndex}`} className="w-full h-[70vh] object-contain bg-black" />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full">
                    <ChevronLeft />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full">
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
            <div className="p-3 flex gap-2 overflow-x-auto bg-gray-50">
              {images.map((src, i) => (
                <button key={i} onClick={() => setImageIndex(i)} className={`w-20 h-14 rounded overflow-hidden border ${i===imageIndex ? "ring-2 ring-blue-400" : ""}`}>
                  <img src={src} alt={`mini-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetail;
