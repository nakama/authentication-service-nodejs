var jsonlint = require("jsonlint");
		

function error (str, code) {
		var obj = {
			"output" : str,
			"status" : "error",
			"code" :code,
		}
		return JSON.stringify(obj);
}

function success (str) {
		var obj = {
			"output" : str,
			"status" : "success"
		}
		return JSON.stringify(obj);
}

function buildUser (user) {
	var obj = {
			"token" : user.token,
			"email" : user.email,
			"username" : user.username,
			"name" : user.name
		}
		return JSON.stringify(obj);
}


module.exports.error = error;
module.exports.success = success;
module.exports.buildUser = buildUser;