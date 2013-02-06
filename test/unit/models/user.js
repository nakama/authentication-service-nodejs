var mongoose = require('mongoose'),
    User = require('../../../src/nakama/model/user');

var connStr = 'mongodb://localhost:27017/mongoose-bcrypt-test';
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

// create a user a new user
var testUser = new User({
    username: 'jmar777',
    password: 'Password123'
});

// save user to database
testUser.save(function(err) {
    if (err) console.log('unable to save user');

    // attempt to authenticate user
    User.getAuthenticated('jmar777', 'Password1233', function(err, user, reason) {
        if (err) console.log('unable to authneticate user');

        // login was successful if we have a user
        if (user) {
            // handle login success
            console.log('login success');
            return;
        }

        // otherwise we can determine why we failed
        var reasons = User.failedLogin;
     
        switch (reason) {
            case reasons.NOT_FOUND:
               console.log('NOT_FOUND');
     
            case reasons.PASSWORD_INCORRECT:
                console.log('PASSWORD_INCORRECT');
                break;
            case reasons.MAX_ATTEMPTS:
                console.log('MAX_ATTEMPTS');
                break;
        }
    });
});