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



function generateRandomString() {
  //generate a 6 alpha numeric character
  let newShortURL = Math.random().toString(36).substr(2, 6);
  return newShortURL;
}

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

let userSpecificURLDatabase = {};

function urlsForUser(userIDFromCookie) {
  userSpecificURLDatabase = {};

  for (const shortURL in urlDatabase) {
    // console.log(urlDatabase[url]["userID"]);
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

///////////////////////////////////*this is for the URLS page*/
app.get("/urls", (req, res) => {
  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.session.user_id;

  userSpecificURLDatabase = urlsForUser(userIDFromCookie);

  const templateVars = { urls: userSpecificURLDatabase, user: req.session.user_id, registeredUsers: users };
  if (!req.session.user_id) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  }

  res.render("urls_index", templateVars);
});
// }


app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let tempShortURL = generateRandomString();
  urlDatabase[tempShortURL] = {
    "longURL" : req.body.longURL,
    "userID" : req.session.user_id
  };
  console.log(urlDatabase);

  // urlDatabase[tempShortURL]["longURL"] = req.body.longURL;
  // urlDatabase[tempShortURL]["userID"] = req.session[user_id];


  res.redirect("/urls/" + tempShortURL);         // Respond with 'Ok' (we will replace this)
});

///////////////////////////////////URLS/new page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;
  }

  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.session.user_id;

  userSpecificURLDatabase = urlsForUser(userIDFromCookie);

  
  // console.log(req.session);
  // console.log(users);
  // console.log(users[req.session.user_id]["email"]);

  const templateVars = { urls: userSpecificURLDatabase, user: req.session.user_id, registeredUsers: users };
  
  res.render("urls_new", templateVars);

});

///////////////////////////////////URLSshort page
app.get("/urls/:shortURL", (req, res) =>{
  if (!req.session.user_id) {
    res.status(401).send("<html> <head>Server Response</head><body><h1> You are not logged in, you will be transferred to the <a href='/login'>login page</a></h1></body></html>");
    return;

  }
  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.session.user_id;

  userSpecificURLDatabase = urlsForUser(userIDFromCookie);
  
  
  const templateVars = {shortURL: req.params.shortURL, longURL: userSpecificURLDatabase[req.params.shortURL]["longURL"], user: req.session.user_id, registeredUsers: users };
  // console.log(req.session + "<<< this is from /urls/:shortURL ");
  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL", (req, res) => {


  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.session.user_id;

  userSpecificURLDatabase = urlsForUser(userIDFromCookie);

  userSpecificURLDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL/delete", (req, res) => {
  res.status(401).send("<html> <head>Server Response</head><body><h1> You cannot delete using this method, redirect to the <a href='/urls'>main page</a></h1></body></html>");

  res.redirect("/urls");
  return;

});


app.post("/urls/:shortURL/delete", (req, res) => {

  // let userSpecificURLDatabase = {};
  let userIDFromCookie = req.session.user_id;
  
  console.log(urlDatabase[req.params.shortURL], userIDFromCookie);

  if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === userIDFromCookie) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
    return;
  } else {
    res.status(401).send("<html> <head>Server Response</head><body><h1> Cannot delete that which does not exist, you will be transferred to the <a href='/urls'>main page</a></h1></body></html>");

  }
  
  // console.log(urlDatabase);
});
app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});
//////////////////////registration page
app.get("/register", (req, res) => {

  // console.log(Object.keys(req.session))

  if (req.session.user_id) {
    res.redirect("/login");
    return;
  }

  const templateVars = { urls: urlDatabase, user: req.session[users.id], registeredUsers: users};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  // console.log("request received");
  if (!req.body.email || !req.body.password) {
    console.log("entered the if statement");
    res.status(400).send("Either the email or password is missing, please fill it out");
    return;
  } else if (emailAlreadyExists(req.body.email)) {
    res.status(400).send("This email already exists");
    res.status(400).send("<html> <head>Server Response</head><body><h1> This email already exists, please click on the <a href='/login'>login page</a></h1></body></html>");

    return;
  }

  let newID = generateRandomString();

  users[newID] =   {
    id : newID,
    email : req.body.email,
    password : bcrypt.hashSync(req.body.password, 10)
  };

  console.log(users[newID]["password"]);

  req.session.user_id = newID;
  res.redirect("/urls");

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
  //  user2@example.com
  //  dishwasher-funk

  // let authorizer = null;

  let foundUser = false;

  let desiredUser = {};

  // console.log(users[user]['password']);

  for (const user in users) {
    foundUser = users[user]['email'] === submittedEmail && bcrypt.compareSync(submittedPassword, users[user]['password']);
    if (foundUser) {
      desiredUser = user;
      break;
    }
  }
  console.log(desiredUser);

  if (foundUser) {
    req.session.user_id = desiredUser;
    res.redirect('/urls');
  } else {
    //show the erorr
    authorizer = false;
    res.status(403).send("Either the email or password doesn't match");
  }

});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }

  const templateVars = { greeting: 'Hello World!', user: req.session.user_id };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
