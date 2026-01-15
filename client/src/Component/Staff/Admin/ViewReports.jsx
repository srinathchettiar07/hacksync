import { useEffect, useState } from "react";
import axios from "axios";

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    try {
        console.log("Fetching reports...");
      const res = await axios.get(
        "http://localhost:3000/admin/reports"
      ,{
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
    console.log("Reports fetched:", res.data);
      setReports(res.data.data);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <p className="p-6">Loading reports...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Stored Reports
      </h1>

      {reports.length === 0 ? (
        <p className="text-gray-500">No reports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Project</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Budget</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.project_name}</td>
                  <td className="p-3">{r.department}</td>
                  <td className="p-3">{r.budget}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        r.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">{r.location}</td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewReports;
