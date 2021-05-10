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

// Save shortened and long URL to database, respond with 200 + shortURL 
app.post('/urls', (req, res) => {
  const longUrl = req.body.longURL
  const shortUrl = generateRandomString()
  urlDatabase[shortUrl] = longUrl;
  res.status(200).send(shortUrl);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new")
})

app.get('/urls/:id', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: req.params.longURL};
  res.render("urls_show", templateVars);
});


app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

const generateRandomString = () => {
  return Math.random().toString(16).substring(9);
}