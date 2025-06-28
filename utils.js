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

const authenticateUser = (email, password, usersDatabse) => {
  for (const key in usersDatabse) {
    if (usersDatabse[key].email === email && usersDatabse[key].password === password) {
      return usersDatabse[key];
    }
  }
  return null;
};

module.exports = {
  generateRandomString,
  createUser,
  findUserByEmail,
  authenticateUser
};