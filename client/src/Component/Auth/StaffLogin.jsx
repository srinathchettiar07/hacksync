import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, Building2, AlertCircle, User } from "lucide-react";
import { UserContext } from "../../Context/userContext"; // Adjust path as needed

function StaffLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Worker"
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:3000/auth/staff/login", formData);
      if (res.data.success) {
        setMessage(res.data.message);
        login(res.data.token, res.data.staff, res.data.staff.role);
        console.log(res.data);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section - Using Deep Teal for staff */}
        <div className="bg-[#004D40] text-white p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Building2 className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">CivicConnect</h1>
          </div>
          <p className="text-[#E0F2F1] mt-1">Municipal Staff Portal</p>
        </div>
        
        {/* Illustration */}
        <div className="bg-[#00796B] p-4 flex justify-center">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-[#004D40] rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
        
        {/* Form Section */}
        <div className="px-8 py-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Staff Login</h2>
          <p className="text-gray-600 text-center mb-6">Access the municipal administration dashboard</p>
          
          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700 text-sm font-medium mb-2">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:border-transparent transition appearance-none"
                  required
                >
                  <option value="Worker">Worker</option>
                  <option value="DepartmentHead">Department Head</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="staff@municipality.gov"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:border-transparent transition"
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-[#004D40] focus:ring-[#004D40] border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-[#004D40] hover:underline">
                Forgot password?
              </a>
            </div>
            
            {/* Message Display */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center ${
                message.includes("success") ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}>
                {message.includes("success") ? (
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={message.includes("success") ? "text-green-700 text-sm" : "text-red-700 text-sm"}>
                  {message}
                </span>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004D40] transition ${
                isLoading ? "bg-[#4DB6AC] cursor-not-allowed" : "bg-[#00796B] hover:bg-[#00695C]"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">Secure Access</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          {/* Additional Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-xs flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              For security reasons, please log out after each session when using a shared device.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} CivicConnect. Restricted access for authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;