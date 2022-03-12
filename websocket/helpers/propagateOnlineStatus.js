const db_object = require("../../db/dbconn");
const redisClient = require("../../db/redisconn");
const isUserOnline = require("./isUserOnline");

/*
 When a user connects or disconnects to or from the server, propagate the status to all of their connections
    1. Get the user's connections
    2. For each connection, if they are online, send them a message that the user is online or offline
 */
async function propagateOnlineStatusFor(io, userEmail, onlineStatus) {
	try {
		const userCollection = db_object.db.collection("users");
		let result = await userCollection.findOne(
			{ email: userEmail },
			{ projection: { connections: 1, _id: 0 } }
		);
		console.log("result:", result);
		if (!result) {
			console.log("propagateOnlineStatusFor:", userEmail, "->", "no user");
			return;
		}

		for (let email of result.connections) {
			let socketId = await isUserOnline(email);
			if (socketId) {
				console.log(
					`sending status about ${userEmail}:${onlineStatus} to:`,
					email
				);
				io.to(socketId).emit("onlineStatus", {
					email: userEmail,
					isOnline: onlineStatus,
				});
			}
		}
	} catch (err) {
		console.log(err);
	}
}

module.exports = propagateOnlineStatusFor;
