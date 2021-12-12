//Require for the server to run
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session")
const {generateRandomString, getUserById,urlForUser, getUserByEmail, emailExist, updateUrl} = require("./helpers.js");
const bcrypt = require('bcryptjs');
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["session1"]
}));


// Variables 
const urlDatabase = {};
const users = {};
//GET && POST
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if(userID){
   res.redirect('/urls');
  } else {
  res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = getUserById(userID,users);
  const url = urlForUser(userID,urlDatabase);
  if (!user) {
    return res.redirect("/login");
  } else {
  const templateVars = {
    urls: url, 
    user: userID,
  };
  res.render("urls_index", templateVars);
}
});

app.post("/urls", (req,res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  const user = getUserById(userID,users)
  if (user) {
    urlDatabase[shortURL] = {
      longURL:req.body.longURL,
      userID:userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    return res.status(400).send("Users not logged in can't save urls")
  }
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = getUserById(userID,users);
  const templateVars = { 
    urls:urlDatabase,
    user:req.session.user_id,
  };
  if (!user) {
    return res.redirect("/login");
  } else{
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL  = req.params.shortURL;
  const userID = req.session.user_id;
  const url = urlForUser(userID,urlDatabase);
  if (userID) {
    if (!url[shortURL]) {
    return res.status(400).send("Error finding the url");
    } else {
    const templateVars = {
      shortURL,
      longURL:url.longURL,
      user:users[userID]
    };
    return res.render("urls_show", templateVars);
  }
  } else{
  return res.status(400).send("Error, you must login first.");
  }
});

app.post("/urls/:shortURL", (req,res) => {
  const shortURL  = req.params;
  const newUrl  = req.body;
  const userID = req.session.user_id;
  const user = getUserById(userID);
  const url = urlDatabase[shortURL](shortURL) 
  if (url.userID === user.id) {
    updateUrl(shortURL, newUrl);
  }
  return res.redirect("/urls");
});


app.post("/urls/:shortURL/delete", (req,res) => {
  const userID = req.session.user_id;
  const url = urlForUser(userID, urlDatabase);
  const shortURL = req.params.shortURL;
  if(!userID){
    return res.status(400).send("Error deleting someone else link");
  } else {
      if (url[shortURL]) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
     } else {
      res.status(400).send("Error")
    }
  }
})

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    return res.redirect(urlDatabase[shortURL].longURL);
  }
  return res.status(400).send("This link doesn't exist")
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
  const templateVars = { 
    user:users[userID] 
  };
  res.render("urls_register", templateVars);
  }
});

app.post("/register" , (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();
  if(!userEmail|| !password || emailExist(userEmail,users)){
    return res.status(400).send("Error fetching the infos");
  } else{
  req.session.user_id = userID;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = {
    id: userID,
    email: userEmail,
    password: hashedPassword
  }
  return res.redirect("/urls") 
  }
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID){
    res.redirect("/urls")
  } else {
    const templateVars = {
      user: users[userID]
    };
  return res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(userEmail, users);
  const hashedPassword = bcrypt.hashSync(password, user.password);
  if( userEmail === undefined || password === undefined) {
    return res.render("Error logging in");
  }
  const user = getUserByEmail(userEmail, users);
  if(user === undefined){
    return res.status(400).send("No user found");
  } else if(!hashedPassword) {
    return res.status(400).send("Username or password incorrect")
  } else {
  req.session.user_id = userID.id;
  res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});