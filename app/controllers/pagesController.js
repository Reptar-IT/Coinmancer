// jshint esversion:6
// require node packages
const PagesController = require('express').Router();
const _ = require("lodash");

// set views path to constant
const view = "../app/views/";

// API Providers
let cgTicker = fetchJSON("https://api.coingecko.com/api/v3/simple/price?ids=tron%2Cbitcoin&vs_currencies=usd");


// call tickers function from api module key
function fetchJSON(url) {
  return new Promise(function(resolve) {
    const https = require("https");
    // request url
    https.get(url, function(response) {
      // parse url to json
      response.on("data", function(data){
        resolve(JSON.parse(data));
      });
    });
  }).catch(error => console.error('There was a problem with function fetchJSON Reco', error));
}

// render views
PagesController.get("/", function(req, res){
  if(req.isAuthenticated()){
    // use promise values
    Promise.all([cgTicker]).then(function(data){
      res.render(view + "profiles/index", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
      // catch errors if any
    }).catch(error => console.error('There was a problem', error));
  } else { 
    // use promise values
    Promise.all([cgTicker]).then(function(data){
      res.render(view + "pages/index", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
      // catch errors if any
   }).catch(error => console.error('There was a problem', error));
 } 
});

PagesController.get("/about", function(req, res) {
  // use promise values
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/about", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/contact", function(req, res) {
  // use promise values
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/contact", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/copyright", function(req, res) {
  // use promise values
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/copyright", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/faq", function(req, res) {
  // use promise values
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/faq", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/privacy", function(req, res) {
  // use promise values
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/privacy", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/services", function(req, res) {
  // use promise values
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/services", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/terms", function(req, res) {
  // use promise values
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/terms", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
    // catch errors if any
  }).catch(error => console.error('There was a problem', error));
});


module.exports = PagesController;
