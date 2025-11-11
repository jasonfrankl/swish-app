const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the browser build directory
app.use(express.static(path.join(__dirname, '/dist')));

// Catch-all route for SPA (must be last)
app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
