const db_object = require("../../db/dbconn");
const redisClient = require("../../db/redisconn");

async function sendMessage(message, socket, io, callback) {
	const userCollection = db_object.db.collection("users");

	// Check if sender && receiver exists
	const receiver = await userCollection.findOne(
		{
			email: message.to,
		},
		{ projection: { _id: 1 } }
	);
	const sender = await userCollection.findOne(
		{
			email: message.from,
		},
		{ projection: { imageUrl: 1, _id: 0 } }
	);

	// Check if person sending message is same as socket.email and receiver is present
	if (message.from === socket.email && receiver && sender) {
		const messageCollection = db_object.db.collection("messages");
		const id = [message.to, message.from].sort().join("_");

		// Add message to database, create unique index for message
		const result = await messageCollection.findOneAndUpdate(
			{ _id: id },
			{
				$inc: { messagesLength: 1 },
				$push: {
					messages: { ...message, index: null },
				},
			},
			{
				upsert: true,
				returnDocument: "after",
				projection: { messagesLength: 1, _id: 0 },
			}
		);

		// If this is the first message then add connections to both users' document
		if (result.lastErrorObject.updatedExisting === false) {
			message.imageUrl = sender.imageUrl;
			message.isOnline = true;

			userCollection.updateOne(
				{ email: message.from },
				{ $addToSet: { connections: message.to } }
			);
			userCollection.updateOne(
				{ email: message.to },
				{ $addToSet: { connections: message.from } }
			);
		}

		// set index of message
		messageCollection.updateOne(
			{
				_id: id,
				messages: {
					$elemMatch: {
						to: message.to,
						from: message.from,
						date: message.date,
					},
				},
			},
			{ $set: { "messages.$.index": result.value.messagesLength } }
		);
		callback({ status: 200, index: result.value.messagesLength });

		// If receiver is online, send message to receiver
		let socketId = await redisClient.get(message.to);
		if (socketId) {
			io.to(socketId).emit("receiveMessage", {
				...message,
				index: result.value.messagesLength,
			});
		}
	}
}

module.exports = sendMessage;
