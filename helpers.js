const bcrypt = require("bcryptjs");

const generateRandomString = (length) => {

  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  // Loop to generate a random string of the given length
  for (let i = 0; i < length; i++) {
    const random = Math.floor(Math.random() * characters.length);
    result += characters.charAt(random);
  }

  return result;
};

const createUser = (newUser, userDatabase) => {

  //generate random id
  const id = generateRandomString(5);
  
  //checks if user with that id already exists
  // if it does, runs the function again (recursion)
  if (userDatabase[id]) return createUser(newUser, userDatabase);

  //set id property to newUser object
  newUser["id"] = id;

  //add new user to user database
  userDatabase[id] = newUser;

  return newUser;
};

const findUserByEmail = (email, usersDatabase) => {

  //if user with given email exists, return entire user object
  for (const key in usersDatabase) {
    if (usersDatabase[key].email === email) return usersDatabase[key];
  }

  return undefined;
};

const authenticateUser = (email, password, usersDatabase) => {

  const user = findUserByEmail(email, usersDatabase);
  //check if user with given email exists
  if (user) {
    //use bcrypt to compare user's password and given password
    const passwordsMatch = bcrypt.compareSync(password, user.hashedPassword);
    if (passwordsMatch) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (id, urlDatabase) => {

  const result = {};

  //loop through database and add all url objects, matching the given id, to the result object
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) result[key] = urlDatabase[key];
  }

  return result;
};

module.exports = {
  generateRandomString,
  createUser,
  findUserByEmail,
  authenticateUser,
  urlsForUser
};