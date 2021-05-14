const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const {
  generateDate,
  generateRandomString,
  registerNewUser,
  getUserByEmail,
  urlsForUser,
  comparePasswords,
} = require('./helpers/helpers');
const app = express();
const PORT = 8080;

// *** MIDDLEWARE ***
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({ name: 'session', keys: ['abc123'] }));
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');

// *** DATEBASE **
const urlDatabase = {};
const users = {};

// *** Requests ***
// GET: homepage, redirects to /urls if logged in or to login page if not
// PUBLIC
app.get('/', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

// GET: user's homepage filters to show only their URLs
// PRIVATE
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;

  const user = users[userID];
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls, user };
  res.render('urls_index', templateVars);
});

// POST: Add URL to datebase
// PRIVATE
app.post('/urls', (req, res, next) => {
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  if (!userID) {
    const err = new Error('Whoa! You have to login first!');
    err.status = 403;
    return next(err);
  }

  const shortURL = generateRandomString();
  const date = generateDate();
  urlDatabase[shortURL] = { date, longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

// DELETE: a url from the database
// PRIVATE
app.delete('/urls/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  const userID = req.session.user_id;

  if (!userID || userID !== urlDatabase[shortURL].userID) {
    const err = new Error(
      "Whoa! This URL doesn't belong to you! Login first or double check your URLs!"
    );
    err.status = 403;
    return next(err);
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// GET: login page
// PUBLIC
app.get('/login', (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.render('urls_login');
  }

  res.redirect('/urls');
});

// POST: login to tinyApp, authenticates users email and password
// PUBLIC
app.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user || !comparePasswords(password, users[user.userID].password)) {
    const err = new Error(
      'Whoops! looks like you entered the wrong username or password!'
    );
    err.status = 403;
    return next(err);
  }

  req.session.user_id = user.userID;
  res.redirect('/urls');
});

// GET: registration page
// PUBLIC
app.get('/register', (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.render('urls_register');
  }

  res.redirect('/urls');
});

// POST: a request to register a new user, authenticates credentials before adding to database and redirecting
// PUBLIC
app.post('/register', (req, res, next) => {
  if (!req.body.email || !req.body.password || getUserByEmail(req.body.email, users)) {
    const err = new Error(
      'Whoa! Something went wrong registering you. Please try again.'
    );
    err.status = 400;
    return next(err);
  }

  const newUser = registerNewUser(req.body);
  users[newUser.userID] = newUser;
  req.session.user_id = newUser.userID;
  res.redirect('/urls');
});

// POST: to Logout and remove cookie
// PRIVATE
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// GET: page for creating new ShortURLS, redirects if not logged in
// PRIVATE
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.redirect('/login');
  }

  const user = users[userID];
  const templateVars = { user };
  res.render('urls_new', templateVars);
});

// PUT: update an existing url, authenticates users credentials before redirecting
// PRIVATE
app.put('/urls/:shortURL', (req, res, next) => {
  const { longURL } = req.body;
  const { shortURL } = req.params;
  const userID = req.session.user_id;

  if (userID !== urlDatabase[shortURL].userID || !userID) {
    const err = new Error(
      "Whoa! This URL doesn't belong to you! Login first or double check your URLs!"
    );
    err.status = 403;
    return next(err);
  }

  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
});

// GET: a URL and renders HTML page or throws error if not found / not logged in / user doesn't own the url
// PRIVATE
app.get('/urls/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  const userID = req.session.user_id;
  const user = users[userID];
  const dbShortURL = urlDatabase[shortURL];

  if (!dbShortURL) {
    const err = new Error("Whoops! looks like that url can't be found!");
    err.status = 404;
    return next(err);
  }

  if (dbShortURL.userID === user.userID) {
    const { longURL, date } = dbShortURL;
    const templateVars = { shortURL, longURL, date, user };
    return res.render('urls_show', templateVars);
  }

  const err = new Error(
    "Whoa! This URL doesn't belong to you! Login first or double check your URLs!"
  );
  err.status = 403;
  return next(err);
});


// GET: associated LongURL in the database and redirect to its webpage
// PUBLIC
app.get('/u/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  const dbShortURL = urlDatabase[shortURL];

  if (!dbShortURL) {
    const err = new Error("Whoops! We can't find that link!");
    err.status = 404;
    next(err);
  }
  res.redirect(`${dbShortURL.longURL}`);
});

// **Error Handler**
app.use((err, req, res, next) => {
  const userID = req.session.user_id;
  const user = users[userID];
  res.status(err.status).render('urls_error', { error: err, user });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});