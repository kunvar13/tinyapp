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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usernameDatabase = {
  kunvar13: "Logged in as Kalpesh Kunvar",
  gkunvar13: "Logged in as Gayatri Kunvar",
  akunvar13: "Logged in as aadi kunvar"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// This is before EJS
/*app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});*/

//Adding EJS to tinyApp


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username']};
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  let sUrl = generateRandomString();
  urlDatabase[sUrl] = (req.body.longURL);  // Log the POST request body to the console
  //shortURL = sUrl;
  res.redirect(`/urls/${sUrl}`);
  console.log(urlDatabase);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const sUrl = req.params.shortURL;
  //console.log(sUrl);
  //console.log(urlDatabase[sUrl]);
  delete urlDatabase[sUrl];
  res.redirect('/urls');

});

app.get("/urls/:shortURL/edit", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  //console.log(req.body);
  const username = req.body.username;
  console.log(username);
  //rsconsole.log(userToAuth);
  for (let key in usernameDatabase) {
    if (key === username) {
      console.log(res.cookie('username', username));
      //res.cookie("isAuthenticated", true);
      return res.redirect('/urls');
    }
  }
  return res.send("BAD username");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  return res.redirect("/urls");
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});