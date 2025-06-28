const express = require("express");
const app = express();
const PORT = 8080;
const {
  generateRandomString,
  createUser,
  findUserByEmail,
  authenticateUser
} = require("./utils");
const cookieParser = require("cookie-parser");
const users = require("./data");


const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//set view engine to ejs
app.set("view engine", "ejs");

/////////////////////// MIDDLEWARE ///////////////////////////

//parse form data
app.use(express.urlencoded({ extended: true }));

//parse cookies
app.use(cookieParser());

/////////////////////// GET ROUTES ///////////////////////////


app.get("/error", (req, res) => {
  res.render("error");
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];

  const templateVars = { urls: urlDatabase, user: users[userId]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {user: users[userId]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies['user_id'];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userId]
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

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
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {user: users[userId]};
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


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString(6);

  urlDatabase[id] = longURL;
  res.status(201).redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    const templateVars = {
      errorCode: "404",
      errorMessage: "Something went wrong! could not delete URL"
    };
    res.status(404).render("error", templateVars);
  } else {
    delete urlDatabase[id];
    res.status(200).redirect('/urls');
  }
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body.updatedURL;

  if (!urlDatabase[id]) {
    const templateVars = {
      errorCode: "404",
      errorMessage: "Something went wrong! could not update URL"
    };
    res.status(404).render("error", templateVars);
  } else {
    urlDatabase[id] = updatedURL;
    res.status(200).redirect('/urls');
  }
});


//////////////////// START SERVER ///////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

