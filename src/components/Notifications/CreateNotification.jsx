import React, { useState } from 'react';
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <SelectInput
                label="Outlet"
                name="outlet"
                value={formData.outlet}
                onChange={handleInputChange}
                options={[
                  { value: 'all', label: 'All Outlets' }
                ]}
              />

              <SelectInput
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                options={[
                  { value: 'all', label: 'All Roles' }
                ]}
              />

              <SelectInput
                label="User"
                name="user"
                value={formData.user}
                onChange={handleInputChange}
                options={[
                  { value: 'all', label: 'All Users' }
                ]}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateNotification;