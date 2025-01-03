const express = require('express');
const GameDAO = require('../dao/gameDAO');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const GameService = require('../service/gameService');


// async function handleGameFetch(url, sportType, res) {
//     try {
//         const liveScores = await GameService.fetchLiveScores(sportType);
//         res.json({ activeGames: liveScores });
//     } catch (error) {
//         console.error('Error fetching games:', error.message);
//         res.status(500).send('Error fetching game data');
//     }
// }

router.get('/api/health', (req, res) => {
    res.status(200).send("Backend in order");
});

router.get('/api/college-basketball/active-games', async (req, res) => {
    try {
        const liveScores = await GameService.handleGameFetch(
            'https://ncaa-api.henrygd.me/scoreboard/basketball-men/d1',
            'college_basketball'
        );
        res.json({ activeGames: liveScores });
    } catch (error) {
        console.error('Error fetching games:', error.message);
        res.status(500).send('Error fetching game data');
    }
});

router.get('/api/college-basketball-women/active-games', async (req, res) => {
    handleGameFetch('https://ncaa-api.henrygd.me/scoreboard/basketball-women/d1', 'womens_college_basketball', res);
});

router.get('/api/college-football/active-games', async (req, res) => {
    handleGameFetch('https://ncaa-api.henrygd.me/scoreboard/football/fbs', 'college_football', res);
});
module.exports = router;




