const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


const generateRandomString = (length) => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  // Loop to generate a random string of the given length
  for (let i = 0; i < length; i++) {
      const random = Math.floor(Math.random() * characters.length);
      result += characters.charAt(random);
  }
  return result;
}


app.set("view engine", "ejs");

//middleware to convert incoming data from the form
app.use(express.urlencoded({ extended: true }));


/////////////////////// GET ROUTES ///////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
})

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if(!longURL) res.status(404).send("<h1>404 - Not Found</h1>")
  else res.status(301).redirect(longURL)
});

/////////////////////// POST ROUTES ///////////////////////////


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const id = generateRandomString(6);

  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});