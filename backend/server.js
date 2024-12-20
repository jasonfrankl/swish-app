// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Forage Map Backend is running.');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Mock Data
const bloomCalendarData = [
    {
        plant: 'Wildflower',
        bloomStart: '2023-04-01',
        bloomEnd: '2023-06-30',
        region: 'Midwest',
    },
    // Add more data as needed
];

// API Route
app.get('/api/bloom-calendar', (req, res) => {
    res.json(bloomCalendarData);
});


// In-memory array to store hive locations
const hiveLocations = [];

// Endpoint to Add a Hive Location
app.post('/api/hive-locations', (req, res) => {
    const newHive = req.body;
    hiveLocations.push(newHive);
    res.status(201).json(newHive);
});

// Endpoint to Get All Hive Locations
app.get('/api/hive-locations', (req, res) => {
    res.json(hiveLocations);
});
