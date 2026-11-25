const User = require("../models/userModel");

/**
 * Periodically marks users inactive if they have not logged in for > 30 days.
 */
function startInactiveUserJob(intervalMs = 60 * 1000) {
  return setInterval(() => {
    console.log("=== CEK USER INACTIVE ===");
    User.deactivateInactive((err, result) => {
      if (err) return console.log("ERROR:", err);
      console.log("HASIL UPDATE:", result);
    });
  }, intervalMs);
}

module.exports = { startInactiveUserJob };
