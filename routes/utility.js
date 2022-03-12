var express = require("express");
var router = express.Router();
let db_object = require("../db/dbconn");
const isUserOnline = require("../websocket/helpers/isUserOnline");
const cors = require("cors");

router.get(
	"/getUser",
	cors({ origin: "http://localhost:3000", credentials: true }),
	async function (req, res, next) {
		try {
			console.log("getUser", req.isAuthenticated());
			if (req.isAuthenticated() && req.user.email) {
				let userCollection = db_object.db.collection("users");
				let result = await userCollection.findOne({ email: req.query.email });

				if (result) {
					res.send({
						email: result.email,
						imageUrl: result.imageUrl,
						isOnline: await isUserOnline(result.email),
					});
				} else {
					res.sendStatus(404);
				}
			} else {
				res.sendStatus(401);
			}
		} catch (err) {
			console.log(err);
			next(err);
		}
	}
);

module.exports = router;
