import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  UserPlus,
  RefreshCw
} from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";

const ComplaintDashboard = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [availableWorkers, setAvailableWorkers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [selectedDepartment, selectedStatus, selectedWorker]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const deptRes = await axios.get("http://localhost:3000/admin/departments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(deptRes.data.data || []);

      const workerRes = await axios.get("http://localhost:3000/admin/workers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(workerRes.data || []);

      await fetchComplaints();
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (selectedDepartment) params.append("departmentId", selectedDepartment);
      if (selectedStatus) params.append("status", selectedStatus);
      if (selectedWorker) params.append("workerId", selectedWorker);

      const res = await axios.get(
        `http://localhost:3000/complaints?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComplaints(res.data.data || []);
      calculateStats(res.data.data || []);
    } catch {
      toast.error("Failed to load complaints");
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter(c => c.status === "Pending").length,
      inProgress: data.filter(c => c.status === "In Progress").length,
      resolved: data.filter(c => c.status === "Resolved").length
    });
  };

  const handleRowClick = (complaintId) => {
    navigate(`/admin/complaint/${complaintId}`);
  };

  const handleAssignComplaint = async (e, complaint) => {
    e.stopPropagation();
    setSelectedComplaint(complaint);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/complaints/workers/${complaint.assignedDepartmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableWorkers(res.data.data || []);
      setShowAssignModal(true);
    } catch {
      toast.error("Failed to load workers");
    }
  };

  const handleAssignWorker = async (workerId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/complaints/${selectedComplaint._id}/assign`,
        {
          departmentId: selectedComplaint.assignedDepartmentId,
          staffId: workerId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Assigned successfully");
      setShowAssignModal(false);
      fetchComplaints();
    } catch {
      toast.error("Assignment failed");
    }
  };

  const handleStatusUpdate = async (e, complaintId, status) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:3000/complaints/${complaintId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Status updated");
      fetchComplaints();
    } catch {
      toast.error("Update failed");
    }
  };

  const filteredComplaints = complaints.filter(c =>
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (s) =>
    s === "Resolved"
      ? "bg-green-100 text-green-800"
      : s === "In Progress"
      ? "bg-blue-100 text-blue-800"
      : "bg-yellow-100 text-yellow-800";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6">
        Complaint Management Dashboard
      </h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredComplaints.map((complaint) => (
                <motion.tr
                  key={complaint._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => handleRowClick(complaint._id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    #{complaint._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4">{complaint.category}</td>
                  <td className="px-6 py-4 truncate max-w-xs">
                    {complaint.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={(e) => handleAssignComplaint(e, complaint)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <UserPlus size={16} />
                    </button>
                    <select
                      value={complaint.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleStatusUpdate(e, complaint._id, e.target.value)
                      }
                      className="text-xs border rounded px-2"
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-lg font-semibold mb-4">Assign Worker</h3>
              {availableWorkers.map(worker => (
                <button
                  key={worker._id}
                  onClick={() => handleAssignWorker(worker._id)}
                  className="w-full text-left p-3 border rounded mb-2 hover:bg-gray-50"
                >
                  {worker.name}
                </button>
              ))}
              <button
                onClick={() => setShowAssignModal(false)}
                className="mt-4 text-gray-600"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplaintDashboard;
