import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faUserGroup,
  faUsers,
  faStore,
  faEye,
  faPenToSquare,
  faCircleCheck,
  faCircleXmark,
  faRotate,
  faExpand,
  faCompress,
  faHome,
  faUser,
  faUserShield,
  faHandshake,
  faMobileScreenButton,
  faIndianRupeeSign,
  faList,
  faSearch,
  faBell,
  faChartLine,
  faEnvelope,
  faShoppingCart,
  faCalendarCheck,
  faLock,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "./common/DataTable";
import { useFullscreen } from "./FullscreenContext";
import { useDashboard } from "../lib/react-query/hooks/useDashboard";

function Dashboard() {
  const navigate = useNavigate();
  const { isFullscreen, setIsFullscreen } = useFullscreen();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Queries
  const {
    data: dashboardData = { outlet_data: [], counts: {} },
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboard().useDashboardData();

  const {
    data: cardData = {
      total_live_outlets: 0,
      total_outlets: 0,
      total_orders: 0,
      total_earning: 0,
    },
    isLoading: isCardLoading,
    refetch: refetchCardData,
  } = useDashboard().useCardData();

  // Define columns for the DataTable
  const columns = [
    {
      field: "outlet_name",
      header: "Name",
      sortable: true,
    },
    {
      field: "total_order_count",
      header: "Orders",
      sortable: true,
    },
    {
      field: "total_cooking_count",
      header: "Cooking",
      sortable: true,
    },
    {
      field: "total_placed_count",
      header: "Placed",
      sortable: true,
    },
    {
      field: "total_paid_count",
      header: "Paid",
      sortable: true,
    },
    {
      field: "total_cancel_count",
      header: "Cancelled",
      sortable: true,
    },
    {
      field: "total_category",
      header: "Categories",
      sortable: true,
    },
    {
      field: "total_menu",
      header: "Menus",
      sortable: true,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      render: (_, item) => (
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={item.is_active === 1 ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${
              item.is_active === 1 ? "text-success-500" : "text-error-500"
            }`}
          />
        </div>
      ),
    },
    {
      field: "account_type",
      header: "Account Type",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs ${
            value === "live" ? "text-error-600" : "text-success-600"
          }`}
        >
          {value?.toUpperCase()}
        </span>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, item) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewClick(item)}
            className="flex items-center justify-center w-8 h-8 text-white transition bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs"
            title="View Outlet"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditClick(item)}
            className="flex items-center justify-center w-8 h-8 text-white transition bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs"
            title="Edit Outlet"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Navigation handlers
  const handleEditClick = (outlet) => {
    navigate(`/edit-outlet/${outlet.outlet_id}`);
  };

  const handleViewClick = (outlet) => {
    navigate(`/view-outlet/${outlet.outlet_id}`);
  };

  // Fullscreen styles
  const fullscreenClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white p-8 flex flex-col justify-center items-center shadow-2xl"
    : "";

  return (
    <div className="p-0">
      {/* Compact Dashboard Card with All Sections */}
      <div
        className={`bg-white rounded-lg border border-gray-200 shadow-sm mb-6 ${fullscreenClass} ${
          isFullscreen
            ? "rounded-3xl border-gray-200 bg-white fixed inset-0 z-50 m-0 p-0 flex items-center justify-center min-h-screen min-w-full"
            : ""
        }`}
      >
        {/* Fullscreen top-right controls */}
        {isFullscreen && (
          <div className="fixed top-4 right-4 z-[60] flex items-center gap-3">
            <button
              onClick={() => refetchCardData()}
              disabled={isCardLoading}
              title="Reload"
              className="p-2 bg-white border border-gray-200 shadow-sm rounded-3xl hover:bg-gray-50"
            >
              <FontAwesomeIcon
                icon={faRotate}
                className={`w-4 h-4 ${isCardLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              title={isFullscreen ? "Minimize" : "Fullscreen"}
              className="p-2 bg-white border border-gray-200 shadow-sm rounded-3xl hover:bg-gray-50"
            >
              <FontAwesomeIcon
                icon={isFullscreen ? faCompress : faExpand}
                className="w-4 h-4"
              />
            </button>
          </div>
        )}

        <div
          className={`p-6 ${isFullscreen ? "w-full max-w-6xl p-8 overflow-auto" : ""}`}
        >
          {/* Header with Title and Controls */}
          <div className="flex items-center justify-between mb-6">
            {/* Title */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-semibold text-gray-800">Home</h1>
            </div>
            
            {/* Controls */}
            {!isFullscreen && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => refetchCardData()}
                  disabled={isCardLoading}
                  title="Reload"
                  className="p-2 bg-white border border-gray-200 shadow-sm rounded-3xl hover:bg-gray-50"
                >
                  <FontAwesomeIcon
                    icon={faRotate}
                    className={`w-4 h-4 ${isCardLoading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={() => setIsFullscreen((f) => !f)}
                  title={isFullscreen ? "Minimize" : "Fullscreen"}
                  className="p-2 bg-white border border-gray-200 shadow-sm rounded-3xl hover:bg-gray-50"
                >
                  <FontAwesomeIcon
                    icon={isFullscreen ? faCompress : faExpand}
                    className="w-4 h-4"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Dashboard Sections Grid */}
          <div
            className={`flex gap-4 ${
              isFullscreen ? "flex-row" : "flex-col md:flex-row"
            } justify-center`}
          >
            {/* 1. Enquiry Section */}
            <div className="flex-1 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Enquiry</h3>
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-sm text-brand-500"
                />
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm font-semibold text-gray-800">
                    {cardData.total_enquiries?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-gray-600">Enquiry</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm font-semibold text-green-600">
                    {cardData.onboard_count?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-gray-600">Onboard</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm font-semibold text-blue-600">
                    {cardData.positive_count?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-gray-600">Positive</div>
                </div>
              </div>
            </div>

            {/* 2. Outlet Section */}
            <div className="flex-1 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Outlets</h3>
                <FontAwesomeIcon
                  icon={faStore}
                  className="text-sm text-brand-500"
                />
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm font-semibold text-gray-800">
                    {cardData.total_outlets?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm font-semibold text-green-600">
                    {cardData.total_live_outlets?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-gray-600">Live</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm font-semibold text-red-600">
                    {cardData.total_inactive_outlets?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-gray-600">Inactive</div>
                </div>
              </div>
            </div>

            {/* 3. Order Section */}
            <div className="flex-1 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Orders</h3>
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  className="text-sm text-brand-500"
                />
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm font-semibold text-blue-600">
                    {cardData.total_orders?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm font-semibold text-green-600">
                    {cardData.paid_orders?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-gray-600">Paid</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-sm font-semibold text-orange-600">
                    {cardData.cooking_orders?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-gray-600">Cooking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Only show the rest of the dashboard if not fullscreen */}
      {!isFullscreen && (
        <>
          {/* Navigation Icons Section */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-5">
             

              <Link
                to="/admins"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faUser}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">Admins</span>
              </Link>
              <Link
                to="/outlets"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faStore}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">Outlets</span>
              </Link>
              <Link
                to="/companies"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">Companies</span>
              </Link>


              <Link
                to="/partners"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faHandshake}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">Partners</span>
              </Link>
              
              <Link
                to="/ubac_tree"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faLock}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">UBAC Tree</span>
              </Link>
              
              <Link
                to="/customer"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faUser}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">Customers</span>
              </Link>
        

             
             
              <Link
                to="/search"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faSearch}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">Search</span>
              </Link>

            

              <Link
                to="/notifications"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faBell}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">
                  Notifications
                </span>
              </Link>

              <Link
                to="/enquiries"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">Partner Enquiries</span>
              </Link>

              <Link
                to="/bookings"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">Website Bookings</span>
              </Link>

              <Link
                to="/stats"
                className="flex flex-col items-center justify-center w-40 h-40 p-3 bg-white border border-gray-200 rounded-3xl hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="mb-1 text-brand-500"
                />
                <span className="text-xs font-medium text-dark">Stats</span>
              </Link>

              
            </div>
          </div>

          {/* DataTable Section */}
          {/* <div className="mt-6">
            <DataTable
              data={dashboardData.outlet_data}
              columns={columns}
              dashboardTitle="All Outlets"
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search"
              counts={{
                total: dashboardData.outlet_data.length,
                active: dashboardData.outlet_data.filter((outlet) => outlet.is_active === 1).length,
                inactive: dashboardData.outlet_data.filter((outlet) => outlet.is_active === 0).length,
              }}
              showBackButton={false}
              createButton={{
                show: false,
              }}
              enableSort={true}
              enablePagination={true}
              enableSearch={true}
              itemsPerPage={50}
              itemsPerPageOptions={[10, 25, 50, 100, 200]}
              darkMode={false}
              enableStatusFilter={true}
              statusFilter={statusFilter}
              onStatusFilterChange={(value) => setStatusFilter(value)}
              isLoading={isDashboardLoading}
              error={dashboardError}
            />
          </div> */}
        </>
      )}
    </div>
  );
}

export default Dashboard;
