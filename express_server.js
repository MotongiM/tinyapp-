//Require for the server to run
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const {generateRandomString, getUserById,urlForUser, emailExist, validateLogin} = require("./helpers.js");
const bcrypt = require('bcryptjs');
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["session1"]
}));

// Variables
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.example.com", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};
const users = {
  "michel": {
    id: "michel",
    email: "michel_motongi@hotmail.com",
    hashedPassword: bcrypt.hashSync("123", 10)
  }
};

//GET && POST
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
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
      user: users[userID],
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req,res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  const user = getUserById(userID,users);
  if (user) {
    urlDatabase[shortURL] = {
      longURL:req.body.longURL,
      userID:userID
    };
  res.redirect("/urls/");
  } else {
    return res.status(400).send("Users not logged in can't save urls");
  }
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = getUserById(userID,users);
  const templateVars = {
    urls:urlDatabase,
    user:users[userID]
  };
  if (!user) {
    return res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const shortURL  = req.params.id;
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
  } else {
    return res.status(400).send("Error, you must login first.");
  }
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]= {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.get('/u/:id', (req, res) => {
  const id = req.params;
  if (urlDatabase[id]) {
    return res.redirect(urlDatabase[id].longURL);
  }
  return res.status(400).send("This link doesn't exist");
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
  if (!userEmail || !password || emailExist(userEmail,users)) {
    return res.status(400).send("Error fetching the infos");
  } else {
    req.session.user_id = userID;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userID] = {
      id: userID,
      email: userEmail,
      password: hashedPassword
    };
    return res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[userID]
    };
    return res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const database = { 
    email: email, 
    password: password};
  const validUser = validateLogin(database);
  if(validUser){
    req.session.user_id = validUser.id;
    res.redirect("/urls");
  } else {
    res.render('urls_login', {error: 'Login failed.'} ) ;
    return;
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});