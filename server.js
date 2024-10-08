const express = require('express');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to handle all GET requests
app.get('*', (req, res) => {
    const url = req.url;
    const targetUrl = `https://example.com${url}`; // change 'https://example.com' to the target site

    req.pipe(request(targetUrl)).pipe(res);
});

// Middleware to handle all POST requests
app.post('*', (req, res) => {
    const url = req.url;
    const targetUrl = `https://example.com${url}`; // change 'https://example.com' to the target site

    req.pipe(request({ url: targetUrl, method: 'POST', json: req.body })).pipe(res);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
