const express = require('express');
const router = express.Router();
const GameService = require('../service/gameService');


router.get('/api/health', (req, res) => {
    res.status(200).send("Backend in order");
});

router.get('/api/:sport/active-games', async (req, res) => {
    const sportType = req.params.sport;
    const apiUrl = getApiUrl(sportType);
    try {
        const liveScores = await GameService.handleGameFetch(apiUrl, sportType);
        res.json({ activeGames: liveScores });
    } catch (error) {
        console.error('Error fetching games:', error.message);
        res.status(500).send('ERROR fetching game data');
    }
});


function getApiUrl(sportType) {
    const apiPaths = {
        'basketball-men': 'basketball-men/d1',
        'basketball-women': 'basketball-women/d1',
        'football': 'football/fbs'
    };
    const baseUrl = 'https://ncaa-api.henrygd.me/scoreboard';
    return `${baseUrl}/${apiPaths[sportType] || apiPaths['basketball-men']}`;
}


module.exports = router;




