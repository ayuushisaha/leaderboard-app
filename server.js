// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000
const MONGODB_URI = process.env.MONGODB_URI; // Your MongoDB connection string

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend communication
app.use(express.json()); // Parse incoming JSON request bodies

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully')) // Success message
    .catch(err => console.error('MongoDB connection error:', err)); // Error message if connection fails

// Mongoose Schema and Model for Users
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Name is required
        unique: true    // User names must be unique
    },
    totalPoints: {
        type: Number,
        default: 0      // Default points to 0 for new users
    }
});
const User = mongoose.model('User', userSchema); // Create User model

// Mongoose Schema and Model for Claim History
const claimHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to a User document
        ref: 'User',                         // Specifies the 'User' model
        required: true
    },
    pointsClaimed: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now // Automatically records the time of the claim
    }
});
const ClaimHistory = mongoose.model('ClaimHistory', claimHistorySchema); // Create ClaimHistory model


// Function to initialize 10 default users if the User collection is empty
const initializeUsers = async () => {
    try {
        const usersCount = await User.countDocuments(); // Count existing users
        if (usersCount === 0) { // If no users found, insert default ones
            const initialUsers = [
                { name: 'Rahul' },
                { name: 'Kamal' },
                { name: 'Sanak' },
                { name: 'Priya' },
                { name: 'Deepak' },
                { name: 'Anjali' },
                { name: 'Vikas' },
                { name: 'Sonia' },
                { name: 'Ravi' },
                { name: 'Neha' }
            ];
            await User.insertMany(initialUsers); // Insert the default users
            console.log('10 initial users created.');
        } else {
            console.log('Users already exist, skipping initialization.'); // Message if users are already there
        }
    } catch (err) {
        console.error('Error initializing users:', err); // Log any errors during initialization
    }
};

// Call initializeUsers only after the MongoDB connection is established
mongoose.connection.on('connected', () => {
    initializeUsers();
});


// API Endpoints

// GET /users: Fetches all users, sorted by totalPoints in descending order (for leaderboard)
app.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ totalPoints: -1 }); // Find all users and sort
        res.json(users); // Send users as JSON response
    } catch (err) {
        res.status(500).json({ message: err.message }); // Handle server errors
    }
});

// POST /users: Adds a new user to the database
app.post('/users', async (req, res) => {
    const { name } = req.body; // Get name from request body
    if (!name) {
        return res.status(400).json({ message: 'User name is required' }); // Validate input
    }
    try {
        const newUser = new User({ name }); // Create new User instance
        await newUser.save(); // Save to database
        res.status(201).json(newUser); // Respond with the newly created user (201 Created)
    } catch (err) {
        if (err.code === 11000) { // MongoDB duplicate key error (e.g., user with same name exists)
            return res.status(409).json({ message: 'User with this name already exists' });
        }
        res.status(500).json({ message: err.message }); // Handle other server errors
    }
});

// POST /claim-points: Awards random points (1-10) to a selected user and logs the transaction
app.post('/claim-points', async (req, res) => {
    const { userId } = req.body; // Get userId from request body

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' }); // Validate input
    }

    try {
        const user = await User.findById(userId); // Find the user by ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Handle user not found
        }

        const pointsClaimed = Math.floor(Math.random() * 10) + 1; // Generate random points (1 to 10)
        user.totalPoints += pointsClaimed; // Add points to user's total
        await user.save(); // Save the updated user document

        // Create a new claim history entry
        const claimHistoryEntry = new ClaimHistory({
            userId: user._id,
            pointsClaimed: pointsClaimed
        });
        await claimHistoryEntry.save(); // Save the history entry

        res.json({
            user: user,             // Return the updated user object
            pointsClaimed: pointsClaimed, // Return the points awarded in this specific claim
            message: `Successfully claimed ${pointsClaimed} points for ${user.name}`
        });
    } catch (err) {
        res.status(500).json({ message: err.message }); // Handle server errors
    }
});

// GET /claim-history: Fetches all claim history entries, populated with user names
app.get('/claim-history', async (req, res) => {
    try {
        // Find all history entries, populate 'userId' to get the user's name, and sort by timestamp
        const history = await ClaimHistory.find().populate('userId', 'name').sort({ timestamp: -1 });
        res.json(history); // Send history as JSON response
    } catch (err) {
        res.status(500).json({ message: err.message }); // Handle server errors
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
