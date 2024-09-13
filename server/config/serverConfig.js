module.exports = {
	emailMinLength: 5,
	emailMaxLength: 100,
	passwordMinLength: 8,
	passwordMaxLength: 16,
	passwordSaltLength: 8,
	nameMinLength: 5,
	nameMaxLength: 100,
	tokenExpiration: 86400,
	tokenSecret: process.env.TOKEN_SECRET
};