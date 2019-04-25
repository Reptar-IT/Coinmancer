// jshint esversion:6
// require node packages
const MilestonesController = require('express').Router();
const User = require('../models/user');
const Job = require('../models/job');
const Milestone = require('../models/milestone');
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

// create a milestone
MilestonesController.post("/create-milestone/:id/:title", function(req, res) {
  // find parent by provided child id, update specific field in specific child array
  const milestone = new Milestone({
    amount: req.body.amount,
    description: req.body.description,
    creator: req.user.id,
    recipient: req.body.bidderId,
    job: req.params.id
  });
  milestone.save(function (err) {
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

// update a milestone
MilestonesController.post("/update-milestone/:id/:title", function(req, res) {
  // find parent by provided child id, update specific field in specific child array using positional identifiers to filter
  Milestone.findOneAndUpdate({_id: req.body.milestoneId},
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

// delete a milestone
MilestonesController.post("/delete-milestone/:id/:title", function(req, res) {
  async.parallel([
    function(callback) {
      Job.findOneAndUpdate({_id: req.params.id}, {
        $pull: { milestones: req.body.milestoneId }
      }, function(err, jobs){
        if(err){
          callback(err);
        } else {
          callback(null, jobs);
        }
      });
    },
    function(callback) {
      Milestone.deleteOne({_id: req.body.milestoneId}, function(err, bid){
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

// update user balances and update milestone status
MilestonesController.post("/release-milestone/:id/:title", function(req, res){
  async.parallel([
    function(callback) {
      // substract from employer balance
      User.findOneAndUpdate({_id: req.params.id}, {
        $set: {
          balance: "newbalance"
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
      // add to employee balance
      User.findOneAndUpdate({_id: req.body.bidderId}, {
        $set: {
          balance: "newbalance"
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
      Milestone.findOneAndUpdate({_id: req.body.milestoneId}, {
        $set: { status: "released" }
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
    let employer = results[0];
    let employee = results[1];
    let bids = results[2];
    res.redirect("/job/" + req.params.id + "/" + req.params.title);
  });
});

module.exports = MilestonesController;
