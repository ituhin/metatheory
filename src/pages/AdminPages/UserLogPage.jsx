/**
 * UserLogPage Component
 * 
 * An administrative component that displays user activity logs with comprehensive
 * information and management capabilities. Implements localStorage-based log storage
 * and retrieval with delete functionality for administrators.
 * 
 * Features:
 * - Displays user logs with login time, logout time, JWT token, username, role, IP address
 * - Have Pagination for user logs list
 * - Provides delete functionality for individual log entries
 * - Implements sorting and filtering capabilities
 * - Includes responsive design for all screen sizes
 * - Supports accessibility with proper ARIA attributes
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { FaTrash, FaSpinner, FaExclamationTriangle, FaUserShield, FaSort, FaFilter, FaTimes, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import axios from 'axios';
import Sidebar from "../../components/admin/Sidebar";
import { API_HOST } from "../../config/config";

const UserLogPage = () => {
  // State management with proper initialization
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempError, setTempError] = useState(null);
  const [tempSuccess, setTempSuccess] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'loginTime',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({
    role: 'all',
    search: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  /**
   * Load user logs from localStorage
   */
  useEffect(() => {
    console.log(`useEffect triggered with page=${page}, limit=${limit}`);
    const loadLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_HOST}/api/user-logs`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit }
        });
        setLogs(response.data.logs);
        setFilteredLogs(response.data.logs);
        setTotal(response.data.total);
        setError(null);
      } catch (err) {
        console.error('Error loading user logs:', err);
        setError(err.response?.data?.message || 'Failed to load user logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [page, limit]);

  /**
   * Apply sorting to logs
   * 
   * @param {string} key - The property to sort by
   */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedLogs = React.useMemo(() => {
    let sortableLogs = [...filteredLogs];
    if (sortConfig.key) {
      sortableLogs.sort((a, b) => {
        let aValue = a[sortConfig.key] || 0;
        let bValue = b[sortConfig.key] || 0;

        if (sortConfig.key === 'loginTime' || sortConfig.key === 'logoutTime') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableLogs;
  }, [filteredLogs, sortConfig]);

  /**
   * Apply filters to logs
   * 
   * @param {Object} newFilters - Updated filter settings
   */
  const applyFilters = (newFilters) => {
    let result = [...logs];
    
    if (newFilters.role !== 'all') {
      result = result.filter(log => log.role === newFilters.role);
    }
    
    if (newFilters.search.trim()) {
      const searchTerm = newFilters.search.toLowerCase().trim();
      result = result.filter(log => 
        log.fullName.toLowerCase().includes(searchTerm) ||
        log.ipAddress.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredLogs(result);
  };

  /**
   * Handle filter changes
   * 
   * @param {string} filterType - Type of filter to change
   * @param {string} value - New filter value
   */
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    console.log('handlePageChange', newPage)
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      console.log('setPage', total, 'g', limit);
      setPage(newPage);
    }
  };

  /**
   * Format date for display
   * 
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid date';
    }
  };

  /**
   * Delete a log entry
   * 
   * @param {string} logId - ID of the log to delete
   */
  const handleDelete = async (logId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_HOST}/api/user-logs/${logId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedLogs = logs.filter(log => log._id !== logId);
      setLogs(updatedLogs);
      setFilteredLogs(updatedLogs);
      setTotal(total - 1);
      setDeleteConfirm(null);
      setTempError(null);
      // Adjust page if necessary
      if (updatedLogs.length === 0 && page > 1) {
        setPage(page - 1);
      }
      setTempSuccess('Record deleted successfully');
      setTimeout(() => setTempSuccess(null), 3000); // Clear after 3 seconds
      if (updatedLogs.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      console.error('Error deleting log:', err);
      setTempError(err.response?.data?.message || 'Failed to delete log. Please try again.');
    }
  };

  const tokenFormat = function(token){

  }

  /**
   * Cancel delete confirmation
   */
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center" aria-live="polite" role="status">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" aria-hidden="true" />
        <span className="ml-2">Loading user logs...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-red-500 flex items-center" aria-live="assertive" role="alert">
        <FaExclamationTriangle className="mr-2" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        {tempError && (
          <div className="mb-4 bg-red-100 p-4 rounded-lg text-red-700 flex items-center justify-between" role="alert">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2 text-xl" aria-hidden="true" />
              <span>{tempError}</span>
            </div>
            <button
              onClick={() => setTempError(null)}
              className="text-red-700 hover:text-red-900"
              aria-label="Dismiss error"
            >
              <FaTimes />
            </button>
          </div>
        )}
        {tempSuccess && (
          <div className="mb-4 bg-green-100 p-4 rounded-lg text-green-700 flex items-center justify-between" role="alert">
            <div className="flex items-center">
              <span>{tempSuccess}</span>
            </div>
            <button
              onClick={() => setTempSuccess(null)}
              className="text-green-700 hover:text-green-900"
              aria-label="Dismiss success message"
            >
              <FaTimes />
            </button>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <FaUserShield className="mr-2 text-blue-500" aria-hidden="true" />
          User Activity Logs
        </h1>

        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Logs
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                type="text"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search by user name or IP"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                aria-label="Search logs by user name or IP"
              />
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" aria-hidden="true" />
              </div>
              <select
                id="role-filter"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                aria-label="Filter logs by role"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
          
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                  User name
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('loginTime')}>
                  Login Time {sortConfig.key === 'loginTime' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : <FaSort />}
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('logoutTime')}>
                  Logout Time {sortConfig.key === 'logoutTime' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : <FaSort />}
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                  JWT Token
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.loginTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.logoutTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-mono" title={log.token}>
                      {log.token.slice(0, 20) + (log.token.length > 20 ? '...' : '')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {deleteConfirm === log._id ? (
                      <div className="flex justify-end space-x-2">
                        <button name={`dd-${log._id}`}
                          onClick={() => handleDelete(log._id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Confirm delete log for ${log.fullName}`}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="text-gray-600 hover:text-gray-900"
                          aria-label="Cancel delete"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(log._id)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete log for ${log.fullName}`}
                      >
                        <FaTrash aria-hidden="true" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
        <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 flex items-center"
            aria-label="Previous page"
          >
            <FaAngleLeft className="mr-2" />
            Previous
          </button>
          <span className="text-gray-700">
            Page {page} of {Math.ceil(total / limit) || 1} (Total: {total} logs)
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 flex items-center"
            aria-label="Next page"
          >
            Next
            <FaAngleRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogPage;