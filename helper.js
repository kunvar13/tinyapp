
const getUserByEmail = function(email, database){

  for (const user in users) {
    if (users[user.email] === submittedEmail) {
      return user.id;
    } 
  }
  return false;

};

function emailAlreadyExists(submittedEmail){
  for (const user in users) {
    if (users[user.email] === submittedEmail) {
      return true;
    } 
  }
  return false;
}

module.exports = getUserByEmail;
module.exports = emailAlreadyExists;