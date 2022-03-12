const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const cookieSession = require("cookie-session");
const authRouter = require("./routes/auth");
const utilityRouter = require("./routes/utility");
const app = express();
const exprSession = require("express-session");
require("./passport/passport")(passport);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(
	exprSession({
		secret: "bR$3jI8)&6naS/7;[awrHnftrg",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: false,
			maxAge: 60 * 60 * 1000,
		},
	})
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/auth", authRouter);
app.use("/utility", utilityRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
