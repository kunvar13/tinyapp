///////////////////////////// requirements ///////////////////////////////////////////
 
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); // Static files (css / images)
app.use(express.urlencoded({ extended: false })); // Parses the body of a form request string in an object
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");
 
////////////////////////////////////////////////////////////////////////////////////////
 
//function to generate random string
 
const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
charactersLength));
  }
  return result;
};
 
const urlsForUser = function(id) {
  let urlObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlObj[key] = {
        longURL: urlDatabase[key].longURL,
        userID: urlDatabase[key].userID
      };
    }
  }
  return urlObj;
};
 
//////////////////////////////////////////
 
////////////////////////////////////////// Databases ////////////////////////////////////
 
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
 
const password1 = "regina@SK"; // found in the req.params object
const hashedPassword1 = bcrypt.hashSync(password1, 10);
const hashedPassword2 = bcrypt.hashSync("saskatoon@SK", 10);
 
const usernameDatabase = {
  "kunvar13": {
    id: "kunvar13",
    email: "knk.fetr@gmail.com",
    password: hashedPassword1
  },
  "gkunvar13": {
    id: "gkunvar13",
    email: "gkunvar18@gmail.com",
    password: hashedPassword2
  }
};
 
///////////////////////////////////////////////////////////////////////////////////////////
 
 
//////////////////////////////////end points///////////////////////////////////////////////
 
//index endpoint
 
app.get("/urls", (req, res) => {
  //shorting our urls for the current user using urlsForUser
  //const templateVars = { urls: urlsForUser(req.session.userID), users: usernameDatabase, userID: req.session.userID};
  if (req.session.userID === undefined) {
    return res.send(" <html> <head>Server Response</head><body><h1> You are not logged in, please login first <a href='/login'>login page</a></h1></body></html>");
  } else {
    const templateVars = { urls: urlDatabase, users: usernameDatabase, userID: req.session.userID};
    res.render("urls_index", templateVars);
  }
});
 
//end point display add new URL page
 
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, users: usernameDatabase, userID: req.session.userID};
  res.render("urls_new",templateVars);
});
 
// end point to show the list of URLs
 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: usernameDatabase, userID: req.session.userID};
  res.render("urls_show", templateVars);
});
 
//end point to generate new ShortUrl
 
app.post("/urls", (req, res) => {
  let sUrl = generateRandomString();
  urlDatabase[sUrl] = {id: req.body.longURL, userID: req.session.userID};
  res.redirect(`/urls/${sUrl}`);
});
 
//endpoint to redirect the short URL to Long URL
 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
 
//endpoint to delete URL

app.post("/urls/:shortURL/delete", (req, res) => {

  // Adding functionality - User can delete the URL belongs to them
  const sUrl = req.params.shortURL;
  if (urlDatabase[sUrl].userID === req.session.userID) {
    res.redirect('/urls');
    delete urlDatabase[sUrl];
    res.redirect('/urls');
  } else {
    return res.send(" Error 400, User is not allowed to edit this URL");
  }
});
 
//endpoint to display edit URL page
app.get("/urls/:shortURL/edit", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,users: usernameDatabase, userID: req.session.userID};
  //checking if user is allowed to edit the URL or not
  if (urlDatabase[req.params.shortURL].userID === req.session.userID) {
    res.render("urls_show", templateVars);
  } else {
    return res.send(" Error 400, User is not allowed to edit this URL");
  }
});

//end point to show urls belong to the user - myURL

app.post("/urls/:shortURL/:userID", (req, res) => {
  let sUrl = req.params.shortURL;
  urlDatabase[sUrl] = {
    longURL: req.body.longURL,
    userID: req.params.userID};
  res.redirect('/urls');
});
 
//end point to display URLS that belongs to the user only

app.get("/url", (req, res) => {
  //shorting our urls for the current user using urlsForUser
  const templateVars = { urls: urlsForUser(req.session.userID), users: usernameDatabase, userID: req.session.userID};
  //const templateVars = { urls: urlDatabase, users: usernameDatabase, userID: req.session.userID};
  res.render("urls_index", templateVars);
});
  
  
//end point to create new url
  
app.post("/urls/:userID", (req, res) => {
  let sUrl = generateRandomString();
  urlDatabase[sUrl] = {
    longURL: req.body.longURL,
    userID: req.params.userID};
  res.redirect('/urls');
});
 
//endpoint for login page
 
app.get("/", (req, res) =>{
  req.session = null;
  const templateVars = {urls: urlDatabase, users: usernameDatabase, userID: undefined};
  res.render("login",templateVars);
});

app.get("/login", (req, res) =>{
  req.session = null;
  const templateVars = {urls: urlDatabase, users: usernameDatabase, userID: undefined};
  res.render("login",templateVars);
});

//end point to authenticate user through login
 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (let key in usernameDatabase) {
    if (usernameDatabase[key].email === email && bcrypt.compareSync(password, usernameDatabase[key].password)) {
      const userID = key;
      req.session.userID = userID;
      const templateVars = {urls: urlsForUser(userID), users: usernameDatabase, userID: req.session.userID};
      return res.redirect("/urls");
    }
  }
  return res.send("BAD email id or password, please enter the valid email id or password, and try again");
});
 
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});
 
//end point to display registeration page
 
app.get("/register", (req, res) => {
  const templateVars = {urls: urlDatabase, users: usernameDatabase, userID: req.session.userID};
  res.render("register", templateVars);
 
});
 
//end point to register and redirect user
 
app.post("/register", (req, res) => {
  if (req.body.email === undefined || req.body.password === undefined) {
    return res.send("Error 400, Email cannot be blank");
  }
 
  for (let user in usernameDatabase) {
    if (usernameDatabase[user].email === req.body.email)
      return res.send(" Error 400, Email ID already exist");
  }
  const userID = generateRandomString();
  let hashedPassword =  bcrypt.hashSync(req.body.password, 10);
  let obj1 = {id: userID, email: req.body.email, password: hashedPassword };
  usernameDatabase[userID] = obj1;
  req.session.userID = userID;
  res.redirect("/login");
});
 
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
