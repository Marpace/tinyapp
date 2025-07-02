const { assert } = require('chai');

const { findUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "test@test.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "[email protected]",
    password: "dishwasher-funk"
  }
};


const testUrls = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  jrgd3: {
    longURL: "https://www.facebook.ca",
    userID: "test1",
  },
  vju7r: {
    longURL: "https://www.example.ca",
    userID: "aJ48lW",
  },
  hgst4: {
    longURL: "https://www.instagram.ca",
    userID: "test1",
  },
  e46hf: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "test1",
  },
};



describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = findUserByEmail("test@test.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined when the email passed does not exist', function() {
    const user = findUserByEmail("doesnot@exist.com", testUsers);
    assert.equal(user, undefined);
  });

});

describe('urlsForUser', function() {

  it("should return an array of url objects matching the user id", function() {
    const userUrls = urlsForUser("test1", testUrls);
    assert.deepEqual(userUrls, {
      jrgd3: {longURL: "https://www.facebook.ca", userID: "test1"},
      hgst4: {longURL: "https://www.instagram.ca", userID: "test1"},
      e46hf: {longURL: "https://www.lighthouselabs.ca", userID: "test1",}
    });
  });

  it("should return an empty array if user id does not match any items in database", function() {
    assert.deepEqual(urlsForUser("test2", testUrls), {});
  });

});