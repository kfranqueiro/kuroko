'use strict';
/*
 * Given a node-callback-style function, returns a new function which returns a promise instead.
 */
exports.promisify = function (func) {
	return function () {
		let args = Array.prototype.slice.call(arguments);
		return new Promise((resolve, reject) => {
			args = args.concat(function (error, result) {
				if (error) {
					reject(error);
				}
				else {
					resolve(result);
				}
			});

			func.apply(this, args);
		});
	};
};
