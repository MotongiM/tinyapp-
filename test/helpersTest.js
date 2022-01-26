const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
      assert.equal(user, expectedUserID);
  });
  
    it('should return undefined if email not in database', function() {
      const user = getUserByEmail("baboo123@gmail.com", testUsers);
      const expectedOutput = undefined;
      assert.equal(user, expectedOutput);
    });
});