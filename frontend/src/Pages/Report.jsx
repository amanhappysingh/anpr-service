import React, { useState } from 'react';
import { Calendar, FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ReportPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);

  // Fetch report data using React Query
  const { data: reportData, isLoading, isError, error } = useQuery({
    queryKey: ['report', startDate, endDate],
    queryFn: async () => {
      const response = await axios.get('/api/reports', {
        params: { startDate, endDate }
      });
      console.log('Report Data:', response.data);
      return response.data;
    },
    enabled: shouldFetch,
    retry: 2,
  });

  const handleGetReport = () => {
    setShouldFetch(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <FileText size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reports
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Select date range and get your report
          </p>
        </div>

        {/* Date Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Get Report Button */}
            <div className="flex items-end">
              <button
                onClick={handleGetReport}
                disabled={isLoading}
                className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Loading...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Get Report
                  </>
                )}
              </button>
            </div>

            {/* Clear Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setShouldFetch(false);
                }}
                className="w-full px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {reportData && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Data fetched successfully! Check console for details.
              </p>
            </div>
          )}

          {isError && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ✗ Error: {error?.message || 'Failed to fetch data'}
              </p>
            </div>
          )}
        </div>

        {/* Table Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <FileText size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Your table will go here</p>
            <p className="text-sm mt-2">Data is being logged to console</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;