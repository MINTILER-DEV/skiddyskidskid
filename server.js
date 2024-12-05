const express = require('express');
const axios = require('axios');
const cors = require('cors');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

app.get('/proxy', async (req, res) => {
    const urls = req.query.urls; // Accept comma-separated URLs

    if (!urls) {
        return res.status(400).send('No URLs provided');
    }

    const urlList = urls.split(','); // Split URLs into an array

    try {
        // Launch headless browser
        const browser = await puppeteer.launch({ headless: true });
        const pagesContent = {};

        // Iterate over the URLs
        for (let i = 0; i < urlList.length; i++) {
            const url = urlList[i].trim();
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: 'networkidle2', // Wait for the page to fully load
            });

            // Get the rendered HTML content
            const content = await page.content();
            pagesContent[`tab_${i + 1}`] = content;

            // Close the tab after fetching content
            await page.close();
        }

        await browser.close();

        // Return all tab contents as JSON
        res.json(pagesContent);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching the pages');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
