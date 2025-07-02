const express = require("express");
const app = express();
const PORT = 8080;
const {
  generateRandomString,
  createUser,
  findUserByEmail,
  authenticateUser,
  urlsForUser
} = require("./helpers");
const cookieSession = require("cookie-session");
const data = require("./data");
const bcrypt = require("bcryptjs");


//set view engine to ejs
app.set("view engine", "ejs");

/////////////////////// MIDDLEWARE ///////////////////////////

const isAuth = (req, res, next) => {
  const id = req.session.user_id;

  if (!id || !data.users[id]) {
    return res.redirect("/login");
  }

  next();
};

//parse form data
app.use(express.urlencoded({ extended: true }));

//used for encoding cookies
app.use(cookieSession({
  name: 'session',
  signed: false
}));

/////////////////////// GET ROUTES ///////////////////////////

app.get("/urls", (req, res) => {
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
app.get("/urls/new", isAuth, (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: data.users[userId]};
  res.render("urls_new", templateVars);
});

//route protected by "isAuth" middleware
app.get("/urls/:id", isAuth, (req, res) => {
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

app.get("/u/:id", (req, res) => {
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

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: data.users[userId]};

  //check if user is already logged in and redirect to /urls
  if (userId && data.users[userId]) {
    return res.redirect("/urls");
  }
  
  //passing templateVars so _header template renders correctly
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: data.users[userId]};

  //check if user is already logged in and redirect to /urls
  if (userId && data.users[userId]) {
    return res.redirect("/urls");
  }

  //passing templateVars so _header template renders correctly
  res.render("login", templateVars);
});

/////////////////////// POST ROUTES ///////////////////////////

app.post("/login", (req, res) => {
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

app.post("/logout", (req, res) => {

  //remove cookie with user id and redirect to login page
  req.session = null;
  res.status(200).redirect("/login");

});

app.post("/register", (req, res) => {
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
app.post("/urls", isAuth, (req, res) => {
  const longURL = req.body.longURL; //get long url from form
  const urlID = generateRandomString(6);
  const userID = req.session.user_id; //get current user id from cookie

  const newURL = {longURL, userID};

  //add new url to urlDatabase
  data.urlDatabase[urlID] = newURL;
  res.status(201).redirect(`/urls/${urlID}`);
});

app.post("/urls/:id", (req, res) => {
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

  if(updatedURL.trim() === "") {
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

app.post("/urls/:id/delete", (req, res) => {
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



//////////////////// START SERVER ///////////////////////////

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

