const redisClient = require("../../db/redisconn");

async function removeRedisMapEmailSocketid({ email }) {
	redisClient.del(email);
}

module.exports = removeRedisMapEmailSocketid;
