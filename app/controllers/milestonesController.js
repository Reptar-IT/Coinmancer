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

//update user balances and create a milestone
MilestonesController.post("/create-milestone/:id/:title", function(req, res) {
  let btcAmount = (req.body.usdValue/req.body.exchangeRate).toFixed(8);
  async.waterfall([
    function(callback) {
      // Find employer balance
      User.find({_id: req.user.id}, function(err, user){
        if(err){
          callback(err);
        } else {
          callback(null, user.balance, user.escrowed);
        }
      });
    },
    function(currentBalance, escrowedBalance, callback) {
      // substract from employer balance
      let newBalance = currentBalance;
      if(currentBalance >= btcAmount) {
        newBalance = (currentBalance - btcAmount).toFixed(8);
        escrowedBalance = (escrowedBalance + btcAmount).toFixed(8);
      } else {
        callback("insuffient funds");
      }
      User.findOneAndUpdate({_id: req.user.id}, {
        $set: {
          balance: newBalance,
          escrowed: escrowedBalance
        }
      }, function(err, user){
        if(err){
          callback(err);
        } else {
          callback(null, "Employer balance updated");
        }
      });
    }
  ],
  // optional async callback
  function(err, results) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    // find parent by provided child id, update specific field in specific child array
    const milestone = new Milestone({
      amount: btcAmount,
      usdValue: req.body.usdValue,
      exchangeRate: req.body.exchangeRate,
      currency: req.body.currency,
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
          $push: { milestones: milestone }
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
});


// update user balances and update milestone status
MilestonesController.post("/release-milestone/:id/:title", function(req, res){
  async.parallel([
    function(paracallback) {
      async.waterfall([
        function(callback) {
          // Find employer balance
          User.find({_id: req.body.creatorId}, function(err, user){
            if(err){
              callback(err);
            } else {
              callback(null, user.escrowed, user.expenditures);
            }
          });
        },
        function(escrowedBalance, expenditures, callback) {
          // substract from employer balance
          let newBalance = escrowedBalance;
          if(escrowedBalance >= req.body.rewardAmount) {
            newBalance = (escrowedBalance - req.body.rewardAmount).toFixed(8);
            expenditures = (expenditures + req.body.rewardAmount).toFixed(8);
          } else {
            callback("insuffient funds");
          }
          User.findOneAndUpdate({_id: req.body.creatorId}, {
            $set: {
              escrowed: newBalance,
              expenditures: expenditures
            }
          }, function(err, user){
            if(err){
              callback(err);
            } else {
              callback(null, "Employer balance updated");
            }
          });
        }
      ],
      function (err, result) {
        paracallback(null, result);
      });
    },
    function(paracallback) {
      async.waterfall([
        function(callback) {
          // Find employee balance
          User.find({_id: req.body.awardeeId}, function(err, user){
            if(err){
              callback(err);
            } else {
              callback(null, user.balance, user.earnings);
            }
          });
        },
        function(currentBalance, earnings, callback) {
          // add to employer balance
          let newBalance = (currentBalance + req.body.rewardAmount).toFixed(8);
          earnings = (earnings + req.body.rewardAmount).toFixed(8);
          User.findOneAndUpdate({_id: req.body.awardeeId}, {
            $set: {
              balance: newBalance,
              earnings: earnings
            }
          }, function(err, user){
            if(err){
              callback(err);
            } else {
              callback(null, "Employee balance updated");
            }
          });
        }
      ],
      function (err, result) {
        paracallback(null, result);
      });
    },
    function(paracallback) {
      // change milestone status
      Milestone.findOneAndUpdate({_id: req.body.milestoneId}, {
        $set: { status: true }
      }, function(err, milestone){
        if(err){
          paracallback(err);
        } else {
          paracallback(null, "Milestone released");
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
    res.redirect("/job/" + req.params.id + "/" + req.params.title);
  });
});


// delete a milestone
MilestonesController.post("/delete-milestone/:id/:title", function(req, res) {
  async.parallel([
    function(paracallback) {
      async.waterfall([
        function(callback) {
          // Find employer balance
          User.find({_id: req.user.id}, function(err, user){
            if(err){
              callback(err);
            } else {
              callback(null, user.escrowed, user.balance);
            }
          });
        },
        function(escrowedBalance, currentBalance, callback) {
          // substract from employer balance
          let newBalance = (escrowedBalance - req.body.rewardAmount).toFixed(8);
          currentBalance = (currentBalance + req.body.rewardAmount).toFixed(8);

          User.findOneAndUpdate({_id: req.user.id}, {
            $set: {
              escrowed: newBalance,
              balance: expenditures
            }
          }, function(err, user){
            if(err){
              callback(err);
            } else {
              callback(null, "Employer balance updated");
            }
          });
        }
      ],
      function (err, result) {
        paracallback(null, result);
      });
    },
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
    res.redirect("/job/" + req.params.id + "/" + req.params.title);
  });
});

module.exports = MilestonesController;
