// jshint esversion:6
// require node packages
const BidsController = require('express').Router();
const User = require('../models/user');
const Job = require('../models/job');
const Bid = require('../models/bid');
const _ = require("lodash");
const async = require("async");

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

// create a bid
BidsController.post("/create-bid/:id/:title", function(req, res) {
  // find parent by provided child id, update specific field in specific child array
  const bid = new Bid({
    amount: req.body.amount,
    description: req.body.description,
    creator: req.user.id,
    job: req.params.id
  });
  bid.save(function (err) {
    if(err){
      res.send(err);
    } else {
      // Find parent by provided id, push new document to child array, save and redirect
      Job.findOneAndUpdate({_id: req.params.id}, {
        // use $push to add new items to array mongoose syntax "faster"
        $push: { bids: bid }
        }, function(err){
        if(err){
          res.send(err);
        } else {
          res.redirect("/job/" + req.params.id + "/" + req.params.title );
        }
      });
    }
  });
});

// update a bid
BidsController.post("/update-bid/:id/:title", function(req, res) {
  // find parent by provided child id, update specific field in specific child array using positional identifiers to filter
  Bid.findOneAndUpdate({_id: req.body.bId},
    { $set: {
      "description": req.body.description,
      "amount": req.body.amount,
      }
    }, function(err, bid){
    if(err){
      res.send(err);
    } else {
      res.redirect("/job/" + req.params.id + "/" + req.params.title );
    }
  });
});

// delete a bid
BidsController.post("/delete-bid/:id/:title", function(req, res) {
  async.parallel([
    function(callback) {
      Job.findOneAndUpdate({_id: req.params.id}, {
        $pull: { bids: req.body.bId }
      }, function(err, jobs){
        if(err){
          callback(err);
        } else {
          callback(null, jobs);
        }
      });
    },
    function(callback) {
      Bid.deleteOne({_id: req.body.bId}, function(err, bid){
        if(err){
          callback(err);
        } else {
          callback(null, bid);
        }
      });
    }
  ],
  // optional async callback
  function(err, results) {
    if (err) {
      console.log(err);
      return res.sendStatus(400);
    }

    if (results == null || results[0] == null) {
      return res.sendStatus(400);
    }
    //results contains [array1, array2, array3]
    let job = results[0];
    let bids = results[1];
    res.redirect("/job/" + req.params.id + "/" + req.params.title);
  });
});

// award bidder and update job Status
BidsController.post("/accept-bid/:id/:title", function(req, res){
  async.parallel([
    function(callback) {
      Job.findOneAndUpdate({_id: req.params.id}, {
        $set: {
          status: "accepted",
          awardee: req.body.awardee,
        }
      }, function(err, jobs){
        if(err){
          callback(err);
        } else {
          callback(null, jobs);
        }
      });
    },
    function(callback) {
      Bid.findOneAndUpdate({_id: req.body.bId}, {
        $set: { status: "awarded" }
      }, function(err, bid){
        if(err){
          callback(err);
        } else {
          callback(null, bid);
        }
      });
    }
  ],
  // optional async callback
  function(err, results) {
    if (err) {
      console.log(err);
      return res.sendStatus(400);
    }

    if (results == null || results[0] == null) {
      return res.sendStatus(400);
    }
    //results contains [array1, array2, array3]
    let job = results[0];
    let bids = results[1];
    res.redirect("/job/" + req.params.id + "/" + req.params.title);
  });
});

module.exports = BidsController;
