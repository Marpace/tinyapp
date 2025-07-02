const express = require("express");
const router = express.Router();
const {
  isAuth,
  generateRandomString,
  createUser,
  findUserByEmail,
  authenticateUser
} = require("../helpers");
const data = require("../data");
const bcrypt = require("bcryptjs");


router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //if credentials are valid, returns an authenticated user, otherwise returns null
  const authUser = authenticateUser(email, password, data.users);

  //render error page if credentials are invalid
  if (!authUser) {
    const templateVars = {errorCode: "403", errorMessage: "Invalid Credentials"};
    return res.status(403).render("error", templateVars);
  }

  req.session.user_id = authUser.id;
  res.status(200).redirect("/urls");
});

router.post("/logout", (req, res) => {

  //remove cookie with user id and redirect to login page
  req.session = null;
  res.status(200).redirect("/login");

});

router.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);


  //trims and checks if email or password fields are empty when user submits form
  //in case the "required" attribute on the html input element fails
  if (email.trim() === "" || password.trim() === "") {
    const templateVars = {
      errorCode: "400",
      errorMessage: "No email or password was entered"
    };
    return res.status(400).render("error", templateVars);
  }
  
  const foundUser = findUserByEmail(email, data.users);

  //checks if user with the email proivided already exists
  if (foundUser) {
    const templateVars = {
      errorCode: "400",
      errorMessage: "Email provided is already registered"
    };
    return res.status(400).render("error", templateVars);
  }

  //create new user once we know the information provided is valid
  const newUser = createUser({email, hashedPassword}, data.users);

  //sets new cookie with the newly created user's id
  req.session.user_id = newUser.id;
  res.status(201).redirect("/urls");
});

//route for adding a new url to the databse
router.post("/urls", isAuth, (req, res) => {
  const longURL = req.body.longURL; //get long url from form
  const urlID = generateRandomString(6);
  const userID = req.session.user_id; //get current user id from cookie
  
  const newURL = {longURL, userID};
  
  //add new url to urlDatabase
  data.urlDatabase[urlID] = newURL;
  res.status(201).redirect(`/urls/${urlID}`);
});

//route for updating urls
router.post("/urls/:id", (req, res) => {
  const id = req.params.id; //get url id
  const updatedURL = req.body.updatedURL; //get new long url from form
  const url = data.urlDatabase[id]; //get corresponding url object
  const userID = req.session.user_id; //get current user id

  //checks if url does not exist or belongs to another user
  if (!url || url.userID !== userID) {
    const templateVars = {
      errorCode: "400",
      errorMessage: "Something went wrong! could not update URL"
    };
    return res.status(400).render("error", templateVars);
  }

  if (updatedURL.trim() === "") {
    const templateVars = {
      errorCode: "400",
      errorMessage: "No url was entered, please try again"
    };
    return res.status(400).render("error", templateVars);
  }

  //replace former url with new one
  data.urlDatabase[id].longURL = updatedURL;
  
  res.status(200).redirect('/urls');
});

router.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; //get url id
  const url = data.urlDatabase[id]; //get corresponding url object
  const userID = req.session.user_id; //get current user

  //checks if url does not exist or belongs to another user
  if (!url || url.userID !== userID) {
    const templateVars = {
      errorCode: "400",
      errorMessage: "Something went wrong! could not delete URL"
    };
    return res.status(400).render("error", templateVars);
  }

  delete data.urlDatabase[id];
  
  res.status(200).redirect('/urls');
});

module.exports = router;