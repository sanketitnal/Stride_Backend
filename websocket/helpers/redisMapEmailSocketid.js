const redisClient = require("../../db/redisconn");

async function redisMapEmailSocketid({ email, socketId }) {
	redisClient.set(email, socketId);
}

module.exports = redisMapEmailSocketid;
