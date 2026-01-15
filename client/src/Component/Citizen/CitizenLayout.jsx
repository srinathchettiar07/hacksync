import { Outlet, Link, useNavigate } from "react-router";
import { useContext, useState } from "react";
import {
  LogOut,
  User,
  FileText,
  PlusCircle,
  Settings,
  Home,
  Menu,
  X,
  ClipboardList,
  AlertCircle,
  MapPin,
  HelpCircle,
  FileSearch
} from "lucide-react";
import { UserContext } from "../../Context/userContext";

const CitizenLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const { user, logout, type } = useContext(UserContext);





  const handleLogout = () => {
    logout()
  };

  const menuItems = [
    { id: "dashboard", path: "/citizen/portal/dashboard", label: "Dashboard", icon: Home },
    { id: "file-complaint", path: "/citizen/portal/file-a-complain", label: "File a Complaint", icon: PlusCircle },
    { id: "posts", path: "/citizen/portal/posts", label: "See All Complaints", icon: ClipboardList },
    { id: "chatroom", path: "/citizen/portal/chat", label: "Chat Room", icon: ClipboardList},
    { id: "document-analysis", path: "/citizen/portal/document-analysis", label: "Document Analysis", icon: FileSearch}
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-[#1E3A8A] text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform lg:translate-x-0 lg:static lg:inset-0
        w-64 bg-white shadow-lg z-40 flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo and Website Name */}
        <div className="bg-[#1E3A8A] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <MapPin className="h-6 w-6 text-[#1E3A8A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">CivicConnect</h2>
                <p className="text-[#E0F2FE] text-xs">{type}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b">
          <div className="flex items-center">
            <img
              src={user?.profilePicture}
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-[#1E3A8A]"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-800">{user?.displayName}</p>
              <p className="text-xs text-gray-500"> Citizen</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className="flex items-center p-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-[#1E3A8A] transition"
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

        {/* Help Section */}
        <div className="px-4 pb-4">
          <Link
            to="/citizen/portal/help"
            className="flex items-center p-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-[#1E3A8A] transition"
            onClick={() => setSidebarOpen(false)}
          >
            <HelpCircle size={20} className="mr-3" />
            Help & Support
          </Link>
        </div>

        {/* Sign Out Section */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 mt-auto border-t">
          <p className="text-xs text-center text-gray-500">
            CivicConnect © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Only show on mobile */}
        <div className="lg:hidden bg-white shadow-sm py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Citizen Portal</h1>
          <div className="flex items-center">
            <img
              src={user?.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-[#1E3A8A]"
            />
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">

          <Outlet />
          
        </div>
      </div>
    </div>
  );
};

export default CitizenLayout;