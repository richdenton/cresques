class Entity {

	/**
	 * Represents an Entity.
	 * @constructor
	 */
	constructor() {
		this.id = 0;
		this.name = 'UNDEFINED';
	}

	/**
	 * Performs a full match on the Entity name.
	 * @param {String} str - A string to compare.
	 * @return {Boolean} Whether or not the passed string fully matches the Entity name.
	 */
	matchFull(str) {
		return this.name.toLowerCase() === str.toLowerCase();
	}

	/**
	 * Performs a partial match on the Entity name.
	 * A succesful match may be one which includes the first X characters of a given string with length X.
	 * @param {String} name - A name to compare.
	 * @return {Boolean} Whether or not the passed string partially matches the Entity name.
	 */
	matchPartial(str) {
		const name = this.name.toLowerCase();
		str = str.toLowerCase();
		let pos = name.indexOf(str);
		while (x > -1) {

			// Match found at the beginning of the word
			if (pos === 0 || this.name[pos - 1] === ' ') {
				return true;
			}

			// Continue check starting with tne next character
			pos = name.indexOf(str, pos + 1);
		}

		// No match found
		return false;
	}
}

module.exports = Entity;