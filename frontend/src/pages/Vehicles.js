import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Car, Edit, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { vehiclesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingRenewals, setUpcomingRenewals] = useState([]);

  useEffect(() => {
    fetchVehicles();
    fetchUpcomingRenewals();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getAll();
      setVehicles(response.data.vehicles);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
      console.error('Vehicles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingRenewals = async () => {
    try {
      const response = await vehiclesAPI.getUpcomingRenewals(30);
      setUpcomingRenewals(response.data.renewals);
    } catch (error) {
      console.error('Upcoming renewals error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehiclesAPI.delete(id);
        setVehicles(vehicles.filter(v => v.id !== id));
        toast.success('Vehicle deleted successfully');
      } catch (error) {
        toast.error('Failed to delete vehicle');
        console.error('Delete vehicle error:', error);
      }
    }
  };

  const getRenewalStatus = (vehicleId) => {
    const renewal = upcomingRenewals.find(r => r.id === vehicleId);
    if (!renewal) return null;

    const daysUntilExpiry = Math.ceil(
      (new Date(renewal.next_expiry) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 7) {
      return { status: 'critical', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', days: daysUntilExpiry };
    }
    return null;
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
          <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
          <p className="text-gray-600">Manage your vehicle fleet and track maintenance</p>
        </div>
        <Link
          to="/vehicles/add"
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Link>
      </div>

      {/* Upcoming Renewals Alert */}
      {upcomingRenewals.length > 0 && (
        <div className="notification notification-warning">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Upcoming Renewals</p>
              <p className="text-sm">
                You have {upcomingRenewals.length} vehicle(s) with insurance or PUC expiring soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles yet</h3>
          <p className="text-gray-500 mb-6">Add your first vehicle to start tracking maintenance</p>
          <Link to="/vehicles/add" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const renewalStatus = getRenewalStatus(vehicle.id);
            
            return (
              <div key={vehicle.id} className="card relative">
                {renewalStatus && (
                  <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
                    renewalStatus.status === 'critical' 
                      ? 'bg-danger-100 text-danger-800' 
                      : 'bg-warning-100 text-warning-800'
                  }`}>
                    {renewalStatus.status === 'critical' ? '⚠️ Critical' : '⏰ Soon'}
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg mr-3">
                      <Car className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-500">{vehicle.year}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Registration:</span>
                    <span className="font-medium">{vehicle.registration_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{vehicle.vehicle_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fuel:</span>
                    <span className="font-medium capitalize">{vehicle.fuel_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Odometer:</span>
                    <span className="font-medium">{vehicle.current_odeter?.toLocaleString() || 0} km</span>
                  </div>
                </div>

                {renewalStatus && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    renewalStatus.status === 'critical' 
                      ? 'bg-danger-50 text-danger-800' 
                      : 'bg-warning-50 text-warning-800'
                  }`}>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Renewal in {renewalStatus.days} days
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    View Details
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/vehicles/${vehicle.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
