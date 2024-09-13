import { doGet, doPost } from './apiService';

/**
 * Get a list of all players associated with the current user.
 * @returns {Promise} List of players
 */
export const getPlayers = async () => doGet('/api/getPlayers');

/**
 * Get a list of all available races.
 * @returns {Promise} List of races
 */
export const getRaces = async () => doGet('/api/getRaces');

/**
 * Register a new player to the current user.
 * @param {string} name 
 * @param {string} raceId 
 * @returns {Promise} JSON response
 */
export const createPlayer = async (name, raceId) => doPost('/api/createPlayer', {
	name: name,
	raceId: raceId
});

/**
 * Delete a given player from the current user.
 * @param {string} playerId 
 * @returns {Promise} JSON response
 */
export const deletePlayer = async (playerId) => doPost('/api/deletePlayer', {
	playerId: playerId
});

/**
 * Set a given player as active for the current user.
 * @param {string} playerId 
 * @returns {Promise} JSON response
 */
export const selectPlayer = async (playerId) => doPost('/api/selectPlayer', {
	playerId: playerId
});