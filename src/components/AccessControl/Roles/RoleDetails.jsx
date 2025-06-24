import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../hooks/useAdmin';
import { useAuth } from '../../../hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faLocationDot,
  faCalendarDays,
  faClock,
  faCircleCheck,
  faShoppingCart,
  faCreditCard,
  faBan,
  faKitchenSet,
  faClipboardList,
  faCheck,
  faMoneyBill,
  faChartLine,
  faSpinner,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

function RoleDetails() {
  const { userId } = useParams();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchCustomerDetails();
    }
  }, [userId, selectedOutlet]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        user_id: userId,
        app_source: "admin_dashboard"
      };

      if (selectedOutlet) {
        requestBody.outlet_id = selectedOutlet;
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/customer_view',
        requestBody,
        {
          headers: {
            Authorization: getToken(),
          }
        }
      );

      setCustomerData(response.data);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      setError(error.response?.data?.msg || 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const OutletSelector = () => (
    <div className="mb-6">
      <select
        value={selectedOutlet || ''}
        onChange={(e) => setSelectedOutlet(e.target.value || null)}
        className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">All Outlets</option>
        {customerData?.customer_details?.outlets?.map(outlet => (
          <option key={outlet.outlet_id} value={outlet.outlet_id}>
            {outlet.outlet_name}
          </option>
        ))}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-brand-500">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        <span>Back to Search</span>
      </button>

      {customerData && (
        <>
          <OutletSelector />

          {/* Customer Details Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-brand-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{customerData.customer_details.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-brand-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{customerData.customer_details.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-brand-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{customerData.customer_details.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarDays} className="w-5 h-5 text-brand-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Created On</p>
                    <p className="font-medium">{customerData.customer_details.created_on}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-5 h-5 text-brand-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Account Status</p>
                    <p className={`font-medium ${customerData.customer_details.account_status ? 'text-green-600' : 'text-red-600'}`}>
                      {customerData.customer_details.account_status ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Statistics Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard
                icon={faShoppingCart}
                label="Total Orders"
                value={customerData.order_statistics.total_orders}
              />
              <StatCard
                icon={faCreditCard}
                label="Paid Orders"
                value={customerData.order_statistics.paid_orders}
              />
              <StatCard
                icon={faBan}
                label="Cancelled"
                value={customerData.order_statistics.cancelled_orders}
              />
              <StatCard
                icon={faKitchenSet}
                label="Cooking"
                value={customerData.order_statistics.cooking_orders}
              />
              <StatCard
                icon={faClipboardList}
                label="Placed"
                value={customerData.order_statistics.placed_orders}
              />
              <StatCard
                icon={faCheck}
                label="Served"
                value={customerData.order_statistics.served_orders}
              />
              <StatCard
                icon={faMoneyBill}
                label="Total Spent"
                value={`₹${customerData.order_statistics.total_spent}`}
              />
              <StatCard
                icon={faChartLine}
                label="Avg. Order Value"
                value={`₹${customerData.order_statistics.average_order_value}`}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper component for statistics cards
const StatCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center mb-2">
      <FontAwesomeIcon icon={icon} className="w-5 h-5 text-brand-500 mr-2" />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className="text-xl font-bold text-gray-800">{value}</p>
  </div>
);

export default RoleDetails;