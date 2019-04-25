// jshint esversion:6
// require node packages
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

//set app to use express package
const app = express();
//let app use body-parser package
app.use(bodyParser.urlencoded({extended:true}));
// let app set ejs as the view engine
app.set("view engine", "ejs");
// let app use express to create a static folder
app.use(express.static(__dirname + "/public"));

// set up sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Connect to mongodb cloud server using mongoose
mongoose.connect(process.env.DB_HOST + "://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@cluster0-dvn5y.mongodb.net/" + process.env.DB_NAME + "?retryWrites=true/" , { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);

//--------------- SESSIONS CONTROLLER -----------------------//
const sessionController = require(__dirname + "/app/controllers/sessionsController");
app.use(sessionController);

//--------------- PAGES CONTROLLER -----------------------//
const pagesController = require(__dirname + "/app/controllers/pagesController");
app.use(pagesController);

//------------------ JOBS CONTROLLER ------------------//
const jobsController = require(__dirname + "/app/controllers/jobsController");
app.use(jobsController);

//------------------ BIDS CONTROLLER ------------------//
const bidsController = require(__dirname + "/app/controllers/bidsController");
app.use(bidsController);

//------------------ MILESTONES CONTROLLER ------------------//
const milestonesController = require(__dirname + "/app/controllers/milestonesController");
app.use(milestonesController);

//--------------- PROFILES CONTROLLER -----------------------//
const profilesController = require(__dirname + "/app/controllers/profilesController");
app.use(profilesController);

//--------------- CHATS CONTROLLER ------------------//
const chatsController = require(__dirname + "/app/controllers/chatsController");
app.use(chatsController);

//------------------ TRANSACTIONS CONTROLLER -------------------//
const transactionsController = require(__dirname + "/app/controllers/transactionsController");
app.use(transactionsController);

//------------------ NEWS CONTROLLER --------------------------//
const newsController = require(__dirname + "/app/controllers/newsController");
app.use(newsController);

//-------------- NEWSLETTER CONTROLLER -----------------------------//
const newslettersController = require(__dirname + "/app/controllers/newslettersController");
app.use(newslettersController);

//------------------- START SERVER ----------------//
app.listen(process.env.PORT || 3030, function(){
  console.log("Docked at port 3030");
});
