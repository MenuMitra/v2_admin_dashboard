import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import {
  TextInput,
  SelectInput,
  Textarea,
} from '../forms/FormElements';
import Breadcrumb from '../Breadcrumb';

function CreateNotification() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    outlet: 'all',
    role: 'all',
    user: 'all'
  });

  // Add these new states
  const [dropdownStates, setDropdownStates] = useState({
    outlet: false,
    role: false,
    user: false
  });
  
  // Add refs for each dropdown
  const outletDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Add this effect to handle outside clicks for all dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (outletDropdownRef.current && !outletDropdownRef.current.contains(event.target)) {
        setDropdownStates(prev => ({ ...prev, outlet: false }));
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setDropdownStates(prev => ({ ...prev, role: false }));
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setDropdownStates(prev => ({ ...prev, user: false }));
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add handler for toggling dropdowns
  const handleDropdownClick = (dropdownName) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  // Add Breadcrumb configuration
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Notifications", path: "/notifications" },
    { label: "Create Notification", path: "/create-notification" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return formData.title?.trim() && formData.description?.trim();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  // Add mock data for dropdowns
  const mockData = {
    outlets: [
      { id: 'all', name: 'All Outlets' },
      { id: '1', name: 'Restaurant ABC' },
      { id: '2', name: 'Café XYZ' },
      { id: '3', name: 'Bistro 123' },
      { id: '4', name: 'Food Court Central' }
    ],
    roles: [
      { id: 'all', name: 'All Roles' },
      { id: 'manager', name: 'Manager' },
      { id: 'chef', name: 'Chef' },
      { id: 'waiter', name: 'Waiter' },
      { id: 'captain', name: 'Captain' }
    ],
    users: [
      { id: 'all', name: 'All Users' },
      { id: '1', name: 'John Doe', role: 'Manager' },
      { id: '2', name: 'Jane Smith', role: 'Chef' },
      { id: '3', name: 'Mike Johnson', role: 'Waiter' },
      { id: '4', name: 'Sarah Wilson', role: 'Captain' }
    ]
  };

  // Add search states for each dropdown
  const [searchTerms, setSearchTerms] = useState({
    outlet: '',
    role: '',
    user: ''
  });

  // Filter functions for each dropdown
  const getFilteredOutlets = () => {
    return mockData.outlets.filter(outlet =>
      outlet.name.toLowerCase().includes(searchTerms.outlet.toLowerCase())
    );
  };

  const getFilteredRoles = () => {
    return mockData.roles.filter(role =>
      role.name.toLowerCase().includes(searchTerms.role.toLowerCase())
    );
  };

  const getFilteredUsers = () => {
    return mockData.users.filter(user =>
      user.name.toLowerCase().includes(searchTerms.user.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerms.user.toLowerCase())
    );
  };

  // Handle search input change
  const handleSearchChange = (type, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Title */}
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Create Notification
            </h1>

            {/* Create Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid()}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                transition shadow-sm
                ${isLoading || !isFormValid() 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-success-500 hover:bg-success-600"}
              `}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-3">
              <TextInput
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter notification title"
                required
                errorMessage="Enter between 3 to 100 characters. Special characters are not allowed."
              />

              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter notification description"
                required
                rows={3}
                errorMessage="Enter between 3 to 500 characters"
              />
            </div>

            {/* Notification Target Options */}
            <div className="grid grid-cols-3 gap-3">
              {/* Outlet Dropdown */}
              <div className="relative" ref={outletDropdownRef}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Outlet
                </label>
                <div className="relative">
                  <div
                    onClick={() => handleDropdownClick('outlet')}
                    className={`
                      w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 
                      focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer
                      ${dropdownStates.outlet ? 'border-error-500' : 'border-gray-300'}
                    `}
                    role="combobox"
                    aria-expanded={dropdownStates.outlet}
                    aria-haspopup="listbox"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-gray-900">
                        {formData.outlet === 'all' ? 'All Outlets' : 
                         mockData.outlets.find(o => o.id === formData.outlet)?.name || 'Select Outlet'}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {dropdownStates.outlet && (
                    <div 
                      className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50"
                      style={{
                        width: '100%',
                        maxHeight: '250px',
                        overflowY: 'auto'
                      }}
                    >
                      {/* Search input */}
                      <div className="sticky top-0 p-2 border-b bg-white">
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Search outlets..."
                          value={searchTerms.outlet}
                          onChange={(e) => handleSearchChange('outlet', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Outlet options */}
                      <div className="overflow-y-auto">
                        {getFilteredOutlets().map((outlet) => (
                          <div
                            key={outlet.id}
                            className={`
                              p-2 cursor-pointer hover:bg-gray-50
                              ${formData.outlet === outlet.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}
                            `}
                            onClick={() => {
                              handleInputChange({ target: { name: 'outlet', value: outlet.id } });
                              setDropdownStates(prev => ({ ...prev, outlet: false }));
                            }}
                          >
                            {outlet.name}
                          </div>
                        ))}
                        {getFilteredOutlets().length === 0 && (
                          <div className="p-2 text-center text-gray-500">
                            No outlets found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="relative" ref={roleDropdownRef}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <div
                    onClick={() => handleDropdownClick('role')}
                    className={`
                      w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 
                      focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer
                      ${dropdownStates.role ? 'border-error-500' : 'border-gray-300'}
                    `}
                    role="combobox"
                    aria-expanded={dropdownStates.role}
                    aria-haspopup="listbox"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-gray-900">
                        {formData.role === 'all' ? 'All Roles' : 
                         mockData.roles.find(r => r.id === formData.role)?.name || 'Select Role'}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {dropdownStates.role && (
                    <div 
                      className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50"
                      style={{
                        width: '100%',
                        maxHeight: '250px',
                        overflowY: 'auto'
                      }}
                    >
                      {/* Search input */}
                      <div className="sticky top-0 p-2 border-b bg-white">
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Search roles..."
                          value={searchTerms.role}
                          onChange={(e) => handleSearchChange('role', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Role options */}
                      <div className="overflow-y-auto">
                        {getFilteredRoles().map((role) => (
                          <div
                            key={role.id}
                            className={`
                              p-2 cursor-pointer hover:bg-gray-50
                              ${formData.role === role.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}
                            `}
                            onClick={() => {
                              handleInputChange({ target: { name: 'role', value: role.id } });
                              setDropdownStates(prev => ({ ...prev, role: false }));
                            }}
                          >
                            {role.name}
                          </div>
                        ))}
                        {getFilteredRoles().length === 0 && (
                          <div className="p-2 text-center text-gray-500">
                            No roles found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <div className="relative">
                  <div
                    onClick={() => handleDropdownClick('user')}
                    className={`
                      w-full p-2 text-left border rounded-lg shadow-sm bg-white hover:bg-gray-50 
                      focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer
                      ${dropdownStates.user ? 'border-error-500' : 'border-gray-300'}
                    `}
                    role="combobox"
                    aria-expanded={dropdownStates.user}
                    aria-haspopup="listbox"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-gray-900">
                        {formData.user === 'all' ? 'All Users' : 
                         mockData.users.find(u => u.id === formData.user)?.name || 'Select User'}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {dropdownStates.user && (
                    <div 
                      className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50"
                      style={{
                        width: '100%',
                        maxHeight: '250px',
                        overflowY: 'auto'
                      }}
                    >
                      {/* Search input */}
                      <div className="sticky top-0 p-2 border-b bg-white">
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Search users..."
                          value={searchTerms.user}
                          onChange={(e) => handleSearchChange('user', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* User options */}
                      <div className="overflow-y-auto">
                        {getFilteredUsers().map((user) => (
                          <div
                            key={user.id}
                            className={`
                              p-2 cursor-pointer hover:bg-gray-50
                              ${formData.user === user.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}
                            `}
                            onClick={() => {
                              handleInputChange({ target: { name: 'user', value: user.id } });
                              setDropdownStates(prev => ({ ...prev, user: false }));
                            }}
                          >
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.role}</div>
                          </div>
                        ))}
                        {getFilteredUsers().length === 0 && (
                          <div className="p-2 text-center text-gray-500">
                            No users found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateNotification;