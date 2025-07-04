import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import {
  TextInput,
  SelectInput,
  Textarea
} from '../forms/FormElements';

function CreateNotification() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    outlet: 'all',
    role: 'all',
    user: 'all'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
            Back
          </button>
        </div>
        <h1 className="text-xl font-semibold text-gray-800">Create Notification</h1>
        <div></div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        <TextInput
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Title"
          required
          errorMessage="Enter between 3 to 100 characters. Special characters are not allowed."
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
          errorMessage="Enter between 3 to 500 characters"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SelectInput
            label="Outlet"
            name="outlet"
            value={formData.outlet}
            onChange={handleInputChange}
            options={[
              { value: 'all', label: 'all' }
            ]}
          />

          <SelectInput
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            options={[
              { value: 'all', label: 'all' }
            ]}
          />

          <SelectInput
            label="User"
            name="user"
            value={formData.user}
            onChange={handleInputChange}
            options={[
              { value: 'all', label: 'all' }
            ]}
          />
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-success-600"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateNotification;