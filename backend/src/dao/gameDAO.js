const db = require('./DBConnection');
const moment = require('moment');

class GameDAO {
    static async addActiveGames(activeGames, sportType) {
        // If you expect sportType to be normalized already,
        // you can simply do a quick check or fallback to a default.
        const validSports = ['basketball-men', 'basketball-women', 'football'];
        const dbSportType = validSports.includes(sportType) ? sportType : 'basketball-men';
        console.log("HERE IS WHAT THE DATABASE IS USING: ", dbSportType);

        try {
            // Iterate over each game and check if it exists
            for (const game of activeGames) {
                const { homeTeam, awayTeam, gameClock, score, currentPeriod } = game;

                const [existingGame] = await db.query(
                    'SELECT * FROM games WHERE home_team = ? AND away_team = ? AND sport_type = ?',
                    [homeTeam, awayTeam, dbSportType]
                );

                if (!existingGame) {
                    await db.query(
                        'INSERT INTO games (sport_type, home_team, away_team, game_date, game_period, game_clock, home_score, away_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            dbSportType,
                            homeTeam,
                            awayTeam,
                            moment().format('YYYY-MM-DD HH:mm:ss'),
                            currentPeriod,
                            gameClock || '00:00',
                            score.home,
                            score.away
                        ]
                    );
                } else {
                    // Update the game clock if the game exists
                    await db.query(
                        'UPDATE games SET game_clock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [gameClock, existingGame.id]
                    );
                }
            }
        } catch (error) {
            console.error('Error adding active games:', error);
            throw error;
        }
    }
}

module.exports = GameDAO;
