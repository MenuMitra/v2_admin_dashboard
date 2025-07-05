import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { API_CONFIG } from '../../config/appConfig';
import {
  TextInput,
  SelectInput,
  Textarea,
} from '../forms/FormElements';
import Breadcrumb from '../Breadcrumb';

function CreateNotification() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [isLoading, setIsLoading] = useState(false);
  const [outlets, setOutlets] = useState({});
  const [formData, setFormData] = useState({
    message: '',
    type: 'Success',
    outlet: 'all',
    role: 'all',
    user: 'all'
  });

  const [dropdownStates, setDropdownStates] = useState({
    outlet: false,
    role: false,
    user: false,
    type: false
  });
  
  const outletDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);

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
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setDropdownStates(prev => ({ ...prev, type: false }));
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownClick = (dropdownName) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

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
    return formData.message?.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const payload = {
        message: formData.message,
        type: formData.type,
        outlet_id: formData.outlet === 'all' ? '0' : formData.outlet.toString(),
        role: formData.role === 'all' ? 'all' : formData.role,
        user_id: formData.user === 'all' ? '0' : formData.user.toString()
      };

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/create_notification`,
        payload,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.notification_id) {
        navigate('/notifications');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mockData = {
    outlets: [
      { id: 'all', name: 'Select Outlets' },
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

  const [searchTerms, setSearchTerms] = useState({
    outlet: '',
    role: '',
    user: ''
  });

  const fetchOutlets = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/get_list/outlets`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlets") {
        setOutlets(response.data.outlet_list);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const getFilteredOutlets = () => {
    if (!outlets || Object.keys(outlets).length === 0) {
      return [{ outlet_id: 'all', outlet_name: 'All Outlets' }];
    }

    const outletsArray = Object.entries(outlets).map(([name, id]) => ({
      outlet_id: id.toString(),
      outlet_name: name
    }));

    const allOutletsOption = { outlet_id: 'all', outlet_name: 'All Outlets' };
    const allOutlets = [allOutletsOption, ...outletsArray];
    
    return allOutlets.filter(outlet =>
      outlet.outlet_name.toLowerCase().includes(searchTerms.outlet.toLowerCase())
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

  const handleSearchChange = (type, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const notificationTypes = [
    { id: 'Info', name: 'Info' },
    { id: 'Success', name: 'Success' },
    { id: 'Warning', name: 'Warning' },
    { id: 'Danger', name: 'Danger' }
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Create Notification
            </h1>

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

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              <Textarea
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter notification message"
                required
                rows={3}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative w-full md:w-auto" ref={typeDropdownRef}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="relative">
                  <div
                    onClick={() => handleDropdownClick('type')}
                    className={`
                      w-full md:w-auto inline-flex items-center gap-2 px-4 py-2 
                      text-sm font-medium text-gray-700 transition rounded-lg 
                      border border-gray-300 bg-white hover:bg-gray-50 shadow-sm
                      ${dropdownStates.type ? 'border-error-500' : 'border-gray-300'}
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-gray-900">
                        {formData.type || 'Select Type'}
                      </div>
                    </div>
                  </div>

                  {dropdownStates.type && (
                    <div 
                      className="fixed left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl"
                      style={{
                        position: 'absolute',
                        width: '300px',
                        zIndex: 9999,
                        maxHeight: '350px',
                        overflowY: 'auto'
                      }}
                    >
                      <div className="overflow-y-auto">
                        {notificationTypes.map((type) => (
                          <div
                            key={type.id}
                            className={`
                              p-3 cursor-pointer hover:bg-gray-50
                              ${formData.type === type.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}
                            `}
                            onClick={() => {
                              handleInputChange({ target: { name: 'type', value: type.id } });
                              setDropdownStates(prev => ({ ...prev, type: false }));
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {type.name}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative w-full md:w-auto" ref={outletDropdownRef}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Outlet
                </label>
                <div className="relative">
                  <div
                    onClick={() => handleDropdownClick('outlet')}
                    className={`
                      w-full md:w-auto inline-flex items-center gap-2 px-4 py-2 
                      text-sm font-medium text-gray-700 transition rounded-lg 
                      border border-gray-300 bg-white hover:bg-gray-50 shadow-sm
                      ${dropdownStates.outlet ? 'border-error-500' : 'border-gray-300'}
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-gray-900">
                        {formData.outlet === 'all' ? 'All Outlets' : 
                         Object.entries(outlets).find(([name, id]) => id.toString() === formData.outlet)?.[0] || 'Select Outlet'}
                      </div>
                    </div>
                  </div>

                  {dropdownStates.outlet && (
                    <div 
                      className="fixed left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl"
                      style={{
                        position: 'absolute',
                        width: '300px',
                        zIndex: 9999,
                        maxHeight: '350px',
                        overflowY: 'auto'
                      }}
                    >
                      <div className="sticky top-0 p-2 border-b bg-white">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          </span>
                          <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Search outlets..."
                            value={searchTerms.outlet}
                            onChange={(e) => handleSearchChange('outlet', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto">
                        {getFilteredOutlets().map((outlet) => (
                          <div
                            key={outlet.outlet_id}
                            className={`
                              p-3 cursor-pointer hover:bg-gray-50
                              ${formData.outlet === outlet.outlet_id ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}
                            `}
                            onClick={() => {
                              handleInputChange({ target: { name: 'outlet', value: outlet.outlet_id } });
                              setDropdownStates(prev => ({ ...prev, outlet: false }));
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {outlet.outlet_name}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {getFilteredOutlets().length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No outlets found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative w-full md:w-auto" ref={roleDropdownRef}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <div
                    onClick={() => handleDropdownClick('role')}
                    className={`
                      w-full md:w-auto inline-flex items-center gap-2 px-4 py-2 
                      text-sm font-medium text-gray-700 transition rounded-lg 
                      border border-gray-300 bg-white hover:bg-gray-50 shadow-sm
                      ${dropdownStates.role ? 'border-error-500' : 'border-gray-300'}
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-gray-900">
                        {formData.role === 'all' ? 'All Roles' : 
                         mockData.roles.find(r => r.id === formData.role)?.name || 'Select Role'}
                      </div>
                    </div>
                  </div>

                  {dropdownStates.role && (
                    <div 
                      className="fixed left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl"
                      style={{
                        position: 'absolute',
                        width: '300px',
                        zIndex: 9999,
                        maxHeight: '350px',
                        overflowY: 'auto'
                      }}
                    >
                      <div className="sticky top-0 p-2 border-b bg-white">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          </span>
                          <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Search roles..."
                            value={searchTerms.role}
                            onChange={(e) => handleSearchChange('role', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto">
                        {getFilteredRoles().map((role) => (
                          <div
                            key={role.id}
                            className={`
                              p-3 cursor-pointer hover:bg-gray-50
                              ${formData.role === role.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}
                            `}
                            onClick={() => {
                              handleInputChange({ target: { name: 'role', value: role.id } });
                              setDropdownStates(prev => ({ ...prev, role: false }));
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {role.name}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {getFilteredRoles().length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No roles found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative w-full md:w-auto" ref={userDropdownRef}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <div className="relative">
                  <div
                    onClick={() => handleDropdownClick('user')}
                    className={`
                      w-full md:w-auto inline-flex items-center gap-2 px-4 py-2 
                      text-sm font-medium text-gray-700 transition rounded-lg 
                      border border-gray-300 bg-white hover:bg-gray-50 shadow-sm
                      ${dropdownStates.user ? 'border-error-500' : 'border-gray-300'}
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-gray-900">
                        {formData.user === 'all' ? 'All Users' : 
                         mockData.users.find(u => u.id === formData.user)?.name || 'Select User'}
                      </div>
                    </div>
                  </div>

                  {dropdownStates.user && (
                    <div 
                      className="fixed left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl"
                      style={{
                        position: 'absolute',
                        width: '300px',
                        zIndex: 9999,
                        maxHeight: '350px',
                        overflowY: 'auto'
                      }}
                    >
                      <div className="sticky top-0 p-2 border-b bg-white">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          </span>
                          <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="Search users..."
                            value={searchTerms.user}
                            onChange={(e) => handleSearchChange('user', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto">
                        {getFilteredUsers().map((user) => (
                          <div
                            key={user.id}
                            className={`
                              p-3 cursor-pointer hover:bg-gray-50
                              ${formData.user === user.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}
                            `}
                            onClick={() => {
                              handleInputChange({ target: { name: 'user', value: user.id } });
                              setDropdownStates(prev => ({ ...prev, user: false }));
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {getFilteredUsers().length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-500">
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