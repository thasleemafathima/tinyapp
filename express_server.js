const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bcrypt = require('bcrypt');

const cookieSession = require('cookie-session');
const getUserByEmail = require("./helpers");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "Thas" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "Ameer" }
};

//hashing password for already existing users in users db
let pass = bcrypt.hashSync("1234", 10);

const users = {
  "Thas": {
    id: "Thas",
    email: "user@example.com",
    password: pass
  },
  "Ameer": {
    id: "Ameer",
    email: "user2@example.com",
    password: pass
  }
};
//function to fetch the respective short and long url database for the provided
//userid i.e eg. only to return url database for one user who is signed in
const urlsForUser = function(id) {
  let new1 = {};
  for (let i in urlDatabase) {
    if (id.id === urlDatabase[i].userID) {
      new1[i] = urlDatabase[i];
    }
  }
  return new1;
};

//function to generate a random unique alphanumeric id.
const generateRandomString = function() {
  let result = '';
  let length = 6;
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});



//get method
app.get("/urls", (req, res) => {
  let newurldb;
  //condition to fetch the urls for logged in userid.
  if (users[req.session.userid]) {
    newurldb = urlsForUser(users[req.session.userid]);
  } else {
    newurldb = {};
  }
  let templateVars = { urls: newurldb,
    user: users[req.session.userid] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.session.userid] };
  let obj = templateVars.user;
  //to check if user is presently defined and logged in
  //to be able to add a new url
  if (obj === undefined) {
    res.redirect(`/login`);
  } else if (obj.id) {
    req.session.userid = obj.id;
    res.render("urls_new",templateVars);
  } else {
    res.redirect(`/login`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.userid] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  if (req.session.userid) {
    res.redirect(`/urls`);
  } else {
    res.redirect(`/login`);
  }
});

app.get("/u/:id", (req, res) => {
  let shortu = req.params.id;
  let longu = urlDatabase[shortu].longURL;
  if (longu) {
    res.redirect(`${longu}`);
  }
});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.session.userid] };
  res.render("register",templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.session.userid] };
  res.render("login",templateVars);
});

//post method
app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  let shortu = generateRandomString();
  let longURL = req.body.longURL;
  let userID = req.session.userid;
  urlDatabase[shortu] = { longURL,userID };
  res.redirect(`/urls/${shortu}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let curruser = req.session.userid;
  if (curruser === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  let userID = req.session.userid;
  let longURL = req.body.longURL;
  if (userID === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = { longURL , userID };
  }
  res.redirect(`/urls`);
});


app.post("/login", (req, res) => {
  let emailnew = req.body.email;
  let passwordnew = req.body.password;
  // to see is user is a valid used in db and allow to login.
  let user22 = getUserByEmail(emailnew,users);
  if (user22) {
    if (bcrypt.compareSync(passwordnew, users[user22].password)) {
      req.session.userid = user22;
      res.redirect(`/urls`);
    } else {
      res.status(404).send('wrong password');
    }
  } else {
    res.status(404).send('Not found');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('userid');
  req.session.userid = null;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  let user = {};
  user.id = generateRandomString();
  user.email = req.body.email;
  user.password = req.body.password;
  user.password = bcrypt.hashSync(user.password, 10);
  //to check if user already exist or empty values provided
  let user22 = getUserByEmail(user.email,users);
  if (user22 !== undefined) {
    res.status(404).send('Already exists');
  }
  if (user.email === "" || user.password === "") {
    res.status(404).send('Not found');
  } else {
    users[user.id] = user;
    res.cookie('password',user.password);
    req.session.userid = user.id;
    res.redirect(`/urls`);
  }
});