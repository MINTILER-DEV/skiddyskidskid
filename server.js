const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to handle JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Middleware to handle all GET requests
app.get('/', (req, res) => {
    const targetUrl = req.query.url; // Get the URL from the query parameter

    if (!targetUrl) {
        return res.status(400).send('Missing "url" query parameter.');
    }

    // Pipe the request to the target URL and return the rendered webpage
    request(targetUrl).pipe(res);
});

// Middleware to handle all POST requests
app.post('/', (req, res) => {
    const targetUrl = req.query.url; // Get the URL from the query parameter

    if (!targetUrl) {
        return res.status(400).send('Missing "url" query parameter.');
    }

    req.pipe(request({ url: targetUrl, method: 'POST', json: req.body })).pipe(res);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
