var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10,
    // these values can be whatever you want - we're defaulting to a
    // max of 5 attempts, resulting in a 2 hour lock
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 2 * 60 * 60 * 1000;

var UserSchema = new Schema({
    username: { type: String, required: true},
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    token: { type: String, required: true },
    deleted:  { type: Number, required: true, default: 0 },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number }
});

UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // set the hashed password back on our user document
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference 
var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

UserSchema.statics.deleteUser = function(usr, cb) {
    this.findOne({ token: usr.token }, function(err, user) {
        if (err) 
            return cb(err, null);
        if (user ==  null) 
            return cb('user not found', null);
        user.deleted = 1;
        user.save(function(err) {
            if (err) 
                return cb(err, null);
            else
              return cb(null, user);  
       })
   });   
}

UserSchema.statics.updateUser = function(usr, cb) {
    this.findOne({ token: usr.token, deleted: 0}, function(err, user) {
        if (err) return cb(err, null);
        if (!user) return cb('user not found', null);
        if (usr.name)
          user.name = usr.name;
          if (usr.password)
          user.password = usr.password;
          user.save(function(err) {
            if (err) 
                return cb(err, null);
            else
                return cb(null, user);  
       })
   });     
}

UserSchema.statics.isEmailAvailable = function(email, cb) {
    this.findOne({ email: email, deleted: 0}, function(err, user) {
        if (user) return cb(false);
        else return cb(true);
   });     
}

UserSchema.statics.isUsernameAvailable = function(username, cb) {
   this.findOne({ username: username, deleted: 0}, function(err, user) {
        if (user) return cb(false);
        else return cb(true);
   });     
}

UserSchema.statics.getAuthenticated = function(username, password, cb) {
    this.findOne({ username: username,  deleted: 0 }, function(err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};

module.exports.User = UserSchema;