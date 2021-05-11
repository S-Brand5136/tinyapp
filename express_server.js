const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com',
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

// homepage URL shows shortened URLs
app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
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
  const { shortURL } = req.params
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

// Shows the database in json form
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Route for creating new tinyURLs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// route: POST to update an existing url
app.post('/urls/:shortURL', (req, res) => {
  const { longURL } = req.body;
  const { shortURL } = req.params;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
})

// Checks the database for a URL and renders HTML page or throws error if not found
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  if (!templateVars.longURL) {
    const err = new Error('404 Not Found');
    err.status = 404;
    throw err;
  }
  res.render("urls_show", templateVars);
});


// Redirects to associated LongURL in the database
app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  res.redirect(`${longURL}`);
});

// Error Handler middleware
app.use((req, res, next) => {
  res.status(404).render("urls_notFound", {error: '404 Page Not Found'});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

const generateRandomString = () => {
  return Math.random().toString(16).substring(9);
};