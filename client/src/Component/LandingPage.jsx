import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  MapPin, 
  AlertCircle, 
  Clock, 
  BarChart3, 
  Send, 
  CheckCircle, 
  Users, 
  Smartphone, 
  Shield, 
  TrendingUp,
  ChevronRight,
  Play,
  Github,
  ExternalLink,
  Menu,
  X
} from "lucide-react";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState('citizen');

  useEffect(() => {
    // Scroll animation effect
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.observe').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-[#1E3A8A] rounded-md flex items-center justify-center text-white font-bold mr-2">
                  C
                </div>
                <Link to={"/staff/login"}>
                <span className="font-bold text-xl text-[#1E3A8A]">CivicConnect</span>
                </Link>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-[#1E3A8A] font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-[#1E3A8A] font-medium">How It Works</a>
              <a href="#technology" className="text-gray-700 hover:text-[#1E3A8A] font-medium">Technology</a>
              <div className="flex space-x-4">
                <Link to="/citizen/login" className="px-4 py-2 rounded-lg text-[#1E3A8A] font-medium hover:bg-blue-50 transition">
                  Log in
                </Link>
                <Link to="/citizen/signup" className="px-4 py-2 bg-[#1E3A8A] rounded-lg text-white font-medium hover:bg-[#233876] transition">
                  Sign Up
                </Link>
              </div>
            </div>
            
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white px-4 pt-2 pb-4 shadow-lg">
            <div className="flex flex-col space-y-3">
              <a href="#features" className="px-3 py-2 rounded-md text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="px-3 py-2 rounded-md text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>How It Works</a>
              <a href="#technology" className="px-3 py-2 rounded-md text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Technology</a>
              <div className="pt-2 border-t border-gray-200 flex flex-col space-y-3">
                <Link to="/citizen/login" className="px-3 py-2 rounded-md text-[#1E3A8A] font-medium text-center" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/citizen/signup" className="px-3 py-2 bg-[#1E3A8A] rounded-md text-white font-medium text-center" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F9FAFB] to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 observe">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Bridging the Gap Between <span className="text-[#1E3A8A]">Citizens and Municipalities</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                A real-time issue reporting and management platform that empowers communities and streamlines public works.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/citizen/signup" className="px-6 py-3 bg-[#1E3A8A] rounded-xl text-white font-medium hover:bg-[#233876] transition flex items-center justify-center">
                  Get Started
                  <ChevronRight size={20} className="ml-1" />
                </Link>
                <button className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center">
                  <Play size={20} className="mr-2" />
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0 observe">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-100 rounded-2xl rotate-2"></div>
                <div className="relative bg-white rounded-2xl shadow-xl p-2 border border-gray-200">
                  <div className="rounded-xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                      alt="CivicConnect App Dashboard" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center observe">
            <h2 className="text-3xl font-bold text-gray-900">The Challenge We're Solving</h2>
            <p className="mt-4 text-xl text-gray-600">Traditional civic issue reporting faces several critical problems</p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Send size={32} className="text-[#1E3A8A]" />,
                title: "Inefficient Reporting",
                description: "Citizens don't know how or where to report problems, leading to unresolved issues."
              },
              {
                icon: <Clock size={32} className="text-[#1E3A8A]" />,
                title: "Slow Response Times",
                description: "Issues get lost in bureaucratic red tape, taking weeks or months to resolve."
              },
              {
                icon: <AlertCircle size={32} className="text-[#1E3A8A]" />,
                title: "Lack of Transparency",
                description: "No way for citizens to track their complaints or see municipal progress."
              },
              {
                icon: <BarChart3 size={32} className="text-[#1E3A8A]" />,
                title: "Poor Prioritization",
                description: "Municipalities struggle to identify critical areas that need immediate attention."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 observe">
                <div className="flex justify-center">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">{item.title}</h3>
                <p className="mt-2 text-gray-600 text-center">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution/How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center observe">
            <h2 className="text-3xl font-bold text-gray-900">How CivicConnect Transforms Civic Engagement</h2>
            <p className="mt-4 text-xl text-gray-600">A simple four-step process to make our cities better, together</p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Report",
                description: "Citizens report issues in under 30 seconds with photos, voice notes, and auto-location tagging."
              },
              {
                step: "02",
                title: "Route & Assign",
                description: "Our AI engine automatically categorizes and routes the ticket to the correct department official."
              },
              {
                step: "03",
                title: "Track & Update",
                description: "Users get real-time notifications. Officials update status directly from the field."
              },
              {
                step: "04",
                title: "Resolve & Analyze",
                description: "Issues are closed efficiently, and data is gathered for insightful analytics."
              }
            ].map((item, index) => (
              <div key={index} className="relative observe">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div className="pt-8 pb-6 px-6 bg-white rounded-2xl shadow-sm border border-gray-200 h-full">
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center observe">
            <h2 className="text-3xl font-bold text-gray-900">Powerful Features for Everyone</h2>
            <p className="mt-4 text-xl text-gray-600">Designed to serve both citizens and municipal staff effectively</p>
          </div>
          
          <div className="mt-12">
            <div className="flex justify-center border-b border-gray-200">
              <button
                className={`px-6 py-3 font-medium border-b-2 ${activeFeatureTab === 'citizen' ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-gray-500'}`}
                onClick={() => setActiveFeatureTab('citizen')}
              >
                For Citizens
              </button>
              <button
                className={`px-6 py-3 font-medium border-b-2 ${activeFeatureTab === 'municipality' ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-gray-500'}`}
                onClick={() => setActiveFeatureTab('municipality')}
              >
                For Municipalities
              </button>
            </div>
            
            <div className="mt-8">
              {activeFeatureTab === 'citizen' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 observe">
                  {[
                    {
                      icon: <Smartphone size={24} className="text-[#1E3A8A]" />,
                      title: "Intuitive Mobile-First Design",
                      description: "Easy-to-use interface that works seamlessly on any smartphone."
                    },
                    {
                      icon: <Send size={24} className="text-[#1E3A8A]" />,
                      title: "One-Tap Reporting with Media Upload",
                      description: "Report issues in seconds with photos, audio, and automatic location tagging."
                    },
                    {
                      icon: <MapPin size={24} className="text-[#1E3A8A]" />,
                      title: "Real-Time Complaint Tracking",
                      description: "Follow your report's journey from submission to resolution on an interactive map."
                    },
                    {
                      icon: <CheckCircle size={24} className="text-[#1E3A8A]" />,
                      title: "Status Notifications",
                      description: "Get instant SMS or push notifications at every stage of your report's progress."
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <p className="mt-1 text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 observe">
                  {[
                    {
                      icon: <BarChart3 size={24} className="text-[#1E3A8A]" />,
                      title: "Smart Automated Ticketing & Routing",
                      description: "AI-powered categorization and routing of issues to the correct department."
                    },
                    {
                      icon: <MapPin size={24} className="text-[#1E3A8A]" />,
                      title: "Centralized Admin Dashboard with Live Map",
                      description: "Visualize all city issues on an interactive map with filtering capabilities."
                    },
                    {
                      icon: <AlertCircle size={24} className="text-[#1E3A8A]" />,
                      title: "Priority-Based Task Assignment",
                      description: "Automatically prioritize issues based on severity, location, and citizen reports."
                    },
                    {
                      icon: <TrendingUp size={24} className="text-[#1E3A8A]" />,
                      title: "Powerful Analytics & Reporting Tools",
                      description: "Gain insights into response times, resolution rates, and common issue types."
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <p className="mt-1 text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center observe">
            <h2 className="text-3xl font-bold text-gray-900">Built With Cutting-Edge Technology</h2>
            <p className="mt-4 text-xl text-gray-600">Leveraging modern tools to deliver a seamless experience</p>
          </div>
          
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: "React", category: "Frontend", color: "bg-blue-100" },
              { name: "Node.js", category: "Backend", color: "bg-green-100" },
              { name: "MongoDB", category: "Database", color: "bg-green-100" },
              { name: "AWS S3", category: "Cloud Storage", color: "bg-yellow-100" },
              { name: "Mapbox API", category: "Maps", color: "bg-blue-100" },
              { name: "Twilio API", category: "SMS", color: "bg-red-100" },
              { name: "TensorFlow", category: "AI", color: "bg-orange-100" },
              { name: "Firebase", category: "Authentication", color: "bg-yellow-100" },
              { name: "Docker", category: "Containerization", color: "bg-blue-100" },
              { name: "GitHub", category: "Version Control", color: "bg-gray-100" },
            ].map((tech, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center observe">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${tech.color}`}>
                  <div className="text-xl font-bold text-gray-800">
                    {tech.name.slice(0, 2)}
                  </div>
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{tech.name}</h3>
                <p className="text-sm text-gray-600">{tech.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1E3A8A] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Transform Your Community?</h2>
          <p className="mt-4 text-xl text-blue-100">Join CivicConnect today and be part of the change</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/citizen/signup" className="px-6 py-3 bg-white rounded-xl text-[#1E3A8A] font-medium hover:bg-gray-100 transition">
              Sign Up as Citizen
            </Link>
            <button className="px-6 py-3 border border-white rounded-xl text-white font-medium hover:bg-blue-900 transition">
              Municipality Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-300 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-[#1E3A8A] rounded-md flex items-center justify-center text-white font-bold mr-2">
                  C
                </div>
                <span className="font-bold text-xl text-white">CivicConnect</span>
              </div>
              <p className="mt-4">Making civic issue resolution efficient, transparent, and collaborative.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#technology" className="hover:text-white">Technology</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} CivicConnect. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease forwards;
        }
        .observe {
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;