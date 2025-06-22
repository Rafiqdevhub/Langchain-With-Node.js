# LangChain Chatbot API with Google Gemini Node.js(typescript)

This project implements a RESTful API for a chatbot using LangChain and Google's Gemini AI model.
It's designed to be used as a backend service for frontend applications like React.

## Features

- Express.js RESTful API server
- LangChain integration with Google Gemini
- Conversation memory/history support
- CORS support for frontend integration
- Stateless design with conversation tracking

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the project root with the following content:
   ```
   PORT=3000
   GOOGLE_API_KEY=your_google_api_key_here
   ```
4. Replace `your_google_api_key_here` with your actual Google AI API key

## Running the Application

Start the development server with:

```
npm run dev
```

The server will start on http://localhost:5000 (or the port specified in your .env file).

## API Endpoints

### POST /api/ai/chat

Send a message to the chatbot.

**Request Body:**

```json
{
  "message": "Your message here",
  "threadId": "optional-thread-id-for-conversation-continuity"
}
```

**Response:**

```json
{
  "message": "Response from the AI",
  "threadId": "conversation-thread-id"
}
```

## Frontend Integration

To use this API with a frontend application like React:

```javascript
// Example React code to call the API
const sendMessage = async (message, threadId = null) => {
  try {
    const response = await fetch("http://localhost:5000/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, threadId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};

// Example usage
const handleSubmit = async (message) => {
  const response = await sendMessage(message, currentThreadId);
  // Update UI with response.message
  // Store response.threadId for conversation continuity
};
```

## Technologies Used

- Node.js with TypeScript
- Express.js
- LangChain
- Google Gemini AI
- UUID for conversation tracking
