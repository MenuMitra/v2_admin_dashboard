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
      <div className="p-6 max-w-7xl mx-auto bg-gray-100">
        {/* Skeleton for header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3 animate-pulse">
            <div className="h-10 w-36 bg-gray-300 rounded"></div>
            <div className="h-10 w-20 bg-gray-300 rounded"></div>
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
        
        {/* Skeleton for content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image skeleton */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-900">
              <div className="h-5 w-36 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="p-5">
              <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Details skeleton */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-900">
              <div className="h-5 w-36 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="p-5">
              <div className="space-y-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-6 w-48 bg-gray-300 rounded mb-1"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 animate-pulse">
                <div className="h-4 w-36 bg-gray-200 rounded mb-3"></div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <div className="h-20 w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!template && !loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FileImage size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-2 text-gray-800">Template Not Found</h3>
          <p className="text-gray-600 mb-6">The template you're looking for doesn't exist or has been deleted.</p>
          <button 
            onClick={() => router.push('/qr-templates')}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
          >
            Go Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100">
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{template?.name}</h1>
          <p className="mt-1 text-sm text-gray-600">QR template details and preview</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => router.push('/qr-templates')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </button>
          <button
            onClick={() => router.push(`/qr-templates/edit/${templateId}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start mb-6">
          <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Template content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template image */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-900 text-white">
            <h3 className="text-lg font-medium flex items-center">
              <FileImage className="mr-2" size={20} />
              Template Preview
            </h3>
          </div>
          <div className="p-5">
            {template?.image_name ? (
              <div className="relative rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center h-64">
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
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 border border-gray-200 rounded-md">
                <FileImage size={48} />
                <span className="text-sm mt-2">No image available</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Template details */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-900 text-white">
            <h3 className="text-lg font-medium flex items-center">
              <LayoutTemplate className="mr-2" size={20} />
              Template Details
            </h3>
          </div>
          <div className="p-5">
            <dl className="space-y-6">
              <div>
                <dd className="text-lg font-medium text-gray-900">{template?.name}</dd>
                <dt className="mt-1 text-sm text-gray-500">Name</dt>
              </div>
              
              <div>
                <dd className="text-lg font-medium text-gray-900 capitalize">{template?.qr_overlay_position}</dd>
                <dt className="mt-1 text-sm text-gray-500">QR Code Position</dt>
              </div>
              
              <div>
                <dd className="text-lg font-medium text-gray-900 break-all">{template?.image_name || 'None'}</dd>
                <dt className="mt-1 text-sm text-gray-500">Image Filename</dt>
              </div>
              
              <div>
                <dd className="text-lg font-medium text-gray-900">{template?.created_on}</dd>
                <dt className="mt-1 text-sm text-gray-500 flex items-center">
                  <Calendar size={16} className="mr-1 text-gray-400" />
                  Created On
                </dt>
              </div>
            </dl>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">QR Position Preview</h3>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  {template?.qr_overlay_position === 'centre' ? (
                    <div className="p-2 bg-white border border-gray-300 rounded-md">
                      <QrCode size={80} className="text-gray-800" />
                    </div>
                  ) : (
                    <div className="absolute top-4 left-0 right-0 flex justify-center">
                      <div className="p-2 bg-white border border-gray-300 rounded-md">
                        <QrCode size={60} className="text-gray-800" />
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
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
        </div>
      )}
    </div>
  );
} 