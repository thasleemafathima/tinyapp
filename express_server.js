const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "Thas" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "Ameer" }
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

const urlsForUser = function(id) {
 let new1 = {};
  for (let i in urlDatabase) {    
    if (id.id === urlDatabase[i].userID){
      new1[i] = urlDatabase[i];
    }
  }
  return new1;
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

const bcrypt = require('bcrypt');
//app.use(bcrypt());


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
  let newurldb;
  if (users[req.cookies["userid"]]) {
    newurldb = urlsForUser(users[req.cookies["userid"]]);
  }
  else{
    newurldb = {};
  }
  let templateVars = { urls: newurldb,
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
    let obj = templateVars.user;
    if (obj.id) {
      res.cookie('userid',obj.id);
      res.render("urls_new",templateVars);
    } else {
      res.redirect(`/login`)
    } 
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["userid"]] };
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
  let longURL = req.body.longURL;
  let userID = req.cookies["userid"];
  urlDatabase[shortu] = { longURL,userID };
  console.log(urlDatabase,"ame")
  res.redirect(`/urls/${shortu}`);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)

});

app.post("/urls/:shortURL/delete", (req, res) => {
  let curruser = req.cookies["userid"];
  console.log(curruser,"thasbas",urlDatabase[req.params.shortURL].userID);
  if (curruser === urlDatabase[req.params.shortURL].userID){
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  let userID = req.cookies["userid"];
  let longURL = req.body.longURL;
  
  urlDatabase[req.params.shortURL] = { longURL , userID };
  res.redirect(`/urls`);
});


app.post("/login", (req, res) => {
  let emailnew = req.body.email;
  let passwordnew = req.body.password;
  let found = 0;
  let foundname = "";
  console.log();
  for (let i in users) {
    if (emailnew !== "" && emailnew === users[i].email) {
      if(bcrypt.compareSync(passwordnew, users[i].password)) {
        found = 1;
        foundname = i;
      }
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
  user.password = bcrypt.hashSync(user.password, 10)
  console.log(user.password,"Amee",req.body.password);
  if (user.email === "" || user.password === "" || user.email !== users[user.id].email) {
    res.status(404).send('Not found');
  }
  res.cookie('password',user.password)
  res.cookie('userid',user.id);
  res.redirect(`/urls`);
});