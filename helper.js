/* eslint-disable func-style */
/* eslint-disable space-before-blocks */
/* eslint-disable linebreak-style */

const getUserByEmail = function(submittedEmail, users){

  for (const user in users) {
    if (users[user.email] === submittedEmail) {
      return user.id;
    }
  }
  return false;

};

function emailAlreadyExists(submittedEmail,users){
  for (const user in users) {
    if (users[user].email === submittedEmail) {
      return true;
    }
  }
  return false;
}

module.exports = getUserByEmail;
module.exports = emailAlreadyExists;