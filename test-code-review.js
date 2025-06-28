// Test script for code review API
const testCode = `
function divide(a, b) {
  return a / b;
}

function getUserData(userId) {
  var query = "SELECT * FROM users WHERE id = " + userId;
  return database.query(query);
}
`;

const testData = {
  code: testCode,
  filename: "test.js",
};

console.log("Testing code review API...");
console.log("Test code:");
console.log(testCode);
console.log("\nSending request to http://localhost:5000/api/ai/review-text");

fetch("http://localhost:5000/api/ai/review-text", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.error("Error:", error);
  });
