// jshint esversion:6
// require node packages
const PagesController = require('express').Router();
const _ = require("lodash");

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

// API Providers
let cgTicker = fetchJSON("https://api.coingecko.com/api/v3/simple/price?ids=tron%2Cbitcoin&vs_currencies=usd");


// call tickers function
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

/* Check user auth status, provide promised ticker values from cgticker API, provide promised balance from tronweb API then render views with object containing defined promised data.
*/
PagesController.get("/", function(req, res){
  if(req.isAuthenticated()){
    Promise.all([cgTicker]).then(function(data){
      tronWeb.trx.getBalance(req.user.username).then(balance => {
        let userBalance = (balance / 1000000);
        res.render(view + "profiles/index", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user, userLoggedInBalance: userBalance});
      }).catch(err => console.error('Problem with getting balance', err));  
    }).catch(error => console.error('Problem with ticker', error));
  } else {
    Promise.all([cgTicker]).then(function(data){
      res.render(view + "pages/index", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user}); 
   }).catch(error => console.error('There was a problem', error));
 } 
});

PagesController.get("/about", function(req, res) {
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/about", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/contact", function(req, res) {
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/contact", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/copyright", function(req, res) {
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/copyright", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/faq", function(req, res) {
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/faq", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/privacy", function(req, res) {
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/privacy", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/services", function(req, res) {
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/services", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
  }).catch(error => console.error('There was a problem', error));
});

PagesController.get("/terms", function(req, res) {
  Promise.all([cgTicker]).then(function(data){
    res.render(view + "pages/terms", {btcTicker: data[0].bitcoin.usd.toFixed(4), trxTicker: data[0].tron.usd.toFixed(4), userLoggedIn: req.user});
  }).catch(error => console.error('There was a problem', error));
});

module.exports = PagesController;
