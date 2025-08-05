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
        <div className="flex items-center gap-2 justify-center">
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
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Outlet"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditClick(item)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
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
      {/* Full-width Card with Chart and Counts */}
      <div
        className={`col-span-12 mb-6 ${fullscreenClass}`}
        style={
          isFullscreen
            ? {
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: "#fff",
                position: "fixed",
                inset: 0,
                zIndex: 50,
                margin: 0,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                minWidth: "100vw",
              }
            : {
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: "#fff",
                position: "relative",
              }
        }
      >
        <div
          className={`w-full flex ${
            isFullscreen
              ? "flex-row items-center justify-center h-full"
              : "flex-col md:flex-row items-center justify-between"
          } gap-6 px-6 pb-6 pt-6`}
          style={isFullscreen ? { height: "100vh", position: "relative" } : {}}
        >
          {/* Counts: Always centered horizontally and vertically */}
          <div className="flex flex-row items-center justify-center w-full h-full gap-6">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-black">
                {cardData.total_live_outlets?.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">Total Live Outlets</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-black">
                {cardData.total_outlets?.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">Total Outlets</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-black">
                {cardData.total_orders?.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">Total Orders</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-black">
                {cardData.total_earning?.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">Total Earning</span>
            </div>
          </div>
          {/* Right: Icons (top-right in fullscreen) */}
          <div
            className={
              isFullscreen
                ? "absolute top-6 right-6 flex flex-col items-end gap-4"
                : "flex flex-col items-end gap-4"
            }
            style={isFullscreen ? { zIndex: 100 } : {}}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetchCardData()}
                disabled={isCardLoading}
                title="Reload"
                className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`w-4 h-4 ${isCardLoading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => setIsFullscreen((f) => !f)}
                title={isFullscreen ? "Minimize" : "Fullscreen"}
                className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
              >
                <FontAwesomeIcon
                  icon={isFullscreen ? faCompress : faExpand}
                  className="w-4 h-4"
                  style={isFullscreen ? { transform: "rotate(0deg)" } : {}}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Only show the rest of the dashboard if not fullscreen */}
      {!isFullscreen && (
        <>
          {/* Stats Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            <Link
              to="/owners"
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUserTie}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {dashboardData.counts?.owner_count || 0}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Owners
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/partners"
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] transition hover:shadow-lg"
            >
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
                      {dashboardData.counts?.partner_count || 0}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Partners
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/outlets"
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] transition hover:shadow-lg"
            >
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
                      {dashboardData.counts?.outlet_count || 0}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Outlets
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/customer"
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="h-6 w-6 text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {dashboardData.counts?.customer_count || 0}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Customers
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Icons Section */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-5">
              <Link
                to="/home"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-brand-500 hover:shadow-lg bg-blue-light-500"
              >
                <FontAwesomeIcon icon={faHome} className="text-white mb-1" />
                <span className="text-xs font-medium text-white">Home</span>
              </Link>

              <Link
                to="/admins"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-brand-500 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon icon={faUser} className="text-white mb-1" />
                <span className="text-xs font-medium text-white">Admins</span>
              </Link>

              <Link
                to="/owners"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-success-500 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon icon={faUsers} className="text-white mb-1" />
                <span className="text-xs font-medium text-white">Owners</span>
              </Link>

              <Link
                to="/super-owners"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-warning-500 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faUserShield}
                  className="text-white mb-1"
                />
                <span className="text-xs font-medium text-white">
                  Super Owners
                </span>
              </Link>

              <Link
                to="/partners"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-gray-500 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faHandshake}
                  className="text-white mb-1"
                />
                <span className="text-xs font-medium text-white">Partners</span>
              </Link>

              <Link
                to="/features"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-theme-pink-500 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faMobileScreenButton}
                  className="text-white mb-1"
                />
                <span className="text-xs font-medium text-white">Features</span>
              </Link>

              <Link
                to="/subscriptions"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-orange-500 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faIndianRupeeSign}
                  className="text-white mb-1"
                />
                <span className="text-xs font-medium text-white">
                  Subscriptions
                </span>
              </Link>

              <Link
                to="/outlets"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-blue-light-600 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon icon={faStore} className="text-white mb-1" />
                <span className="text-xs font-medium text-white">Outlets</span>
              </Link>

              <Link
                to="/roles"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-error-500 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faUserShield}
                  className="text-white mb-1"
                />
                <span className="text-xs font-medium text-white">Roles</span>
              </Link>

              <Link
                to="/functionalities"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-gray-600 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon icon={faList} className="text-white mb-1" />
                <span className="text-xs font-medium text-white">
                  Functionalities
                </span>
              </Link>

              <Link
                to="/search"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-brand-600 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon icon={faSearch} className="text-white mb-1" />
                <span className="text-xs font-medium text-white">Search</span>
              </Link>

              <Link
                to="/customer"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-success-600 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon icon={faUser} className="text-white mb-1" />
                <span className="text-xs font-medium text-white">
                  Customers
                </span>
              </Link>

              <Link
                to="/notifications"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-warning-600 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon icon={faBell} className="text-white mb-1" />
                <span className="text-xs font-medium text-white">
                  Notifications
                </span>
              </Link>

              <Link
                to="/enquiries"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-theme-pink-500 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-white mb-1"
                />
                <span className="text-xs font-medium text-white">
                  Enquiries
                </span>
              </Link>

              <Link
                to="/stats"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-error-400 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="text-white mb-1"
                />
                <span className="text-xs font-medium text-white">Stats</span>
              </Link>

              <Link
                to="/profile"
                className="w-40 h-40 flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 bg-gray-700 hover:border-brand-500 hover:shadow-lg"
              >
                <FontAwesomeIcon icon={faUser} className="text-white mb-1" />
                <span className="text-xs font-medium text-white">Profile</span>
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
              itemsPerPageOptions={[50, 100, 200]}
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
