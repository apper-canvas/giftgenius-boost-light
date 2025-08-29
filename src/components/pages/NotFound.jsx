import React from 'react';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-surface-800 rounded-lg shadow-lg text-center">
        <ApperIcon name="AlertCircle" size={64} className="mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;