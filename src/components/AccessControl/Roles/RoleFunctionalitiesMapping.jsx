import React from 'react';
import { useParams } from 'react-router-dom';

function RoleFunctionalitiesMapping() {
  const { roleId } = useParams();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Role Functionalities Mapping
        </h2>
        <div className="mb-4">
          <span className="text-gray-600 font-medium">Role ID:</span>
          <span className="ml-2 text-gray-800">{roleId}</span>
        </div>
        
        {/* Placeholder for functionalities mapping content */}
        <div className="mt-4">
          <p className="text-gray-600">
            Functionalities mapping for role ID: {roleId} will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoleFunctionalitiesMapping;