/**
 * Helper function for performing an HTTP request via fetch.
 * @param {string} url 
 * @param {string} method 
 * @param {object} data 
 * @returns {Promise} JSON response
 */
async function getData(url, method, parameters) {
	const response = await fetch(url, {
		method: method,
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify(parameters)
	});
	const data = await response.json();
	if (!response.ok) {
		throw data.message;
	}
	return data;
}

/**
 * Perform a GET request.
 * @param {string} url 
 * @param {object} parameters 
 * @returns {Promise} JSON response
 */
export const doGet = async (url, parameters) => getData(url, 'GET', parameters);

/**
 * Perform a POST request.
 * @param {string} url 
 * @param {object} parameters 
 * @returns {Promise} JSON response
 */
export const doPost = async (url, parameters) => getData(url, 'POST', parameters);