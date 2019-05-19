// jshint esversion:6
// require node packages
const TransactionsController = require('express').Router();
const User = require('../models/user');
const _ = require("lodash");

const view = "../app/views/";

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
TransactionsController.get("/deposit", function(req, res) {
  if(req.isAuthenticated()){
    // use promise values
    Promise.all([btcUsd, trxBtc]).then(function(data){
      res.render(view + "transactions/deposit", {
        btcTicker: data[0].last.toFixed(4),
        trxTicker: ((data[0].last)*(data[1].last)).toFixed(4),
        userLoggedIn: req.user
      });
    // catch errors if any
    }).catch(error => console.error('There was a problem', error));
  } else {
    res.redirect("/login");
  }
});

TransactionsController.get("/depositpage", function(req, res) {
  if(req.isAuthenticated()){
    // use promise values
    Promise.all([btcUsd, trxBtc]).then(function(data){
      res.render(view + "transactions/depositpage", {
        btcTicker: data[0].last.toFixed(4),
        trxTicker: ((data[0].last)*(data[1].last)).toFixed(4),
        userLoggedIn: req.user
      });
    // catch errors if any
    }).catch(error => console.error('There was a problem', error));
  } else {
    res.redirect("/login");
  }
});

TransactionsController.get("/transactions", function(req, res) {
  if(req.isAuthenticated()){
    // use promise values
    Promise.all([btcUsd, trxBtc]).then(function(data){
      res.render(view + "transactions/index", {
        btcTicker: data[0].last.toFixed(4),
        trxTicker: ((data[0].last)*(data[1].last)).toFixed(4),
        userLoggedIn: req.user
      });
    // catch errors if any
    }).catch(error => console.error('There was a problem', error));
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
