const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {generateRandomString} = require("./utils");
const cookieParser = require("cookie-parser")


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
  const templateVars = { urls: urlDatabase, username: req.cookies['username']};
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const username = req.cookies['username'] ? req.cookies['username'] : null;
  const templateVars = {username: username};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const username = req.cookies['username'] ? req.cookies['username'] : null;
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: username
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
  const username = req.cookies['username'] ? req.cookies['username'] : null;
  const templateVars = {username: username};
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

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username).redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username").status(200).redirect("/urls"); 
});


//////////////////// START SERVER ///////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

