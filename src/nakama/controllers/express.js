var express = require('express');
var facebook = require('./facebook');
var instagram = require('./instagram');
var app = express.createServer();

// configure Express
app.configure(function() {
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(facebook.passport.initialize());
  app.use(facebook.passport.session());
  app.use(instagram.passport.initialize());
  app.use(instagram.passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
  res.render('facebook/index', { user: req.user });
});

app.get('/facebook/account', facebook.ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/facebook/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/facebook/auth',
  facebook.passport.authenticate('facebook'),
  function(req, res){});

app.get('/facebook/auth/callback', 
  facebook.passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/facebook/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/instagram/account', instagram.ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/instagram/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/instagram/auth',
  instagram.passport.authenticate('instagram'),
  function(req, res){}); // function won't be called

app.get('/instagram/auth/callback', 
  instagram.passport.authenticate('instagram', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/instagram/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);
