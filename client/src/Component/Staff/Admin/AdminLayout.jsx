import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { useContext, useState } from "react";
import {
  LogOut,
  User,
  FileText,
  BarChart3,
  Shield,
  Building,
  Users,
  Settings,
  Menu,
  MapIcon,
  X,
  FolderPlus,
  BookDown,
  AlertTriangle,
  UserCheck,
  Activity,
} from "lucide-react";
import { UserContext } from "../../../Context/userContext";
import NotificationSystem from "./NotificationSystem";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(UserContext);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuItems = [
    { id: "dashboard", path: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "complaints", path: "/admin/complaints", label: "Complaint Management", icon: AlertTriangle },
    { id: "department-dashboard", path: "/admin/department-dashboard", label: "Department Dashboard", icon: Activity },
    { id: "workers", path: "/admin/workers", label: "Worker Management", icon: UserCheck },
    { id: "map", path: "/admin/map", label: "Map", icon: MapIcon },
    { id: "department", path: "/admin/add-department", label: "Create Department", icon: FolderPlus },
    { id: "departments", path: "/admin/department", label: "Departments", icon: BookDown },
    {id: "reports", path:"/admin/reports", label:"Add Reports", icon: FileText},
    {id: "view-reports", path:"/admin/view-reports", label:"View Reports", icon: FileText},
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-[#1a56db] text-white shadow-md"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#1a56db] to-[#1e40af] shadow-xl z-40 flex flex-col transform transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}
      >
        {/* Logo and Website Name */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-6 w-6 text-[#1a56db]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">CivicConnect</h2>
                <p className="text-blue-200 text-xs">Administration Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-blue-200 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center">
            <img
              src={
                user?.profilePicture ||
                "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
              }
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-blue-400"
            />
            <div className="ml-3">
              <p className="font-medium text-white">{user?.name || "Admin User"}</p>
              <p className="text-xs text-blue-200 capitalize">{user?.role || "Administrator"}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg text-blue-100 transition-all duration-200 ${
                      isActive
                        ? "bg-blue-700 text-white shadow-inner"
                        : "hover:bg-blue-600 hover:text-white"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sign Out Section */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-blue-800 text-blue-100 hover:bg-blue-700 hover:text-white transition"
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 mt-auto border-t border-blue-700">
          <p className="text-xs text-center text-blue-300">
            Admin Portal v1.0 © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {menuItems.find(item => location.pathname === item.path)?.label || "Admin Panel"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationSystem />
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
