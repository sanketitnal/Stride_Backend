const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const passport = require("passport");
const redisClient = require("../db/redisconn");
const cors = require("cors");

router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
	"/google/callback",
	passport.authenticate("google", { failureRedirect: "http://localhost:3000" }),
	function (req, res) {
		// Successful authentication, redirect home.
		res.redirect("http://localhost:3000/chat");
	}
);

router.get("/logout", function (req, res) {
	req.logout();
	res.redirect("http://localhost:3000");
});

router.get(
	"/sockettkn",
	cors({ origin: "http://localhost:3000", credentials: true }),
	async function (req, res) {
		if (req.isAuthenticated() && req.user.email) {
			const randomString = crypto.randomBytes(20).toString("hex");
			await redisClient.set(randomString, req.user.email);
			await redisClient.expire(randomString, 60);
			res.send({ token: randomString });
		} else {
			res.sendStatus(401);
		}
	}
);

module.exports = router;
