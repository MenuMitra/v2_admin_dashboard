import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SuperOwnerDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    superOwnerData, 
    assignedOutlets, 
    assignedFunctionalities,
    totalOutlets,
    totalFunctionalities 
  } = location.state || {};

  if (!superOwnerData) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No super owner data available
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/super-owners');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Super Owner Details</h2>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 transition rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to List
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{superOwnerData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{superOwnerData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{superOwnerData.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Aadhar Number</p>
                <p className="font-medium">{superOwnerData.aadhar_number}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Status Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  superOwnerData.account_status 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {superOwnerData.account_status ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created On</p>
                <p className="font-medium">{superOwnerData.created_on}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{superOwnerData.updated_on}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Assigned Outlets ({totalOutlets})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedOutlets.map((outlet) => (
              <div key={outlet.outlet_id} className="border rounded-lg p-4">
                <h4 className="font-medium">{outlet.outlet_name}</h4>
                <p className="text-sm text-gray-500">{outlet.address}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    outlet.outlet_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {outlet.outlet_status ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    outlet.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {outlet.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Assigned Functionalities ({totalFunctionalities})</h3>
          <div className="flex flex-wrap gap-2">
            {assignedFunctionalities.map((func) => (
              <span key={func.functionality_id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {func.functionality_name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperOwnerDetails;