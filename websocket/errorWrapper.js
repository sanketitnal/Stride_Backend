module.exports = function (handlerFunction, ...arguments) {
	let length = arguments.length;
	try {
		handlerFunction(...arguments);
	} catch (error) {
		console.log(error);
		if (arguments[length - 1] instanceof Function) {
			arguments[length - 1]({ status: 500, error: "INTERNAL SERVER ERROR" });
		}
	}
};
