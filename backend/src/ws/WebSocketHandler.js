const GameService = require('../service/gameService');
const handleGameFetch = require('../api/APIRouter').handleGameFetch;

let clients = new Map();
let intervals = new Map();

// Use the normalized value "basketball-men" as the default.
function handleWebSocketConnection(ws, sportType = 'basketball-men') {
    console.log(`NICE  a websocket client has been connected for ${sportType}`);
    clients.set(ws, sportType);
    console.log('WebSocket client connected with default sport.');

    ws.on('message', (msg) => {
        const message = JSON.parse(msg);
        console.log('Message received from client: ', message);
        if (message.type === 'sportChange') {
            const newSportType = message.sportType; // Expect this to be one of: "basketball-men", "basketball-women", or "football"
            clients.set(ws, newSportType);
            console.log(`Client switched to ${newSportType}`);

            if (intervals.has(ws)) {
                clearInterval(intervals.get(ws));
            }
            // Immediately fetch and then restart periodic fetching for the new sport.
            fetchAndBroadcast(ws, newSportType);
            startFetchingScores(ws, newSportType);
        }
    });

    ws.on('close', () => {
        console.log('Whoops client disconnected');
        clients.delete(ws);
        clearInterval(intervals.get(ws));
        intervals.delete(ws);
    });
}

function startFetchingScores(ws, sportType) {
    fetchAndBroadcast(ws, sportType);
    const intervalId = setInterval(() => {
        fetchAndBroadcast(ws, sportType);
    }, 30000);
    intervals.set(ws, intervalId);
}

async function fetchAndBroadcast(ws, sportType) {
    console.log(`fetching scores for ${sportType}`);
    try {
        // Build the API URL using the normalized sportType
        const liveScores = await GameService.handleGameFetch(
            `https://ncaa-api.henrygd.me/scoreboard/${getApiPath(sportType)}`,
            sportType
        );
        console.log(`fetched scores for ${sportType}:`, liveScores);
        broadcastLiveScore(liveScores, sportType);
    } catch (error) {
        console.error('Websocket fetch error with fetchAndBroadcast', error.message);
    }
}

function broadcastLiveScore(liveScores, sportType) {
    console.log('Broadcasting live scores for:', sportType);
    // No extra mapping here because sportType is already normalized.
    clients.forEach((clientSportType, client) => {
        console.log('Client sport type:', clientSportType);
        if (client.readyState === 1 && clientSportType === sportType) {
            console.log(`Sending live scores for ${sportType}`);
            client.send(JSON.stringify({ label: 'chat', sportType: sportType, data: liveScores }));
        }
    });
}

function getApiPath(sportType) {
    // Use normalized keys that match our frontend and API expectations.
    const apiPaths = {
        'basketball-men': 'basketball-men/d1',
        'basketball-women': 'basketball-women/d1',
        'football': 'football/fbs'
    };
    return apiPaths[sportType] || 'basketball-men/d1';
}

module.exports = {
    handleWebSocketConnection
};
