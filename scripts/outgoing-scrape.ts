import { JSDOM } from 'jsdom';

const url = process.env.REZEPT_SCRAPE_URL;
const apiBase = process.env.REZEPT_API_BASE;
if (!url) {
	console.log(`No URL provided`);
	process.exit();
}
if (!apiBase) {
	console.log(`No API base provided`);
	process.exit();
}
const response = await fetch(url);

const text = await response.text();

const dom = new JSDOM(text);
const scripts = [...dom.window.document.querySelectorAll('script[type="application/ld+json"]')];
const data = scripts
	.map(s => {
		try {
			return JSON.parse(s.innerHTML);
		} catch (e) {
			console.error(`Error parsing HTML: ${e}`);
			return null;
		}
	})
	.filter(Boolean);

if (!data.length) {
	throw new Error('No JSON-LD found on this page');
}

const scrapeData = { url, jsonld: data };

console.log(`Scrape data for ${url}:\n${JSON.stringify(scrapeData, null, 2)}`);
console.log(`Sending scrape data to API endpoint ${apiBase}/api/recipes/imports/scrapes...`);
console.log(`Using API key from environment variable REZEPT_API_KEY: ${process.env.REZEPT_API_KEY}`);

const apiResponse = await fetch(`${apiBase}/api/recipes/imports/scrapes`, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${process.env.REZEPT_API_KEY}`,
	},
	body: JSON.stringify(scrapeData),
});
const result = await apiResponse.json();

console.log(JSON.stringify(result, null, 2));
