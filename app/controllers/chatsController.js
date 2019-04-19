// jshint esversion:6
// require node packages
const ChatsController = require('express').Router();
const User = require('../models/user');
const _ = require("lodash");

// set views path to constant
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

ChatsController.get("/messages", function(req, res) {
  if(req.isAuthenticated()){
    // use promise values
    Promise.all([btcUsd, trxBtc]).then(function(data){
      res.render(view + "chats/chats", {
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

ChatsController.post("/messages", function(req, res) {
  // use promise values
  Promise.all([btcUsd, trxBtc]).then(function(data){
    res.render(view + "chats/chats");
  // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});



module.exports = ChatsController;
