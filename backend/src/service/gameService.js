const GameDAO = require('../dao/gameDAO');
// const API_URL = 'https://ncaa-api.henrygd.me/scoreboard/basketball-men/d1';


async function handleGameFetch(url, sportType) {
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

        return activeGames;
    } catch (error) {
        console.error('Error fetching games:', error);
        throw error;  // Propagate error to WebSocket or API layer
    }
};


module.exports = {
    handleGameFetch
};