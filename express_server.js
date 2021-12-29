/* eslint-disable func-style */
/* eslint-disable camelcase */
/* eslint-disable linebreak-style */
const getUserByEmail = require("./helper");
const emailAlreadyExists = require("./helper");


const express = require("express");
const cookieParser = require("cookie-session");
const app  = express();
const PORT = 8080;
app.set("view engine", "ejs");
//***********************************************************************

const bodyParser = require("body-parser");
const { render } = require("ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser({
  name : "session",
  keys : ["key1", "key2"],
  maxAge: 24 * 60 * 60 * 1000
}));

//***********************************************************************
const bcrypt = require('bcryptjs'); //secure password
//***********************************************************************

//function generate random strings for shortURL

function generateRandomString() {
  //generate a 6 alpha numeric character
  let newShortURL = Math.random().toString(36).substr(2, 6);
  return newShortURL;
}

//userDatabase

const users = {
  "kunvar13": {
    id: "kunvar13",
    email: "knk.fetr@gmail.com",
    password: bcrypt.hashSync("Regina@SK", 10)
  },
  "gkunvar13": {
    id: "gkunvar13",
    email: "gkunvar@gmail.com",
    password: bcrypt.hashSync("Saskatoon@SK", 10)
  }
};

//urlDatabase

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "kunvar13"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID:"gkunvar13"
  }
};

//Declaring as global variable as this is required multiple times

let userSpecificURLDatabase = {};

//sorting user specific urls

function urlsForUser(userIDFromCookie) {
  userSpecificURLDatabase = {};

  for (const shortURL in urlDatabase) {
    if (userIDFromCookie === urlDatabase[shortURL]["userID"]) {
      userSpecificURLDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  if (userSpecificURLDatabase) {
    return userSpecificURLDatabase;
  } else {
    return false;
  }
}

///////////////////////////////////*get /urls */
app.get("/urls", (req, res) => {
//if user is not logged in
  if (!req.session.user_id) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  }

  let userIDFromCookie = req.session.user_id;
  userSpecificURLDatabase = urlsForUser(userIDFromCookie);
  const templateVars = { urls: userSpecificURLDatabase, user: req.session.user_id, registeredUsers: users };
  res.render("urls_index", templateVars);

});

//post urls request
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  }
  let tempShortURL = generateRandomString();
  urlDatabase[tempShortURL] = {
    "longURL" : req.body.longURL,
    "userID" : req.session.user_id
  };
  res.redirect("/urls/" + tempShortURL);
});

///////////////////////////////////URLS/new page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  }

  let userIDFromCookie = req.session.user_id;
  userSpecificURLDatabase = urlsForUser(userIDFromCookie);
  const templateVars = { urls: userSpecificURLDatabase, user: req.session.user_id, registeredUsers: users };
  res.render("urls_new", templateVars);

});

///////////////////////////////////URLSshort page

app.get("/urls/:shortURL", (req, res) =>{
  if (!req.session.user_id) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  }

  let userIDFromCookie = req.session.user_id;
  userSpecificURLDatabase = urlsForUser(userIDFromCookie);

  if (userSpecificURLDatabase[req.params.shortURL] === undefined) {
    res.status(401).send("<html> <head>Server Response</head><body><h1>Provided shortURL is wrong or doesnt belong to you, pls try again with valid ShortURL</h1></body></html>");
  } else {
    const templateVars = {shortURL: req.params.shortURL, longURL: userSpecificURLDatabase[req.params.shortURL]["longURL"], user: req.session.user_id, registeredUsers: users };
    res.render("urls_show", templateVars);
  }
});

//edit the shortURL
app.post("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  }
  let userIDFromCookie = req.session.user_id;
  userSpecificURLDatabase = urlsForUser(userIDFromCookie);

  if (userSpecificURLDatabase[req.params.shortURL] !== undefined) {
    userSpecificURLDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  }  else {
    console.log("doesnt belong to u");
    res.status(401).send("<html> <head>Server Response</head><body><h1>Provided shortURL is wrong or doesnt belong to you, pls try again with valid ShortURL</h1></body></html>");
  }
});

//get method for delete
app.get("/urls/:shortURL/delete", (req, res) => {
  
  res.status(401).send("<html> <head>Server Response</head><body><h1> You cannot delete using this method, redirect to the <a href='/urls'>main page</a></h1></body></html>");
  res.redirect("/urls");
  return;

});

//Post method for delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    //console.log("pls login");
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  }
  let userIDFromCookie = req.session.user_id;

  if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === userIDFromCookie) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
    return;
  } else {
    res.status(401).send("<html> <head>Server Response</head><body><h1> Cannot delete that which does not exist, you will be transferred to the <a href='/urls'>main page</a></h1></body></html>");
  }
  
});

//get the longURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] !== undefined) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  } else {
    res.status(401).send("<html> <head>Server Response</head><body><h1>Provided shortURL is wrong or doesnt belong to you, pls try again with valid ShortURL</h1></body></html>");
  }
});

//////////////////////registration page

app.get("/register", (req, res) => {

  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { urls: urlDatabase, user: req.session[users.id], registeredUsers: users};
  res.render("register", templateVars);
});

//post register
app.post("/register", (req, res) => {
  console.log(req.body.email);
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Either the email or password is missing, please fill it out");
    return;

  } else if (emailAlreadyExists(req.body.email, users) === true) {
    console.log("Email already exist");
    res.status(400).send("This email already exists");
    res.status(400).send("<html> <head>Server Response</head><body><h1> This email already exists, please click on the <a href='/login'>login page</a></h1></body></html>");
    return;
  } else {
    let newID = generateRandomString();
    users[newID] =   {
      id : newID,
      email : req.body.email,
      password : bcrypt.hashSync(req.body.password, 10)
    };

    req.session.user_id = newID;
    res.redirect("/urls");

  }

});
/////////////////////LOGIN PAGE & BUTTONS
app.get("/login", (req, res) => {

  res.render("login", {user: req.session.user_id});
});


app.post("/login", (req, res) =>{
  //add the  login to the cookie objects from the form
  //put the email and password in a variable
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;

  console.log(submittedEmail + "<< this is email from the form");
  console.log(submittedPassword + "<< this is password from the form");
  //  knk.fetr@gmail.com
  //  Regina@SK

  let foundUser = false;
  let desiredUser = {};

  for (const user in users) {
    foundUser = users[user]['email'] === submittedEmail && bcrypt.compareSync(submittedPassword, users[user]['password']);
    if (foundUser) {
      desiredUser = user;
      break;
    }
  }

  if (foundUser) {
    req.session.user_id = desiredUser;
    res.redirect('/urls');
  } else {
    res.status(403).send("Either the email or password doesn't match");
  }

});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let userIDFromCookie = req.session.user_id;
    userSpecificURLDatabase = urlsForUser(userIDFromCookie);
    const templateVars = { urls: userSpecificURLDatabase, user: req.session.user_id, registeredUsers: users };
    res.render("urls_index", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
