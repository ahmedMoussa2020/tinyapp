const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};




const usersDb = {
  eb849b1f: {
    id: 'eb849b1f',
    name: 'ahmed',
    email: 'ahmed@live.se',
    password: '1234',
  },
  '1dc937ec': {
    id: '1dc937ec',
    name: 'said',
    email: 'said@live.com',
    password: 'meatlover',
  },
};


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("register", templateVars);

})


app.get('/users.json', (req, res) => {
  res.json(usersDb);
});


app.post('/register', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;


  for (let userId in usersDb) {
    const user = usersDb[userId];

    if (user.email === email){
      res.status(403).send('Sorry hoddy its taken');
      return;
    }
  }


  const userId = Math.random().toString(36).substr(2,8);

  const newUser = {
    id: userId,
    name,
    email,
    password,
  };

  usersDb[userId] = newUser;



  res.cookie('user_id', userId);


  res.redirect('/index');





});


app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls')
});

app.get('/', (req, res) => {
  res.cookie('Username', username)
})





app.get('/login', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("login", templateVars);
  
})

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect('/urls');
})









app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});





app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_index', templateVars);
});

app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  console.log(req.body);
  console.log(req.body.newLongURL);
  let newLongURL = req.body.newLongURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});


app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]
  res.redirect('/urls')
});


app.post('/urls', (req, res) => {
  console.log(req.body)
  let urlShort = generateRandomString();
  let urlLong = req.body.longURL;
  urlDatabase[urlShort] = urlLong;
  res.redirect(`/urls/${urlShort}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render('urls_new', templateVars);
});



app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});




function generateRandomString() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    let aCode = Math.floor(Math.random() * 32) + 56;
    randomString += String.fromCharCode(aCode);
  }
  return randomString;
}

app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL]
  const templateVars = { shortURL, longURL, username: req.cookies["username"] };
  res.render('urls_show', templateVars);
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