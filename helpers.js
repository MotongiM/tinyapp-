
const bcrypt = require('bcryptjs');
const users = {};

const urlDatabase = {};

function generateRandomString() {
    let string = '';
    let char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let charLength = char.length
    for (let i = 0 ; i < 6; i++){
      string += char.charAt(Math.floor(Math.random() * charLength));    } 
    return string;
};

function emailExist(email,users) {
    for(let item in users) {
        if (users[item].email === email) {
            return true;
        }
    }
};
function getUserByEmail(email,users){
    for(let item in users) {
        if (users[item].email === email) {
            return users[item].id
        }
    }
};

function urlForUser(id, urlDatabase) {
    let userData = {};
    for(let item in urlDatabase ) {
      if (urlDatabase[item].userID === id) {
        userData[item] = urlDatabase[item];
      }
    }
    return userData;
};
function getUserById(id, users){
    const user = users[id];
    if(user) {
        return user;
    }
    return null;
};

function updateUrl(shortUrl, longUrl){
    urlDatabase[shortUrl].longURL = longUrl;
}

module.exports = {
    getUserByEmail,
    urlForUser,
    generateRandomString,
    getUserById,
    emailExist,
    updateUrl
};