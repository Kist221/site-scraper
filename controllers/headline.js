// Require dependencies
var express = require("express");
var formidable = require('formidable');
var passport = require("../config/passport");
var router = express.Router();
// Requiring bcrypt for password hashing. Using the bcrypt-nodejs version as the regular bcrypt module
var bcrypt = require("bcrypt-nodejs");
// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");
// Requiring our models
var db = require("../models");
// Require our emailer function
const NewEmail = require("../email");
var parse = require('csv-parse');
var fs = require('fs');


// Create all our routes and set up logic within those routes where required.

// Using the passport.authenticate middleware with our local strategy.
// If the user has valid login credentials, send them to the members page.
// Otherwise the user will be sent an error
router.post("/api/login", passport.authenticate("local"), function(req, res) {
  // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
  // So we're sending the user back the route to the members page because the redirect will happen on the front end
  // They won't get this or even be able to access this page if they aren't authed
  res.json("/dashboard");
});

// Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
// how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
// otherwise send back an error
router.post("/api/signup", function(req, res) {
  console.log(req.body);
  db.Users.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  }).then(function(dbUsers) {
    console.log("Registered new user...");
    db.Company.create({
      UserId: dbUsers.dataValues.id,
      name: req.body.company
    }).then(function() {
      console.log("Registered new company...");
      res.redirect(307, "/api/login");
    });
  }).catch(function(err) {
    console.log("ERROR!");
    //res.json(err);
    res.status(422).json(err.errors[0].message);
  });
});

// This will return the current user login
router.post("/api/currentUser", function(req, res) {
  res.json(req.user);
});

// Parse an uploaded CSV file and save data as Contacts
router.post("/api/uploadcsv", function(req, res) {
  var form = new formidable.IncomingForm();
  var csvFilePath = "";
  var newUserData = {};

  // Find the ComapnyId of the current User's Company.
  // We need this to associate a Contact to a Company
  db.Company.findOne({
    where: {
      UserId: req.user.id
    }
  })
  .then(function(dbCompany) {
    newUserData.CompanyId = dbCompany.id;
  });

  form.parse(req);

  form.on('fileBegin', function (name, file){
      file.path = __dirname + '/uploads/' + file.name;
      csvFilePath = file.path;
  });

  form.on('file', function (name, file){
    console.log('Uploaded ' + file.name);
    var parser = parse({"columns": true}, function(err, data){
      // Print error if there is one
      if(err) {
        console.log(err);
      }
      // Iterate through each data (or row) in the csv and store it as a Contact
      for(var i = 0; i < data.length; i++) {
        newUserData.name = data[i].first_name.trim() + " " + data[i].last_name.trim();
        newUserData.email = data[i].email.trim();
        newUserData.phone = data[i].phone1.trim();
        // This is where we create our new Contact
        db.Contact.create(newUserData);
      }
      // Redirect the User to the list of Contact once csv data is uploaded to DB
      res.redirect("/contacts");
    });

    fs.createReadStream(csvFilePath).pipe(parser);
  });
});

// Route for login page
router.get("/login", function(req, res) {
  // If the user already has an account send them to the members page
  if (req.user) {
    res.redirect("/dashboard");
  }
  res.render("login");
});

// Route for logging user out
router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

// Home page / Landing Page
router.get("/", function(req, res) {
  // If the user already has an account send them to the dashboard page
  if (req.user) {
    res.redirect("/dashboard");
  }
  res.render("register");
});

// Dashboard Page
router.get("/dashboard", isAuthenticated, function(req, res) {
  res.render("dashboard");
});

// Settings Page
router.get("/settings", isAuthenticated, function(req, res) {
  res.render("settings");
});

// Fetch Reviews Page
router.get("/fetch", isAuthenticated, function(req, res) {
  res.render("fetch");
});

// Email Templates Page
router.get("/templates", isAuthenticated, function(req, res) {
  res.render("templates");
});

// Negative review Page
router.get("/nreview:id", function(req, res) {
  db.Contact.findOne({
    where: {
      id: req.params.id
    },
    include: [db.Company]
  }).then(function(dbContact) {
    var negative = {
      review_type: "negative",
      contact_id: dbContact.id,
      contact_name: dbContact.name,
      contact_email: dbContact.email,
      contact_phone: dbContact.phone
    };
    res.render("negative", negative);
  });
});

