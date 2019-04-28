// jshint esversion:6
// require node packages
const JobsController = require('express').Router();
const User = require('../models/user');
const Job = require('../models/job');
const Bid = require('../models/bid');
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
      // use promise values
      Promise.all([btcUsd, trxBtc]).then(function(data){
      // render views
        res.render(view + "jobs/index", {
          btcTicker: data[0].last.toFixed(4),
          trxTicker: ((data[0].last)*(data[1].last)).toFixed(4),
          showStart: jobCountIndex,
          showEnd: showEnd,
          total: jobs.length,
          jobs: jobs.slice(start, perPage),
          userLoggedIn: req.user,
          current: page,
          pages: totalpages, // match/ciel to prevent decimal values
          bids: bids
        });
      // catch errors if any
      }).catch(error => console.error('There was a problem', error));
    } else {
      // err 404
      res.send("page does not exist!");
    }
  });
});

// view all projects that I created or bidded on
JobsController.get("/projects", function(req, res) {
  if(req.isAuthenticated()){
    Job.find({}, function(err, users){
      if(err){
        res.send(err);
      } else {
        // use promise values
        Promise.all([btcUsd, trxBtc]).then(function(data){
        // render views
        res.render(view + "jobs/projects", {
          btcTicker: data[0].last.toFixed(4),
          trxTicker: ((data[0].last)*(data[1].last)).toFixed(4),
          jobs: userJobs,
          userLoggedIn: req.user
        });
        // catch errors if any
        }).catch(error => console.error('There was a problem', error));
      }
    });
  } else {
    res.redirect("/login");
  }
});

// view form to post job
JobsController.get("/post-job", function(req, res) {
  if(req.isAuthenticated()){
    // use promise values
    Promise.all([btcUsd, trxBtc]).then(function(data){
    // render views
      res.render(view + "jobs/create", {
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

// view specific job project
JobsController.get("/job/:id/:title", function(req, res) {
  // use async function to run find queries in parallel
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
    // use promise values
    Promise.all([btcUsd, trxBtc]).then(function(data){
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
        btcTicker: data[0].last.toFixed(4),
        trxTicker: ((data[0].last)*(data[1].last)).toFixed(4),
        userLoggedIn: req.user
      });
    // catch errors if any
    }).catch(error => console.error('There was a problem', error));
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
  if(req.body.title === "" || req.body.workType === "" || req.body.description === "" || req.body.budget === "" || endDate === "" || req.body.skills === "" || req.body.availability === ""){
    console.log("Missing fields found");
  } else {
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
      availability: req.body.availability,
      creator: req.user.id
    });
    job.save(function (err) {
      if(err){
        res.send(err);
      } else {
        // Find parent by provided id, push new document to child array, save and redirect
        User.findOneAndUpdate({_id: req.user.id}, {
          // use $push to add new items to array mongoose syntax "faster"
          $push: { jobs: job.id }
          }, function(err){
          if(err){
            res.send(err);
          } else {
            res.redirect("/jobs/1");
          }
        });
      }
    });
  }
});

// delete a job
JobsController.post("/delete-job", function(req, res) {
  // find parent by provided child id, delete specific child from array
  User.findOneAndUpdate({"jobs._id": req.body.jobId}, {
    $pull: { jobs: { _id: req.body.jobId } }
  }, {new: true}, function(err, job){
    if(err){
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

module.exports = JobsController;
