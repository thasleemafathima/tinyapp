
// function to verify is given email is present in database
const getUserByEmail = function(emailnew, database) {
  // lookup magic...
  let foundname;
  for (let i in database) {
    if (emailnew !== "" && emailnew === database[i].email) {
      foundname = i;
    }
  }
  
  return foundname;
};

module.exports = getUserByEmail;