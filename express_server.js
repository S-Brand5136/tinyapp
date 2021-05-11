const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com',
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

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

app.get("/urls/new", (req, res) => {
  res.render("urls_new")
})

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  if(!templateVars.longURL) {
    const err = new Error('404 Not Found')
    err.status = 404;
    throw err
  }
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  res.redirect(`${longURL}`);
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.use((err, req, res, next) => {
  if(err.status === 404) {
    res.status(err.status).render("urls_notFound", {error: err.message});
  } else {
    res.status(500).render("urls_notFound", {error: "Uh oh! Something went wrong internally"})
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

const generateRandomString = () => {
  return Math.random().toString(16).substring(9);
}