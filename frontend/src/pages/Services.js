import React from 'react';
import { Wrench } from 'lucide-react';

const Services = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Records</h1>
        <p className="text-gray-600">Track your vehicle maintenance and service history</p>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Service management features coming soon! You'll be able to:
          </p>
          <ul className="mt-2 text-sm text-gray-600 text-left max-w-md mx-auto">
            <li>• Log service records with odometer tracking</li>
            <li>• Schedule future maintenance</li>
            <li>• Track service costs and history</li>
            <li>• Set service reminders</li>
            <li>• Upload service invoices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Services;
