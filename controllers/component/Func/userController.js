// controllers/userController.js
const users = require("../../../models/user");

function getSortedUserDetails() {
  // Sort users by displayName (name)
  const sortedUsers = users.sort((a, b) => a.displayName.localeCompare(b.displayName));

  // Create a message with sorted user details (name and phone number)
  return sortedUsers.map((user) => ({
    type: "text",
    text: `ชื่อ: ${user.displayName}\nเบอร์: ${user.phoneNumber}`,
  }));
}

module.exports = {
  getSortedUserDetails,
};
