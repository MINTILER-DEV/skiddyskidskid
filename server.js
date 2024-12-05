const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const urlLib = require('url');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files like HTML, CSS, JS if necessary
app.use(express.static('public'));

app.get('/proxy', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('No URL provided');
    }

    try {
        // Launch headless browser using Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Navigate to the provided URL
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Get rendered HTML content
        let content = await page.content();

        // Convert relative links to absolute links
        content = await convertRelativeLinksToAbsolute(page, content, url);

        // Return the updated content in the response
        res.set('Content-Type', 'text/html');
        res.send(content);

        await browser.close();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching the page');
    }
});

// Utility function to convert relative links to absolute links
async function convertRelativeLinksToAbsolute(page, htmlContent, baseUrl) {
    return await page.evaluate((baseUrl, htmlContent) => {
        const base = document.createElement('base');
        base.href = baseUrl;
        document.head.appendChild(base);
        const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
        const absoluteLinks = doc.querySelectorAll('a[href], img[src], link[href], script[src]');

        absoluteLinks.forEach(el => {
            let link = el.getAttribute(el.tagName === 'A' ? 'href' : 'src');
            if (link && !link.startsWith('http') && !link.startsWith('data:')) {
                el.setAttribute(el.tagName === 'A' ? 'href' : 'src', new URL(link, baseUrl).href);
            }
        });

        return doc.documentElement.outerHTML;
    }, baseUrl, htmlContent);
}

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
