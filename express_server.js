const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { generateDate, generateRandomString } = require('./helpers/helper_functions');
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
    numVisits: 20
  },
  '9sm5xk':{
    date: '5/11/2021, 6:52:49 p.m.',
    longURL: 'http://www.google.com',
    numVisits: 12
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// GET: homepage, redirects to /urls if logged in or to login page if not
app.get('/', (req, res) => {
  res.redirect("/urls");
});

// GET: user's homepage URL shows shortened URLs
app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies['username']};
  res.render("urls_index", templateVars);
});

// POST: Add URL to datebase
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const date = generateDate();
  urlDatabase[shortURL] = {date, longURL};
  res.redirect(`/urls/${shortURL}`);
});

// POST: Delete a url from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// POST: login to tinyApp only takes in username
app.post('/login', (req, res) => {
  const { username } = (req.body);
  res.cookie('username', username);
  res.redirect('/urls');
});

// GET: serves the html for the register page
app.get('/register', (req, res) => {
  res.render('urls_register');
});

// POST: a request to register a new user
app.post('/register', (req, res) => {
  
});

// POST: Logout and remove cookie
app.post('/logout', (req, res) => {
  res.clearCookie('username', {path: "/"});
  res.redirect('/urls');
});

// GET: Shows the database in json form
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// GET: Route for creating new tinyURLs
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('urls_new', templateVars);
});

// POST: to update an existing url
app.post('/urls/:shortURL', (req, res) => {
  const { longURL } = req.body;
  const { shortURL } = req.params;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

// GET: a URL and renders HTML page or throws error if not found
app.get('/urls/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  if (!urlDatabase[shortURL]) {
    next();
  }
  const { longURL, numVisits, date } = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL, date,  numVisits, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});


// GET: associated LongURL in the database and redirect to its webpage
app.get('/u/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  const tinyURL = urlDatabase[shortURL];
  if (!tinyURL) {
    next();
  }
  tinyURL['numVisits']++;
  res.redirect(`${tinyURL.longURL}`);
});

// Error Handler middleware
app.use((req, res) => {
  res.status(404).render("urls_notFound", {error: '404 Page Not Found', username: req.cookies["username"]});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});