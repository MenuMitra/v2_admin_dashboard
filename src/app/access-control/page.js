'use client';

import React from 'react';
import Link from 'next/link';
import { FiUsers, FiLayers, FiLink, FiShield } from 'react-icons/fi';

const AccessControlDashboard = () => {
  const cards = [
    {
      title: 'Roles',
      description: 'Manage user roles for access control',
      icon: <FiUsers className="h-12 w-12 text-blue-500" />,
      path: '/dashboard/access-control/roles',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Functionalities',
      description: 'Manage system functionalities',
      icon: <FiLayers className="h-12 w-12 text-green-500" />,
      path: '/dashboard/access-control/functionalities',
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Role-Functionality Mapping',
      description: 'Configure what functionalities each role can access',
      icon: <FiLink className="h-12 w-12 text-purple-500" />,
      path: '/dashboard/access-control/roles',
      color: 'bg-purple-50 border-purple-200'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Access Control Management</h1>
        <p className="text-gray-500 mt-1">
          Configure and manage user roles, functionalities, and their mappings
        </p>
      </div>

      <div className="mb-8 flex items-center p-6 bg-indigo-50 border border-indigo-100 rounded-lg">
        <div className="mr-6 p-4 bg-white rounded-full">
          <FiShield className="h-10 w-10 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">User-Based Access Control (UBAC)</h2>
          <p className="text-gray-600 mt-1">
            UBAC allows you to control what actions different users can perform based on their roles. 
            First create roles, then functionalities, and finally map them together.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link key={index} href={card.path} className="block">
            <div className={`h-full p-6 border rounded-lg transition-all duration-200 hover:shadow-md ${card.color}`}>
              <div className="flex flex-col h-full">
                <div className="mb-4">{card.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{card.description}</p>
                <span className="text-blue-600 font-medium">Manage &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">How Access Control Works</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
          <li><strong>Create Roles</strong> - Define different user roles (e.g., Admin, Manager, Staff)</li>
          <li><strong>Define Functionalities</strong> - Specify system functionalities that can be controlled</li>
          <li><strong>Map Roles to Functionalities</strong> - Assign which functionalities each role can access</li>
          <li><strong>Assign Roles to Users</strong> - Give users the appropriate roles</li>
        </ol>
      </div>
    </div>
  );
};

export default AccessControlDashboard; 