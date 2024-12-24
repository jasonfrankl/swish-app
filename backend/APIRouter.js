const express = require('express');

const router = express.Router();

router.get('/api/college-basketball/active-games', async (req, res) => {
    try {
        const response = await fetch('https://ncaa-api.henrygd.me/scoreboard/basketball-men/d1');

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
                    score: {
                        home: game.home.score,
                        away: game.away.score
                    }
                };
            });

        res.json({ activeGames });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).send('Error fetching game data');
    }
});


router.get('/api/college-basketball-women/active-games', async (req, res) => {
    try {
        const response = await fetch('https://ncaa-api.henrygd.me/scoreboard/basketball-women/d1');

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
                    score: {
                        home: game.home.score,
                        away: game.away.score
                    }
                };
            });

        res.json({ activeGames });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).send('Error fetching game data');
    }
});

router.get('/api/college-football/active-games', async (req, res) => {
    try {
        const response = await fetch('https://ncaa-api.henrygd.me/scoreboard/football/fbs');

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
                    score: {
                        home: game.home.score,
                        away: game.away.score
                    }
                };
            });

        res.json({ activeGames });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).send('Error fetching game data');
    }
});

module.exports = router;




