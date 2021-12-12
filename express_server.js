const { getUserByEmail } = require('./helpers.js');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

//app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ 
name: 'session',
keys: ['key1', 'key2']
  
}));
 
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// const getUserByEmail = (email, db) => {
//   for (let userId in db) {
//     const user = db[userId]; // => retrieve the value

//     if (user.email === email) {
//       return user;
//     }
//   }

//   return false;
// };

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
    password: '1234',
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});


app.get('/urls/new', (req, res) => {
  const templateVars = {user: req.session.user_id}
  res.render('urls_new', templateVars);
});


app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL]
  const templateVars = { shortURL, longURL, user: req.session.user_id
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const userId = req.session.user_id

  const user = usersDb[userId]
  const templateVars = {
    user: user
    
    // ... any other vars
  };
  res.render("register", templateVars);

})

// app.get('/quoteList', (req, res) => {
//   const quoteList = Object.values(movieQuotesDb);
//   const templateVars = { quotesArr: quoteList};

//   res.render('quotes', templateVars);
// });


app.get('/users.json', (req, res) => {
  res.json(usersDb);
});


app.post('/register', (req, res) => {

  const {email, password, name} = req.body;
  if(!email || !password || !name) {
    return res.send(400, "you need to pass an email and password and name!")
  };
  
  const emailExist = getUserByEmail(email, usersDb);
  if(emailExist) {
    return res.send(400, "Sorry this email alredy exist")
  }

  const userId = Math.random().toString(36).substr(2, 8);
  const hashedPassword = bcrypt.hashSync(password, 10);

  usersDb[userId] = {
    id: userId,
    name,
    email,
    password: hashedPassword,
  };
  //set the cookie here
  // res.cookie('user_id', userId);
  req.session.user_id = userId;
  res.redirect('/urls');

});

app.post('/login', (req, res) =>{

  // const email = req.body.email;
  // const password = req.body.password;
  const {email, password} = req.body;
  if(!email || !password) {
    return res.send(400, "you need to pass an email and password!")
  };

  const user = getUserByEmail(email, usersDb);
  if(!user) {
    return res.send(400, "User does not exist")
  } 

  const passwordMatch = bcrypt.compareSync(password, user.password);
    if(!passwordMatch) {
      return res.send(400, "Password does not match.")
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});


app.post('/logout', (req, res) => {
  // res.clearCookie("user_id");
  req.session = null
  // console.log('req.session', req.session);
  res.redirect('/urls');
});

app.get('/', (req, res) => {
  res.cookie('Username', username)
});



app.get('/login', (req, res) => {
  const templateVars = {user: null};

  res.render('login', templateVars)
});



// app.get('/login', (req, res) => {
//   const templateVars = {
//     username: req.cookies["username"],
//     // ... any other vars
//   };
//   res.render("login", templateVars);
  
// });

// app.post('/login', (req, res) => {
//   const username = req.body.username;
//   res.cookie("username", username);
//   res.redirect('/urls');
// });


app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});




app.get('/urls', (req, res) => {
  // console.log('req.session,', req.session);
  const userId = req.session.user_id
  const user = usersDb[userId]
  const templateVars = { urls: urlDatabase, user: user};
  console.log('templateVars', templateVars);
  
  if(!user){
    
    return res.redirect('/login');
  }
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



// app.get('/urls/new', (req, res) => {
//   res.render('urls_new');
// });




function generateRandomString() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    let aCode = Math.floor(Math.random() * 32) + 56;
    randomString += String.fromCharCode(aCode);
  }
  return randomString;
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

