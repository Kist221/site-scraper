// Require dependencies
const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const router = express.Router();
// Requiring our models
const db = require("../models");

// Create all our routes and set up logic within those routes where required.

// home route
router.get("/", function(req, res) {
	db.Headline.find({})
		.then(function(headlines) {
			console.log(headlines);
			res.render("home", {headline: headlines});
		});
});

// A GET route for scraping the echojs website
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.csdesignstudios.com/studio-news", function(err, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(html);

    // Now, we grab every element, and do the following:
    $(".CS-ArticleContent").each(function(i, element) {
      // Save an empty result object
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h3")
        .text();
      result.summary = $(this)
      	.children("p")
      	.text();
      result.link = "https://www.csdesignstudios.com" + $(this)
        .children("a")
        .attr("href");

      // Create a new Headline using the `result` object built from scraping
      db.Headline.create(result)
        .then(function(dbHeadline) {
          // View the added result in the console
          // console.log(dbHeadline);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Headline, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Headlines from the db
router.get("/headlines", function(req, res) {
	// Grab every document in the Headlines collection
	db.Headline.find({})
		.then(function(dbHeadline) {
			// If we were able to successfully find Headlines, send them back to the client
			res.json(dbHeadline);
		})
		.catch(function(err) {
			// If an error occurred, send it to the client
			res.json(err);
		});
});

// cleanup
router.get("/cleanup", function(req, res) {
	// clear db
	db.Headline.remove({})
		.then(function(data) {
			res.json(data);
		})
		.catch(function(err) {
			res.json(err);
		})
});

// Export routes for server.js to use.
module.exports = router;

