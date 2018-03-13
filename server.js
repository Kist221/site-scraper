// requirements
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var routes = require("./controllers/app_controllers.js");
// server PORT
var PORT = process.env.PORT || 3000;
// Requiring our models for syncing
var db = require("./models");
// start express
var app = express();

// configure handlebars template
app.engine("handlebars", exphbs({
 helpers: require('./views/helpers/handlebars.js'),
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

// Syncing our sequelize models and then starting our Express app
// =============================================================
// Add {force: true} inside of sync to resolve DB/model changes
db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});

module.exports = app;  // for testing
