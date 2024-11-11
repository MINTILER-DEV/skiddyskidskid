const express = require('express');
const axios = require('axios');
const cors = require('cors');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

app.get('/proxy', async (req, res) => {
    const gameUrl = req.query.url;

    if (!gameUrl) {
        return res.status(400).send('No URL provided');
    }

    try {
        // Launch headless browser using Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        // Go to the target URL
        await page.goto(gameUrl, {
            waitUntil: 'networkidle2', // Wait for the page to fully load
        });

        // Get the rendered HTML content
        const content = await page.content();

        // Send back the rendered HTML content
        res.set('Content-Type', 'text/html');
        res.send(content);

        await browser.close();
    } catch (error) {
        res.status(500).send('Error fetching the game');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
