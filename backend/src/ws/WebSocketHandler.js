const GameService = require('../service/gameService');
const handleGameFetch = require('../api/APIRouter').handleGameFetch;

let clients = new Map();

function handleWebSocketConnection(ws, sportType = 'college_basketball') {
    console.log(`NICE  a websocket client has been connected for ${sportType}`);
    clients.set(ws, sportType);
    console.log('WebSocket client connected with default sport.');

    ws.on('message', (msg) => {
        const message = JSON.parse(msg);
        console.log('Message recieved from client: ', message);
        if (message.type === 'sportChange') {
            clients.set(ws, message.sportType);
            console.log(`Client switched to ${message.sportType}`);
        }
    });

    // Fetch live scores every 30 seconds and broadcasts
    const intervalId = setInterval(async () => {
        try {
            const liveScores = await GameService.handleGameFetch(
                `https://ncaa-api.henrygd.me/scoreboard/${getApiPath(sportType)}`, sportType
            );
            broadcastLiveScore(liveScores, sportType);  // Make sure this matches the function name
        } catch (error) {
            console.error('WebSocket fetch error:', error.message);
        }
    }, 30000);

    ws.on('close', () => {
        console.log('Whoops client disconnected');
        clients.delete(ws);
        clearInterval(intervalId);
    });
}

function broadcastLiveScore(liveScores, sportType) {

    const sportTypeMap = {
        'college-basketball': 'college_basketball',
        'womens-college-basketball': 'womens_college_basketball',
        'college-football': 'college_football'
    };
    const dbSportType = sportTypeMap[sportType] || 'college_basketball';

    clients.forEach((clientSportType, client) => {
        if (client.readyState === 1 && clientSportType == dbSportType) {
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