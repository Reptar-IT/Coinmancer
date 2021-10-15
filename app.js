// jshint esversion:6
// require node packages
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const https = require("https");
//const mongoose = require("mongoose");
const app = express();
//let app use express json parser 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// let app set ejs as the view engine
app.set("view engine", "ejs");
// let app use express to create a static folder
app.use(express.static(__dirname + "/public"));

//set up sessions
app.use(session({
  secret: "Secret123",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/*
// Connect to mongodb cloud server using mongoose
mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@cluster0.6nxdu.mongodb.net/" + process.env.DB_APP_NAME + "?retryWrites=true&w=majority" , { useNewUrlParser: true, useUnifiedTopology: true });

*/


/*
//--------------- USERS CONTROLLER -----------------------//
const usersController = require(__dirname + "/app/controllers/usersController");
app.use(usersController);

//--------------- PAGES CONTROLLER -----------------------//
const pagesController = require(__dirname + "/app/controllers/pagesController");
app.use(pagesController);

//------------------ JOBS CONTROLLER ------------------//
const jobsController = require(__dirname + "/app/controllers/jobsController");
app.use(jobsController);

/*

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

*/

//------------------- START SERVER ----------------//

let port;

if(process.env.PORT != null){
  port = process.env.PORT;
} else {
  port = 3030;
}

app.listen(port, function(){
  // set views path to constant
  const view = "../app/views/";
  app.get("/", function(req, res) {
    res.send("server is now docked at port " + port);
  });
  console.log("Docked at port " + port);
});
