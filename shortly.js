var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');//npm install manually
var session = require('express-session');//npm install manually - in refactor add to package.json
var passport = require('passport');//npm install manually
var GithubStrategy = require('passport-github2').Strategy;//npm install manually

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.use(cookieParser('sk8'));
app.use(session({ secret: 'sk8', cookie: {maxAge: 60 * 2500}, resave: true, saveUninitialized: true}));
 //https://github.com/expressjs/session/issues/56
 //http://expressjs.com/en/guide/migrating-4.html

//serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});



//config passport
passport.use(new GithubStrategy({
    clientID: '6ccaf471f996fc0c16d9',
    clientSecret: 'fedcb428ead337f2c7dfae702571e68a14b5aceb',
    callbackURL: "http://127.0.0.1:4568/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    findOrCreate({ githubId: profile.id }, function (err, user) {
      console.log('authenticated', accessToken, refreshToken, profile, done);
      return done(err, user);
    });
  }
));

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


app.get('/', 
function(req, res) {
  res.render('index');
});

app.get('/login', 
function(req, res) {
  res.render('login');
});


app.get('/create', 
function(req, res) {
  res.render('index');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/',
  function(req,res){
    console.log("clicked");
  }
);


app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Links.create({
          url: uri,
          title: title,
          base_url: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/logout', function (req, res) {
  req.logOut();
});


app.get('/auth/github',
  function(req, res){
    res.redirect('/index');
});

app.post('/login', function(req, res){
  var password = req.body.password;
  var username = req.body.username;
});

app.get('/signup',
  function(req, res){
    res.render('signup');
});

app.post('/signup', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  console.log(req.session);

  new User({'username': username, 'password': password}).save().then(function(){
    console.log("new user added");

    //redirect to login page after signup/or login after signup
  });
  //don't allow username or password to be blank
  //don't allow users to sign up for the same username
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

findOrCreate = function(gitObj, callback){
  console.log("some string there as well", gitObj.githubID);


  new User({'username': gitObj.githubID }).fetch().then(function (model) {
    if(model === null){
      console.log('no users');
    }else{
      if(model.attributes.password === password){
        req.session.regenerate(function(){
          req.session.user = username;
          res.redirect('index');
        });
      }else{
        res.redirect('login');
      }
    }
  });
};

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits')+1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
