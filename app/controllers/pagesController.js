// jshint esversion:6
// require node packages
const PagesController = require('express').Router();
const _ = require("lodash");

// set views path to constant
const view = "../app/views/";
// require and assign api module to constant
const api = require("../../modules/apis.js");
// call tickers function from api module key
api();

PagesController.get("/", function(req, res){
  if(req.isAuthenticated()){
    res.render(view + "profiles/index", {btcTicker: btc, trxTicker: trx, userLoggedIn: req.user});
  } else {
    res.render(view + "pages/index", {btcTicker: btc, trxTicker: trx, userLoggedIn: req.user});
  }
});

PagesController.get("/about", function(req, res) {
  res.render(view + "pages/about", {btcTicker: btc, trxTicker: trx, userLoggedIn: req.user});
});

PagesController.get("/contact", function(req, res) {
  res.render(view + "pages/contact", {btcTicker: btc, trxTicker: trx, userLoggedIn: req.user});
});

PagesController.get("/copyright", function(req, res) {
  res.render(view + "pages/copyright", {btcTicker: btc, trxTicker: trx, userLoggedIn: req.user});
});

PagesController.get("/faq", function(req, res) {
  res.render(view + "pages/faq", {btcTicker: btc, trxTicker: trx, userLoggedIn: req.user});
});

PagesController.get("/privacy", function(req, res) {
  res.render(view + "pages/privacy", {btcTicker: btc, trxTicker: trx, userLoggedIn: req.user});
});

PagesController.get("/services", function(req, res) {
  res.render(view + "pages/services", {btcTicker: btc, trxTicker: trx, userLoggedIn: req.user});
});

PagesController.get("/terms", function(req, res) {
  res.render(view + "pages/terms", {btcTicker: btc, trxTicker: trx, userLoggedIn: req.user});
});

module.exports = PagesController;
