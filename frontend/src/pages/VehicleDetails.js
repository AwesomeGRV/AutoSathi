import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Fuel, Calendar, Wrench, FileText } from 'lucide-react';
import { vehiclesAPI, fuelAPI } from '../services/api';
import toast from 'react-hot-toast';

const VehicleDetails = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [fuelEntries, setFuelEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchVehicleDetails();
    fetchFuelEntries();
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      const response = await vehiclesAPI.getById(id);
      setVehicle(response.data.vehicle);
    } catch (error) {
      toast.error('Failed to fetch vehicle details');
      console.error('Vehicle details error:', error);
    }
  };

  const fetchFuelEntries = async () => {
    try {
      const response = await fuelAPI.getByVehicleId(id, 1, 5);
      setFuelEntries(response.data.fuelEntries);
    } catch (error) {
      console.error('Fuel entries error:', error);
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

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehicle not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Fuel },
    { id: 'fuel', label: 'Fuel Entries', icon: Fuel },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/vehicles"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-gray-600">{vehicle.registration_number}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/vehicles/${id}/fuel/add`}
            className="btn btn-success flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Fuel
          </Link>
          <Link
            to={`/vehicles/${id}/edit`}
            className="btn btn-secondary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Vehicle Info Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Make & Model</p>
            <p className="font-medium">{vehicle.make} {vehicle.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Year</p>
            <p className="font-medium">{vehicle.year}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="font-medium capitalize">{vehicle.vehicle_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fuel Type</p>
            <p className="font-medium capitalize">{vehicle.fuel_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Registration Number</p>
            <p className="font-medium">{vehicle.registration_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Odometer</p>
            <p className="font-medium">{vehicle.current_odometer?.toLocaleString() || 0} km</p>
          </div>
          {vehicle.chassis_number && (
            <div>
              <p className="text-sm text-gray-600">Chassis Number</p>
              <p className="font-medium">{vehicle.chassis_number}</p>
            </div>
          )}
          {vehicle.engine_number && (
            <div>
              <p className="text-sm text-gray-600">Engine Number</p>
              <p className="font-medium">{vehicle.engine_number}</p>
            </div>
          )}
          {vehicle.purchase_date && (
            <div>
              <p className="text-sm text-gray-600">Purchase Date</p>
              <p className="font-medium">
                {new Date(vehicle.purchase_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Fuel Entries */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Fuel Entries</h3>
                <Link
                  to={`/vehicles/${id}/fuel`}
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              {fuelEntries.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No fuel entries yet</p>
              ) : (
                <div className="space-y-3">
                  {fuelEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(entry.fuel_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {entry.fuel_quantity}L @ ₹{entry.fuel_price_per_liter}/L
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
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card">
                <p className="text-sm font-medium text-gray-600">Total Fuel Entries</p>
                <p className="text-2xl font-bold text-primary-600">
                  {fuelEntries.length}
                </p>
              </div>
              <div className="stat-card">
                <p className="text-sm font-medium text-gray-600">Average Mileage</p>
                <p className="text-2xl font-bold text-success-600">
                  {fuelEntries.length > 0 
                    ? `${(fuelEntries.reduce((sum, e) => sum + (e.mileage_calculated || 0), 0) / fuelEntries.filter(e => e.mileage_calculated).length).toFixed(1)} km/L`
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="stat-card">
                <p className="text-sm font-medium text-gray-600">Total Spent on Fuel</p>
                <p className="text-2xl font-bold text-danger-600">
                  ₹{fuelEntries.reduce((sum, e) => sum + parseFloat(e.total_cost), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fuel' && (
          <div className="text-center py-12">
            <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fuel Management</h3>
            <p className="text-gray-500 mb-6">Track your fuel consumption and calculate mileage</p>
            <Link
              to={`/vehicles/${id}/fuel/add`}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fuel Entry
            </Link>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Records</h3>
            <p className="text-gray-500 mb-6">Keep track of your vehicle maintenance</p>
            <Link
              to={`/vehicles/${id}/services/add`}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service Record
            </Link>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Documents</h3>
            <p className="text-gray-500 mb-6">Upload and manage your vehicle documents</p>
            <Link
              to={`/vehicles/${id}/documents/add`}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetails;
