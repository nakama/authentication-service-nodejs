
var validateMessageObj = function (str) {
	var obj = null;
		try {
		obj = JSON.parse(str);
		}
		catch (err){
			throw 'invalid json object';
		}

		if (!obj.hasOwnProperty('cb')){
			throw {"msg" : "object missing callback"};
		}
		if (!obj.hasOwnProperty('action')){
			throw {"msg" : "object missing action"};
		}
		if (!obj.hasOwnProperty('data')){
			throw {"msg" : "object missing data"};
		}
		return obj;
}


var validateLoginObj = function (obj) {
	   if (!obj.hasOwnProperty('username')){
			throw {"msg" : "username is required"};
		}
		if (!obj.username){
			throw {"msg" : "invalid username"};
		}
		if (!obj.hasOwnProperty('password')){
			throw {"msg" : "password is required"};
		}
		if (!obj.password){
			throw {"msg" : "invalid password"};
		}
		return obj;
}

var validateSignupObj = function (obj) {
		if (!obj.hasOwnProperty('name')){
			throw {"msg" : "name is required"};
		}
		if (!obj.hasOwnProperty('email')){
			throw {"msg" : "email is required"};
		}
		if (!obj.hasOwnProperty('username')){
			throw {"msg" : "username is required"};
		}
		if (!obj.username){
			throw {"msg" : "invalid username"};
		}
		if (!obj.hasOwnProperty('password')){
			throw {"msg" : "password is required"};
		}
		if (!obj.password){
			throw {"msg" : "invalid password"};
		}
	return obj;
}

module.exports.validateLoginObj = validateLoginObj;
module.exports.validateSignupObj = validateSignupObj;
module.exports.validateMessageObj = validateMessageObj;

