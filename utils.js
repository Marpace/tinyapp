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
  for (const key in usersDatabase) {
    if (usersDatabase[key].email === email) return usersDatabase[key];
  }
  return null;
};

const authenticateUser = (email, password, usersDatabase) => {
  console.log(usersDatabase)
  for (const key in usersDatabase) {
    if (usersDatabase[key].email === email && bcrypt.compareSync(password, usersDatabase[key].hashedPassword)) {
      return usersDatabase[key];
    }
  }
  return null;
};

const urlsForUser = (id, urlDatabase) => {
  const result = {};

  for(const key in urlDatabase) {
    if(urlDatabase[key].userID === id) result[key] = urlDatabase[key];
  }

  return result;
}

module.exports = {
  generateRandomString,
  createUser,
  findUserByEmail,
  authenticateUser,
  urlsForUser
};