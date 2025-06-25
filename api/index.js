const path = require("path");

// Import the compiled Express app
try {
  const appModule = require(path.join(__dirname, "..", "dist", "index.js"));
  const app = appModule.default || appModule;

  module.exports = app;
} catch (error) {
  console.error("Error loading Express app:", error);
  throw error;
}
