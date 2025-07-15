// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import global CSS if any
import './App.css';
import App from './App'; // Import the main App component

import reportWebVitals from './reportWebVitals'; // For performance monitoring

// Create a root to render the React application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* Render the App component */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
