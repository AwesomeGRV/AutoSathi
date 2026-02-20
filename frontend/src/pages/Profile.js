import React from 'react';
import { User } from 'lucide-react';

const Profile = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Profile management features coming soon! You'll be able to:
          </p>
          <ul className="mt-2 text-sm text-gray-600 text-left max-w-md mx-auto">
            <li>• Update your personal information</li>
            <li>• Change your password</li>
            <li>• Manage notification preferences</li>
            <li>• Configure app settings</li>
            <li>• View account activity</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
