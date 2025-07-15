# leaderboard-app
A dynamic full-stack web application using ReactJS for the frontend and NodeJS with MongoDB for the backend that allows users to claim random points, view real-time rankings on a leaderboard, and track a detailed history of all point claims.

✨ Features
User Management:

Display a pre-defined list of initial users.

Ability to add new users dynamically from the frontend, which are persisted in the database.

Point Claiming:

Select an existing user from a dropdown.

Click a "Claim Points" button to award random points (1 to 10) to the selected user.

Visual feedback (confetti animation, temporary message) upon successful point claim.

Dynamic Leaderboard:

Users are ranked in real-time based on their total accumulated points.

The top 3 users are highlighted with distinct styling (gold, silver, bronze) and visually elevated.

User avatars are displayed for a richer visual experience.

Claim History:

A dedicated section displays a chronological history of all point claims, showing which user claimed how many points and when.

Responsive UI:

The application's interface is designed to be user-friendly and visually appealing across various device sizes (mobile, tablet, desktop).

Loading Indicators:

Provides visual feedback during API calls (fetching data, claiming points, adding users).

Themed Design:

Features an attractive dark theme with vibrant accents, custom icons, and visual elements inspired by modern gaming leaderboards.

Interactive Ranking Filters:

Tabs for different ranking types (Party, Live, Hourly, Family, Wealth Ranking) and time filters (Daily, Weekly, Monthly, Hourly) for future extensibility (currently visual only).

Reward & Task Sections:

Dedicated sections for "Contribution", "Star tasks", and "Rewards" to hint at broader application features.

Total Prizes Display:

Prominently displays the total prize pool associated with the leaderboard.

🚀 Technologies Used
Frontend:

ReactJS: A JavaScript library for building user interfaces.

HTML5 & CSS3: For structuring and styling the web content.

JavaScript (ES6+): For interactive functionality.

Backend:

Node.js: A JavaScript runtime environment.

Express.js: A fast, unopinionated, minimalist web framework for Node.js.

MongoDB Atlas: A cloud-hosted NoSQL database for data storage.

Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.

dotenv: To manage environment variables securely.

cors: Middleware to enable Cross-Origin Resource Sharing.

⚙️ Setup & Installation
Follow these steps to get the project up and running on your local machine.

Prerequisites
Node.js (v14 or higher recommended)

npm (Node Package Manager) or Yarn

MongoDB Atlas Account (for cloud database)

Git (for version control)

1. Clone the Repositories
First, ensure you have two separate GitHub repositories for your frontend and backend. If you haven't done so, please create them and push your code.

# Assuming you have a parent directory for your project
mkdir leaderboard-app
cd leaderboard-app

# Clone your frontend repository
git clone https://github.com/YOUR_GITHUB_USERNAME/leaderboard-frontend.git client

# Clone your backend repository
git clone https://github.com/YOUR_GITHUB_USERNAME/leaderboard-backend.git server

Note: Replace YOUR_GITHUB_USERNAME with your actual GitHub username.

2. Backend Setup (server directory)
Navigate to the backend directory:

cd server

Install dependencies:

npm install

Create .env file:
Create a file named .env in the server directory (at the same level as server.js).
Add your MongoDB Atlas connection string and port:

MONGODB_URI= ur_api_key
PORT=5000

Replace YOUR_MONGODB_PASSWORD with your actual MongoDB Atlas database user password.
Security Note: Ensure .env is listed in your server/.gitignore file to prevent it from being committed to public repositories.

Configure MongoDB Atlas Network Access:
Go to your MongoDB Atlas dashboard -> Security -> Network Access. Add an IP Access List Entry for 0.0.0.0/0 (Allow Access from Anywhere) to enable connections from your local machine and future deployment environments. Wait for it to become active.

3. Frontend Setup (client directory)
Navigate to the frontend directory:

cd client

Install dependencies:

npm install

Create .env.local file (for local development):
Create a file named .env.local in the client directory (at the same level as package.json).
Add the backend API base URL for local development:

REACT_APP_API_BASE_URL=http://localhost:5000

Security Note: Ensure .env.local is listed in your client/.gitignore file.

▶️ Running the Application (Local Development)
To run the application on your local machine:

1. Start the Backend Server
Open a new terminal or command prompt.

Navigate to the server directory:

cd server

Start the server:

node server.js

You should see "MongoDB connected successfully" and "Server running on port 5000" (or your specified port) in your terminal. Keep this terminal window open.

2. Start the Frontend Application
Open another new terminal or command prompt.

Navigate to the client directory:

cd client

Start the React development server:

npm start

This will open the application in your default web browser at http://localhost:3000 (or another available port).

🎮 Usage
Select a User: Use the dropdown to choose an existing user.

Add New User: Type a name in the input field and click "Add New User" to create a new participant.

Claim Points: Click the "Claim Points" button to award random points (1-10) to the currently selected user. Watch the confetti fly!

View Leaderboard: The leaderboard will automatically update, showing users sorted by their total points. The top 3 will be highlighted.

Check History: The "Claim History" section will log every point claim with details.

📁 Project Structure
leaderboard-app/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   └── ... (other components/files)
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
├── server/                 # Node.js Backend
│   ├── models/
│   │   ├── ClaimHistory.js
│   │   └── User.js
│   ├── routes/
│   │   └── leaderboard.js
│   ├── .env                # Environment variables (NOT committed to Git)
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
└── README.md               # This file
