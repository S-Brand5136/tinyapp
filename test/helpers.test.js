const { assert } = require('chai');

const { getUserByEmail } = require('../helpers/helpers');

const testUsers = {
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
};

describe('#getUserByEmail', () => {
  
  it('should return a user with a valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = 'userRandomID';
    assert.equal(user.id, expectedOutput);
  });

  it('should return undefined if an invalid email is used', () => {
    const user = getUserByEmail('user3@example.ca', testUsers);
    const expectedOutput = undefined
    assert.equal(user, expectedOutput)
  });

  it('should return undefined if an empty string is used', () => {
    const user = getUserByEmail('', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

});