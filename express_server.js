const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { generateDate, generateRandomString, registerNewUser, checkForEmail, urlsForUser, checkUsersUrls } = require('./helpers/helper_functions');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': {
    date: '5/11/2021, 6:52:52 p.m.',
    longURL: 'http://www.lighthouselabs.ca',
    numVisits: 20,
    userID: "a94m6h"
  },
  '9sm5xk':{
    date: '5/11/2021, 6:52:49 p.m.',
    longURL: 'http://www.google.com',
    numVisits: 12,
    userID: "a94m6h"
  }
};

const users = {
  "a94m6h": {
    id: "a94m6h",
    email: "user@example.com",
    password: "12345"
  },
  "js73md": {
    id: "js73md",
    email: "user2@example.com",
    password: "12345"
  }
};

// GET: homepage, redirects to /urls if logged in or to login page if not
app.get('/', (req, res) => {
  const userid = req.cookies['user_id'];
  if(!userid) {
    res.redirect('/login');
  } 
  res.redirect("/urls");
});

// GET: user's homepage URL shows shortened URLs
app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const urls = urlsForUser(userId, urlDatabase)
  const templateVars = {urls, user};
  res.render("urls_index", templateVars);
});

// POST: Add URL to datebase
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.cookies['user_id'];
  const shortURL = generateRandomString();
  const date = generateDate();
  urlDatabase[shortURL] = {date, longURL, userID, numVisits: 0 };
  res.redirect(`/urls/${shortURL}`);
});

// POST: Delete a url from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  res.render('urls_login');
});

// POST: login to tinyApp only takes in username
app.post('/login', (req, res, next) => {
  const { email, password } = (req.body);
  const existingUser = checkForEmail(email, users);

  if (!existingUser || existingUser.password !== password) {
    const err = new Error("Whoops! looks like you entered the wrong username or password!");
    err.status = 403;
    return next(err);
  }

  res.cookie('user_id', existingUser.id);
  res.redirect('/urls');
});

// GET: the html for the register page
app.get('/register', (req, res) => {
  res.render('urls_register');
});

// POST: a request to register a new user
app.post('/register', (req, res, next) => {
  if (!req.body.email || !req.body.password || checkForEmail(req.body.email, users)) {
    const err = new Error("Whoops! Something went wrong registering you. Please try again.");
    err.status = 400;
    return next(err);
  }
  const newUser = registerNewUser(req.body);
  users[newUser.userId] = newUser;
  res.cookie('user_id', newUser.userId);
  res.redirect('/urls');
});

// POST: to Logout and remove cookie
app.post('/logout', (req, res) => {
  res.clearCookie('user_id', {path: "/"});
  res.redirect('/urls');
});

// GET: database in json form
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// GET: Route for creating new tinyURLs
app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  if(!userId){
    res.redirect('/login');
  }
  const user = users[userId];
  const templateVars = { user };
  res.render('urls_new', templateVars);
});

// POST: to update an existing url
app.post('/urls/:shortURL', (req, res) => {
  const { longURL } = req.body;
  const { shortURL } = req.params;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

// GET: a URL and renders HTML page or throws error if not found / not logged in / user doesn't own the url
app.get('/urls/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  const userID = req.cookies['user_id'];
  const tinyURL = urlDatabase[shortURL];

  if(!userID) {
    const err = new Error("Whoa! Try logging in first!");
    err.status = 403;
    return next(err);
  }

  if (!tinyURL) {
    const err = new Error("Whoops! looks like that url can't be found!");
    err.status = 404;
   return next(err);
  }

  if(urlDatabase[shortURL].userID === userID) {
    const { longURL, numVisits, date } = tinyURL;
    const userId = req.cookies['user_id'];
    const user = users[userId];
    const templateVars = { shortURL, longURL, date,  numVisits, user };
    return res.render("urls_show", templateVars); 
  }

  const err = new Error("Whoa! This URL doesn't belong to you!");
  err.status = 403;
  return next(err);
});


// GET: associated LongURL in the database and redirect to its webpage
app.get('/u/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  const tinyURL = urlDatabase[shortURL];
  if (!tinyURL) {
    const err = new Error("Whoops! We can't find that link!");
    err.status = 404;
    next(err);
  }
  tinyURL['numVisits']++;
  res.redirect(`${tinyURL.longURL}`);
});

// Error Handler middleware
app.use((err, req, res, next) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  res.status(err.status).render("urls_notFound", {error: err, user});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});