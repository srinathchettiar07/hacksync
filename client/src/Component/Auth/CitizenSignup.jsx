import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar, IdCard, AlertCircle, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

export default function CitizenSignup() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    password: "",
    aadhaar: "",
    dob: "",
    gender: "Male",
    address: "",
    otpId: "",
    otp: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validate all required fields including OTP
    if (!formData.otpId || !formData.otp) {
      setMessage("Please complete OTP verification first");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/auth/citizen/signup", formData);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);        
        setMessage("Signup successful! Redirecting to dashboard...");
        
        setTimeout(() => {
          window.location.reload();
        }, 1250);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    // Validate email before sending OTP
    if (!formData.email) {
      setMessage("Please enter your email address first");
      return;
    }

    setSendingOtp(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:3000/otp/send-otp", {
        email: formData.email
      });

      if (response.data.success) {
        setFormData(prev => ({ ...prev, otpId: response.data.otpId }));
        setOtpSent(true);
        setMessage("OTP has been sent to your email. Please check your inbox and enter the code below.");
      }
    } catch (error) {
      console.error("OTP sending error:", error);
      setMessage(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!formData.displayName || !formData.email || !formData.phone || !formData.password) {
        setMessage("Please fill all required fields");
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setMessage("Please enter a valid email address");
        return;
      }
      
      // Basic phone validation
      if (formData.phone.length < 10) {
        setMessage("Please enter a valid phone number");
        return;
      }
      
      // Password strength validation
      if (formData.password.length < 6) {
        setMessage("Password must be at least 6 characters long");
        return;
      }
      
    } else if (currentStep === 2) {
      if (!formData.aadhaar || !formData.dob || !formData.address) {
        setMessage("Please fill all required fields");
        return;
      }
      
      // Aadhaar validation (basic 12-digit check)
      if (formData.aadhaar.replace(/\s/g, '').length !== 12) {
        setMessage("Please enter a valid 12-digit Aadhaar number");
        return;
      }
    }
    
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    setMessage(""); // Clear any previous messages
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    setMessage(""); // Clear any previous messages
  };

  // Progress steps
  const steps = ["Account Details", "Personal Info", "Verification"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-[#1E3A8A] text-white p-6 text-center">
          <h1 className="text-2xl font-bold">CivicConnect</h1>
          <p className="text-[#E0F2FE] mt-1">Citizen Registration</p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6">
          <div className="flex justify-between mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center w-1/3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > index ? 'bg-[#10B981]' : 
                  currentStep === index + 1 ? 'bg-[#1E3A8A]' : 'bg-gray-300'
                } text-white`}>
                  {currentStep > index ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-1 ${
                  currentStep === index + 1 ? 'font-medium text-[#1E3A8A]' : 'text-gray-500'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <div className="px-8 py-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Create Your Account</h2>
          <p className="text-gray-600 text-center mb-6">Join us in making our community better</p>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-gray-700 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 1234567890"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                    Password *
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
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
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
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="aadhaar" className="block text-gray-700 text-sm font-medium mb-2">
                    Aadhaar Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="aadhaar"
                      name="aadhaar"
                      type="text"
                      placeholder="1234 5678 9012"
                      value={formData.aadhaar}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dob" className="block text-gray-700 text-sm font-medium mb-2">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="gender" className="block text-gray-700 text-sm font-medium mb-2">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="address" className="block text-gray-700 text-sm font-medium mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      placeholder="Your complete address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-blue-700 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {otpSent 
                      ? "OTP has been sent to your email. Please enter the 6-digit code below to verify your account."
                      : "Please click the button below to send OTP to your email address."}
                  </p>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={sendingOtp || otpSent}
                    className="bg-[#1E3A8A] text-white px-6 py-3 rounded-xl hover:bg-[#233876] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingOtp ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </>
                    ) : (
                      otpSent ? "OTP Sent ✓" : "Send OTP to My Email"
                    )}
                  </button>
                </div>

                {/* OTP Input Field - Always visible in step 3 */}
                <div>
                  <label htmlFor="otp" className="block text-gray-700 text-sm font-medium mb-2">
                    OTP Verification Code *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP code"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                      disabled={!otpSent}
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit verification code sent to your email
                  </p>
                </div>

                {otpSent && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={sendOtp}
                      className="text-sm text-[#1E3A8A] hover:underline"
                    >
                      Didn't receive the code? Resend OTP
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-3 px-6 rounded-xl text-[#1E3A8A] font-medium border border-[#1E3A8A] hover:bg-blue-50 transition"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="py-3 px-6 rounded-xl bg-[#1E3A8A] text-white font-medium hover:bg-[#233876] transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !otpSent || !formData.otp}
                  className={`py-3 px-6 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] transition ${
                    isLoading || !otpSent || !formData.otp
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#10B981] hover:bg-[#0DA271]"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Complete Signup"
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg border ${
              message.includes("success") 
                ? "bg-green-50 border-green-200 text-green-700"
                : message.includes("OTP") 
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Login Suggestion */}
          <div className="mt-6 text-center">
            <Link to="/citizen/login">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <span className="text-[#1E3A8A] font-medium hover:underline cursor-pointer">
                  Login here
                </span>
              </p>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} CivicConnect. Your data is securely stored and never shared.
          </p>
        </div>
      </div>
    </div>
  );
}