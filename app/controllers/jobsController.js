// jshint esversion:6
// require node packages
const JobsController = require('express').Router();
const UserModel = require('../models/user');
const _ = require("lodash");
const async = require("async");

// set views path to constant
const view = "../app/views/";
// require and assign api module to constant
const api = require("../../modules/apis.js");
// call tickers function from api module key
api();

// view all curent jobs
JobsController.get("/jobs/:page", function(req, res) {
  let page = req.params.page || 1, pageLimit = 40, perPage = pageLimit * page, start = perPage - pageLimit, showEnd = perPage;
  UserModel.find({"jobs": {$ne:null}}, function(err, usersWithJob) {
    if(err){
      res.send(err);
    } else {
      // catch all jobs
      let allJobs = [];
      usersWithJob.forEach(function(employer){
        allJobs.push(employer.jobs);
      }); // push to job array
      let jobs = _.flatten(allJobs); // lodash flatten array one level
      let totalpages = Math.ceil(jobs.length / pageLimit);
      if(jobs.length < perPage){
        showEnd = jobs.length;
      }
      if(page <= totalpages || page == 1){ // throw err if page nonexistent
        res.render(view + "jobs/index", {
          btcTicker: btc,
          trxTicker: trx,
          showStart: start + 1,
          showEnd: showEnd,
          total: jobs.length,
          jobs: jobs.slice(start, perPage),
          userLoggedIn: req.user,
          current: page,
          pages: totalpages // match/ciel to prevent decimal values
        });
      } else {
        // err 404
        res.send("page does not exist!");
      }
    }
  });
});

// view all projects that I created or bidded on
JobsController.get("/projects", function(req, res) {
  if(req.isAuthenticated()){
    UserModel.find({"jobs.bids.$": {$ne:null}}, function(err, users){
      if(err){
        res.send(err);
      } else {
        // res.render(view + "jobs/projects", {
        //   btcTicker: btc,
        //   trxTicker: trx,
        //   usersWithBids: users,
        //   userLoggedIn: req.user
        // });
      }
    });
  } else {
    res.redirect("/login");
  }
});

// view form to post job
JobsController.get("/post-job", function(req, res) {
  if(req.isAuthenticated()){
    res.render(view + "jobs/create", {
      btcTicker: btc,
      trxTicker: trx,
      userLoggedIn: req.user}
    );
  } else {
    res.redirect("/login");
  }
});

// view specific job project
JobsController.get("/job/:id/:title", function(req, res) {
  UserModel.find({}, function(err, users){
    if (err) {
      res.send(err);
    } else {
      // catch all jobs from users
      let allJobs = [];
      users.forEach(function(employer){
        allJobs.push(employer.jobs);
      }); // push to job array
      // catch the job that matches the job Id that was passed
      let thisJob = [];
      _.flatten(allJobs).forEach(function(job){
        if( _.lowerCase(req.params.id) === _.lowerCase(job.id)){
          thisJob.push(job);
        }
      }); // push to job array
      let job = _.flatten(thisJob); // lodash flatten array one level
      job.find(function(job){
        res.render(view + "jobs/show", {
          employer: users,
          id: job._id,
          title: job.title,
          body: job.description,
          budget: job.budget,
          workType: job.workType,
          skills: job.skills,
          bids: job.bids,
          status: job.award_status,
          expires: job.end,
          btcTicker: btc,
          trxTicker: trx,
          userLoggedIn: req.user
        });
      });
    }
  });
});

// create andsave job
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
    // Find parent by provided id, push new document to child array, save and redirect
    UserModel.findOneAndUpdate({_id: req.user.id}, {
      // use $push to add new items to array mongoose syntax "faster"
      $push: {
          jobs: {
            workType: req.body.workType,
            title: _.capitalize(req.body.title),
            description: req.body.description,
            budget: req.body.budget,
            end: endDate,
            skills: selectedSkills,
            availability: req.body.availability
          }
        }
      }, function(err){
      if(err){
        res.send(err);
      } else {
        res.redirect("/jobs");
      }
    });
  }
});

// delete a job
JobsController.post("/delete-job", function(req, res) {
  // find parent by provided child id, delete specific child from array
  UserModel.findOneAndUpdate({"jobs._id": req.body.jobId}, {
    $pull: { jobs: { _id: req.body.jobId } }
  }, {new: true}, function(err, job){
    if(err){
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

// create a bid
JobsController.post("/create-bid/:id/:title", function(req, res) {
  // find parent by provided child id, update specific field in specific child array
  UserModel.findOneAndUpdate({"jobs._id": req.params.id}, {
    // use $set to do modification
    $push: {
      "jobs.$.bids": {
        body: req.body.body,
        amount: req.body.amount,
        bidder: req.user.id,
        award_status: "awaiting"
      }
    }
  }, {new: true}, function(err, bid){
    if(err){
      res.send(err);
    } else {
      res.redirect("/job/" + req.params.id + "/" + req.params.title );
    }
  });
});

// update a bid
JobsController.post("/update-bid/:id/:title", function(req, res) {
  // find parent by provided child id, update specific field in specific child array using positional identifiers to filter
  UserModel.findOneAndUpdate({"jobs.bids._id": req.body.bId},
    { $set: {
      "jobs.$[job].bids.$[bid].body": req.body.body,
      "jobs.$[job].bids.$[bid].amount": req.body.amount,
      }
    },
    { arrayFilters : [ { "job._id": req.params.id }, {"bid._id" : req.body.bId} ],
     multi : true },
    function(err, bid){
    if(err){
      res.send(err);
    } else {
      res.redirect("/job/" + req.params.id + "/" + req.params.title );
    }
  });
});

// delete a bid
JobsController.post("/delete-bid/:id/:title", function(req, res) {
  // find parent by provided child id, delete specific child from array
  //console.log(req.body.bId);
  UserModel.findOneAndUpdate({"jobs.bids._id": req.body.bId}, {
    $pull: { "jobs.$.bids": { _id: req.body.bId } }
  }, {new: true}, function(err, bid){
    if(err){
      console.log(err);
    } else {
      res.redirect("/job/" + req.params.id + "/" + req.params.title);
    }
  });
});

// award bidder and update job Status
JobsController.post("/accept-bid/:id/:title", function(req, res){
  // find parent by provided child id, update specific field in specific child array using positional identifiers to filter
  UserModel.findOneAndUpdate({"jobs._id": req.params.id},
    { $set: {
      "jobs.$[job].bids.$[bid].award_status": "accepted",
      "jobs.$[job].award_status": "awarded" }
    },
    { arrayFilters : [ { "job._id": req.params.id }, {"bid._id" : req.body.bId} ],
     multi : true },
    function(err, bid){
    if(err){
      res.send(err);
    } else {
      res.redirect("/job/" + req.params.id + "/" + req.params.title );
    }
  });

});

module.exports = JobsController;
