const { assert } = require('chai');
const getUserByEmail = require('../helpers');



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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user,expectedOutput);
  });
  it('should return undefined for non existing user', function() {
    const user = getUserByEmail("user676@example.com", testUsers);
    assert.equal(user,undefined);
  });
});
