const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRouter = require('./api/APIRouter');
const { Server } = require('socket.io');
const http = require('http');  // Add http for WebSockets

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(apiRouter);  // Mount the API routes to handle /api calls


// Only start WebSocket when the container is running (not during Docker build)
if (process.env.WEBSOCKET_ENABLED === 'true') {
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: '*'
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        setInterval(async () => {
            const liveScores = await fetchLiveScores();
            socket.emit('scoreUpdate', liveScores);
        }, 10000);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    server.listen(PORT, () => {
        console.log(`WebSocket server running at http://localhost:${PORT}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`Backend server running at http://localhost:${PORT}`);
    });
}

// Mock function to simulate fetching live scores
async function fetchLiveScores() {
    return [
        { homeTeam: 'Team A', awayTeam: 'Team B', homeScore: 75, awayScore: 65 }
    ];
}