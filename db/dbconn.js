require("dotenv").config();
const { MongoClient } = require("mongodb");
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const dbClusterName = process.env.DB_CLUSTER_NAME;

const database_object = {
	databaseName: "chat_app",
	client: new MongoClient(
		`mongodb+srv://${username}:${password}@${dbClusterName}.1hbtk.mongodb.net/${database}?retryWrites=true&w=majority`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	),
	closeDatabaseConnection: function () {
		this.client.close();
	},
};

database_object.client.connect((err) => {
	if (err) {
		console.log("Error connecting to database - ", err);
		process.exit();
	} else {
		console.log("connected to database");
	}
	database_object.db = database_object.client.db("chat_app");
});

module.exports = database_object;
