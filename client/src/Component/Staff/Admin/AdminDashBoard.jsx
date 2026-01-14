import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  AlertCircle, CheckCircle, Clock, TrendingUp, Users, FileText,
  ArrowUp, ArrowDown, Search, Filter
} from 'lucide-react';

// Color palette for charts and UI
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const STATUS_COLORS = {
  'Pending': '#FFBB28',
  'In Progress': '#0088FE',
  'Resolved': '#00C49F'
};
const PRIORITY_COLORS = {
  'Low': '#00C49F',
  'Medium': '#FFBB28',
  'High': '#FF8042',
  'Critical': '#FF0000'
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
        params: { range: timeRange }
      });
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">No data available</h2>
          <p className="text-gray-600">There is no data to display on the dashboard.</p>
        </div>
      </div>
    );
  }

  const {
    summary,
    recentComplaints,
    analytics,
    hotIssues
  } = dashboardData;

  // Prepare data for charts
  const categoryData = analytics.byCategory.map(item => ({
    name: item._id,
    value: item.count
  }));

  const statusData = Object.entries(summary.statusSummary).map(([name, value]) => ({
    name,
    value
  }));

  const timelineData = analytics.overTime.map(item => ({
    name: item._id,
    issues: item.count
  }));

  const departmentData = analytics.departmentPerformance.map(dept => ({
    name: dept.departmentName,
    resolved: dept.resolved,
    pending: dept.totalAssigned - dept.resolved
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Civic Issue Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Complaints"
                value={summary.totalComplaints}
                icon={<FileText className="w-6 h-6 text-blue-500" />}
                change={12}
              />
              <MetricCard
                title="Resolved Today"
                value={summary.todayActivity.resolved}
                icon={<CheckCircle className="w-6 h-6 text-green-500" />}
                change={5}
              />
              <MetricCard
                title="Avg. Resolution Time"
                value={`${summary.avgResolutionTime}h`}
                icon={<Clock className="w-6 h-6 text-yellow-500" />}
                change={-2}
              />
              <MetricCard
                title="Registered Citizens"
                value={summary.systemOverview.totalCitizens}
                icon={<Users className="w-6 h-6 text-purple-500" />}
                change={8}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issues by Category */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Category</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Issues Over Time */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Issues Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="issues" stroke="#0088FE" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Complaints & Hot Issues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentComplaints complaints={recentComplaints} />
              <HotIssues issues={hotIssues} />
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Complaints by Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Performance */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Department Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="resolved" stackId="a" fill="#00C49F" />
                      <Bar dataKey="pending" stackId="a" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Resolution Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resolution Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{summary.avgResolutionTime}h</div>
                  <div className="text-sm text-gray-600">Average Resolution Time</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {((summary.todayActivity.resolved / summary.todayActivity.new) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Today's Resolution Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {summary.systemOverview.totalStaff}
                  </div>
                  <div className="text-sm text-gray-600">Active Staff Members</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            {change && (
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="sr-only">{change >= 0 ? 'Increased' : 'Decreased'} by</span>
                {Math.abs(change)}%
              </div>
            )}
          </dd>
        </dl>
      </div>
    </div>
  </div>
);

// Recent Complaints Component
const RecentComplaints = ({ complaints }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium text-gray-900">Recent Complaints</h3>
    </div>
    <div className="space-y-4">
      {complaints.slice(0, 5).map((complaint) => (
        <div key={complaint._id} className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${STATUS_COLORS[complaint.status]}`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-4 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {complaint.description}
            </p>
            <p className="text-xs text-gray-500 capitalize mt-1">
              {complaint.category.toLowerCase()} • {complaint.assignedDepartmentId?.name || 'Unassigned'}
            </p>
            <div className="mt-1 flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[complaint.status] ? 'bg-opacity-20' : ''}`}
                style={{ 
                  backgroundColor: `${STATUS_COLORS[complaint.status]}20`,
                  color: STATUS_COLORS[complaint.status]
                }}>
                {complaint.status}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Hot Issues Component
const HotIssues = ({ issues }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium text-gray-900">Trending Issues</h3>
      <TrendingUp className="w-5 h-5 text-orange-500" />
    </div>
    <div className="space-y-4">
      {issues.slice(0, 5).map(issue => (
        <div key={issue._id} className="flex items-start">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-100 text-orange-800">
              <ArrowUp className="w-5 h-5" />
              <span className="ml-1 font-medium">{issue.upvotes}</span>
            </div>
          </div>
          <div className="ml-4 min-w-0 flex-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">{issue.category}</h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{issue.description}</p>
            <div className="mt-1 flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[issue.status] ? 'bg-opacity-20' : ''}`}
                style={{ 
                  backgroundColor: `${STATUS_COLORS[issue.status]}20`,
                  color: STATUS_COLORS[issue.status]
                }}>
                {issue.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminDashboard;