const express = require("express");
const app = express();
const PORT = 8080;
const {
  generateRandomString,
  createUser,
  findUserByEmail,
  authenticateUser,
  urlsForUser
} = require("./utils");
const cookieParser = require("cookie-parser");
const users = require("./data");


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//set view engine to ejs
app.set("view engine", "ejs");

/////////////////////// MIDDLEWARE ///////////////////////////

const isAuth = (req, res, next) => {
  const id = req.cookies["user_id"]; 

  if(!id || !users[id]) {
    return res.redirect("/login");
  }

  next();
}

//parse form data
app.use(express.urlencoded({ extended: true }));

//parse cookies
app.use(cookieParser());

/////////////////////// GET ROUTES ///////////////////////////

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedIn = users[userId] ? true : false;
  const urls = urlsForUser(userId, urlDatabase);
  const user = users[userId]

  console.log(urlDatabase)

  const templateVars = { 
    urls, 
    user, 
    loggedIn
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", isAuth, (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {user: users[userId]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", isAuth, (req, res) => {
  const userID = req.cookies['user_id'];
  const url = urlDatabase[req.params.id];

  if(url.userID !== userID) {
    const templateVars = {errorCode: "401", errorMessage: "The URL you are trying to access, belongs to another user"}
    return res.status(401).render("error", templateVars)
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userId]
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

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
  const userId = req.cookies['user_id'];
  const templateVars = {user: users[userId]};

  //check if user is already logged in and redirect to /urls
  if(userId && users[userId]) {
    return res.redirect("/urls");
  }

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {user: users[userId]};

  //check if user is already logged in and redirect to /urls
  if(userId && users[userId]) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

/////////////////////// POST ROUTES ///////////////////////////

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //if credentials are valid, returns an authenticated user, otherwise returns null
  const authUser = authenticateUser(email, password, users);

  if (!authUser) {
    const templateVars = {errorCode: "403", errorMessage: "Invalid Credentials"};
    return res.status(403).render("error", templateVars);
  }

  res.status(200).cookie("user_id", authUser.id).redirect("/urls");
});

app.post("/logout", (req, res) => {
  //remove cookie with user id
  res.status(200).clearCookie("user_id").redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;


  //checks if email or password fields are empty when user submits form
  if (email === "" || password === "") {
    const templateVars = {
      errorCode: "400",
      errorMessage: "No email or password was entered"
    };
    return res.status(400).render("error", templateVars);
  }
  
  const foundUser = findUserByEmail(email, users);

  //checks if user with the email proivided already exists
  if (foundUser) {
    const templateVars = {
      errorCode: "400",
      errorMessage: "Email provided is already registered"
    };
    return res.status(400).render("error", templateVars);
  }

  const newUser = createUser({email, password}, users);

  //sets new cookie with the newly created user's id
  res.status(201).cookie("user_id", newUser.id).redirect("/urls");
});


app.post("/urls", isAuth, (req, res) => {
  const longURL = req.body.longURL;
  const urlID = generateRandomString(6);
  const userID = req.cookies["user_id"];

  const newURL = {longURL, userID}


  urlDatabase[urlID] = newURL;
  res.status(201).redirect(`/urls/${urlID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id]
  const userID = req.cookies["user_id"]

  //checks if url does not exist or belongs to another user
  if (!url || url.userID !== userID) {
    const templateVars = {
      errorCode: "400",
      errorMessage: "Something went wrong! could not delete URL"
    };
    return res.status(400).render("error", templateVars);
  } 

  delete urlDatabase[id];
  res.status(200).redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body.updatedURL;
  const url = urlDatabase[id]
  const userID = req.cookies["user_id"]

  if (!url || url.userID !== userID) {
    const templateVars = {
      errorCode: "400",
      errorMessage: "Something went wrong! could not update URL"
    };
    return res.status(400).render("error", templateVars);
  } 

  urlDatabase[id].longURL = updatedURL;
  res.status(200).redirect('/urls');
});


//////////////////// START SERVER ///////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

