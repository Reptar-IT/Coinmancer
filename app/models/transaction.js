// jshint esversion:6
// require node packages
const TransactionsController = require('express').Router();
const User = require('../models/user');
const Job = require('../models/job');
const Bid = require('../models/bid');
const _ = require("lodash");
const async = require("async");
const mongoose = require("mongoose");

const timestamps = {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }};
const Schema = mongoose.Schema;

// Create schemas
const transactionSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User"}, transactionHash: String, amount: Number, toAddress: String, fromAddress: String, transactionType: {type: String, default: "deposit"}}, timestamps
);

// Create model
const Transaction = new mongoose.model("Transaction", transactionSchema);

// create milestone
TransactionsController.post("/create-milestone/:id/:title", function(req, res){
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

TransactionsController.post("/release-milestone/:id/:title", function(req, res){
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

module.exports = TransactionsController;
