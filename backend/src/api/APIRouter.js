const express = require('express');
const GameDAO = require('../dao/gameDAO');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');


const handleGameFetch = async (url, sportType, res) => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const games = data.games || [];

        const activeGames = games
            .filter(gameObj => {
                const game = gameObj.game;
                return game.currentPeriod !== "FINAL" && game.currentPeriod !== '';
            })
            .map(gameObj => {
                const game = gameObj.game;
                return {
                    homeTeam: game.home.names.short,
                    awayTeam: game.away.names.short,
                    currentPeriod: game.currentPeriod,
                    gameClock: game.contestClock,
                    score: {
                        home: game.home.score,
                        away: game.away.score
                    }
                };
            });

        // Call DAO method to add games to DB
        await GameDAO.addActiveGames(activeGames, sportType);

        res.json({ activeGames });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).send('Error fetching game data');
    }
};
// router.use('/api', createProxyMiddleware({
//     target: 'http://localhost:3000',  // Proxy to your backend API
//     changeOrigin: true
// }));

router.get('/api/health', (req, res) => {
    res.status(200).send("Backend in order");
});

router.get('/api/college-basketball/active-games', async (req, res) => {
    handleGameFetch('https://ncaa-api.henrygd.me/scoreboard/basketball-men/d1', 'college_basketball', res);
});

router.get('/api/college-basketball-women/active-games', async (req, res) => {
    handleGameFetch('https://ncaa-api.henrygd.me/scoreboard/basketball-women/d1', 'womens_college_basketball', res);
});

router.get('/api/college-football/active-games', async (req, res) => {
    handleGameFetch('https://ncaa-api.henrygd.me/scoreboard/football/fbs', 'college_football', res);
});
module.exports = router;




