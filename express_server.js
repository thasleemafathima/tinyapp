const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "Thas": {
    id: "Thas",
    email: "user@example.com",
    password: "1234"
  },
  "Ameer": {
    id: "Ameer",
    email: "user2@example.com",
    password: "1234"
  }
};


const generateRandomString = function() {
  let result = '';
  let length = 6;
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};


app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());


//get method
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  let a;
  res.send(`a = ${a}`);
});
//above are examples

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.cookies["userid"]] };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.cookies["userid"]] };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["userid"]] };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.cookies["userid"]] };
  res.render("register",templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.cookies["userid"]] };
  res.render("login",templateVars);
});

//post method
app.post("/urls", (req, res) => {

  // Log the POST request body to the console
  let shortu = generateRandomString();
  urlDatabase[shortu] = req.body.longURL;
  res.redirect(`/urls/${shortu}`);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)

});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});


app.post("/login", (req, res) => {
  let emailnew = req.body.email;
  let passwordnew = req.body.password;
  let found = 0;
  let foundname = "";
  for (let i in users) {
    if (emailnew !== "" && emailnew === users[i].email && passwordnew === users[i].password) {
      found = 1;
      foundname = i;
    }
  }
  if (found) {
    res.cookie('userid',foundname);
  } else {
    res.status(404).send('Not found');
  }
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('userid');
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  let user = {};
  user.id = generateRandomString();
  user.email = req.body.email;
  user.password = req.body.password;
  users[user.id] = user;
  if (user.email === "" || user.password === "" || user.email !== users[user.id].email) {
    res.status(404).send('Not found');
  }
  res.cookie('userid',user.id);
  res.redirect(`/urls`);
});