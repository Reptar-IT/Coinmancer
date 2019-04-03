// jshint esversion:6
// require node packages
const TransactionsController = require('express').Router();
const UserModel = require('../models/user');
const _ = require("lodash");

const view = "../app/views/";
// require and assign api module to constant
const api = require("../../modules/apis.js");
// call tickers function from api module key
api();

TransactionsController.get("/deposit", function(req, res) {
  if(req.isAuthenticated()){
    res.render(view + "transactions/deposit", {
      btcTicker: btc, 
      trxTicker: trx, 
      userLoggedIn: req.user
    });
  } else {
    res.redirect("/login");
  }
});

TransactionsController.get("/transactions", function(req, res) {
  if(req.isAuthenticated()){
    res.render(view + "transactions/index", {
      btcTicker: btc, 
      trxTicker: trx, 
      userLoggedIn: req.user
    });
  } else {
    res.redirect("/login");
  }
});

TransactionsController.post("/deposit", function(req, res) {
  if(req.isAuthenticated()){
    res.render(view + "transactions/deposit");
  } else {
    res.redirect("/login");
  }
  // if user has less than 2 deposit wallets asigned
  // create a deposit wallet and asign to user until user has 2 deposit wallets
  // if user has 2 deposit wallets
  // randomly choose 1 of the two asigned wallets and display for user to make deposit
  // user balance = wallet1 balance + wallet2 balance
});

module.exports = TransactionsController;
