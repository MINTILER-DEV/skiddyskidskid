const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to handle JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Route to render HTML from a provided URL
app.get('/api/render', async (req, res) => {
    const targetUrl = req.query.url; // Get the URL from the query parameter

    if (!targetUrl) {
        return res.status(400).send('Missing "url" query parameter.');
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
        });

        const page = await browser.newPage();
        await page.goto(targetUrl, { waitUntil: 'networkidle2' });
        const html = await page.content();

        await browser.close();

        res.send(html); // Send the rendered HTML back to the client
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while rendering the page.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Headless browser API is running on port ${PORT}`);
});
