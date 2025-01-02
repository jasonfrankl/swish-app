const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressWs = require('express-ws');
const apiRouter = require('./api/APIRouter');

const app = express();
expressWs(app);  // Initialize express-ws for WebSocket support

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(apiRouter);
// WebSocket Route
app.ws('/ws', (ws, req) => {
    console.log('WebSocket client connected.');

    setInterval(() => {
        const liveScores = [
            {
                homeTeam: 'Team C',
                awayTeam: 'Team D',
                home: { score: Math.floor(Math.random() * 100) },
                away: { score: Math.floor(Math.random() * 100) },
                currentPeriod: 'Q3'
            }
        ];
        ws.send(JSON.stringify({ label: 'chat', data: liveScores }));
    }, 5000);

    ws.on('message', (msg) => {
        console.log(`Message received from client: ${msg}`);
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected.');
    });
});


// Basic API route for testing
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
    console.log('WebSocket route active at ws://localhost:3000/ws');
});



// const apiRouter = require('./api/APIRouter');
