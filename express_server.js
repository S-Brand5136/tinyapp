const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { generateDate, generateRandomString, registerNewUser, authEmail, urlsForUser, comparePasswords } = require('./helpers/helper_functions');
const app = express();
const PORT = 8080;

// MiddleWare:
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {};

const users = {};

// Requests
// GET: homepage, redirects to /urls if logged in or to login page if not
app.get('/', (req, res) => {
  const userID = req.cookies['user_id'];
  if (!userID) {
    return res.redirect('/login');
  }
  res.redirect("/urls");
});

// GET: user's homepage filters to show only their URLs
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const urls = urlsForUser(userID, urlDatabase);
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
app.post('/urls/:shortURL/delete', (req, res, next) => {
  const { shortURL } = req.params;
  const userID = req.cookies['user_id'];

  if (userID !== urlDatabase[shortURL].userID || !userID) {
    const err = new Error("Whoa! You can't delete this url, it doesn't belong to you!");
    err.status = 403;
    return next(err);
  }
  
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// GET: login page
app.get('/login', (req, res) => {
  res.render('urls_login');
});

// POST: login to tinyApp, authenticates users email and password
app.post('/login', (req, res, next) => {
  const { email, password } = (req.body);
  const user = authEmail(email, users);

  if (!user || !comparePasswords(password, users[user.userID].password)) {
    const err = new Error("Whoops! looks like you entered the wrong username or password!");
    err.status = 403;
    return next(err);
  }

  res.cookie('user_id', user.userID);
  res.redirect('/urls');
});

// GET: registration page
app.get('/register', (req, res) => {
  res.render('urls_register');
});

// POST: a request to register a new user, authenticates credentials before adding to database and redirecting
app.post('/register', (req, res, next) => {
  if (!req.body.email || !req.body.password || authEmail(req.body.email, users)) {
    const err = new Error("Whoops! Something went wrong registering you. Please try again.");
    err.status = 400;
    return next(err);
  }


  const newUser = registerNewUser(req.body);
  users[newUser.userID] = newUser;
  res.cookie('user_id', newUser.userID);
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

// GET: page for creating new ShortURLS, redirects if not logged in
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];

  if (!userID) {
    return res.redirect('/login');
  }

  const user = users[userID];
  const templateVars = { user };
  res.render('urls_new', templateVars);
});

// POST: to update an existing url, authenticates users credentials before redirecting
app.post('/urls/:shortURL', (req, res, next) => {
  const { longURL } = req.body;
  const { shortURL } = req.params;
  const userID = req.cookies['user_id'];

  if (userID !== urlDatabase[shortURL].userID || !userID) {
    const err = new Error("Whoa! You can't update this url, it doesn't belong to you!");
    err.status = 403;
    return next(err);
  }

  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
});

// GET: a URL and renders HTML page or throws error if not found / not logged in / user doesn't own the url
app.get('/urls/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  const userID = req.cookies['user_id'];
  const dbShortURL = urlDatabase[shortURL];

  if (!userID) {
    const err = new Error("Whoa! Try logging in first!");
    err.status = 403;
    return next(err);
  }

  if (!dbShortURL) {
    const err = new Error("Whoops! looks like that url can't be found!");
    err.status = 404;
    return next(err);
  }

  if (urlDatabase[shortURL].userID === userID) {
    const { longURL, numVisits, date } = dbShortURL;
    const templateVars = { shortURL, longURL, date,  numVisits, userID };
    return res.render("urls_show", templateVars);
  }

  const err = new Error("Whoa! This URL doesn't belong to you!");
  err.status = 403;
  return next(err);
});


// GET: associated LongURL in the database and redirect to its webpage
app.get('/u/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  const dbShortURL = urlDatabase[shortURL];

  if (!dbShortURL) {
    const err = new Error("Whoops! We can't find that link!");
    err.status = 404;
    next(err);
  }
  
  dbShortURL['numVisits']++;
  res.redirect(`${dbShortURL.longURL}`);
});

// Error Handler
app.use((err, req, res, next) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  res.status(err.status).render("urls_error", {error: err, user});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});