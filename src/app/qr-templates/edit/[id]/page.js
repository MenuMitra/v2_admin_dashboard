"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Image from 'next/image';
import { 
  QrCode, 
  Upload, 
  X, 
  ArrowLeft, 
  Save, 
  Loader2,
  FileImage,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { templateService } from '@/api';

export default function EditTemplate({ params }) {
  const router = useRouter();
  // Unwrap the params using React.use()
  const unwrappedParams = use(params);
  const templateId = unwrappedParams.id;
  
  const [name, setName] = useState('');
  const [position, setPosition] = useState('centre');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageName, setCurrentImageName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch template details
  useEffect(() => {
    async function fetchTemplate() {
      try {
        setLoading(true);
        const template = await templateService.viewTemplate(templateId);
        
        if (template) {
          setName(template.name || '');
          setPosition(template.qr_overlay_position || 'centre');
          setCurrentImageName(template.image_name || '');
          
          // Set the image preview if there's an existing image
          if (template.image_name) {
            setImagePreview(templateService.getTemplateImageUrl(template.image_name));
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch template:', err);
        setError('Failed to load template details. Please try again.');
        
        // Set mock data for now
        setName('Classic Template');
        setPosition('centre');
        setCurrentImageName('template_example.jpg');
      } finally {
        setLoading(false);
      }
    }
    
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !position) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Make sure the template_id is a number
      const parsedTemplateId = parseInt(templateId, 10);
      if (isNaN(parsedTemplateId)) {
        throw new Error("Invalid template ID");
      }
      
      // Create the template data
      const templateData = {
        name: name,
        qr_overlay_position: position,
        template_id: parsedTemplateId  // Ensure this is correctly passed
      };
      
      // Add the image file if a new one was selected
      if (imageFile) {
        console.log("Including image file in update:", imageFile.name);
        templateData.image = imageFile;
      }
      
      console.log("Submitting template data:", templateData);
      
      // Update the template
      const result = await templateService.updateTemplate(templateData);
      console.log("Update result:", result);
      
      if (result && result.detail) {
        setError(result.detail);
        setSaving(false);
        return;
      }
      
      // Navigate back to templates list on success
      router.push('/qr-templates');
    } catch (err) {
      console.error('Failed to update template:', err);
      setError('Failed to update template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Process the selected file
  const handleFile = (file) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    setError(null);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Clear the selected image and revert to the original
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
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
              Edit QR Template
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Update details for this QR code template
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-500 transition-colors duration-200 flex items-center"
        >
          <Trash2 size={16} className="mr-1" />
          Delete Template
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Template form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form fields */}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Classic, Modern, Elegant"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QR Code Position
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label 
                    className={`relative flex items-center justify-center p-4 border ${position === 'centre' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-50`}
                  >
                    <input
                      type="radio"
                      name="position"
                      value="centre"
                      checked={position === 'centre'}
                      onChange={() => setPosition('centre')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                        <QrCode size={24} className={position === 'centre' ? 'text-indigo-600' : 'text-gray-400'} />
                      </div>
                      <span className={`text-sm font-medium ${position === 'centre' ? 'text-indigo-700' : 'text-gray-700'}`}>
                        Center
                      </span>
                    </div>
                    {position === 'centre' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full"></div>
                    )}
                  </label>
                  
                  <label 
                    className={`relative flex items-center justify-center p-4 border ${position === 'top' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-50`}
                  >
                    <input
                      type="radio"
                      name="position"
                      value="top"
                      checked={position === 'top'}
                      onChange={() => setPosition('top')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto border-2 border-dashed border-gray-300 relative mb-2">
                        <div className="absolute top-1 left-0 right-0 flex justify-center">
                          <QrCode size={24} className={position === 'top' ? 'text-indigo-600' : 'text-gray-400'} />
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${position === 'top' ? 'text-indigo-700' : 'text-gray-700'}`}>
                        Top
                      </span>
                    </div>
                    {position === 'top' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full"></div>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3 px-4 flex justify-center items-center rounded-lg text-white font-medium ${
                    saving
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  } transition-colors duration-200`}
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Image
              </label>
              
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Template preview"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    <X size={18} className="text-gray-700" />
                  </button>
                  <div className="p-3 bg-gray-50 text-sm text-gray-500 flex justify-between items-center">
                    {imageFile ? (
                      <>
                        <span>{imageFile.name}</span>
                        <span>{(imageFile.size / 1024).toFixed(1)} KB</span>
                      </>
                    ) : (
                      <span>Current image: {currentImageName}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                  } rounded-lg p-6 transition-colors duration-200 flex flex-col items-center justify-center h-64 cursor-pointer`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center text-center">
                    <FileImage size={48} className={`mb-3 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                    <p className="text-gray-700 font-medium mb-1">Drag and drop your image here</p>
                    <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, JPEG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">Leave unchanged to keep the current image</p>
            </div>
          </div>
        </form>
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
              Are you sure you want to delete this template? This action cannot be undone.
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