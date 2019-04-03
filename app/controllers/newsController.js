// jshint esversion:6
// require node packages
const NewsController = require('express').Router();
const UserModel = require('../models/user');
const _ = require("lodash");

// set views path to constant
const view = "../app/views/";
// require and assign api module to constant
const api = require("../../modules/apis.js");
// call tickers function from api module key
api();

NewsController.get("/news", function(req, res) {
  if(req.isAuthenticated()){
    res.render(view + "news/news", {
      btcTicker: btc,
      trxTicker: trx,
      userLoggedIn: req.user // add topic, msg and time
    });
  } else {
    res.redirect("/login");
  }
});

module.exports = NewsController;