// Positive review Page
router.get("/preview:id", function(req, res) {
  db.Contact.findOne({
    where: {
      id: req.params.id
    },
    include: [db.Company]
  }).then(function(dbContact) {
    var positive = {
      review_type: "positive",
      contact_id: dbContact.id,
      yelp: dbContact.Company.yelp,
      google: dbContact.Company.google,
      bbb: dbContact.Company.bbb
    };
    res.render("positive", positive);
  });
});

// Contact List Page
router.get("/contacts", isAuthenticated, function(req, res) {
  db.Company.findOne({
    where: {
      UserId: req.user.id
    }
  })
  .then(function(dbCompany) {
    db.Contact.findAll({
      where: {
        CompanyId: dbCompany.id
      }
    })
    .then(function(dbContact) {
      res.render("contact-list", {contacts: dbContact});
    });
  });
});

// Import Contact Page
router.get("/import", isAuthenticated, function(req, res) {
  res.render("upload");
});

// Sends an email with options defined in the req.body
router.post("/api/send_email", function(req, res) {
  var data = req.body;
  NewEmail.sendEmail(data.to, data.subject ,data.id, data.name, data.message);
  res.json(data);
});

/**********************
 *                    *
 *    User routes     *
 *                    *
 **********************/
// Returns all Users
router.get("/api/fetch_users", function(req, res) {
	db.Users.findAll({
      include: [db.Company]
    }).then(function(dbUsers) {
      res.json(dbUsers);
    });
});

// Fetch one User by id
router.get("/api/fetch_users/:id", function(req, res) {
	db.Users.findOne({
      where: {
        id: req.params.id
      },
      include: [db.Company]
    }).then(function(dbUsers) {
      res.json(dbUsers);
    });
});

// Creates a new User
router.post("/api/fetch_users/new", function(req, res) {
  db.Users.create(req.body).then(function(dbUsers) {
      res.json(dbUsers);
    });
});

// Update User
router.post("/api/fetch_users/update", function(req, res) {
  req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
  db.Users.update(req.body, {
    where: {
      id: req.body.id
    }
  }).then(function(dbUsers) {
      res.json(dbUsers);
    });
});

/**************************
 *                        *
 *    Template routes     *
 *                        *
 **************************/
// Creates a new Template
router.post("/api/fetch_templates/new", function(req, res) {
  db.Company.findOne({
    where: {
      UserId: req.user.id
    }
  })
  .then(function(dbCompany) {
    req.body.CompanyId = dbCompany.id;
    db.Template.create(req.body)
    .then(function(dbTemplates) {
      res.json(dbTemplates);
    });
  });
});

// Returns all Template
router.get("/api/fetch_templates", function(req, res) {
  db.Template.findAll()
    .then(function(dbTemplates) {
      res.json(dbTemplates);
    });
});

// Returns all Template for a Company
router.get("/api/fetch_company_templates", function(req, res) {
  db.Company.findOne({
    where: {
      UserId: req.user.id
    }
  })
  .then(function(dbCompany) {
    db.Template.findAll({
      where: {
        CompanyId: dbCompany.id
      }
    })
    .then(function(dbTemplates) {
      res.json(dbTemplates);
    });
  });
});

// Fetch one Template by id
router.get("/api/fetch_templates/:id", function(req, res) {
  db.Template.findOne({
      where: {
        id: req.params.id
      },
      include: [db.Company]
    }).then(function(dbTemplates) {
      res.json(dbTemplates);
    });
});

/**************************
 *                        *
 *    Contact routes      *
 *                        *
 **************************/
// Returns all Contacts
router.get("/api/fetch_contact_data", function(req, res) {
  db.Company.findOne({
    where: {
      UserId: req.user.id
    }
  })
  .then(function(dbCompany) {
    db.Contact.findAll({
      where: {
        CompanyId: dbCompany.id
      }
    })
    .then(function(dbContact) {
      res.json(dbContact);
    });
  });
});

