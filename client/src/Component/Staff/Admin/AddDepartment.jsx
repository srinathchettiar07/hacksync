import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, UserCheck, Users, Building2, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const DepartmentForm = () => {
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headEmail: ''
  });
  
  // State for staff list - initialize as empty array
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch staff data from backend
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
       const token = localStorage.getItem("token"); // wherever you store it
            const response = await axios.get("http://localhost:3000/admin/workers", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        // Handle different response structures
        let staffData = [];
        
        if (Array.isArray(response.data)) {
          // If response.data is already an array
          staffData = response.data;
        } else if (response.data && Array.isArray(response.data.staff)) {
          // If response.data has a staff property that is an array
          staffData = response.data.staff;
        } else if (response.data && Array.isArray(response.data.data)) {
          // If response.data has a data property that is an array
          staffData = response.data.data;
        } else if (response.data && Array.isArray(response.data.users)) {
          // If response.data has a users property that is an array
          staffData = response.data.users;
        } else {
          // Fallback: try to convert to array if it's an object
          if (response.data && typeof response.data === 'object') {
            staffData = Object.values(response.data);
          } else {
            console.error('Unexpected API response structure:', response.data);
            toast.error('Unexpected data format received from server');
          }
        }
        
        // Ensure we have an array before setting state
        if (Array.isArray(staffData)) {
          setStaff(staffData);
        } else {
          setStaff([]);
          toast.error('Failed to parse staff data');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast.error('Failed to load staff data');
        setStaff([]); // Ensure staff is always an array
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || !formData.headEmail) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token"); 
      // Create department - replace with your actual API endpoint
        const departmentResponse = await axios.post(
    "http://localhost:3000/admin/add-department",
    {
        name: formData.name,
        description: formData.description,
        headEmail: formData.headEmail,
    },
    {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    }
    );

      // wherever you store it
            const response = await axios.get("http://localhost:3000/admin/workers", {
        
        });
      
      // Update staff role - replace with your actual API endpoint
    //   await axios.patch(`/api/staff/${formData.headEmail}`, { 
    //     role: 'Department Head' 
    //   });
      
    //   // Send email notification - replace with your actual API endpoint
    //   await axios.post('/api/email', {
    //     to: formData.headEmail,
    //     subject: 'Department Head Assignment',
    //     message: `You have been assigned as the head of ${formData.name} department.`
    //   });
      
      // Update local state - safely handle staff array
      if (Array.isArray(staff)) {
        const updatedStaff = staff.map(person => 
          person && person.email === formData.headEmail 
            ? { ...person, role: 'Department Head' } 
            : person
        );
        setStaff(updatedStaff);
      }
      
      // Show success toast
      toast.success(`Department "${formData.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        headEmail: ''
      });
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Safely render staff list
  const renderStaffList = () => {
    // Ensure staff is an array before mapping
    if (!Array.isArray(staff) || staff.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Users className="h-12 w-12 mb-4 opacity-50" />
          <p>No staff members available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {staff.map((person, index) => {
          // Check if person is valid
          if (!person || typeof person !== 'object') {
            return null; // Skip invalid items
          }
          
          const initials = person.name 
            ? person.name.split(' ').map(n => n[0]).join('')
            : '??';
            
          return (
            <motion.div
              key={person.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                person.role === 'Department Head' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              } transition-all hover:shadow-md`}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                  person.role === 'Department Head' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                } font-bold`}>
                  {initials}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{person.name || 'Unknown'}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      person.role === 'Department Head' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {person.role || 'Staff'}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-1" />
                    {person.email || 'No email provided'}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg mb-4">
            <Building2 className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Department Management</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create a new department and assign a department head from available staff members
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center">
                <UserCheck className="mr-2 h-6 w-6" />
                Create New Department
              </h2>
              <p className="mt-2 opacity-90">Fill in the details to create a new department</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter department name"
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter department description"
                ></textarea>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label htmlFor="headEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Department Head
                </label>
                <select
                  id="headEmail"
                  name="headEmail"
                  value={formData.headEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isLoading || !Array.isArray(staff) || staff.length === 0}
                >
                  <option value="">Select a staff member</option>
                  {Array.isArray(staff) && staff.map(person => (
                    <option key={person._id} value={person.email}>
                      {person.name} ({person.email}) - {person.role}
                    </option>
                  ))}
                </select>
                {isLoading && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Loading staff data...
                  </div>
                )}
                {!isLoading && (!Array.isArray(staff) || staff.length === 0) && (
                  <div className="mt-2 text-sm text-red-500">
                    No staff members available
                  </div>
                )}
              </motion.div>
              
              <motion.div variants={itemVariants} className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || !Array.isArray(staff) || staff.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Create Department
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center">
                <Users className="mr-2 h-6 w-6" />
                Available Staff
              </h2>
              <p className="mt-2 opacity-90">
                {isLoading 
                  ? 'Loading...' 
                  : Array.isArray(staff) 
                    ? `${staff.length} staff members available` 
                    : 'No staff data available'
                }
              </p>
            </div>
            
            <div className="p-6 h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                renderStaffList()
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;