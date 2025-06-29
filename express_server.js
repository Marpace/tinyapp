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
const bcrypt = require("bcryptjs")


//set view engine to ejs
app.set("view engine", "ejs");

/////////////////////// MIDDLEWARE ///////////////////////////

const isAuth = (req, res, next) => {
  const id = req.session.user_id; 

  if(!id || !data.users[id]) {
    return res.redirect("/login");
  }

  next();
}

//parse form data
app.use(express.urlencoded({ extended: true }));


app.use(cookieSession({
  name: 'session',
  signed: false,
}));

/////////////////////// GET ROUTES ///////////////////////////

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const loggedIn = data.users[userId] ? true : false;
  const urls = urlsForUser(userId, data.urlDatabase);
  const user = data.users[userId]

  const templateVars = { 
    urls, 
    user, 
    loggedIn
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", isAuth, (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: data.users[userId]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", isAuth, (req, res) => {
  const userID = req.session.user_id;
  const url = data.urlDatabase[req.params.id];

  if(url.userID !== userID) {
    const templateVars = {errorCode: "401", errorMessage: "The URL you are trying to access, belongs to another user"}
    return res.status(401).render("error", templateVars)
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

  if (!longURL) {
    const templateVars = {
      errorCode: "404",
      errorMessage: "Not found"
    };
    return res.status(404).render("error", templateVars);
  }
  
  res.status(301).redirect(longURL);
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: data.users[userId]};

  //check if user is already logged in and redirect to /urls
  if(userId && data.users[userId]) {
    return res.redirect("/urls");
  }

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: data.users[userId]};

  //check if user is already logged in and redirect to /urls
  if(userId && data.users[userId]) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

/////////////////////// POST ROUTES ///////////////////////////

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //if credentials are valid, returns an authenticated user, otherwise returns null
  const authUser = authenticateUser(email, password, data.users);

  if (!authUser) {
    const templateVars = {errorCode: "403", errorMessage: "Invalid Credentials"};
    return res.status(403).render("error", templateVars);
  }
  req.session.user_id = authUser.id
  res.status(200).redirect("/urls");
});

app.post("/logout", (req, res) => {
  //remove cookie with user id
  req.session = null
  res.status(200).redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);


  //trims and checks if email or password fields are empty when user submits form
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

  const newUser = createUser({email, hashedPassword}, data.users);

  //sets new cookie with the newly created user's id
  req.session.user_id = newUser.id
  res.status(201).redirect("/urls");
});

//route for adding a new url to the databse
app.post("/urls", isAuth, (req, res) => {
  const longURL = req.body.longURL;
  const urlID = generateRandomString(6);
  const userID = req.session.user_id;

  const newURL = {longURL, userID}


  data.urlDatabase[urlID] = newURL;
  res.status(201).redirect(`/urls/${urlID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const url = data.urlDatabase[id]
  const userID = req.session.user_id;

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

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body.updatedURL;
  const url = data.urlDatabase[id]
  const userID = req.session.user_id;

  if (!url || url.userID !== userID) {
    const templateVars = {
      errorCode: "400",
      errorMessage: "Something went wrong! could not update URL"
    };
    return res.status(400).render("error", templateVars);
  } 

  data.urlDatabase[id].longURL = updatedURL;
  res.status(200).redirect('/urls');
});


//////////////////// START SERVER ///////////////////////////

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

