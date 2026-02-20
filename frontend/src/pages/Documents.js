import React from 'react';
import { FileText } from 'lucide-react';

const Documents = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">Manage your vehicle documents and certificates</p>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Document management features coming soon! You'll be able to:
          </p>
          <ul className="mt-2 text-sm text-gray-600 text-left max-w-md mx-auto">
            <li>• Upload insurance policies and PUC certificates</li>
            <li>• Store registration documents</li>
            <li>• Track document expiry dates</li>
            <li>• Get renewal reminders</li>
            <li>• Access documents on the go</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Documents;
