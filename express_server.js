const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const getRoutes = require("./routes/getRoutes");
const postRoutes = require("./routes/postRoutes");


//set view engine to ejs
app.set("view engine", "ejs");

//parse form data
app.use(express.urlencoded({ extended: true }));

//used for encoding cookies
app.use(cookieSession({
  name: 'session',
  signed: false
}));


//routes
app.use(getRoutes);
app.use(postRoutes);



//////////////////// START SERVER ///////////////////////////

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

