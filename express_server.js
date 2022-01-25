const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers.js');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { redirect } = require('express/lib/response');

// Databases

const usersDB = {
  'eb849b1f': {
    id: 'eb849b1f',
    name: 'ahmed',
    email: 'ahmed@live.se',
    password: '1234',
  },
  '1dc937ec': {
    id: '1dc937ec',
    name: 'said',
    email: 'said@live.com',
    password: '1234',
  },
};

const urlsDB = {
  'b2xVn2@': {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'eb849b1f'
  },
  '9sm5xK@': {
    longURL: "http://www.google.com",
    userID: '1dc937ec'
  }
};

//Middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`🚀 Server ready => http://localhost:${PORT} !`);
});


//Get routes
app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('login', templateVars);
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
    const user = usersDB[userId];
    const urls = urlsForUser(userId, urlsDB);
    const templateVars = { urls: urls, user: user };
    res.render('urls_index', templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: usersDB[req.session.user_id] }
    res.render('urls_new', templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get('/urls/:shortURL', (req, res) => {
  if (!req.session.user_id) {
    res.send("You are not loged in please login.");
  } else if (!Object.keys(urlsDB).includes(req.params.shortURL)) {
    res.send("Please enter a valid short url.");
  } else if (Object.keys(urlsForUser(req.session.user_id, urlsDB)).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    const longURL = urlsDB[shortURL]["longURL"];
    const templateVars = { shortURL, longURL, user: usersDB[req.session.user_id] };
    res.render('urls_show', templateVars);
  } else {
    res.send("This short url is not yours.");
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortUrl = req.params.shortURL;
  if (urlsDB[shortUrl]) {
    const longUrl = urlsDB[shortUrl].longURL;
    res.redirect(longUrl);
  } else {
    return res.send(400, "This short url does not exist!");
  };
});




app.get('/register', (req, res) => {
  const userId = req.session.user_id;

  const user = usersDB[userId];
  const templateVars = {
    user: user
  };
  
  res.render("register", templateVars);
});

//redirects to long url when given shortURl

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.send(400, "you need to pass an email and password!");
  };

  const user = getUserByEmail(email, usersDB);
  
  if (!user) {
    return res.send(400, "User does not exist")
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);
  
  if (!passwordMatch) {
    return res.send(400, "Password does not match.")
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});


app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Post routes

app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    const urlShort = generateRandomString();
    const urlLong = req.body.longURL;
    urlsDB[urlShort] = { longURL: urlLong, userID: req.session.user_id };
    res.redirect(`/urls/${urlShort}`);
  } else {
    res.redirect("/urls");
  }
});

//deletes a shortURl object from urlDatabase

app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) {
    res.send("You are not loged in please login.");
  } else {
    const shortURL = req.params.shortURL;
    
    if (urlsDB[shortURL].userID === req.session.user_id) {
      delete urlsDB[shortURL];
      res.redirect('/urls');
    } else {
      res.send("This short url is not yours.");
    }
  }
});

app.post('/urls/:shortURL', (req, res) => {
  if (!req.session.user_id) {
    res.send("You are not logged in please login.");
  } else if (!Object.keys(urlsDB).includes(req.params.shortURL)) {
    res.send("Please enter a valid short url.");
  } else if (Object.keys(urlsForUser(req.session.user_id, urlsDB)).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlsDB[shortURL] = { longURL: longURL, userID: req.session.user_id };

    res.redirect("/urls");
  } else {
    res.send("This short url is not yours.");
  }
});

// updates users object if email and password aren't empty strings, and email doesn't already exist in users object

app.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.send(400, "you need to pass an email and password and name!");
  };

  const emailExist = getUserByEmail(email, usersDB);
  
  if (emailExist) {
    return res.send(400, "Sorry this email alredy exist");
  }

  const userId = Math.random().toString(36).substr(2, 8);
  const hashedPassword = bcrypt.hashSync(password, 10);

  usersDB[userId] = {
    id: userId,
    name,
    email,
    password: hashedPassword,
  };
  
  req.session.user_id = userId;
  res.redirect('/urls');
});