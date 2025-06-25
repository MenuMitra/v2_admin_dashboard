import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import axios from "axios";
import DataTable from "../common/DataTable";

function CustomerDetails() {
  const { customerId } = useParams(); // Get customerId from URL params
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState("");

  // Fetch outlets on mount
  useEffect(() => {
    fetchOutlets();
  }, []);

  // Fetch customer data when selectedOutlet changes
  useEffect(() => {
    if (selectedOutlet) {
      fetchCustomerData();
    }
  }, [selectedOutlet]);

  const fetchOutlets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/common/listview_outlet",
        {
          user_id: adminData?.user_id,
          app_source: "admin_dashboard",
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      setOutlets(response.data.data || []);
      if (response.data.data?.length > 0) {
        setSelectedOutlet(response.data.data[0].outlet_id);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch outlets");
      setLoading(false);
    }
  };

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      // First API call to get customer details
      const customerResponse = await axios.post(
        "https://men4u.xyz/v2/admin/customer_view",
        {
          user_id: Number(customerId), // Using customerId from URL params
          app_source: "admin_dashboard",
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      // Second API call to get customer's outlet specific data
      const outletCustomerResponse = await axios.post(
        "https://men4u.xyz/v2/admin/customer_listview",
        {
          outlet_id: selectedOutlet,
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      // Find the customer in outlet data to get outlet-specific information
      const outletCustomerData = outletCustomerResponse.data.customers?.find(
        (c) => c.user_id === Number(customerId)
      );

      // Combine both API responses
      setCustomerData({
        ...customerResponse.data,
        ...outletCustomerData,
        outlet_name: outletCustomerResponse.data.outlet_name,
      });
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  };

  // Custom row render function to display customer information
  const renderCustomerInfo = () => (
    <div className="space-y-6">
      {/* Outlet Selector */}
      <div className="mb-6">
        <label className="text-sm text-gray-500 block mb-2">
          Select Outlet
        </label>
        <select
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={selectedOutlet}
          onChange={(e) => setSelectedOutlet(e.target.value)}
        >
          {outlets.map((outlet) => (
            <option key={outlet.outlet_id} value={outlet.outlet_id}>
              {outlet.outlet_name} ({outlet.outlet_code})
            </option>
          ))}
        </select>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-gray-500 block mb-1">Name</label>
          <p className="font-medium">{customerData?.name || "N/A"}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">Mobile</label>
          <p className="font-medium">{customerData?.mobile || "N/A"}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">User ID</label>
          <p className="font-medium">{customerData?.user_id || "N/A"}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">
            Order Count
          </label>
          <p className="font-medium">{customerData?.order_count || "0"}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">
            Current Outlet
          </label>
          <p className="font-medium">{customerData?.outlet_name || "N/A"}</p>
        </div>
        {/* Order History Section (if available) */}
        {customerData?.order_count > 0 && (
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-3">Order History</h3>
            <div className="text-sm text-gray-500">
              This customer has placed {customerData.order_count} orders in{" "}
              {customerData.outlet_name}.
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!customerData && !loading) {
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
              Customer not found. Please go back and try again.
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <DataTable
        title={`Customer Details - ${customerData?.name || ""}`}
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

      {error && (
        <div className="mt-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default CustomerDetails;
