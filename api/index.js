const path = require("path");

// Import the compiled Express app
const { default: app } = require(path.join(
  __dirname,
  "..",
  "dist",
  "index.js"
));

module.exports = app;
