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

module.exports = {generateRandomString};