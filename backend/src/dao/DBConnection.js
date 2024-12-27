const mariadb = require('mariadb');

let pool = null;

exports.getDatabaseConnection = () => {
    if (pool === null) {
        pool = mariadb.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            charset: process.env.DB_CHARSET
        });

    }

    return pool;
};

exports.query = (query, params) => {
    if (!query) {
        return;
    }
    const pool = exports.getDatabaseConnection();

    return pool.query(query, params).catch(err => {
        console.log(err);
        throw err;
    });
}

exports.close = () => {
    if (pool !== null) {
        pool.end();
    }
}