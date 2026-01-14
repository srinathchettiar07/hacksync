import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { 
  Building, 
  User, 
  Users, 
  Mail, 
  Phone, 
  Search, 
  Filter, 
  Plus,
  Edit,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Loader,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); 
  // Fetch departments data from backend with populated DepartmentHead
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/admin/departments', {
        headers: {
            Authorization: `Bearer ${token}`,
        }
        
      });
      
      if (response.data.success) {
        setDepartments(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter and sort departments
  const filteredAndSortedDepartments = departments
    .filter(dept => {
      const searchTerm = filters.search.toLowerCase();
      return (
        dept.name.toLowerCase().includes(searchTerm) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm)) ||
        (dept.contactEmail && dept.contactEmail.toLowerCase().includes(searchTerm)) ||
        (dept.contactPhone && dept.contactPhone.toLowerCase().includes(searchTerm)) ||
        (dept.DepartmentHead && dept.DepartmentHead.name.toLowerCase().includes(searchTerm))
      );
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'head':
          aValue = a.DepartmentHead ? a.DepartmentHead.name.toLowerCase() : '';
          bValue = b.DepartmentHead ? b.DepartmentHead.name.toLowerCase() : '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const toggleExpandDepartment = (departmentId) => {
    if (expandedDepartment === departmentId) {
      setExpandedDepartment(null);
    } else {
      setExpandedDepartment(departmentId);
    }
  };

  // Function to handle navigation to WorkerManagement with department filter
  const handleManageStaff = (department) => {
    // Store the selected department in localStorage for the WorkerManagement component to use
    localStorage.setItem('selectedDepartment', JSON.stringify({
      id: department._id,
      name: department.name
    }));
    
    // Navigate to WorkerManagement component
    navigate('/admin/workers');
  };

  // Function to get staff count for a department
  const getStaffCountForDepartment = async (departmentId) => {// wherever you store it
    try {
      const response = await axios.get(`/department/${departmentId}/count` , {
        headers: {
            Authorization: `Bearer ${token}`,
            },
      });
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching staff count:', error);
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Building className="h-8 w-8 mr-3 text-blue-600" />
                Department Management
              </h1>
              <p className="text-gray-600">View and manage all departments and their heads</p>
            </div>
            <Link to="/admin/add-department">
            <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
                <Plus className="h-5 w-5 mr-2" />
                New Department
            </button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search departments, contact info, or department heads..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="head">Department Head</option>
                  <option value="createdAt">Date Created</option>
                </select>
                <button
                  onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {filters.sortOrder === 'asc' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Departments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAndSortedDepartments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow text-gray-500">
              <Building className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">No departments found</p>
              {filters.search && (
                <p className="text-sm mt-2">Try adjusting your search criteria</p>
              )}
            </div>
          ) : (
            filteredAndSortedDepartments.map((department) => (
              <DepartmentCard 
                key={department._id} 
                department={department} 
                isExpanded={expandedDepartment === department._id}
                onToggleExpand={() => toggleExpandDepartment(department._id)}
                onManageStaff={() => handleManageStaff(department)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Department Card Component
const DepartmentCard = ({ department, isExpanded, onToggleExpand, onManageStaff }) => {
  const [staffCount, setStaffCount] = useState(0);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      fetchStaffCount();
    }
  }, [isExpanded]);

  const fetchStaffCount = async () => {
    setIsLoadingStaff(true);
    try {
      const response = await axios.get(`/department/${department._id}/count`);
      setStaffCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching staff count:', error);
      toast.error('Failed to load staff count');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 truncate">
                {department.name}
              </h3>
              {department.description && (
                <p className="text-gray-600 mt-1 line-clamp-2">
                  {department.description}
                </p>
              )}
              
              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 mt-3">
                {department.contactEmail && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-1" />
                    {department.contactEmail}
                  </div>
                )}
                {department.contactPhone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-1" />
                    {department.contactPhone}
                  </div>
                )}
              </div>
              
              {/* Department Head */}
              {department.DepartmentHead && (
                <div className="flex items-center mt-3">
                  <div className="flex-shrink-0">
                    {department.DepartmentHead.profilePicture ? (
                      <img
                        src={department.DepartmentHead.profilePicture}
                        alt={department.DepartmentHead.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {department.DepartmentHead.name}
                    </p>
                    <p className="text-xs text-gray-500">Department Head</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                <span>{isLoadingStaff ? 'Loading...' : `${staffCount} staff members`}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Created: {new Date(department.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="text-gray-400">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <DepartmentExpandedView 
            department={department} 
            staffCount={staffCount} 
            isLoadingStaff={isLoadingStaff}
            onManageStaff={onManageStaff}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Expanded Department View Component
const DepartmentExpandedView = ({ department, staffCount, isLoadingStaff, onManageStaff }) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="px-6 pb-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Department Details</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{department.name}</dd>
              </div>
              {department.description && (
                <div>
                  <dt className="text-xs text-gray-500">Description</dt>
                  <dd className="text-sm text-gray-900">{department.description}</dd>
                </div>
              )}
              {department.contactEmail && (
                <div>
                  <dt className="text-xs text-gray-500">Contact Email</dt>
                  <dd className="text-sm text-gray-900">{department.contactEmail}</dd>
                </div>
              )}
              {department.contactPhone && (
                <div>
                  <dt className="text-xs text-gray-500">Contact Phone</dt>
                  <dd className="text-sm text-gray-900">{department.contactPhone}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500">Staff Count</dt>
                <dd className="text-sm text-gray-900">
                  {isLoadingStaff ? 'Loading...' : `${staffCount} members`}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Created On</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(department.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Department Head</h4>
            {department.DepartmentHead ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {department.DepartmentHead.profilePicture ? (
                      <img
                        src={department.DepartmentHead.profilePicture}
                        alt={department.DepartmentHead.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {department.DepartmentHead.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      <Mail className="h-4 w-4 inline mr-1" />
                      {department.DepartmentHead.email}
                    </p>
                    {department.DepartmentHead.phone && (
                      <p className="text-sm text-gray-500 truncate">
                        <Phone className="h-4 w-4 inline mr-1" />
                        {department.DepartmentHead.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Role: {department.DepartmentHead.role}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  No department head assigned
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => toast.success('Edit department functionality would open a form')}
          >
            Edit Department
          </button>

          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onManageStaff}
          >
            Manage Staff
          </button>

        </div>
      </div>
    </motion.div>
  );
};

export default DepartmentManagement;