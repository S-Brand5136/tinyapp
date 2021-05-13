const bcrypt = require('bcrypt');

const generateRandomString = () => {
  return Math.random().toString(16).substring(9);
};

const generateDate = () => {
  const date = new Date;
  return date.toLocaleString('en-CA', { timeZone: 'America/Edmonton' });
};

const registerNewUser = ({ email, password }) => {
  if (!email || !password) {
    return null;
  }

  const newUser = {
    userID: generateRandomString(),
    email,
    password: bcrypt.hashSync(password, 10),
  };
  
  return newUser;
};

const getUserByEmail = (email, database) => {
  for (const item in database) {
    if (database[item].email === email) {
      return database[item];
    }
  }
  return undefined;
};

const urlsForUser = (userID, database) => {
  const urls = {};

  for (const item in database) {
    if (database[item].userID === userID) {
      urls[item] = database[item];
    }
  }

  return urls;
};

const comparePasswords = (password, dbPassword) => {
  return bcrypt.compare(password, dbPassword);
};

module.exports = { generateRandomString, generateDate, registerNewUser, getUserByEmail, urlsForUser, comparePasswords };