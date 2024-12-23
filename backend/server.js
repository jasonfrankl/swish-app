const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRouter = require('./APIRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('App is running.');
});

// Use API Router
app.use(apiRouter);

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
