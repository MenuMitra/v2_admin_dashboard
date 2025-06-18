import React from 'react';
import ownerImage from '../assets/images/user/owner.jpg';
import { useAdmin } from '../hooks/useAdmin';
import DataTable from './common/DataTable';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const pageName = "Profile";

  // Early return if no admin data
  if (!adminData) {
    return (
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <DataTable
          title="Profile"
          showBackButton={true}
          onBackClick={() => navigate(-1)}
          createButton={{ show: false }}
          showSearch={false}
          data={[]}
          columns={[]}
          counts={null}
          customRowRender={() => (
            <div className="text-center py-8">Loading admin data...</div>
          )}
          enablePagination={false}
          enableSort={false}
        />
      </div>
    );
  }

  // Custom render function for the profile content
  const renderProfileContent = () => (
    <div className="p-5 dark:border-gray-800 lg:p-6">
      {/* <div className="p-5 mb-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src={ownerImage} alt="user" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {adminData.name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {adminData.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Personal Information Section */}
      <div className=" rounded-2xl dark:border-gray-800 lg:p-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <InfoField label="Name" value={adminData.name} />
            <InfoField label="Email address" value={adminData.email} />
            <InfoField label="Phone" value={adminData.mobile} />
            <InfoField label="Role" value={adminData.role} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
      <DataTable
        title="Profile"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        createButton={{ show: false }}
        showSearch={false}
        data={[adminData]}
        columns={[]}
        counts={null}
        customRowRender={renderProfileContent}
        enablePagination={false}
        enableSort={false}
      />
    </div>
  );
}

// Helper Component
const InfoField = ({ label, value }) => (
  <div>
    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
      {value || 'N/A'}
    </p>
  </div>
);

export default Profile;