import { doPost } from './apiService';

/**
 * Register a new user.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} JSON response
 */
export const signupUser = (email, password) => doPost('/api/signup', {
	email: email,
	password: password
});

/**
 * Login a user.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} JSON response
 */
export const loginUser = (email, password) => doPost('/api/login', {
	email: email,
	password: password
});

/**
 * Logout the current user.
 * @returns {Promise} JSON response
 */
export const logoutUser = () => doPost('/api/logout');