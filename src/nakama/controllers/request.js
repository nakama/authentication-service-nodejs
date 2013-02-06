

var jsonValidator = require('../utils/jsonValidator');
var jsonGenerator = require('../utils/jsonGenerator');
var user = require('./user');
var redis = require("redis");
var subscribe = redis.createClient();
var publish = redis.createClient();



var channel  = 'user';

redis.debug_mode = false;

subscribe.subscribe(channel); //    listen to messages from channel login

subscribe.on("message", function(channel, message) {
            process(message);
});

function process(message){
	console.log('process message :  '+message);
	var obj = null;
	try {
		obj = jsonValidator.validateMessageObj(message);
		action = obj.action;
		if (action.toLowerCase()  == 'login') user.login(obj.data, obj.cb);
		if (action.toLowerCase()  == 'add') user.add(obj.data, obj.cb);
		if (action.toLowerCase()  == 'update') user.update(obj.data, obj.cb);
		if (action.toLowerCase()  == 'delete') user.del(obj.data, obj.cb);
		publish.publish(obj.cb, jsonGenerator.error('invalid action . '+action, "000002"));
	} catch (err){
		console.log('error :'+JSON.stringify(err));
		if (err.cb) {
			publish.publish(err.cb, jsonGenerator.error(err.msg, "000002"));
			return ;
		} else {
			console.log('request.js - no callback available in request message');
			return ;
		}
	}
}


// handle things

subscribe.on("error", function (err) {
    console.log("Redis says: " + err);
});

subscribe.on("ready", function () {
    console.log("Redis Signup ready.");
});

subscribe.on("reconnecting", function (arg) {
    console.log("Redis reconnecting: " + JSON.stringify(arg));
});
subscribe.on("connect", function () {
    console.log("Redis connected to channel: "+channel);
});