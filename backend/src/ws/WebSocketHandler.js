const GameService = require('../service/gameService');
const handleGameFetch = require('../api/APIRouter').handleGameFetch;

let clients = new Set();

function handleWebSocketConnection(ws) {
    console.log('NICE a websocket client has been connected');
    clients.add(ws);
    // Fetch live scores every 30 seconds and broadcast
    const intervalId = setInterval(async () => {
        try {
            const liveScores = await GameService.handleGameFetch(
                'https://ncaa-api.henrygd.me/scoreboard/basketball-men/d1',
                'college_basketball'
            );
            broadcastLiveScore(liveScores);  // Make sure this matches the function name
        } catch (error) {
            console.error('WebSocket fetch error:', error.message);
        }
    }, 30000);

    ws.on('message', (msg) => {
        console.log('Message from client: ${msg}');
    });

    ws.on('close', () => {
        console.log('Whoops client disconnected');
        clients.delete(ws);
        clearInterval(intervalId);
    });
}

function broadcastLiveScore(liveScores) {
    clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify({ label: 'chat', data: liveScores }));
        }
    });
}

// setInterval(async () => {
//     try {
//         const liveScores = await GameService.fetchLiveScores();
//         broadcastLiveScores(liveScores);
//         console.log('scores broadcasted');
//     } catch (error) {
//         console.error('Failed to fetch and broadcast live scores:', error);
//     }
// }, 30000);

module.exports = {
    handleWebSocketConnection
};