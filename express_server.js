//Require for the server to run
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const cookieSession = require("cookie-session");
const {generateRandomString, urlsForUser, uniqueUser,getUserByEmail, newUser} = require("./helpers.js");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["session1"]
}));

// Variables
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};


//DataBase
const usersDb = { 
  "userRandomID4": {
    id: "user4RandomID", 
    email: "user4@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID5": {
    id: "user5RandomID", 
    email: "user5@example.com", 
    password: "dishwasher-funk"
  }
}

//GET && POST
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

// URLS ROUTES
app.get('/urls', (req,res) => {
  const templateVars = { urls: urlsForUser(urlDatabase, req.session.user_id), user: usersDb[req.session.user_id] };
  res.render('urls_index', templateVars);
});


// Redirect if not a user or Show new URL
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send('Please login to create new URLs');
  } else {
    const userID = req.session.user_id;
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL, userID };
    res.redirect(`urls/${shortURL}`);
  }
});

//Create new URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    urls:urlDatabase,
    user:usersDb[userID]
  };
  if (!templateVars.user) {
    res.render("/login", templateVars);
  } else {
    res.render("urls_new", templateVars);
  }
});

// Short url with edit option
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { urls: urlDatabase, shortURL, longURL: urlDatabase[shortURL].longURL, user: usersDb[req.session.user_id] };
  if (req.session.user_id === urlDatabase[templateVars.shortURL].userID) {
    res.render('urls_show', templateVars);
  } else {
    res.status(401).send('Wrong TinyURL');
  }
});


//Edit 
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.newURL;
  const userID = req.session.user_id;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(400).send("400: Denied");
  }
  urlDatabase[shortURL] = {
    longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls");
});


//delete an URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const loggeduserId = req.session['user_id'];
  const isOwnerCreator = urlDatabase[req.params.shortURL].userID === loggeduserId;
  const shortURL = req.params.shortURL;

  if (!isOwnerCreator) {
    res.status(400).send('Error: cannot delete another creator\'s URL');
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


//Short url redirecting to longUrl
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//Registering
app.get("/register", (req, res) => {
  const templateVars = { user: usersDb[req.session.user_id] };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
});

//Saving the user in a database
app.post("/register" , (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(userEmail, usersDb)
  if (userEmail === "" || password === "" ) {
    return res.status(400).send("Error fetching the infos");
  } else if(user) {
    res.status(403).send('Email already exist');
  }else{
    const userId = newUser(userEmail,password,usersDb);
    req.session['user_id'] = userId;
    return res.redirect("/urls");
  }
});


//Login page
app.get("/login", (req, res) => {
  const templateVars = { user: usersDb[req.session.user_id] };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', templateVars);
  }
});

//Login validation
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = uniqueUser(email, password, usersDb);

  if (user) {
    req.session["user_id"] = user.id;
    res.redirect("/urls");
  } else {
    res.status(401).send('error_401');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});