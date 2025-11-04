const express = require('express');
const path = require('path');
const app = express();
// const { createProxyMiddleware } = require('http-proxy-middleware');
const apiRouter = require(path.join(__dirname, '../backend/src/api/APIRouter'));
// const { Server } = require('socket.io');

// app.use(express.static(__dirname + '/dist/forage-for-cool-bees-frontend'));

// app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, '/dist/forage-for-cool-bees-frontend/index.html'));
// });

// Serve static files from the browser build directory
// Serve static files from the 'browser' directory
app.use(express.static(__dirname + '/dist/forage-for-cool-bees-frontend/browser'));




// Use API router for all API calls
app.use(apiRouter);

// Health check (optional - must come before catch-all route)
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

// Catch-all route for SPA (must be last)
app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/forage-for-cool-bees-frontend/browser/index.html'));
});

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
