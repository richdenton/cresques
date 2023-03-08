module.exports = {
	passwordMinLength: 8,
	passwordMaxLength: 16,
	passwordSaltLength: 8,
	tokenExpiration: 86400,
	tokenSecret: process.env.TOKEN_SECRET
};