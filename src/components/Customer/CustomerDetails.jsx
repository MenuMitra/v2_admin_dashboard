import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../common/DataTable';

function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const customerData = location.state?.customerData;

  // Custom row render function to display customer information
  const renderCustomerInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div>
        <label className="text-sm text-gray-500 block mb-1">Name</label>
        <p className="font-medium">{customerData.name || 'N/A'}</p>
      </div>
      <div>
        <label className="text-sm text-gray-500 block mb-1">Mobile</label>
        <p className="font-medium">{customerData.mobile || 'N/A'}</p>
      </div>
      <div>
        <label className="text-sm text-gray-500 block mb-1">User ID</label>
        <p className="font-medium">{customerData.user_id || 'N/A'}</p>
      </div>
      <div>
        <label className="text-sm text-gray-500 block mb-1">Order Count</label>
        <p className="font-medium">{customerData.order_count || '0'}</p>
      </div>
      {/* Order History Section (if available) */}
      {customerData.order_count > 0 && (
        <div className="col-span-2 mt-4">
          <h3 className="text-lg font-semibold mb-3">Order History</h3>
          <div className="text-sm text-gray-500">
            This customer has placed {customerData.order_count} orders.
          </div>
        </div>
      )}
    </div>
  );

  if (!customerData) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <DataTable
          title="Customer Details"
          showBackButton={true}
          onBackClick={() => navigate(-1)}
          createButton={{ show: false }}
          showSearch={false}
          data={[]}
          columns={[]}
          customRowRender={() => (
            <div className="text-center py-8 text-red-500">
              No customer data available. Please go back and try again.
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <DataTable
        title="Customer Details"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        createButton={{ show: false }}
        showSearch={false}
        showHeader={true}
        data={[customerData]}
        columns={[]}
        customRowRender={renderCustomerInfo}
        enablePagination={false}
        enableSort={false}
      />
    </div>
  );
}

export default CustomerDetails;