import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Fuel,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Plus,
  DollarSign,
  Activity,
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [mileageStats, setMileageStats] = useState([]);
  const [expenseTrends, setExpenseTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, mileageRes, expenseRes] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getMileageStats(),
        dashboardAPI.getExpenseTrends(),
      ]);

      setOverview(overviewRes.data.overview);
      setMileageStats(mileageRes.data.mileageStats);
      setExpenseTrends(expenseRes.data.expenseTrends);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load dashboard data</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Vehicles',
      value: overview.vehicleStats.total_vehicles,
      icon: Car,
      color: 'primary',
      link: '/vehicles',
    },
    {
      title: 'Upcoming Renewals',
      value: overview.upcomingRenewals,
      icon: Calendar,
      color: 'warning',
      link: '/vehicles',
    },
    {
      title: 'Monthly Fuel Expense',
      value: `₹${overview.currentMonthExpense.toFixed(2)}`,
      icon: DollarSign,
      color: 'danger',
      link: '/fuel',
    },
    {
      title: 'Unread Notifications',
      value: overview.unreadNotifications,
      icon: AlertTriangle,
      color: 'secondary',
      link: '/notifications',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your vehicle overview.</p>
        </div>
        <Link
          to="/vehicles"
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="stat-card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-600 mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fuel Entries */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Fuel Entries</h2>
            <Link
              to="/fuel"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {overview.recentEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No fuel entries yet</p>
            ) : (
              overview.recentEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.make} {entry.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.fuel_date).toLocaleDateString()} • {entry.fuel_quantity}L
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{entry.total_cost}</p>
                    {entry.mileage_calculated && (
                      <p className="text-sm text-gray-500">
                        {entry.mileage_calculated} km/L
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vehicle Type Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Cars</span>
              </div>
              <span className="font-semibold">{overview.vehicleStats.cars || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Bikes</span>
              </div>
              <span className="font-semibold">{overview.vehicleStats.bikes || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-warning-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Scooters</span>
              </div>
              <span className="font-semibold">{overview.vehicleStats.scooters || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-secondary-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Others</span>
              </div>
              <span className="font-semibold">
                {(overview.vehicleStats.total_vehicles || 0) - 
                 ((overview.vehicleStats.cars || 0) + 
                  (overview.vehicleStats.bikes || 0) + 
                  (overview.vehicleStats.scooters || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mileage Statistics */}
      {mileageStats.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Mileage</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {mileageStats.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-500">{vehicle.registration_number}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {vehicle.avg_mileage ? `${vehicle.avg_mileage} km/L` : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {vehicle.fuel_entries_count} entries
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/vehicles"
            className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Car className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-primary-900">Manage Vehicles</span>
          </Link>
          <Link
            to="/fuel"
            className="flex flex-col items-center p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors"
          >
            <Fuel className="h-8 w-8 text-success-600 mb-2" />
            <span className="text-sm font-medium text-success-900">Add Fuel Entry</span>
          </Link>
          <Link
            to="/services"
            className="flex flex-col items-center p-4 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors"
          >
            <Calendar className="h-8 w-8 text-warning-600 mb-2" />
            <span className="text-sm font-medium text-warning-900">Service Records</span>
          </Link>
          <Link
            to="/documents"
            className="flex flex-col items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-secondary-600 mb-2" />
            <span className="text-sm font-medium text-secondary-900">Documents</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
