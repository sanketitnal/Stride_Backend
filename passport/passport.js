require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db_object = require("../db/dbconn");

module.exports = function (passport) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: "http://localhost:5000/auth/google/callback",
			},
			async function (accessToken, refreshToken, profile, done) {
				try {
					const userCollection = db_object.db.collection("users");
					let user = await userCollection.findOne({ googleId: profile.id });
					if (!user) {
						user = {
							email: profile.emails[0].value,
							googleId: profile.id,
							name: profile.displayName,
							imageUrl: profile.photos[0].value,
							connections: [],
						};
						await userCollection.insertOne(user);
					}
					done(null, user);
				} catch (err) {
					console.log(err);
					throw new Error("Unable to add user to database");
				}
			}
		)
	);

	passport.serializeUser(function (user, done) {
		//console.log(user);
		done(null, user.googleId);
	});

	passport.deserializeUser(async function (googleId, done) {
		const userCollection = db_object.db.collection("users");
		let user = await userCollection.findOne({ googleId });
		done(null, user);
	});
};
