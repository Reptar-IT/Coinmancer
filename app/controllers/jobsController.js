// jshint esversion:6
// require node packages
const JobsController = require('express').Router();
const User = require('../models/user');
const Job = require('../models/job');
const Bid = require('../models/bid');
const Milestone = require('../models/milestone');
const _ = require("lodash");
const async = require("async");

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

// view all curent jobs
JobsController.get("/jobs/:page", function(req, res) {
  let page = req.params.page || 1, pageLimit = 40, perPage = pageLimit * page, start = perPage - pageLimit, showEnd = perPage;

  async.parallel([
    function(callback) {
      Job.find({}, function(err, job){
        if(err){
          callback(err);
        } else {
          callback(null, job);
        }
      });
    },
    function(callback) {
      Bid.find({}, function(err, bids){
        if(err){
          callback(err);
        } else {
          callback(null, bids);
        }
      });
    }
  ],
  // optional async callback
  function(err, results) {
    if (err) {
      res.send(err);
      return res.sendStatus(400);
    }

    if (results == null || results[0] == null) {
      return res.sendStatus(400);
    }
    //results contains [array1, array2, array3]
    let jobs = results[0];
    let bids = results[1];
    let totalpages = Math.ceil(jobs.length / pageLimit);
    let jobCountIndex = start + 1;
    if(jobs.length === 0){
      jobCountIndex = 0;
    }
    if(jobs.length < perPage){
      showEnd = jobs.length;
    }
    if(page <= totalpages || page == 1){ // throw err if page nonexistent
      if(req.isAuthenticated()){
        // use promise values
        Promise.all([cgTicker]).then(function(data){
          tronWeb.trx.getBalance(req.user.username).then(balance => {
            let userBalance = (balance / 1000000);
            // render views
            res.render(view + "jobs/index", {
              btcTicker: data[0].bitcoin.usd.toFixed(4), 
              trxTicker: data[0].tron.usd.toFixed(4),
              showStart: jobCountIndex,
              showEnd: showEnd,
              total: jobs.length,
              jobs: jobs.slice(start, perPage),
              userLoggedIn: req.user,
              userLoggedInBalance: userBalance,
              current: page,
              pages: totalpages, // match/ciel to prevent decimal values
              bids: bids
            });
          }).catch(err => console.error('Problem with getting balance', err));
        }).catch(error => console.error('There was a problem', error));
      } else {
        Promise.all([cgTicker]).then(function(data){
          // render views
          res.render(view + "jobs/index", {
            btcTicker: data[0].bitcoin.usd.toFixed(4), 
            trxTicker: data[0].tron.usd.toFixed(4),
            showStart: jobCountIndex,
            showEnd: showEnd,
            total: jobs.length,
            jobs: jobs.slice(start, perPage),
            userLoggedIn: req.user,
            current: page,
            pages: totalpages, // match/ciel to prevent decimal values
            bids: bids
          });
        }).catch(error => console.error('There was a problem', error));
      }
    } else {
      // err 404
      res.send("page does not exist!");
    }
  });
});

// view all projects that I created or bidded on
JobsController.get("/projects", function(req, res) {
    Job.find({}, function(err, users){
      if(err){
        res.send(err);
      } else {
        if(req.isAuthenticated()){
        Promise.all([cgTicker]).then(function(data){
          tronWeb.trx.getBalance(req.user.username).then(balance => {
            let userBalance = (balance / 1000000);
            res.render(view + "jobs/projects", {
              btcTicker: data[0].bitcoin.usd.toFixed(4), 
              trxTicker: data[0].tron.usd.toFixed(4),
              jobs: userJobs,
              userLoggedIn: req.user,
              userLoggedInBalance: userBalance
            });
          }).catch(err => console.error('Problem with getting balance', err));
          }).catch(error => console.error('There was a problem', error));
        } else {
          Promise.all([cgTicker]).then(function(data){
            res.render(view + "jobs/projects", {
              btcTicker: data[0].bitcoin.usd.toFixed(4), 
              trxTicker: data[0].tron.usd.toFixed(4),
              jobs: userJobs,
              userLoggedIn: req.user
            });
            }).catch(error => console.error('There was a problem', error));
        }
    }
  });
});

