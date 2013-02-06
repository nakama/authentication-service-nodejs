var redis = require("redis"),
   // publish = redis.createClient('6379', 'ec2-50-19-65-14.compute-1.amazonaws.com');
   // subscribe = redis.createClient('6379', 'ec2-50-19-65-14.compute-1.amazonaws.com');
    publish = redis.createClient('6379', 'localhost');
    subscribe = redis.createClient('6379', 'localhost');
    redis.debug_mode = true;


subscribe.subscribe('mycallback'); 
subscribe.on("message", function(channel, message) {
			obj = JSON.parse(message);
		    console.log('--> code . '+obj.code);
 });


login  = {
 "action" : "login",
 "cb" :"mycallback",
 "data" : {
 		"password" :"abcdseasdf",
 		"username" : "marcelo123"
 	}
 };

add  = {
 "action" : "add",
 "cb" :"mycallback",
 "data" : {
 		"password" :"gurupi123",
 		"name" : 'marcelo oliveira',
 		"email" : 'marcelo.oliveira@mail.com',
 		"username" : "marcelo123"
 	}
 };

update  = {
 "action" : "update",
 "cb" :"mycallback",
 "data" : {
 	    "token" : "mo41of8q0hehfr",
 		"password" :"abcdseasdf",
 		"name" : 'stephanie oliveira'
 		}
};

del  = {
 "action" : "delete",
 "cb" :"mycallback",
 "data" : {
 	    "token" : "qc15t1gsacwka9k9",
 		}
 };



publish.publish("user", JSON.stringify(login));