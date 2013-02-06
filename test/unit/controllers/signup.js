var redis = require("redis"),
    publish = redis.createClient();
    subscribe = redis.createClient();
redis.debug_mode = true;

publish.on("ready", function () {
    console.log('ready state');
});

subscribe.subscribe('d2marcelo'); 
subscribe.on("message", function(channel, message) {
			obj = JSON.parse(message);
		   console.log('--> status msg. '+obj.status);
           console.log('--> output msg. '+obj.output);
            console.log('--> code . '+obj.code);
 });
/*
// failed login json obj
publish.publish("login", "invalid json");
// failed no channel passed
publish.publish("login", '{"username": "d2marcelo", "password" :"pwd"}');
// failed login username key
publish.publish("login", '{"usr": "d2marcelo", "password" :"pwd", "channel" :"d2marcelo"}');
// failed login password key
publish.publish("login", '{"username": "d2marcelo", "pwd" :"pwd", "channel" :"d2marcelo"}');
// failed login username value
publish.publish("login", '{"username": null, "password" :"pwd", "channel" :"d2marcelo"}');
// failed login password value
publish.publish("login", '{"username": "d2marcelo", "password" :null, "channel" :"d2marcelo"}');
// correct
publish.publish("login", '{"username": "d2marcelo", "password" :"pwd", "channel" :"d2marcelo"}');
*/
publish.publish("signup", '{"username": "d2marcelo", "email" :"marcelo@mail.com", "name" : "marcelo oliveira","password":"gurupi123","channel" :"d2marcelo"}');