'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiDollarSign, 
  FiTrendingUp,
  FiUserCheck,
  FiShield,
  FiQrCode,
  FiSettings,
  FiActivity,
  FiGrid
} from 'react-icons/fi';
import dashboardService from '@/api/services/dashboardService';

// StatCard component
const StatCard = ({ title, value, growth, icon: Icon, color }) => {
  if (!Icon) {
    console.error(`Icon is missing for card: ${title}`);
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
      <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className={`text-sm ${parseFloat(growth) >= 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
            {growth}%
          </p>
        </div>
        <div className={`p-3 rounded-full ${color} text-white`}>
          <Icon size={24} />
      </div>
    </div>
  </div>
);
};

// Dashboard component
function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, growth: 0 },
    outlets: { total: 0, growth: 0 },
    revenue: { total: 0, growth: 0 },
    sessions: { total: 0, growth: 0 },
    owners: { total: 0, growth: 0 },
    partners: { total: 0, growth: 0 },
    roles: { total: 0, growth: 0 },
    functionalities: { total: 0, growth: 0 },
    qrTemplates: { total: 0, growth: 0 }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await dashboardService.getStats();
      
      // Process and organize stats data
      setStats({
        users: {
          total: statsResponse.total_users || 0,
          growth: statsResponse.user_growth || 0
        },
        outlets: {
          total: statsResponse.total_outlets || 0,
          growth: statsResponse.outlet_growth || 0
        },
        revenue: {
          total: statsResponse.total_revenue || 0,
          growth: statsResponse.revenue_growth || 0
        },
        sessions: {
          total: statsResponse.active_sessions || 0,
          growth: statsResponse.session_growth || 0
        },
        owners: {
          total: statsResponse.total_owners || 0,
          growth: statsResponse.owner_growth || 0
        },
        partners: {
          total: statsResponse.total_partners || 0,
          growth: statsResponse.partner_growth || 0
        },
        roles: {
          total: statsResponse.total_roles || 0,
          growth: statsResponse.role_growth || 0
        },
        functionalities: {
          total: statsResponse.total_functionalities || 0,
          growth: statsResponse.functionality_growth || 0
        },
        qrTemplates: {
          total: statsResponse.total_qr_templates || 0,
          growth: statsResponse.qr_template_growth || 0
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Main Statistics Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            growth={stats.users.growth}
            icon={FiUsers}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Outlets"
            value={stats.outlets.total}
            growth={stats.outlets.growth}
            icon={FiShoppingBag}
            color="bg-green-500"
          />
          <StatCard
            title="Revenue"
            value={`$${stats.revenue.total.toLocaleString()}`}
            growth={stats.revenue.growth}
            icon={FiDollarSign}
            color="bg-purple-500"
          />
          <StatCard
            title="Active Sessions"
            value={stats.sessions.total}
            growth={stats.sessions.growth}
            icon={FiActivity}
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* User Management Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Owners"
            value={stats.owners.total}
            growth={stats.owners.growth}
            icon={FiUserCheck}
            color="bg-indigo-500"
          />
          <StatCard
            title="Total Partners"
            value={stats.partners.total}
            growth={stats.partners.growth}
            icon={FiUsers}
            color="bg-pink-500"
          />
        </div>
      </div>

      {/* Access Control Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Roles"
            value={stats.roles.total}
            growth={stats.roles.growth}
            icon={FiShield}
            color="bg-yellow-500"
          />
          <StatCard
            title="Total Functionalities"
            value={stats.functionalities.total}
            growth={stats.functionalities.growth}
            icon={FiSettings}
            color="bg-red-500"
          />
        </div>
          </div>
          
      {/* QR Management Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="QR Templates"
            value={stats.qrTemplates.total}
            growth={stats.qrTemplates.growth}
            icon={FiGrid}
            color="bg-teal-500"
          />
        </div>
      </div>
    </div>
  );
} 

export default DashboardPage; 