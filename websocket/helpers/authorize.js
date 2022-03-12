const redisClient = require("../../db/redisconn");

async function authorize(socket, next) {
	const token = socket.handshake.auth.token;
	const email = await redisClient.get(token);
	if (email) {
		socket.email = email;
		next();
	} else {
		const err = new Error("not authorized");
		err.data = { content: "Please retry later" };
		next(err);
	}
}

module.exports = authorize;
