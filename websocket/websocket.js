const db_object = require("../db/dbconn");

// API endpoint handlers
const authorize = require("./helpers/authorize");
const redisMapEmailSocketid = require("./helpers/redisMapEmailSocketid");
const removeRedisMapEmailSocketid = require("./helpers/removeRedisMapEmailSocketid");
const getMessagesOfChannel = require("./helpers/getMessagesOfChannel");
const sendMessage = require("./helpers/sendMessage");
const isUserOnline = require("./helpers/isUserOnline");
const propagateOnlineStatusFor = require("./helpers/propagateOnlineStatus");
const errorWrapper = require("./errorWrapper");

module.exports = function (io) {
	io.use(authorize);

	io.on("connection", async function (socket) {
		// Register all API endpoints
		socket.on("disconnect", () => {
			propagateOnlineStatusFor(io, socket.email, false);
			removeRedisMapEmailSocketid({ email: socket.email });
			console.log(`${socket.email} disconnected`);
		});
		socket.on("getMessagesOfConnection", (request) =>
			errorWrapper(getMessagesOfChannel, request, socket)
		);
		socket.on("sendMessage", (message, callback) =>
			errorWrapper(sendMessage, message, socket, io, callback)
		);

		// Send your connections that you are online
		propagateOnlineStatusFor(io, socket.email, true);

		// run mandatory onConnect routines
		onConnect(socket, io);
	});
};

async function onConnect(socket) {
	console.log(`${socket.email} connected`);

	// map email to socket id
	redisMapEmailSocketid({ email: socket.email, socketId: socket.id });

	// Send list of connections to the user on startup
	const connections = await getConnectionsOf(socket.email);
	socket.emit("connections", { username: socket.email, connections });
}

async function getConnectionsOf(email) {
	const userCollection = db_object.db.collection("users");
	let result = await userCollection.findOne(
		{ email },
		{ projection: { connections: 1, _id: 0 } }
	);
	let connections = await userCollection
		.find(
			{ email: { $in: result.connections } },
			{ projection: { email: 1, _id: 0, imageUrl: 1 } }
		)
		.toArray();
	for (let connection of connections) {
		if (await isUserOnline(connection.email)) {
			connection.isOnline = true;
		} else {
			connection.isOnline = false;
		}
	}
	return connections;
}
