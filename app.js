// jshint esversion:6
// require node packages
'use strict';
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
//heroku use Node@10.15.3 incompatible with above mongoose@5.8.5 
const mongoose = require("mongoose"); 
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
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//------------------- DEFINE Database ----------------//

let db_uri;

if(process.env.MONGODB_URI != null){
  db_uri = process.env.MONGODB_URI;
} else {
  db_uri = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@cluster0.6nxdu.mongodb.net/" + process.env.DB_APP_NAME + "?retryWrites=true&w=majority";
}

// Connect to mongodb cloud server using mongoose
mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("Connection Successful"))
.catch(err => console.log("Mongoose connection error: " + err));


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

//------------------- DEFINE PORT ----------------//

let port;

if(process.env.PORT != null){
  port = process.env.PORT;
} else {
  port = 3030;
}
//------------------- START SERVER ----------------//

app.listen(port, function(){
  console.log("Database_URL", db_uri);
  console.log("Server is now docked at port " + port);
});
