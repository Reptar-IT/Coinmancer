// jshint esversion:6
// require node packages
require("dotenv").config();
const UsersController = require('express').Router();
const User = require('../models/user');
const nodemailer = require("nodemailer");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const FacebookStrategy = require("passport-facebook").Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const findOrCreate = require("mongoose-findorcreate");

// set views path to constant
const view = "../app/views/";

//configure SMTP Server details.STMP mail server which is responsible for sending and receiving email. Am using gmail here.
const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS
  }
});

const host = "localhost:3030";

// use passport to create strategy
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


// Strategies
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3030/auth/facebook/coinmancer",
    profileFields: ["id", "first_name", "last_name", "email"]
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      facebookId: profile._json.id
    }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3030/auth/github/coinmancer",
  scope: ["user:email"]
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      githubId: profile._json.id
    }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3030/auth/google/coinmancer",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      googleId: profile._json.sub,
      fName: profile._json.given_name,
      lName: profile._json.family_name
    }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_ID,
  clientSecret: process.env.LINKEDIN_SECRET,
  callbackURL: "http://localhost:3030/auth/linkedin/coinmancer",
  scope: ["r_emailaddress", "r_basicprofile"],
  state: true
}, function(accessToken, refreshToken, profile, done) {
  User.findOrCreate({
    linkedInId: profile._json.id,
    fName: profile._json.firstName,
    lName: profile._json.lastName
  }, function (err, user) {
    return done(err, user);
  });
}));

//-------------- Session Control -------------------//
// API Providers
let btcUsd = fetchJSON("https://apiv2.bitcoinaverage.com/indices/global/ticker/BTCUSD");
let trxBtc = fetchJSON("https://apiv2.bitcoinaverage.com/indices/tokens/ticker/TRXBTC");

// call tickers function from api module key
function fetchJSON(url) {
  return new Promise(function(resolve, reject) {
    const request = require("request");
    // request url
    request(url, function(error, response, body) {
      // handle errors if any
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
        reject(new Error('Failed with status code ' + response.statusCode));
      } else {
        // parse url to json
        resolve(JSON.parse(body));
      }
    });
  });
}

// render views

//facebook oauth
UsersController.get("/auth/facebook", passport.authenticate("facebook"));

UsersController.get("/auth/facebook/coinmancer",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/jobs/1");
  }
);

//github oauth
UsersController.get("/auth/github", passport.authenticate("github"));

UsersController.get("/auth/github/coinmancer",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/jobs/1");
  }
);

// google oauth
UsersController.get("/auth/google", passport.authenticate("google", {scope: ["profile"]}));

UsersController.get("/auth/google/coinmancer",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/jobs/1");
  }
);

//linkedin oauth
UsersController.get("/auth/linkedin",
  passport.authenticate("linkedin"),
  function(req, res){}
);

UsersController.get("/auth/linkedin/coinmancer", passport.authenticate("linkedin", {
  successRedirect: "/jobs", failureRedirect: "/login"})
);

//twitter oauth
UsersController.get('/auth/twitter',
  passport.authenticate('twitter')
);

UsersController.get('/auth/twitter/coinmancer',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/jobs/1');
  }
);

