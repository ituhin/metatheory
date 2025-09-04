/**
 * TaskFilter Component
 * 
 * A component for filtering tasks by completion status and title. Used within
 * a parent component (e.g., UserPage) to filter displayed tasks.
 * 
 * Features:
 * - Filter tasks by completion status (All/Complete/Incomplete)
 * - Search tasks by title with real-time results
 * - Responsive design with mobile optimization
 * - Accessibility support with ARIA attributes
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.1
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaTasks } from 'react-icons/fa';

const TaskFilter = ({ tasks, setTasks, setFilteredTasks }) => {
  // State for filter settings
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [counts, setCounts] = useState({
    all: 0,
    complete: 0,
    incomplete: 0
  });

  /**
   * Update task counts by status
   * 
   * @param {Array} taskList - List of tasks to count
   */
  const updateCounts = useCallback((taskList) => {
    const completeTasks = taskList.filter(task => task.progress === 100).length;
    const incompleteTasks = taskList.filter(task => task.progress < 100).length;
    
    setCounts({
      all: taskList.length,
      complete: completeTasks,
      incomplete: incompleteTasks
    });
  }, []);

  /**
   * Apply filters to tasks based on current filter settings
   * Memoized with useCallback to prevent unnecessary re-renders
   * 
   * @param {Array} taskList - List of tasks to filter
   * @param {Object} filterSettings - Current filter settings
   */
  const applyFilters = useCallback((taskList, filterSettings) => {
    let result = [...taskList];
    
    // Apply status filter
    if (filterSettings.status !== 'all') {
      result = result.filter(task => 
        filterSettings.status === 'complete' ? task.progress === 100 : task.progress < 100
      );
    }
    
    // Apply search filter
    if (filterSettings.search.trim()) {
      const searchTerm = filterSettings.search.toLowerCase().trim();
      result = result.filter(task => task.title.toLowerCase().includes(searchTerm));
    }
    
    setFilteredTasks(result);
  }, [setFilteredTasks]);

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
    applyFilters(tasks, newFilters);
  };

  // Update counts and filtered tasks when tasks change
  useEffect(() => {
    updateCounts(tasks);
    applyFilters(tasks, filters);
  }, [tasks, filters, updateCounts, applyFilters]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaTasks className="mr-2" aria-hidden="true" />
        Filter Tasks
      </h2>
      
      <div className="space-y-4">
        {/* Search input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Tasks
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              type="text"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search by title"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              aria-label="Search tasks by title"
            />
          </div>
        </div>
        
        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" aria-hidden="true" />
            </div>
            <select
              id="status-filter"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              aria-label="Filter tasks by status"
            >
              <option value="all">All Tasks ({counts.all})</option>
              <option value="complete">Complete ({counts.complete})</option>
              <option value="incomplete">Incomplete ({counts.incomplete})</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {tasks.length > 0 ? tasks.filter(task => filters.status === 'all' || (filters.status === 'complete' ? task.progress === 100 : task.progress < 100)).filter(task => filters.search.trim() ? task.title.toLowerCase().includes(filters.search.toLowerCase().trim()) : true).length : 0} of {tasks.length} tasks
      </div>
    </div>
  );
};

export default TaskFilter;