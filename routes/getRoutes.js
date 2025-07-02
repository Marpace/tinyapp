const express = require("express");
const router = express.Router();
const {isAuth, urlsForUser} = require("../helpers");
const data = require("../data");


router.get("/urls", (req, res) => {
  const userId = req.session.user_id; //get user id from cookie (if any)
  const urls = urlsForUser(userId, data.urlDatabase); // get urls for that specific user
  const urlKeys = Object.keys(urls); //keys array to access the length of urls in the ejs template
  const user = data.users[userId]; // get user object
  const loggedIn = data.users[userId] ? true : false; //boolean to determine logged in or not
 
  const templateVars = {
    urls,
    urlKeys,
    user,
    loggedIn
  };
  
  res.render("urls_index", templateVars);
});

//route protected by "isAuth" middleware
router.get("/urls/new", isAuth, (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: data.users[userId]};
  res.render("urls_new", templateVars);
});

//route protected by "isAuth" middleware
router.get("/urls/:id", isAuth, (req, res) => {
  const userID = req.session.user_id;
  const url = data.urlDatabase[req.params.id];

  //render error page if url does not belong to the logged user
  if (url.userID !== userID) {
    const templateVars = {errorCode: "401", errorMessage: "The URL you are trying to access, belongs to another user"};
    return res.status(401).render("error", templateVars);
  }

  const templateVars = {
    id: req.params.id,
    longURL: data.urlDatabase[req.params.id].longURL,
    user: data.users[userID]
  };

  res.render("urls_show", templateVars);
});

router.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = data.urlDatabase[id].longURL;

  //render error page if long url is not found
  if (!longURL) {
    const templateVars = {
      errorCode: "404",
      errorMessage: "Not found"
    };
    return res.status(404).render("error", templateVars);
  }
  
  res.status(200).redirect(longURL);
});

router.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: data.users[userId]};

  //check if user is already logged in and redirect to /urls
  if (userId && data.users[userId]) {
    return res.redirect("/urls");
  }
  
  //passing templateVars so _header template renders correctly
  res.render("register", templateVars);
});

router.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: data.users[userId]};

  //check if user is already logged in and redirect to /urls
  if (userId && data.users[userId]) {
    return res.redirect("/urls");
  }

  //passing templateVars so _header template renders correctly
  res.render("login", templateVars);
});

module.exports = router;