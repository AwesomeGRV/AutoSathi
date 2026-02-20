import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Fuel, TrendingUp, Calendar, Filter } from 'lucide-react';
import { fuelAPI, vehiclesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Fuel = () => {
  const [vehicles, setVehicles] = useState([]);
  const [fuelEntries, setFuelEntries] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchVehicles();
    fetchFuelEntries();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getAll();
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error('Vehicles error:', error);
    }
  };

  const fetchFuelEntries = async () => {
    try {
      const response = await fuelAPI.getRecentEntries(20);
      setFuelEntries(response.data.entries);
    } catch (error) {
      toast.error('Failed to fetch fuel entries');
      console.error('Fuel entries error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleFilter = async (vehicleId) => {
    setSelectedVehicle(vehicleId);
    try {
      if (vehicleId === 'all') {
        const response = await fuelAPI.getRecentEntries(20);
        setFuelEntries(response.data.entries);
      } else {
        const response = await fuelAPI.getByVehicleId(vehicleId, 1, 20);
        setFuelEntries(response.data.fuelEntries);
      }
    } catch (error) {
      toast.error('Failed to filter fuel entries');
      console.error('Filter error:', error);
    }
  };

  const getTotalExpense = () => {
    return fuelEntries.reduce((sum, entry) => sum + parseFloat(entry.total_cost), 0);
  };

  const getAverageMileage = () => {
    const validEntries = fuelEntries.filter(entry => entry.mileage_calculated);
    if (validEntries.length === 0) return 0;
    return validEntries.reduce((sum, entry) => sum + entry.mileage_calculated, 0) / validEntries.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel Management</h1>
          <p className="text-gray-600">Track fuel consumption and calculate mileage</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Fuel Entry
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-primary-600">{fuelEntries.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Fuel className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expense</p>
              <p className="text-2xl font-bold text-danger-600">₹{getTotalExpense().toFixed(2)}</p>
            </div>
            <div className="p-3 bg-danger-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Mileage</p>
              <p className="text-2xl font-bold text-success-600">
                {getAverageMileage().toFixed(1)} km/L
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Fuel Form (Simplified) */}
      {showAddForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Add Fuel Entry</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Full fuel entry form coming soon!</p>
            <Link
              to="/fuel/add"
              className="btn btn-primary"
              onClick={() => setShowAddForm(false)}
            >
              Open Full Form
            </Link>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Filter by Vehicle:</label>
          <select
            value={selectedVehicle}
            onChange={(e) => handleVehicleFilter(e.target.value)}
            className="input max-w-xs"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ({vehicle.registration_number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fuel Entries Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Entries</h3>
        {fuelEntries.length === 0 ? (
          <div className="text-center py-12">
            <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fuel entries yet</h3>
            <p className="text-gray-500 mb-6">Add your first fuel entry to start tracking consumption</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fuel Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Odometer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel (L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mileage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fuelEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.fuel_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{entry.make} {entry.model}</p>
                        <p className="text-gray-500">{entry.registration_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.odometer_reading?.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.fuel_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{entry.fuel_price_per_liter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{entry.total_cost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.mileage_calculated ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          {entry.mileage_calculated} km/L
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fuel;
