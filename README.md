# TinyApp

  **TinyApp** is a *fullstack* web app that is built with Node and Express 😎. It allows users to shorten long URL links (à la bit.ly). It was made during my third week of the web dev bootcamp at [Lighthouse Labs](https://www.lighthouselabs.ca/).

### Table of Contents
1. [Dependencies](#dependencies)
2. [Final Product](#final)
3. [Installation](#installation)
4. [Tests](#tests)
5. [How to](#howto)

## Dependencies used <a name="dependencies"></a>

  - [Node.js]('https://nodejs.org/en/')
  - [Express]('https://expressjs.com/')
  - [Morgan]('http://expressjs.com/en/resources/middleware/morgan.html')
  - [Bodyparser]('http://expressjs.com/en/resources/middleware/body-parser.html) 
  - [Cookie-session]('http://expressjs.com/en/resources/middleware/cookie-session.html')
  - [Method-ovverride]('http://expressjs.com/en/resources/middleware/method-override.html')
  - [Bcrypt]('https://www.npmjs.com/package/bcryptjs')
  - [Ejs]('https://ejs.co/')
  - [Bootstrap]('https://getbootstrap.com/')

## Dev Dependencies used

  - [Chai]('https://www.chaijs.com/')
  - [Mocha]('https://mochajs.org/')
  - [Nodemon]('https://www.npmjs.com/package/nodemon')

## Final Product <a name="final"></a>

#### User Home Page
!["Image of main user homepage"](https://github.com/S-Brand5136/tinyapp/blob/master/docs/tinyApp_urls.png)

#### Login User Page 
!["Image of login page"](https://github.com/S-Brand5136/tinyapp/blob/master/docs/tinyApp_login.png)

#### Register User Page
!["Image of register page"](https://github.com/S-Brand5136/tinyapp/blob/master/docs/tinyApp_register.png)

## Installation <a name="installation"></a>

If you're a programming wizard🧙‍♂️ its as simple as just cloning the repository and installing the dependencies. However if you're not a wizard, follow the instructions below for code snippets on how to install the project on your machine.

  - first clone the repository
  ```bash
    $ git clone https://github.com/S-Brand5136/tinyapp.git
  ```
  - Open the project and run npm install in the root directory to download all the dependencies used
  ```bash
    $ npm install
  ```
  - Run npm start to start the server locally on port 8080 and then open your browser to [http://localhost:8080/](http://localhost:8080/)
  ```bash
    $ npm start
  ```
## Tests <a name="tests"></a>

Testing was done using *Mocha* for the framework and *Chai* for assertions. If your interested in checking them out install the devDependencies 

```bash
  $ npm i --save-dev
```
To run the tests just run the npm script in your terminal

```bash
  $ npm test
```

## How to use <a name='howto'></a>

To start using the project after downloading and installing all the dependencies.
  
Register a new user at /register. You should then be redirected to the user hompage.
From there you can start creating shortened URLS with the link in the navbar *Create new Url*.

To try out a shortened URL, in your browser of choice (Should be mozilla, but no judgement here) enter the address localhost:8080/u/<!*SHORT-URL-HERE*!> 