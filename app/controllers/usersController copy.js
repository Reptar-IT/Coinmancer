// require node packages
// require("dotenv").config();
const UsersController = require('express').Router();
const User = require('../models/user');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;
//mainnet
const pVider = new HttpProvider("https://api.trongrid.io");
//testnet
const pVider2 = new HttpProvider("https://api.shasta.trongrid.io");

const tronWeb = new TronWeb({
    fullNode: pVider2,
    solidityNode: pVider2,
    eventServer: pVider2
});

// set views path to constant
const view = "../app/views/";

const host = "localhost:3030";

// use passport to create strategy
//passport.use(User.createStrategy());

passport.use(User.createStrategy(
  {usernameField:"username", passwordField:"password"}, function(username, done) {
    return done(null, false, {message:'Unable to login'})
  }
));

//modify to find user by username
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

UsersController.post("/connect", function(req, res) {
    //handle if null
    if(req.body.userId === ""){
      res.send("Missing Tron Account, Value is NULL");
    } else {
      if(tronWeb.isAddress(req.body.username)){
        let password = req.body.username
        User.findOne({
          "username": req.body.username
        }, function(err, user) {
          if(!user){
            User.register({
              username: req.body.username,
            }, password, function(err, user) {
              if (err) {
                console.log(err);
                res.redirect("/register");
              } else {
                passport.authenticate("local")(req, res, function(){
                  console.log("registering address: " + user.username + "  &  password: " + user.password);
                  res.redirect("/");
                });
              }
            });
          } else {
            const user = new User({
              username: req.body.username,
              password: password
            });
            req.login(user, function(err){
              if(err) {
                res.redirect("/login");
              } else {
                passport.authenticate("local")(req, res, function(){
                  console.log("login authenticated for " + user.username + " &  password: " + user.password);
                  res.redirect("/");
                });
              }
            });
          }
        });
      } else {
        console.log("bypass address: " + req.body.username);
        res.send("error in login");
      }
    }
});

UsersController.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


module.exports = UsersController;