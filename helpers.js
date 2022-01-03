const generateRandomString = () => {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
};

const urlsForUser = (id, db) => {
  const userURLs = {};
  for (let url in db) {
    if (id === db[url].userID) {
      userURLs[url] = db[url]["longURL"];
    }
  }
  return userURLs;
};

const getUserByEmail = (email, db) => {
  for (let key in db) {
    if (db[key].email === email) {
      return db[key];
    }
  }
  return undefined;
};



module.exports = { generateRandomString, urlsForUser, getUserByEmail };