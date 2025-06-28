const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {generateRandomString, createUser, findUserByEmail} = require("./utils");
const cookieParser = require("cookie-parser")
const users = require("./data")


const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


app.set("view engine", "ejs");


/////////////////////// MIDDLEWARE ///////////////////////////

//middleware parse form data 
app.use(express.urlencoded({ extended: true }));

//middleware to parse cookies
app.use(cookieParser());

/////////////////////// GET ROUTES ///////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id']; 

  const templateVars = { urls: urlDatabase, user: users[userId]};
  res.render("urls_index", templateVars);
})

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
})

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if(!longURL) res.status(404).send("<h1>404 - Not Found</h1>")
  else res.status(301).redirect(longURL)
});

app.get("/register", (req, res) => {
  const userId = req.cookies['user_id']; 
  const templateVars = {user: users[userId]};
  res.render("register", templateVars);
});

/////////////////////// POST ROUTES ///////////////////////////


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const id = generateRandomString(6);

  urlDatabase[id] = longURL;
  res.status(201).redirect(`/urls/${id}`); 
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  if(!urlDatabase[id]) {
    res.status(404).send("<h1>Something went wrong! could not delete URL</h1>")
  } 
  else {
    delete urlDatabase[id];
    res.status(200).redirect('/urls');
  }
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body.updatedURL

  if(!urlDatabase[id]) {
    res.status(404).send("<h1>Something went wrong! could not update URL</h1>")
  } 
  else {
    urlDatabase[id] = updatedURL;
    res.status(200).redirect('/urls');
  }
});

// app.post("/login", (req, res) => {
//   const email = req.body.email;
//   res.cookie("username", username).redirect("/urls");
// });

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").status(200).redirect("/urls"); 
});

app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password

  //checks if email or password fields are empty when user submits form
  if(email === "" || password === "") {
    return res.status(400).send("<h1>404 - No email or password was entered.</h1>")
  }
  
  //checks if user with the email proivided already exists 
  if(findUserByEmail(email, users)) {
    return res.status(400).send("<h1>404 - Email provided is already registered</h1>")
  }

  const newUser = createUser({email, password}, users);

  //sets new cookie with the newly created user's id 
  res.cookie("user_id", newUser.id) 

  //status code 201 - successfully created new user
  res.status(201).redirect("/urls");
})

//////////////////// START SERVER ///////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