// view form to post job
JobsController.get("/post-job", function(req, res) {
  if(req.isAuthenticated()){
      Promise.all([cgTicker]).then(function(data){
        tronWeb.trx.getBalance(req.user.username).then(balance => {
          let userBalance = (balance / 1000000);
          res.render(view + "jobs/projects", {
            btcTicker: data[0].bitcoin.usd.toFixed(4), 
            trxTicker: data[0].tron.usd.toFixed(4),
            userLoggedIn: req.user,
            userLoggedInBalance: userBalance
          });
        }).catch(err => console.error('Problem with getting balance', err));
      }).catch(error => console.error('There was a problem', error));
    } else {
      Promise.all([cgTicker]).then(function(data){
        res.render(view + "jobs/create", {
          btcTicker: data[0].bitcoin.usd.toFixed(4), 
          trxTicker: data[0].tron.usd.toFixed(4),
          userLoggedIn: req.user
        });
      }).catch(error => console.error('There was a problem', error));
    }
});

// view specific job project
JobsController.get("/job/:id/:title", function(req, res) {
  async.parallel([
    function(callback) {
      Job.findOne({_id: req.params.id}, function(err, jobs){
        if(err){
          callback(err);
        } else {
          callback(null, jobs);
        }
      });
    },
    function(callback) {
      Bid.find({job: req.params.id}, function(err, bids){
        if(err){
          callback(err);
        } else {
          callback(null, bids);
        }
      });
    },
    function(callback) {
      Milestone.find({job: req.params.id}, function(err, milestones){
        if(err){
          callback(err);
        } else {
          callback(null, milestones);
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
    let milestones = results[2];

    if(req.isAuthenticated()){
        Promise.all([cgTicker]).then(function(data){
          tronWeb.trx.getBalance(req.user.username).then(balance => {
            let userBalance = (balance / 1000000);
            res.render(view + "jobs/projects", {
              creator: job.creator,
              id: job._id,
              title: job.title,
              body: job.description,
              budget: job.budget,
              workType: job.workType,
              skills: job.skills,
              bids: bids,
              awardee: job.awardee,
              status: job.status,
              milestones: milestones,
              expires: job.end,
              btcTicker: data[0].bitcoin.usd.toFixed(4), 
              trxTicker: data[0].tron.usd.toFixed(4),
              userLoggedIn: req.user,
              userLoggedInBalance: userBalance
            });
          }).catch(err => console.error('Problem with getting balance', err));
        }).catch(error => console.error('There was a problem', error));
      } else {
        Promise.all([cgTicker]).then(function(data){
          // render views
          res.render(view + "jobs/show", {
            creator: job.creator,
            id: job._id,
            title: job.title,
            body: job.description,
            budget: job.budget,
            workType: job.workType,
            skills: job.skills,
            bids: bids,
            awardee: job.awardee,
            status: job.status,
            milestones: milestones,
            expires: job.end,
            btcTicker: data[0].bitcoin.usd.toFixed(4), 
            trxTicker: data[0].tron.usd.toFixed(4),
            userLoggedIn: req.user
          });
        }).catch(error => console.error('There was a problem', error));
      }
  });
});

// create and save job
JobsController.post("/post-job", function(req, res) {
  let endDate;
  if(req.body.expiresAt === "") {
    endDate = req.body.expiresAt;
  } else {
    // add days
    Date.prototype.addDays = function(days) {
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };
    let today = new Date();
    endDate = today.addDays(Number(req.body.expiresAt));
  }
  // custom validation if any fields are empty return with err messages
  if(req.body.title === "" || req.body.workType === "" || req.body.description === "" || req.body.budget === "" || endDate === "" || req.body.skills === "" || req.body.userId === ""){
    console.log("Missing fields found");
    res.send("Missing fields found");
  } else {
    if(tronWeb.isAddress(req.body.userId)){
      // convert skill selction to array
      let selectedSkills = (req.body.skills).split(',');
      selectedSkills.pop();
      const job = new Job({
        workType: req.body.workType,
        title: _.capitalize(req.body.title),
        description: req.body.description,
        budget: req.body.budget,
        end: endDate,
        skills: selectedSkills,
        creator: req.body.userId //userwallet
      });
      job.save(function (err) {
        if(err){
          res.send(err);
        } else {
          res.redirect("/jobs/1");
        }
      });
    } else {
      console.log("Invalid Tron address");
      res.send("Invalid Tron address");
    }
  }
});

// delete a job
JobsController.post("/delete-job", function(req, res) {
  // find parent by provided child id, delete specific child from array
  if(req.body.userId === ""){
    console.log("Missing Tron Account");
    res.send("Missing Tron Account");
  } else {
    if(tronWeb.isAddress(req.body.userId)){
      //find job where creator equal to userId & _id equal jobId
      Job.findOneAndDelete({creator: req.body.userId, _id: req.body.jobId}, function(err, job){
        if(err){
          console.log(err);
        } else {
          res.redirect("/");
        }
      });
    }
  }
});

module.exports = JobsController;
