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
        console.log('WebSocket is initialized and listening for connections...');

    });
} else {
    app.listen(PORT, () => {
        console.log(`Backend server running at http://localhost:${PORT}`);
    });
}

// Mock function to simulate fetching live scores
async function fetchLiveScores() {
    const response = await fetch('https://ncaa-api.henrygd.me/scoreboard/basketball-men/d1');
    const data = await response.json();
    return data.games.map(game => ({
        homeTeam: game.game.home.names.short,
        awayTeam: game.game.away.names.short,
        homeScore: game.game.home.score,
        awayScore: game.game.away.score,
        currentPeriod: game.game.currentPeriod
    }));
}
