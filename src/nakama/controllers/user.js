
var mongoose = require('mongoose');
var User = mongoose.model('User');
var jsonValidator = require('../utils/jsonValidator');
var jsonGenerator = require('../utils/jsonGenerator');
var redis = require("redis");
var publish = redis.createClient();


function del (data, cb) {
	console.log('delete user ');
	var callback = cb;
	User.deleteUser(data, function(err, user) {
        if (err)  
        publish.publish(callback, jsonGenerator.error(err));
        else
     	publish.publish(callback, jsonGenerator.success('n/a'));
    });
}

function update (data, cb) {
	console.log('update user ');
	var callback = cb;
	User.updateUser(data, function(err, user) {
        if (err)  
        publish.publish(callback, jsonGenerator.error(err));
        else
     	publish.publish(callback, jsonGenerator.success(jsonGenerator.buildUser(user)));
    });
}


function add (data, cb) {
	console.log('add user');
	var obj = null;
	var callback = cb;
	try {
		obj = jsonValidator.validateSignupObj(data);
	} catch (err){
		console.log('login error :'+JSON.stringify(err));
		publish.publish(err.cb, jsonGenerator.error(err.msg, "000002"));
	}
	User.isUsernameAvailable(obj.username, function(isAvailable) { 
		console.log(isAvailable);
			if (!isAvailable)  {
							publish.publish(callback, jsonGenerator.error("username already in use", "000023"));
							return;
			}

			User.isEmailAvailable(obj.email, function(isAvailable) { 
				console.log(isAvailable);
			if (!isAvailable)  {
							publish.publish(callback, jsonGenerator.error("email already in use", "000023"));
							return;
			}

			var myUser = new User({
			    username: obj.username,
			    password: obj.password,
			    name: obj.name,
			    email: obj.email,
			    token: Math.random().toString(36).substr(2)
			});

			// save user to database
			myUser.save(function(err) {
			    if (err) {
			    	 publish.publish(callback, jsonGenerator.error(err, "000003"));
			    	 return;
			    } else {
					    User.getAuthenticated(obj.username, obj.password, function(err, user, reason) {
					        if (err) 
					        		 console.log(err);
					        
					        if (user) {
					             publish.publish(callback, jsonGenerator.success(jsonGenerator.buildUser(user)));
					            return;
					        }

					        // otherwise we can determine why we failed
					        var reasons = User.failedLogin;
					        console.log('return auth failure');
						
					        switch (reason) {
					            case reasons.NOT_FOUND:
					                publish.publish(callback, jsonGenerator.error("user not found", "000001"));
						        	break;
						        case reasons.PASSWORD_INCORRECT:
					                publish.publish(callback, jsonGenerator.error("incorrect password", "000002"));
					                break;
					            case reasons.MAX_ATTEMPTS:
					                publish.publish(callback, jsonGenerator.error("max attempts", "000003"));
					                break;
					        }
					    });
			 }
			})
		})
	});

}


function login (data, cb) {
	console.log('login user');
	var obj = null;
	var callback = cb;
	try {
		obj = jsonValidator.validateLoginObj(data);
	} catch (err){
		console.log('login object parsing error :'+JSON.stringify(err));
		publish.publish(err.cb, jsonGenerator.error(err.msg, "000002"));
	}

	console.log('authenticate user');

    User.getAuthenticated(obj.username, obj.password, function(err, user, reason) {
        if (err) 
        		 console.log(err);
        
        if (user) {
            publish.publish(callback, jsonGenerator.success(jsonGenerator.buildUser(user)));
            return;
        }

        // otherwise we can determine why we failed
        var reasons = User.failedLogin;
     console.log('return auth failure');
	
        switch (reason) {
            case reasons.NOT_FOUND:
                publish.publish(callback, jsonGenerator.error("user not found", "000001"));
	        	break;
	        case reasons.PASSWORD_INCORRECT:
                publish.publish(callback, jsonGenerator.error("incorrect password", "000002"));
                break;
            case reasons.MAX_ATTEMPTS:
                publish.publish(callback, jsonGenerator.error("max attempts", "000003"));
                break;
        }
    });

}

module.exports.login = login;
module.exports.add = add;
module.exports.del = del;
module.exports.update = update;