UsersController.get("/login", function(req, res) {
  // use promise values
  Promise.all([btcUsd, trxBtc]).then(function(data){
    res.render(view + "users/login", {btcTicker: data[0].last.toFixed(4), trxTicker: ((data[0].last)*(data[1].last)).toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

UsersController.get("/register", function(req, res) {
  // use promise values
  Promise.all([btcUsd, trxBtc]).then(function(data){
    res.render(view + "users/register", {btcTicker: data[0].last.toFixed(4), trxTicker: ((data[0].last)*(data[1].last)).toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

UsersController.get("/confirmation/:token", function(req, res) {
  let token = Buffer.from(req.params.token, "base64");
  // render page with message "A message with instructions was sent to email. Please check your email to proceed".
  // use promise values
  Promise.all([btcUsd, trxBtc]).then(function(data){
    res.render(view + "users/confirmation", {btcTicker: data[0].last.toFixed(4), trxTicker: ((data[0].last)*(data[1].last)).toFixed(4), userLoggedIn: req.user, email: token});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

UsersController.get("/success", function(req, res) {
  // use promise values
  Promise.all([btcUsd, trxBtc]).then(function(data){
    res.render(view + "users/success", {btcTicker: data[0].last.toFixed(4), trxTicker: ((data[0].last)*(data[1].last)).toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

UsersController.get("/reset", function(req, res) {
  // use promise values
  Promise.all([btcUsd, trxBtc]).then(function(data){
    res.render(view + "users/reset", {btcTicker: data[0].last.toFixed(4), trxTicker: ((data[0].last)*(data[1].last)).toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

UsersController.post("/login", function(req, res) {
  // add feauture: if user email exist, if emailVerified true proceed else msg "please confirm your email address before your acount expires". if email nonexistent msg "this email does not match any user".
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err) {
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/jobs/1");
      });
    }
  });
});

UsersController.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

UsersController.post("/register", function(req, res) {
  // Generating random string.
  let tokenid = Math.floor((Math.random() * 100) + 84);
  let token = Buffer.from(req.body.username).toString("base64");
  let link="http://"+req.get(host)+"/verify/"+token+"/id/"+tokenid;
  User.register({
    username: req.body.username,
    fName: req.body.fName,
    lName: req.body.lName,
    alias: req.body.alias,
    title: req.body.profession
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      let options = { from: process.env.MAILER_USER, to: req.body.username,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
      };
      smtpTransport.sendMail(options, function(error, response){
        if(error){
          console.log(error);
        }else{
          console.log("Message sent" );
          passport.authenticate("local")(req, res, function(){
            // redirect confirmation page
            res.redirect("/");
          });
        }
      });
    }
  });
});
//HERE: email is now sent. it is the time to test if login works. if yes, allow login if isVerified is set to true. Next: save token with expiration date. delete token automatically upon expiration.if token is expired redirect to create and send a new token else check if decoded token matches an email. if no, notify user email nonexistent or token expired else set isVerified to true and redirect to login page.

// email verification
UsersController.post("/verify/:token/id/:tokenid", function(req, res) {
  let token = Buffer.from(req.params.token, "base64");
  // fixed to use and parameter because both must match for specific user to be found
  User.find({username: token, "emailToken.token": tokenid}, function(err, user){
    if(err){
      console.log(err);
      // res.send("Registration for " + decode + " has expired. Please try again. Verification must be done within one(1) hour");
      // res.render(view + "users/reset", {btcTicker: data[0].last.toFixed(4), trxTicker: ((data[0].last)*(data[1].last)).toFixed(4), userLoggedIn: req.user});
    } else {
      console.log(user);
      // update user emailVerified to true, remove emailToken field to prevent user expiration
      // res.send("email verification successful!. Registration is complete. You can now login.");
      // res.render(view + "users/reset", {btcTicker: data[0].last.toFixed(4), trxTicker: ((data[0].last)*(data[1].last)).toFixed(4), userLoggedIn: req.user});
    }
  });
});

// initiation external password reset
UsersController.post("/resetpassword", function(req, res) {
  let tokenid = Math.floor((Math.random() * 100) + 84);
  let token = Buffer.from(req.body.username).toString("base64");
  let link="http://"+req.get(host) + "/resetpassword/" + token + "/id/" + tokenid;
  User.find({username: req.body.email}, function(err, user){
    if(err){
      // user nonexistent
      res.send(err);
    } else {
      let options = { from: process.env.MAILER_USER, to: req.body.username,
        subject: "Password Reset",
        html: "Hello "+ user.fName +",<br> Please click on the link to reset your password.<br><a href="+link+">Password reset</a><br> If you did not request a password reset it is ok. You ignore this message."
      };
      smtpTransport.sendMail(options, function(error, response){
        if(error){
          console.log(error);
        }else{
          console.log("Message sent" );
          // redirect confirmation page
          res.redirect("/confirmation/" + token);
        }
      });
    }
  });
});

// external password reset
UsersController.post("/resetpassword/:token/id/:tokenid", function(req, res) {
  let token = Buffer.from(req.params.token, "base64");
  // fixed to use and parameter because both must match for specific user to be found
  // Find parent by provided id, push new document to child array, save and redirect
  User.findOneAndUpdate({username: token, "passwordReset.token": tokenid}, {
    password: req.body.password
  }, function(err){
    if(err){
      console.log(err);
      // res.send("Registration for " + decode + " has expired. Please try again. Verification must be done within one(1) hour");
      // res.render(view + "users/reset", {btcTicker: data[0].last.toFixed(4), trxTicker: ((data[0].last)*(data[1].last)).toFixed(4), userLoggedIn: req.user});
    } else {
      console.log(user);
      // update user emailVerified to true, remove emailToken field to prevent user expiration
      // res.send("email verification successful!. Registration is complete. You can now login.");
      // res.render(view + "users/reset", {btcTicker: data[0].last.toFixed(4), trxTicker: ((data[0].last)*(data[1].last)).toFixed(4), userLoggedIn: req.user});
    }
  });
});

module.exports = UsersController;
