const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': {date: '2021-05-11, 6:52:52 p.m.',
    longURL: 'http://www.lighthouselabs.ca',
  },
  '9sm5xk':{date: '2021-05-11, 6:52:49 p.m.',
    longURL: 'http://www.google.com',
  }
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

// homepage URL shows shortened URLs
app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies['username']};
  res.render("urls_index", templateVars);
});

// Save shortened and long URL to database, redirects
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Delete a url from the database
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

// POST: Logout and remove cookie
app.post('/logout', (req, res) => {
  res.clearCookie('username', {path: "/"});
  res.redirect('/urls');
});

// Shows the database in json form
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Route for creating new tinyURLs
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// route: POST to update an existing url
app.post('/urls/:shortURL', (req, res) => {
  const { longURL } = req.body;
  const { shortURL } = req.params;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

// Checks the database for a URL and renders HTML page or throws error if not found
app.get('/urls/:shortURL', (req, res, next) => {
  const { shortURL } = req.params;
  const tinyURL = urlDatabase[shortURL];
  if (!tinyURL) {
    next();
  }
  const templateVars = { shortURL, longURL: tinyURL.longURL, date: tinyURL.date, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});


// Redirects to associated LongURL in the database
app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  res.redirect(`${longURL}`);
});

// Error Handler middleware
app.use((req, res) => {
  res.status(404).render("urls_notFound", {error: '404 Page Not Found', username: req.cookies["username"]});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

const generateRandomString = () => {
  return Math.random().toString(16).substring(9);
};

const generateDate = () => {
  const date = new Date;
  return date.toLocaleString();
};