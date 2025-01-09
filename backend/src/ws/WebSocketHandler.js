const GameService = require('../service/gameService');
const handleGameFetch = require('../api/APIRouter').handleGameFetch;

let clients = new Map();
let intervals = new Map();

function handleWebSocketConnection(ws, sportType = 'college_basketball') {
    console.log(`NICE  a websocket client has been connected for ${sportType}`);
    clients.set(ws, sportType);
    console.log('WebSocket client connected with default sport.');

    ws.on('message', (msg) => {
        const message = JSON.parse(msg);
        console.log('Message recieved from client: ', message);
        if (message.type === 'sportChange') {
            const newSportType = message.sportType;
            clients.set(ws, newSportType);
            console.log(`Client switched to ${newSportType}`);

            if (intervals.has(ws)) {
                clearInterval(intervals.get(ws));
            }
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
        const liveScores = await GameService.handleGameFetch(
            `https://ncaa-api.henrygd.me/scoreboard/${getApiPath(sportType)}`, sportType
        );
        console.log(`fetched scores for ${sportType}:`, liveScores);
        broadcastLiveScore(liveScores, sportType);
    } catch (error) {
        console.error('Websocket fetch error with fetchANdBroadcast', error.message);
    }
}

function broadcastLiveScore(liveScores, sportType) {
    console.log('This is the backend BROADCAST sportType that is being passed in: ', sportType);
    clients.forEach((clientSportType, client) => {
        console.log('This is the client sport type: ', clientSportType);
        console.log('This is the REGULAR SPORT TYPE IS WITHOUT NORMALIZATION ON THE BACKEND: ', sportType);
        if (client.readyState === 1 && clientSportType == sportType) {
            console.log(`Broadcasting live scores for ${sportType}`);
            client.send(JSON.stringify({ label: 'chat', data: liveScores }));
        }
    });
}

function getApiPath(sportType) {
    const apiPaths = {
        'college_basketball': 'basketball-men/d1',
        'womens_college_basketball': 'basketball-women/d1',
        'college_football': 'football/fbs'
    };
    return apiPaths[sportType] || 'basketball-men/d1';
}


module.exports = {
    handleWebSocketConnection
};