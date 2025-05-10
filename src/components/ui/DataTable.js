import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';

const DataTable = ({ 
  data, 
  columns, 
  title, 
  onAdd, 
  onEdit, 
  onDelete, 
  onView, 
  addButtonLabel = "Add New",
  emptyMessage = "No items found" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ensure data is an array
  const dataArray = Array.isArray(data) ? data : [];
  
  // Filter data based on search term
  const filteredData = dataArray.filter(item => {
    const searchFields = columns.map(col => col.accessor).filter(Boolean);
    return searchTerm === '' || searchFields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm transition duration-200 flex items-center"
          >
            <span className="mr-1">+</span>
            {addButtonLabel}
          </button>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-4 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {columns.map((column, index) => (
                    <th 
                      key={index} 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </th>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {column.header === 'Sr No' ? (
                          <span className="text-gray-900">{rowIndex + 1}</span>
                        ) : (
                          column.accessor ? (
                            column.render ? column.render(item) : item[column.accessor]
                          ) : (
                            column.render && column.render(item)
                          )
                        )}
                      </td>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="View"
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
};

export default DataTable; 