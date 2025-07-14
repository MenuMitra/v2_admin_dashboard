import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faUserGroup,
  faUsers,
  faUserGear,
  faStore,
  faEye,
  faPenToSquare,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "./common/DataTable";
import { API_CONFIG } from "../config/appConfig";
import ApexCharts from "react-apexcharts";
import { faRotate, faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";
import { useFullscreen } from "./FullscreenContext";

function Dashboard() {
  const { getToken, isAuthenticated, logout } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [data, setData] = useState({
    outlet_data: [],
    counts: {
      customer_count: 0,
      owner_count: 0,
      outlet_count: 0,
      partner_count: 0,
      guest_count: 0,
    },
  });

  // Add search state
  const [searchTerm, setSearchTerm] = useState("");

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

  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"
  const outlets = data.outlet_data || [];

  const [cardData, setCardData] = useState({
    total_live_outlets: 0,
    total_outlets: 0,
    total_orders: 0,
    total_earning: 0,
  });
  const [cardLoading, setCardLoading] = useState(false);
  const { isFullscreen, setIsFullscreen } = useFullscreen();

  // Fetch card data (simulate or use real API)
  const fetchCardData = async () => {
    setCardLoading(true);
    try {
      // Replace with your real API call if needed
      const token = getToken();
      const response = await fetch(`${BASE_URL}/${API_VERSION}/admin/admin_home`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
      const jsonData = await response.json();
      setCardData({
        total_live_outlets: jsonData.counts?.live_outlet_count ?? 0,
        total_outlets: jsonData.counts?.outlet_count ?? 0,
        total_orders: jsonData.counts?.total_order_count ?? 0,
        total_earning: jsonData.counts?.total_earning_count ??0,
      });
    } catch (e) {
      // fallback or error handling
    } finally {
      setCardLoading(false);
    }
  };

  // Auto-refresh every 10 minutes
  useEffect(() => {
    fetchCardData();
    const interval = setInterval(fetchCardData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ApexChart options
  const chartOptions = {
    chart: { type: "donut", toolbar: { show: false } },
    labels: ["Life Outlets", "Outlets", "Orders"],
    legend: { show: true, position: "bottom" },
    dataLabels: { enabled: true },
    colors: ["#6366f1", "#22c55e", "#f59e42"],
  };
  const chartSeries = [
    cardData.total_live_outlets,
    cardData.total_outlets,
    cardData.total_orders,
    cardData.total_earning,
  ];

  // Fullscreen styles
  const fullscreenClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white p-8 flex flex-col justify-center items-center shadow-2xl"
    : "";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        const response = await fetch(`${BASE_URL}/${API_VERSION}/admin/admin_home`, {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          navigate("/");
          logout();
        }

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (isAuthenticated()) {
      fetchDashboardData();
    }
  }, []);

  const handleEditClick = (outlet) => {
    navigate(`/edit-outlet/${outlet.outlet_id}`);
  };

  const handleViewClick = (outlet) => {
    navigate(`/view-outlet/${outlet.outlet_id}`);
  };

  return (
    <div className="p-0">
      {/* Full-width Card with Chart and Counts */}
      <div className={`col-span-12 mb-6 ${fullscreenClass}`} style={isFullscreen ? { borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff", position: "fixed", inset: 0, zIndex: 50, margin: 0, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", minWidth: "100vw" } : { borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff", position: "relative" }}>
        <div className={`w-full flex ${isFullscreen ? "flex-row items-center justify-center h-full" : "flex-col md:flex-row items-center justify-between"} gap-6 px-6 pb-6 pt-6`} style={isFullscreen ? {height: "100vh", position: "relative"} : {}}>
          {/* Counts: Always centered horizontally and vertically */}
          <div className="flex flex-row items-center justify-center w-full h-full gap-6">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-black">{cardData.total_live_outlets}</span>
              <span className="text-xs text-gray-500">Total Live Outlets</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-black">{cardData.total_outlets}</span>
              <span className="text-xs text-gray-500">Total Outlets</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-black">{cardData.total_orders}</span>
              <span className="text-xs text-gray-500">Total Orders</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-black">{cardData.total_earning}</span>
              <span className="text-xs text-gray-500">Total Earning</span>
            </div>
          </div>
          {/* Right: Icons (top-right in fullscreen) */}
          <div className={isFullscreen ? "absolute top-6 right-6 flex flex-col items-end gap-4" : "flex flex-col items-end gap-4"} style={isFullscreen ? {zIndex: 100} : {}}>
            <div className="flex items-center gap-3">
              <button onClick={fetchCardData} disabled={cardLoading} title="Reload" className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50">
                <FontAwesomeIcon icon={faRotate} className={`w-4 h-4 ${cardLoading ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => setIsFullscreen((f) => !f)} title={isFullscreen ? "Minimize" : "Fullscreen"} className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50">
                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="w-4 h-4" style={isFullscreen ? { transform: "rotate(0deg)" } : {}} />
              </button>
            </div>
            {/* Chart is commented out */}
            {/* {isFullscreen && (
              <div className="flex justify-center items-center flex-1">
                <ApexCharts
                  options={chartOptions}
                  series={chartSeries}
                  type="donut"
                  width={500}
                />
              </div>
            )} */}
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
                      {data.counts?.owner_count || 0}
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
                      {data.counts?.partner_count || 0}
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
                      {data.counts?.outlet_count || 0}
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
                      {data.counts?.customer_count || 0}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Customers
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Replace Table Section with DataTable */}
          {/* <div className="mt-6">
            <DataTable
              data={outlets}
              columns={columns}
              dashboardTitle="All Outlets"
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search"
              counts={{
                total: outlets.length,
                active: outlets.filter((outlet) => outlet.is_active === 1).length,
                inactive: outlets.filter((outlet) => outlet.is_active === 0).length,
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
              // onItemsPerPageChange={(value) => {
              //   console.log('Items per page changed to:', value);
              // }}
            />
          </div> */}
        </>
      )}
    </div>
  );
}

export default Dashboard;
