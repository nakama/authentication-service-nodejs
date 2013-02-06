
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/account')
mongoose.model('User', require('./src/nakama/models/user.js').User);
require('./src/nakama/controllers/request.js')
require('./src/nakama/controllers/express.js')
