const bcrypt = require('bcryptjs');
function generateRandomString() {
  let string = '';
  let char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charLength = char.length;
  for (let i = 0; i < 6; i++) {
    string += char.charAt(Math.floor(Math.random() * charLength));
  }
  return string;
}

function newUser(email, password, database) {

  const userId = generateRandomString();
  
  const newUserObj = {
    id: userId,
    email,
    password : bcrypt.hashSync(password, 10)
  };
  database[userId] = newUserObj;
  return userId;
  
};

function urlsForUser(database, id) {
  let userData = {};
  for (let url in database) {
    if (id === database[url].userID ) {
      userData[url] = database[url];
    }
  }
  return userData;
};


function getUserByEmail(email,users) {
  for ( let userId in users) {
    if ( users[userId].email === email) {
      return users[userId];
    }
  } 
  return undefined;

}

const uniqueUser = (email, password, users) => {
  const user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

module.exports = {
  urlsForUser,
  generateRandomString,
  newUser,
  getUserByEmail,
  uniqueUser
};