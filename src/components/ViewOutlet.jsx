import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faUserGroup,
  faUserGear,
  faChevronLeft,
  faEdit,
  faTrash,
  faStore,
  faPhone,
  faLocationDot,
  faBowlFood,
  faPercent,
  faClock,
  faIdCard,
  faFileInvoice,
  faQrcode,
  faBook,
  faListUl,
  faTableCells,
  faReceipt,
  faTable,
  faCalendarPlus,
  faUser,
  faCalendarCheck,
  faUserPen,
  faMessage
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

function ViewOutlet() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const [outletData, setOutletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchOutletDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "https://men4u.xyz/v2/common/view_outlet",
        {
          outlet_id: outletId,
          user_id: adminData?.user_id,
          app_source: "admin_dashboard",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlet details") {
        setOutletData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch outlet details");
      console.error("Error fetching outlet details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchOutletDetails();
    }
  }, [adminData?.user_id, outletId]);

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Outlets', path: '/outlets' },
    { label: outletData?.name || 'View Outlet' }
  ];

  // Add these handler functions
  const handleEdit = () => {
    navigate(`/edit-outlet/${outletId}`);
  };

  const handleDelete = async () => {
    // Implement delete functionality
    if (window.confirm("Are you sure you want to delete this outlet?")) {
      // Add your delete API call here
    }
  };

  return (
    <>
      {/* Breadcrumb - Moved outside the card */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Actions */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div>
              <button 
                onClick={() => navigate('/outlets')}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {outletData?.name || 'View Outlet'}
              </h2>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 hover:bg-error-600 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

         
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2
              className="text-xl font-semibold text-gray-800 dark:text-white/90"
              x-text="pageName"
            >
              Basic Information
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {/* Waiters Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faStore}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Outlet Name
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chefs Metric */}
            {/* <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUtensils}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email Address
                    </p>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.chef_count}
                    </h4>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Captains Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.mobile}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mobile Number
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.address}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Address
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faMessage}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.whatsapp || '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    WhatsApp
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUtensils}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.outlet_type 
                        ? outletData.outlet_type.charAt(0).toUpperCase() + outletData.outlet_type.slice(1)
                        : '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Outlet Type
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 mt-6">
            <h2
              className="text-xl font-semibold text-gray-800 dark:text-white/90"
              x-text="pageName"
            >
              Business Details
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {/* Waiters Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faBowlFood}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.veg_nonveg 
                        ? outletData.veg_nonveg.charAt(0).toUpperCase() + outletData.veg_nonveg.slice(1)
                        : '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Food Type
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faPercent}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.service_charges != null 
                        ? `${outletData.service_charges}%` 
                        : '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Service Charges
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faPercent}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.gst != null 
                        ? `${outletData.gst}%` 
                        : '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    GST
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.opening_time || '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Opening Hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.closing_time || '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Closing Hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.fssainumber || '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    FSSAI Number
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faFileInvoice}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.gstnumber || '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    GST Number
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faQrcode}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.upi_id || '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    UPI ID
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>



          <div className="flex flex-wrap items-center justify-between gap-3 my-6">
            <h2
              className="text-xl font-semibold text-gray-800 dark:text-white/90"
              x-text="pageName"
            >
              Manage Staff Details
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {/* Waiters Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.waiter_count ?? '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Waiters
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chefs Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUtensils}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.chef_count ?? '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Chefs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Captains Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUserGroup}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.captain_count ?? '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Captains
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUserGear}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.manager_count ?? '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Managers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 mt-6">
            <h2
              className="text-xl font-semibold text-gray-800 dark:text-white/90"
              x-text="pageName"
            >
              Manage Outlet Details
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {/* Waiters Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faBook}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.total_menu ?? '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Menus
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chefs Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faListUl}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.total_category ?? '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Categories
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Captains Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faTableCells}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.section_count ?? '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sections
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faReceipt}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.orders_count ?? '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Orders
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faTable}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.table_count ?? '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tables
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 mt-6">
            <h2
              className="text-xl font-semibold text-gray-800 dark:text-white/90"
              x-text="pageName"
            >
              Audit Information
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {/* Waiters Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faCalendarPlus}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.created_on || '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created On
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chefs Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.created_by || '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created By
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Captains Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.updated_on || '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Updated On
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Managers Metric */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUserPen}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {outletData?.updated_by 
                        ? outletData.updated_by.charAt(0).toUpperCase() + outletData.updated_by.slice(1)
                        : '-'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Updated By
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewOutlet;
