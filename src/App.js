// client/src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; // Import the CSS file for styling

// --- Confetti Function (Pure JS) ---
// This function creates a simple confetti effect using canvas.
// It's self-contained and doesn't require external libraries.
const launchConfetti = () => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; // Allows clicks to pass through
    canvas.style.zIndex = '9999'; // Ensure it's on top
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#ffd700', '#c0c0c0', '#cd7f32']; // Added gold, silver, bronze
    const particles = [];
    const particleCount = 100; // Number of confetti particles

    function Particle() {
        this.x = W / 2; // Start from center of screen
        this.y = H / 2;
        this.radius = Math.random() * 5 + 2; // Random size
        this.color = colors[Math.floor(Math.random() * colors.length)]; // Random color
        this.velocity = {
            x: (Math.random() - 0.5) * 10, // Random horizontal velocity
            y: (Math.random() - 0.5) * 10 - 5 // Random initial upward velocity
        };
        this.alpha = 1; // Initial opacity
        this.gravity = 0.2; // Gravity effect
        this.friction = 0.99; // Air resistance
        this.dampening = 0.8; // For bouncing effect
        this.ground = H - 20; // Simulated ground level

        this.update = () => {
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.velocity.y += this.gravity;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= 0.01; // Fade out over time

            // Bounce off ground
            if (this.y + this.radius > this.ground) {
                this.y = this.ground - this.radius;
                this.velocity.y *= -this.dampening;
            }
        };

        this.draw = () => {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        };
    }

    // Populate particles array
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, W, H); // Clear canvas for next frame
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        // Remove particles that have completely faded out
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // Continue animation if there are still particles
        if (particles.length > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            // Remove canvas from DOM when animation is complete
            document.body.removeChild(canvas);
        }
    }

    animateConfetti(); // Start the confetti animation
};


