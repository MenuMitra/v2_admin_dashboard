"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { 
  QrCode, 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Download,
  Loader2,
  FileImage,
  AlertCircle,
  Calendar,
  LayoutTemplate
} from 'lucide-react';
import { templateService } from '@/api';

export default function ViewTemplate({ params }) {
  const router = useRouter();
  // Unwrap the params using React.use()
  const unwrappedParams = use(params);
  const templateId = unwrappedParams.id;
  
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch template details
  useEffect(() => {
    async function fetchTemplate() {
      try {
        setLoading(true);
        const data = await templateService.viewTemplate(templateId);
        
        // Log the template data for debugging
        console.log("Template API response:", data);
        
        setTemplate(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch template:', err);
        setError('Failed to load template details. Please try again.');
        
        // Set mock data for now
        setTemplate({
          name: 'Classic Template',
          qr_overlay_position: 'centre',
          qr_code_template_id: templateId,
          image_name: 'template_example.jpg',
          created_on: '30 Apr 2025'
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  // Handle delete template
  const handleDeleteTemplate = async () => {
    try {
      await templateService.deleteTemplate(templateId);
      router.push('/qr-templates');
    } catch (err) {
      console.error('Failed to delete template:', err);
      setError('Failed to delete template. Please try again.');
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!template && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <FileImage size={64} className="mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">Template Not Found</h3>
        <p className="text-sm mb-6">The template you're looking for doesn't exist or has been deleted.</p>
        <button 
          onClick={() => router.push('/qr-templates')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Go Back to Templates
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/qr-templates')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 flex items-center">
              <QrCode className="mr-2 text-indigo-600" size={28} />
              {template?.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              QR template details and preview
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/qr-templates/edit/${templateId}`)}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center"
          >
            <Edit2 size={16} className="mr-1.5" />
            Edit Template
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-500 transition-colors duration-200 flex items-center"
          >
            <Trash2 size={16} className="mr-1.5" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Template content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileImage className="text-indigo-600 mr-2" size={20} />
              Template Preview
            </h2>
          </div>
          <div className="p-5">
            {template?.image_name ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center h-64">
                <img 
                  src={templateService.getTemplateImageUrl(template.image_name)} 
                  alt={template.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const imgUrl = templateService.getTemplateImageUrl(template.image_name);
                    console.error(`Failed to load template image: ${template.image_name}`, {
                      url: imgUrl,
                      template_id: template.qr_code_template_id
                    });
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden flex-col items-center justify-center">
                  <FileImage size={64} className="text-gray-400" />
                  <span className="text-sm mt-2 text-gray-500">Image not available</span>
                  <div className="mt-4 text-xs text-gray-400">{template.image_name}</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 border border-gray-200 rounded-lg">
                <FileImage size={48} />
                <span className="text-sm mt-2">No image available</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Template details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <LayoutTemplate className="text-indigo-600 mr-2" size={20} />
              Template Details
            </h2>
          </div>
          <div className="p-5">
            <dl className="space-y-6">
             
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-lg text-gray-900">{template?.name}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">QR Code Position</dt>
                <dd className="mt-1 text-lg text-gray-900 capitalize">{template?.qr_overlay_position}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Image Filename</dt>
                <dd className="mt-1 text-lg text-gray-900 break-all">{template?.image_name || 'None'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar size={16} className="mr-1 text-gray-400" />
                  Created On
                </dt>
                <dd className="mt-1 text-lg text-gray-900">{template?.created_on}</dd>
              </div>
            </dl>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">QR Position Preview</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  {template?.qr_overlay_position === 'centre' ? (
                    <div className="p-2 bg-white border border-gray-300 rounded-lg">
                      <QrCode size={80} className="text-indigo-600" />
                    </div>
                  ) : (
                    <div className="absolute top-4 left-0 right-0 flex justify-center">
                      <div className="p-2 bg-white border border-gray-300 rounded-lg">
                        <QrCode size={60} className="text-indigo-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all animate-fade-in">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              Confirm Deletion
            </h3>
            <p className="mt-4 text-sm text-gray-600">
              Are you sure you want to delete the template "{template?.name}"? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 