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
    userId: generateRandomString(),
    email,
    password,
  };
  return newUser;
};

const checkForEmail = (email, database) => {
  for (let item in database) {
    if (database[item].email.toLowerCase() === email.toLowerCase()) {
      return database[item];
    }
  }
  return false;
};

const urlsForUser = (userID, database) => {
  const urls = {};

  for(let item in database) {
    if(database[item].userID === userID){
      urls[item] = database[item];
    }
  }

  return urls;
}

module.exports = { generateRandomString, generateDate, registerNewUser, checkForEmail, urlsForUser };