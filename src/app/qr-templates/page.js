"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  AlertCircle,
  QrCode,
  LayoutGrid,
  FileImage,
  X,
  Filter
} from 'lucide-react';
import { templateService } from '@/api';
import { API_URL } from '@/api/config';
import Modal from '@/components/ui/Modal';

export default function QRTemplates() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);
      const data = await templateService.getTemplates();
      console.log("Templates API response:", data);
      
      // Log detailed info for the first template if available
      if (data && data.length > 0) {
        console.log("First template details:", {
          id: data[0].qr_code_template_id,
          name: data[0].name,
          image: data[0].image_name,
          qr_position: data[0].qr_overlay_position,
          created_on: data[0].created_on,
          image_url: data[0].image_url,
          full_object: data[0]
        });
      }
      
      setTemplates(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to load templates. Please try again later.');
      // Use mock data for now
      setTemplates([
        { name: "Classic", qr_overlay_position: "centre", qr_code_template_id: 1, image_name: "YY5RT4107H.jpg", created_on: "02 May 2025" },
        { name: "garden", qr_overlay_position: "top", qr_code_template_id: 2, image_name: "PC8J7RAVHG.jpg", created_on: "02 May 2025" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Clear search term
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Get unique position values for the filter
  const getUniquePositions = () => {
    const positions = templates.map(template => template.qr_overlay_position);
    return [...new Set(positions)];
  };

  // Filter templates based on search term and position filter
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || template.qr_overlay_position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const handleCreateTemplate = () => {
    router.push('/qr-templates/create');
  };

  const handleEditTemplate = (e, id) => {
    e.stopPropagation();
    router.push(`/qr-templates/edit/${id}`);
  };

  const handleViewTemplate = (id) => {
    router.push(`/qr-templates/view/${id}`);
  };

  const openDeleteModal = (e, template) => {
    e.stopPropagation();
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      await templateService.deleteTemplate(templateToDelete.qr_code_template_id);
      setShowDeleteModal(false);
      setTemplateToDelete(null);
      // Refresh the list
      fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
      // Still close the modal but show an error
      setShowDeleteModal(false);
      setError('Failed to delete template. Please try again.');
    }
  };
  
  // Render delete confirmation content
  const renderDeleteConfirmation = () => {
    if (!templateToDelete) return null;
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete the template "{templateToDelete.name}"? This action cannot be undone.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteTemplate}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100">
      <div className={`${showDeleteModal ? 'blur-sm' : ''}`}>
        {/* Page header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">QR Templates</h1>
            <p className="mt-1 text-sm text-gray-600">Create and manage QR code templates for your menus</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={16} />
              </div>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-gray-700 focus:border-gray-700 text-gray-900"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="text-gray-400" size={16} />
              </div>
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-gray-700 focus:border-gray-700 appearance-none bg-white text-gray-900"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="all">All Positions</option>
                {getUniquePositions().map(position => (
                  <option key={position} value={position}>
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center">
            <span className="text-sm text-gray-500">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start mb-6">
            <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Templates grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array(4).fill().map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between pt-2">
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div 
                key={template.qr_code_template_id} 
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
                onClick={() => handleViewTemplate(template.qr_code_template_id)}
              >
                <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {/* Template image or placeholder */}
                  {template.image_name ? (
                    <div className="relative h-full w-full">
                      <img 
                        src={templateService.getTemplateImageUrl(template.image_name)} 
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const imgUrl = templateService.getTemplateImageUrl(template.image_name);
                          console.error(`Failed to load image: ${template.image_name}`, {
                            url: imgUrl,
                            template_id: template.qr_code_template_id
                          });
                          
                          // Hide the image and show fallback
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden flex-col items-center justify-center absolute inset-0 bg-gray-50 h-full w-full text-gray-400">
                        <FileImage size={48} />
                        <span className="text-sm mt-2">Image not available</span>
                        <span className="text-xs mt-1 text-gray-500">{template.image_name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <FileImage size={48} />
                      <span className="text-sm mt-2">No image available</span>
                    </div>
                  )}
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="flex space-x-3">
                      <button 
                        onClick={(e) => handleViewTemplate(template.qr_code_template_id)}
                        className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors duration-200 transform hover:scale-110"
                        title="View template"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => handleEditTemplate(e, template.qr_code_template_id)}
                        className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors duration-200 transform hover:scale-110"
                        title="Edit template"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => openDeleteModal(e, template)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200 transform hover:scale-110"
                        title="Delete template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 truncate">{template.name}</h3>
                      <div className="mt-1 flex items-center">
                        <span className="text-sm text-gray-600 capitalize">
                          QR Position: {template.qr_overlay_position}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <QrCode className="text-gray-400" size={18} />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {template.created_on}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // No templates found
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
              <LayoutGrid size={40} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2 text-gray-800">No templates found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchTerm 
                  ? `No templates match "${searchTerm}"${positionFilter !== 'all' ? ` with position "${positionFilter}"` : ''}.` 
                  : positionFilter !== 'all'
                    ? `No templates with position "${positionFilter}" found.`
                    : "You haven't created any QR templates yet."}
              </p>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium inline-flex items-center shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
              >
                <Plus className="mr-2" size={16} />
                Create Your First Template
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        {renderDeleteConfirmation()}
      </Modal>
    </div>
  );
} 