function App() {
    // State variables to manage application data
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [claimedPoints, setClaimedPoints] = useState(null);
    const [newUserName, setNewUserName] = useState('');
    const [claimHistory, setClaimHistory] = useState([]);
    const [error, setError] = useState(null);

    // Loading states for better user feedback during API calls
    const [isFetchingUsers, setIsFetchingUsers] = useState(false);
    const [isClaimingPoints, setIsClaimingPoints] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);

    // NEW: State for active ranking type and time filter
    const [activeRankingType, setActiveRankingType] = useState('Live Ranking');
    const [activeTimeFilter, setActiveTimeFilter] = useState('Daily');


    // Base URL for the backend API
    const API_BASE_URL = 'http://localhost:5000'; // Ensure this matches your backend server's port

    // Memoized function to fetch users from the backend
    const fetchUsers = useCallback(async () => {
        setIsFetchingUsers(true); // Set loading state to true before fetching
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Parse the JSON response
            // Sort data by totalPoints descending before setting state for ranking
            const sortedUsers = data.sort((a, b) => b.totalPoints - a.totalPoints);
            setUsers(sortedUsers); // Update the users state
            // Set the first user as selected by default if no user is currently selected
            if (sortedUsers.length > 0 && !selectedUser) {
                setSelectedUser(sortedUsers[0]._id);
            }
        } catch (e) {
            console.error("Failed to fetch users:", e);
            setError("Failed to load users. Please try again later.");
        } finally {
            setIsFetchingUsers(false); // Always set loading state to false after fetch attempt
        }
    }, [selectedUser]);

    // Memoized function to fetch claim history from the backend
    const fetchClaimHistory = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/claim-history`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setClaimHistory(data); // Update the claim history state
        } catch (e) {
            console.error("Failed to fetch claim history:", e);
            setError("Failed to load claim history. Please try again later.");
        }
    }, []);

    // useEffect hook to run fetch operations when the component mounts
    useEffect(() => {
        fetchUsers();
        fetchClaimHistory();
    }, [fetchUsers, fetchClaimHistory]);

    // Handler for the "Claim Points" button click
    const handleClaimPoints = async () => {
        if (!selectedUser) {
            setError("Please select a user to claim points.");
            return;
        }
        setError(null); // Clear any previous errors
        setIsClaimingPoints(true); // Set loading state for claiming points
        try {
            const response = await fetch(`${API_BASE_URL}/claim-points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: selectedUser }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setClaimedPoints(data.pointsClaimed); // Display the points claimed
            launchConfetti(); // Launch confetti effect on successful claim!

            // Clear the claimedPoints message after a short delay
            setTimeout(() => {
                setClaimedPoints(null);
            }, 3000); // Message will disappear after 3 seconds

            fetchUsers(); // Re-fetch users to update the leaderboard with new points
            fetchClaimHistory(); // Re-fetch claim history to show the new entry
        } catch (e) {
            console.error("Failed to claim points:", e);
            setError(`Error claiming points: ${e.message}`);
        } finally {
            setIsClaimingPoints(false); // Always set loading state to false after claim attempt
        }
    };

    // Handler for the "Add New User" button click
    const handleAddUser = async () => {
        if (!newUserName.trim()) {
            setError("User name cannot be empty.");
            return;
        }
        setError(null); // Clear any previous errors
        setIsAddingUser(true); // Set loading state for adding user
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newUserName.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            setNewUserName(''); // Clear the input field after successful addition
            fetchUsers(); // Re-fetch users to update the list and leaderboard
        } catch (e) {
            console.error("Failed to add user:", e);
            setError(`Error adding user: ${e.message}`);
        } finally {
            setIsAddingUser(false); // Always set loading state to false after add attempt
        }
    };

    // Function to get a random avatar URL
    const getRandomAvatar = (id) => {
        // Use a consistent random avatar based on user ID for stability
        const seed = id ? id.charCodeAt(0) + id.charCodeAt(id.length - 1) : Math.floor(Math.random() * 100);
        const gender = seed % 2 === 0 ? 'male' : 'female';
        const avatarNum = seed % 70; // 0-69 for randomusers.co
        return `https://xsgames.co/randomusers/assets/avatars/${gender}/${avatarNum}.jpg`;
    };


    return (
        <div className="app-container">
            {/* NEW: Top Navigation Bar */}
            <div className="top-nav">
                <div className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </div>
                <div className="ranking-tabs">
                    {['Party Ranking', 'Live Ranking', 'Hourly Ranking', 'Family Ranking', 'Wealth Ranking'].map(type => (
                        <span
                            key={type}
                            className={`ranking-tab ${activeRankingType === type ? 'active' : ''}`}
                            onClick={() => setActiveRankingType(type)}
                        >
                            {type}
                        </span>
                    ))}
                </div>
                <div className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                </div>
            </div>

            {/* NEW: Time Filters */}
            <div className="time-filters">
                {['Daily', 'Weekly', 'Monthly', 'Hourly'].map(filter => (
                    <span
                        key={filter}
                        className={`time-filter-tab ${activeTimeFilter === filter ? 'active' : ''}`}
                        onClick={() => setActiveTimeFilter(filter)}
                    >
                        {filter}
                    </span>
                ))}
            </div>


            {/* Header/Banner Section - styled to match UI screenshots */}
            <header className="app-header">
                {/* NEW: Settlement Time */}
                <p className="settlement-time">Settlement time 2 days 01:45:41</p>

                {/* Main Logo/Trophy with wings */}
                <div className="main-logo-container">
                    <svg className="logo-wings left-wing" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18l5-5-5-5M1 12h22"/></svg>
                    <div className="trophy-icon-placeholder"></div> {/* Existing trophy */}
                    <svg className="logo-wings right-wing" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18l-5-5 5-5M23 12H1"/></svg>
                </div>

                {/* NEW: Rewards icon (moved from top-right) */}
                <div className="rewards-icon-top">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M2 7h20v4H2z"/><path d="M12 2v3"/><path d="M10 5h4"/></svg>
                    <span>Rewards</span>
                </div>
            </header>

            {/* NEW: Total Prizes Section (below logo, not in it) */}
            <div className="total-prizes-section">
                <span>Total Prizes</span>
                <span className="prize-amount">10,000,000</span>
                <span className="prize-icon">💰</span> {/* Emoji for prize */}
            </div>

            {/* NEW: Contribution, Star Tasks, Rewards Sections */}
            <div className="feature-sections">
                <div className="feature-card">
                    <div className="feature-icon-circle bg-orange">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3z"/><path d="M12 15v6"/><path d="M8 20h8"/></svg>
                    </div>
                    <span>Contribution</span>
                    <div className="contribution-avatars">
                        <img src={getRandomAvatar('user1')} alt="User" className="small-avatar"/>
                        <img src={getRandomAvatar('user2')} alt="User" className="small-avatar"/>
                        <span className="more-users">...</span>
                    </div>
                </div>
                <div className="feature-card">
                    <div className="feature-icon-circle bg-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                    <span>Star tasks</span>
                </div>
                <div className="feature-card">
                    <div className="feature-icon-circle bg-pink">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M2 7h20v4H2z"/><path d="M12 2v3"/><path d="M10 5h4"/></svg>
                    </div>
                    <span>Rewards</span>
                </div>
            </div>


            {/* Main Content Area - This div wraps all content below the banner for layout purposes */}
            <div className="main-content-area">
                {/* Display error messages if any */}
                {error && <div className="error-message">{error}</div>}

                {/* Interaction Section (moved here as per UI flow) */}
                <div className="interaction-section">
                    <div className="user-selection">
                        <label htmlFor="user-select">Select User:</label>
                        <select
                            id="user-select"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            disabled={isFetchingUsers || isClaimingPoints}
                        >
                            {isFetchingUsers ? (
                                <option value="">Loading users...</option>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ))
                            ) : (
                                <option value="">No users available</option>
                            )}
                        </select>
                        <button onClick={handleClaimPoints} disabled={!selectedUser || isClaimingPoints}>
                            {isClaimingPoints ? 'Claiming...' : 'Claim Points'}
                        </button>
                        {claimedPoints !== null && (
                            <p className="claimed-message">Claimed {claimedPoints} points!</p>
                        )}
                    </div>

                    <div className="add-user">
                        <input
                            type="text"
                            placeholder="New user name"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            disabled={isAddingUser}
                        />
                        <button onClick={handleAddUser} disabled={isAddingUser}>
                            {isAddingUser ? 'Adding...' : 'Add New User'}
                        </button>
                    </div>
                </div>

                {/* Leaderboard Section */}
                <div className="leaderboard-section">
                    <h2>Leaderboard</h2>
                    {isFetchingUsers ? (
                        <p className="loading-message">Loading leaderboard...</p>
                    ) : (
                        <>
                            {/* Grid for top 3 ranked users, styled as circular cards */}
                            <div className="leaderboard-grid">
                                {/* Rank 2 Card (Shyla) */}
                                {users[1] && (
                                    <div
                                        key={users[1]._id}
                                        className="top-rank-card rank-2"
                                        data-rank-number="2"
                                    >
                                        <img src={getRandomAvatar(users[1]._id)} alt={users[1].name} className="user-avatar" />
                                        <div className="rank-badge">🥈</div> {/* Silver medal emoji */}
                                        <div className="user-name">{users[1].name}</div>
                                        <div className="total-points">
                                            {users[1].totalPoints.toLocaleString()} <span className="points-gem-icon">💎</span>
                                        </div>
                                    </div>
                                )}

                                {/* Rank 1 Card (Swetambari) - Positioned Higher */}
                                {users[0] && (
                                    <div
                                        key={users[0]._id}
                                        className="top-rank-card rank-1"
                                        data-rank-number="1"
                                    >
                                        <img src={getRandomAvatar(users[0]._id)} alt={users[0].name} className="user-avatar" />
                                        <div className="rank-badge">🥇</div> {/* Gold medal emoji */}
                                        <div className="user-name">{users[0].name}</div>
                                        <div className="total-points">
                                            {users[0].totalPoints.toLocaleString()} <span className="points-gem-icon">💎</span>
                                        </div>
                                    </div>
                                )}

                                {/* Rank 3 Card (Global King) */}
                                {users[2] && (
                                    <div
                                        key={users[2]._id}
                                        className="top-rank-card rank-3"
                                        data-rank-number="3"
                                    >
                                        <img src={getRandomAvatar(users[2]._id)} alt={users[2].name} className="user-avatar" />
                                        <div className="rank-badge">🥉</div> {/* Bronze medal emoji */}
                                        <div className="user-name">{users[2].name}</div>
                                        <div className="total-points">
                                            {users[2].totalPoints.toLocaleString()} <span className="points-gem-icon">💎</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* List for users ranked 4th onwards */}
                            <ul className="leaderboard-list">
                                {users.slice(3).map((user, index) => (
                                    <li key={user._id} className="leaderboard-item">
                                        <span className="rank">{index + 4}.</span>
                                        <img src={getRandomAvatar(user._id)} alt={user.name} className="list-user-avatar" />
                                        <span className="name">{user.name} <span className="small-person-icon">👤</span></span>
                                        <span className="points">
                                            {user.totalPoints.toLocaleString()} <span className="points-gem-icon">💎</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* Claim History Section */}
                <div className="claim-history-section">
                    <h2>Claim History</h2>
                    {isFetchingUsers ? (
                        <p className="loading-message">Loading claim history...</p>
                    ) : claimHistory.length === 0 ? (
                        <p>No claim history yet.</p>
                    ) : (
                        <ul className="claim-history-list">
                            {claimHistory.map((entry) => (
                                <li key={entry._id} className="claim-history-item">
                                    <span className="history-user-name">
                                        {entry.userId ? entry.userId.name : 'Unknown User'}
                                    </span>{' '}
                                    claimed{' '}
                                    <span className="history-points">{entry.pointsClaimed}</span>{' '}
                                    points at{' '}
                                    <span className="history-timestamp">
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div> {/* End of main-content-area */}
        </div>
    );
}

export default App;
