'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCreditCard, FiEye, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import partnerService from '@/api/services/partnerService';
import { isAuthenticated } from '@/utils/auth';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    aadhar_number: '',
    dob: '',
  });

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
  }, [router]);

  // Table columns configuration
  const columns = [
    {
      header: 'Sr No',
      render: () => null, // This will be populated directly in the UI
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <FiUsers className="text-purple-600" />
          </div>
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Contact',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <FiMail className="mr-2" /> {row.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiPhone className="mr-2" /> {row.mobile}
          </div>
        </div>
      ),
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (row) => (
        <div className="flex items-center text-gray-600">
          <FiMapPin className="mr-2" />
          <span>{row.address}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleView(row)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <FiEye className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-yellow-600 hover:text-yellow-800"
            title="Edit Partner"
          >
            <FiEdit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-800"
            title="Delete Partner"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  // Fetch partners on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchPartners();
    }
  }, []);

  // Fetch partners from API
  const fetchPartners = async () => {
    setLoading(true);
    try {
      const userId = 1; 
      const data = await partnerService.listPartners(userId);
      setPartners(data);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open modal for adding new partner
  const handleAddNew = () => {
    setModalMode('add');
    setFormData({
      name: '',
      mobile: '',
      email: '',
      address: '',
      aadhar_number: '',
      dob: '',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing partner
  const handleEdit = async (partner) => {
    setLoading(true);
    try {
      const partnerDetails = await partnerService.viewPartner(partner.user_id);
      setCurrentPartner(partnerDetails);
      setFormData({
        name: partnerDetails.name,
        mobile: partnerDetails.mobile,
        email: partnerDetails.email,
        address: partnerDetails.address,
        aadhar_number: partnerDetails.aadhar_number,
        dob: partnerDetails.dob,
      });
      setModalMode('edit');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch partner details:', error);
      toast.error('Failed to load partner details');
    } finally {
      setLoading(false);
    }
  };

  // View partner details
  const handleView = async (partner) => {
    setLoading(true);
    try {
      const partnerDetails = await partnerService.viewPartner(partner.user_id);
      setCurrentPartner(partnerDetails);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch partner details:', error);
      toast.error('Failed to load partner details');
    } finally {
      setLoading(false);
    }
  };

  // Delete partner
  const handleDelete = async (partner) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      setLoading(true);
      try {
        const userId = 1; // TODO: Get from auth context
        await partnerService.deletePartner(partner.user_id, userId);
        toast.success('Partner deleted successfully');
        fetchPartners(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete partner:', error);
        toast.error('Failed to delete partner');
      } finally {
        setLoading(false);
      }
    }
  };

  // Submit form for creating or updating partner
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = 1; // TODO: Get from auth context
      if (modalMode === 'add') {
        const data = {
          user_id: userId,
          ...formData
        };
        await partnerService.createPartner(data);
        toast.success('Partner created successfully');
      } else {
        const data = {
          update_user_id: userId,
          user_id: currentPartner.user_id,
          ...formData
        };
        await partnerService.updatePartner(data);
        toast.success('Partner updated successfully');
      }
      setIsModalOpen(false);
      fetchPartners();
    } catch (error) {
      console.error(`Failed to ${modalMode} partner:`, error);
      toast.error(`Failed to ${modalMode} partner`);
    } finally {
      setLoading(false);
    }
  };

  // Render form for add/edit modal
  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                placeholder="Enter mobile number"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                required
              />
            </div>
          </div>

          <div className="col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <FiMapPin className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                placeholder="Enter complete address"
                required
              />
            </div>
          </div>

          <div className="col-span-2">
            <label htmlFor="aadhar_number" className="block text-sm font-medium text-gray-700">
              Aadhar Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="aadhar_number"
                name="aadhar_number"
                value={formData.aadhar_number}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                placeholder="Enter 12-digit Aadhar number"
                pattern="[0-9]{12}"
                title="Please enter a valid 12-digit Aadhar number"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 transition-colors duration-200"
          >
            {loading ? 'Saving...' : (modalMode === 'add' ? 'Create Partner' : 'Update Partner')}
          </button>
        </div>
      </form>
    );
  };

  // Render view modal content
  const renderViewContent = () => {
    if (!currentPartner) return null;

    const details = [
      { icon: FiUser, label: 'Name', value: currentPartner.name },
      { icon: FiMail, label: 'Email', value: currentPartner.email },
      { icon: FiPhone, label: 'Mobile', value: currentPartner.mobile },
      { icon: FiMapPin, label: 'Address', value: currentPartner.address },
      { icon: FiCalendar, label: 'Date of Birth', value: formatDate(currentPartner.dob) },
      { icon: FiCreditCard, label: 'Aadhar Number', value: currentPartner.aadhar_number },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {details.map((detail, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <detail.icon className="text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-500">{detail.label}</span>
              </div>
              <span className="text-base font-medium text-gray-900">{detail.value}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="text-sm font-medium text-gray-500">Created On</span>
              <p className="mt-1 text-sm text-gray-900">{formatDate(currentPartner.created_on)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Created By</span>
              <p className="mt-1 text-sm text-gray-900">{currentPartner.created_by}</p>
            </div>
            {currentPartner.updated_on && (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-500">Updated On</span>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(currentPartner.updated_on)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Updated By</span>
                  <p className="mt-1 text-sm text-gray-900">{currentPartner.updated_by}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Partner Management</h1>
        <p className="mt-1 text-sm text-gray-600">Manage restaurant partners and their details</p>
      </div>

      <div className="mb-8">
        <DataTable
          title="Partners"
          data={partners}
          columns={columns}
          onAdd={handleAddNew}
          onEdit={handleEdit}
          onView={handleView}
          addButtonLabel="Add Partner"
          emptyMessage={loading ? "Loading partners..." : "No partners found"}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Partner' : 'Edit Partner'}
        size="lg"
      >
        {renderForm()}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Partner Details"
        size="lg"
      >
        {renderViewContent()}
      </Modal>
    </div>
  );
} 