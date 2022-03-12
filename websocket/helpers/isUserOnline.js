const redisClient = require("../../db/redisconn");

async function isUserOnline(email) {
	try {
		const userOnline = await redisClient.get(email);
		console.log("isUserOnline:", email, "->", userOnline);
		return userOnline;
	} catch (err) {
		console.log(err);
		return false;
	}
}

module.exports = isUserOnline;
