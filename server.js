// requirements
const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const routes = require("./controllers/fetch.js");
// mongoose for mongoDB
const mongoose = require("mongoose");
// server PORT
const PORT = process.env.PORT || 3000;
// start express
const app = express();

// configure handlebars template
app.engine("handlebars", exphbs({
 // helpers: require('./views/helpers/handlebars.js'),
 defaultLayout: "main" }));
app.set("view engine", "handlebars");
// URL parser
app.use(bodyParser.urlencoded({ extended: false }));
// json parser
app.use(bodyParser.json());
// serve static content from the "public" directory
app.use(express.static("public"));
// Give the server access to routes
app.use(routes);

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// =============================================================
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

module.exports = app;  // for testing
