// AdminComplaintDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router";
import {
  BarChart3,
  Image as ImageIcon,
  MessageCircle,
  Clock,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
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

const AdminComplaintDetail = () => {
  const { complaintId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imageIndex, setImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${apiBase}/admin/complaint/${complaintId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch complaint");
        }

        const json = await res.json();
        setData(json.data);
        setImageIndex(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

  if (loading) {
    return <div className="p-6 text-center">Loading complaint...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  const images = data.images?.map(i => i.imageUrl) || [];
  const comments = data.comments || [];
  const complaint = data.complaint;
  const analysis = data.analysis;

  const doughnutData = {
    labels: ["Images", "Comments", "Upvotes"],
    datasets: [
      {
        data: [
          analysis.totalImages,
          analysis.totalComments,
          analysis.totalUpvotes,
        ],
        backgroundColor: ["#60A5FA", "#7C3AED", "#FB7185"],
      },
    ],
  };

  const barData = {
    labels: analysis.commentActivity.labels,
    datasets: [
      {
        label: "Comments",
        data: analysis.commentActivity.counts,
        backgroundColor: "#60A5FA",
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="text-blue-600" />
        <h1 className="text-2xl font-bold">
          {complaint.category} Complaint
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          {/* Gallery */}
          <div className="bg-white rounded-xl border overflow-hidden">
            {images.length > 0 ? (
              <div className="relative">
                <img
                  src={images[imageIndex]}
                  className="w-full h-[420px] object-cover"
                  alt=""
                />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 bg-black/40 text-white p-2 rounded-full">
                      <ChevronLeft />
                    </button>
                    <button onClick={() => setImageIndex((imageIndex + 1) % images.length)}
                      className="absolute right-3 top-1/2 bg-black/40 text-white p-2 rounded-full">
                      <ChevronRight />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="p-6 text-gray-500 text-center">
                No images uploaded
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border p-4">
            <p>{complaint.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <User size={14} /> {complaint.user?.name || "Citizen"}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={14} /> {complaint.address}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={14} /> {analysis.ageInDays} days old
              </span>
            </div>
          </div>

          {/* Comments (READ ONLY) */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageCircle size={16} /> Citizen Comments
            </h3>
            {comments.length === 0 ? (
              <p className="text-gray-500">No comments</p>
            ) : (
              comments.map(c => (
                <div key={c._id} className="bg-gray-50 p-3 rounded mb-2">
                  <div className="text-sm font-medium">{c.user}</div>
                  <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                  <p className="text-sm mt-1">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <h4 className="font-semibold mb-3">Engagement</h4>
            <div className="h-48">
              <Doughnut data={doughnutData} />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h4 className="font-semibold mb-3">Activity</h4>
            <div className="h-40">
              <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h4 className="font-semibold mb-3">Location</h4>
            {complaint.locationLat && complaint.locationLong ? (
              <iframe
                className="w-full h-56 rounded"
                src={`https://www.google.com/maps?q=${complaint.locationLat},${complaint.locationLong}&z=16&output=embed`}
              />
            ) : (
              <p className="text-gray-500">No location available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintDetail;
