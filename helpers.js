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

function emailExist(email,users) {
  for (let item in users) {
    if (users[item].email === email) {
      return true;
    }
  }
}

function validateLogin(database){
    let email = database.email;
    let password = database.password;
    for(let key in users) {
      let user = users[key];
      if (user.email === email && bcrypt.hashSync(password, user.hashedPassword)) {
        return user;
      }
    }
    return false;
};

function urlForUser(id, database) {
  let userData = {};
  for (let item in database) {
    if (database[item].userID === id) {
      userData[item] = database[item];
    }
  }
  return userData;
}
function getUserById(id, users) {
  const user = users[id];
  if (user) {
    return user;
  }
  return null;
}


module.exports = {
  urlForUser,
  generateRandomString,
  getUserById,
  emailExist,
  validateLogin
};