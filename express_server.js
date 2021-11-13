////////////////////////////// requirements ///////////////////////////////////////////

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); // Static files (css / images)
app.use(express.urlencoded({ extended: false })); // Parses the body of a form request string in an object
app.use(cookieParser());
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

const usernameDatabase = {
  "kunvar13": {
    id: "kunvar13",
    email: "knk.fetr@gmail.com",
    password: "regina@SK"
  },
  "gkunvar13": {
    id: "gkunvar13",
    email: "gkunvar18@gmail.com",
    password: "saskatoon@SK"
  }
};

///////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////end points///////////////////////////////////////////////

//index endpoint

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.cookies['userID']), users: usernameDatabase, userID: req.cookies['userID']};
  res.render("urls_index", templateVars);
});

//end point to add new URL

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, users: usernameDatabase, userID: req.cookies['userID']};
  res.render("urls_new",templateVars);
});

// end point to show the list of URLs

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: usernameDatabase, userID: req.cookies['userID']};
  res.render("urls_show", templateVars);
});

//end point to generate new ShortUrl

app.post("/urls", (req, res) => {
  let sUrl = generateRandomString();
  urlDatabase[sUrl] = {id: req.body.longURL, userID: req.cookies['userID']};
  res.redirect(`/urls/${sUrl}`);
});

//endpoint to redirect the short URL to Long URL

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//endpoint to delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const sUrl = req.params.shortURL;
  delete urlDatabase[sUrl];
  res.redirect('/urls');
});

//endpoint to edit URL
app.get("/urls/:shortURL/edit", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,users: usernameDatabase, userID: req.cookies['userID'] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/:userID", (req, res) => {
  let sUrl = req.params.shortURL;
  urlDatabase[sUrl] = {
    longURL: req.body.longURL,
    userID: req.params.userID};
  console.log(urlDatabase[sUrl]);
  res.redirect('/urls');
});

app.post("/urls/:userID", (req, res) => {
  let sUrl = generateRandomString();
  urlDatabase[sUrl] = {
    longURL: req.body.longURL,
    userID: req.params.userID};
  console.log(urlDatabase[sUrl]);
  res.redirect('/urls');
});

//endpoint to login

app.get("/login", (req, res) =>{
  const templateVars = {urls: urlDatabase, users: usernameDatabase, userID: req.cookies['userID']};
  res.render("login",templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (let key in usernameDatabase) {
    if (usernameDatabase[key].email === email && usernameDatabase[key].password === password) {
      const userID = key;
      res.cookie("userID", userID);
      const templateVars = {urls: urlsForUser(userID), users: usernameDatabase, userID: req.cookies['userID']};
      return res.redirect("/urls");
    }
  }
  return res.send("BAD email id or password, please enter the valid email id or password, and try again");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  return res.redirect("/login");
});

//end point for Registeration page

app.get("/register", (req, res) => {
  const templateVars = {urls: urlDatabase, users: usernameDatabase, userID: req.cookies['userID']};
  res.render("register", templateVars);

});

//Getting parameters from register page

app.post("/register", (req, res) => {
  if (req.body.email === undefined || req.body.password === undefined) {
    return res.send("Error 400, Email cannot be blank");
  }

  for (let user in usernameDatabase) {
    if (usernameDatabase[user].email === req.body.email)
      return res.send(" Error 400, Email ID already exist");
  }
  const userID = generateRandomString();
  let obj1 = {id: userID, email: req.body.email, password: req.body.password };
  usernameDatabase[userID] = obj1;
  res.cookie("userID", userID);
  const templateVars = {urls: urlDatabase, users: usernameDatabase, userID: req.cookies['userID']};
  res.render("login", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});