// jshint esversion:6
// require node packages
const ChatsController = require('express').Router();
const UserModel = require('../models/user');
const _ = require("lodash");

// set views path to constant
const view = "../app/views/";
// require and assign api module to constant
const api = require("../../modules/apis.js");
// call tickers function from api module key
api();

ChatsController.get("/messages", function(req, res) {
  if(req.isAuthenticated()){
    res.render(view + "chats/chats", {
      btcTicker: btc, 
      trxTicker: trx, 
      userLoggedIn: req.user
    });
  } else {
    res.redirect("/login");
  }
});

ChatsController.post("/messages", function(req, res) {
  if(req.isAuthenticated()){
    res.render(view + "chats/chats");
  } else {
    res.redirect("/login");
  }
});

module.exports = ChatsController;