// Returns all Contacts by Company id
router.get("/api/fetch_contact_data/company/:id", function(req, res) {
  db.Contact.findAll({
    where: {
      CompanyId: req.params.id
    },
      include: [db.Company]
    }).then(function(dbContact) {
      res.json(dbContact);
    });
});

// Returns all data for Contacts where active = 0 or 1
router.get("/api/fetch_contact_data/active/:active", function(req, res) {
  console.log(req.params);
  db.Contact.findAll({
    where: {
      active: req.params.active
    },
    include: [db.Company]
    }).then(function(dbContact) {
      res.json(dbContact);
    });
});

// Returns all data for Contacts with status = 0: "not sent", or 1: "sent", or 2: "replied" and active = "true"
router.get("/api/fetch_contact_data/status_and_active/:status", function(req, res) {
  console.log(req.params);
  db.Contact.findAll({
    where: {
      status: req.params.status,
      active: 1
    },
    include: [db.Company]
    }).then(function(dbContact) {
      res.json(dbContact);
    });
});

// Returns all data for Contacts with status = 0: "not sent", or 1: "sent", or 2: "replied" and active = "false"
router.get("/api/fetch_contact_data/status_and_not_active/:status", function(req, res) {
  console.log(req.params);
  db.Contact.findAll({
    where: {
      status: req.params.status,
      active: 0
    },
    include: [db.Company]
    }).then(function(dbContact) {
      res.json(dbContact);
    });
});

// Fetch one Contact by id
router.get("/api/fetch_contact_data/:id", function(req, res) {
	db.Contact.findOne({
      where: {
        id: req.params.id
      },
      include: [db.Company]
    }).then(function(dbContact) {
      res.json(dbContact);
    });
});

// Fetch one Contact by name
router.get("/api/fetch_contact_data/name/:name", function(req, res) {
  db.Contact.findOne({
      where: {
        name: req.params.name
      },
      include: [db.Company]
    }).then(function(dbContact) {
      res.json(dbContact);
    });
});

// Creates a new Contact
router.post("/api/fetch_contact_data/new", function(req, res) {
  db.Company.findOne({
    where: {
      UserId: req.user.id
    }
  })
  .then(function(dbCompany) {
    req.body.CompanyId = dbCompany.id;
    db.Contact.create(req.body).then(function(dbContact) {
      res.json(dbContact);
    });
  });
});

// Fetch Contacts with negative reviews that replied (i.e., status = 2)
router.get("/api/fetch_contact_data/reviews/nreviews", function(req, res) {
  db.Contact.findAll({
      where: {
        reviewType: false,
        status: 2 // replied
      },
      include: [db.Company]
    }).then(function(dbContact) {
      res.json(dbContact);
    });
});

// Fetch Contacts with positive reviews that replied (i.e., status = 2)
router.get("/api/fetch_contact_data/reviews/previews", function(req, res) {
  db.Contact.findAll({
      where: {
        reviewType: true,
        status: 2 // replied
      },
      include: [db.Company]
    }).then(function(dbContact) {
      res.json(dbContact);
    });
});

// Update Contact
router.post("/api/fetch_contact_data/update", function(req, res) {
  db.Contact.update(req.body, {
    where: {
      id: req.body.id
    }
  }).then(function(dbContact) {
      res.json(dbContact);
    });
});

/**************************
 *                        *
 *    Company routes      *
 *                        *
 **************************/
// Returns all Company
router.get("/api/fetch_company", function(req, res) {
	db.Company.findAll({
      include: [db.Contact]
    }).then(function(dbCompany) {
      res.json(dbCompany);
    });
});

// Fetch one Company by UserId
router.get("/api/fetch_company/:id", function(req, res) {
	db.Company.findOne({
      where: {
        UserId: req.params.id
      },
      include: [db.Contact]
    }).then(function(dbCompany) {
      res.json(dbCompany);
    });
});

// Creates a new Company
router.post("/api/fetch_company/new", function(req, res) {
  db.Company.create(req.body).then(function(dbCompany) {
      res.json(dbCompany);
    });
});

// Update Company
router.post("/api/fetch_company/update", function(req, res) {
  db.Company.update(req.body, {
    where: {
      UserId: req.body.id
    }
  }).then(function(dbCompany) {
      res.json(dbCompany);
    });
});

// Export routes for server.js to use.
module.exports = router;