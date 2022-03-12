const redisClient = require("../../db/redisconn");
const db_object = require("../../db/dbconn");

async function getMessagesOfChannel(request, socket) {
	const connectionEmail = request.connectionEmail;
	const channelId = [socket.email, connectionEmail].sort().join("_");
	const lowestMessageIndex = request.lowestMessageIndex;
	let sliceQuery = { $slice: -10 };
	if (lowestMessageIndex) {
		if (lowestMessageIndex <= 1) return;
		let startIndex = Math.max(lowestMessageIndex - 1 - 10, 0);
		sliceQuery = {
			$slice: [startIndex, lowestMessageIndex - startIndex - 1],
		};
	}

	const channelExists = await db_object.db
		.collection("messages")
		.countDocuments({ _id: channelId });

	if (channelExists > 0) {
		let data = await db_object.db
			.collection("messages")
			.findOne(
				{ _id: channelId },
				{ projection: { _id: 0, messages: sliceQuery } }
			);
		socket.emit("receiveMessagesForConnection", {
			connectionEmail,
			messages: data.messages,
		});
	} else {
		socket.emit("receiveMessagesForConnection", {
			connectionEmail,
			messages: [],
		});
	}
}

module.exports = getMessagesOfChannel;
