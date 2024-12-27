const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRouter = require('./api/APIRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('App is running.');
});

app.use(apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
