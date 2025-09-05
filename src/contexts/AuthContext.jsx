/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Implements JWT-based authentication with secure storage and proper state management.
 * 
 * Features:
 * - User authentication state management
 * - Login/logout functionality
 * - Token persistence
 * - Role-based access control support
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import { API_HOST } from "../config/config";
import axios from 'axios';

// Create the authentication context
const AuthContext = createContext();

/**
 * Custom hook to use the authentication context
 * @returns {Object} Authentication context values and methods
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Authentication Provider Component
 * Manages authentication state and provides methods to login, logout, etc.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
const AuthProvider = ({ children }) => {
  /**
   * Initialize user state from localStorage if available
   * This ensures authentication persists across page refreshes
   */
  const [user, setUser] = useState(() => {

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");

    return token && userId && userRole ? { userId, role: userRole } : null;
  });
  
  const [loading, setLoading] = useState(true);

  /**
   * Effect to check token validity on mount
   * In a production app, this would verify the token with the backend
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (token) {
          const userId = localStorage.getItem("userId");
          const userRole = localStorage.getItem("userRole");
          if (userId && userRole) {
            setUser({ userId, role: userRole });
          } else {
            await logout();
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        await logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const setLocalStorageSession = function(token, user){
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.userId); // keeping existing setup/structure
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('loggedInUser', JSON.stringify(user));
  }

  /**
   * Handles user login
   * @param {string} email - User's email
   * @param {string} password - User's password (not used in mock implementation)
   * @returns {Promise<Object>} User data
   */
  const login = async (email, password, role) => {
    const response = await axios.post(`${API_HOST}/api/auth/login`, { email, password, role });
    const { token, user } = response.data;
    setLocalStorageSession(token, user);
    setUser(user);
    return user;
  };

  const signup = async (fullName, email, password, role) => {
    const response = await axios.post(`${API_HOST}/api/auth/register`, { fullName, email, password, role });
    const { token, user } = response.data;
    setLocalStorageSession(token, user);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${API_HOST}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("adminProfile");
        localStorage.removeItem("userProfile");
        localStorage.removeItem("loggedInUser");
           
        setUser(null);

    }
  };

  /**
   * Handles password reset request
   * @param {string} email - User's email
   * @returns {Promise<void>}
   */
  const resetPassword = async (email) => {
    // In a real app, this would make an API call
    console.log("Password reset requested for:", email);
    return Promise.resolve();
  };

  /**
   * Checks if the current user has a specific role
   * @param {string} requiredRole - Role to check for
   * @returns {boolean} Whether user has the required role
   */
  const hasRole = (requiredRole) => {
    const userRole = localStorage.getItem("userRole");
    return userRole === requiredRole;
  };

  /**
   * Context value with authentication state and methods
   */
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    hasRole,
    isAdmin: () => hasRole("admin"),
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
