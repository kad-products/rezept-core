import { JSDOM } from 'jsdom';

const debugURLs: string[] = [];
const initialUrl = process.env.REZEPT_CRAWL_URL;
const apiBase = process.env.REZEPT_API_BASE;
if (!initialUrl) {
	console.log(`No URL provided`);
	process.exit();
}
if (!apiBase) {
	console.log(`No API base provided`);
	process.exit();
}
const crawlHost = new URL(initialUrl).hostname;

const crawledDOM = await fetchAndParse(initialUrl);
const anchors = [...crawledDOM.window.document.querySelectorAll('a')];
const inSiteUrls = new Set(
	anchors
		.map(anc => anc.href)
		.filter(url => url.includes(crawlHost))
		.filter(url => debugURLs.length === 0 || debugURLs.includes(url))
		.filter(Boolean),
);

for (const url of inSiteUrls) {
	console.log(`Parsing ${url}`);

	try {
		const recipeDom = await fetchAndParse(url);
		console.log(`  Recipe DOM is ${recipeDom.serialize().length} characters long`);
		const jsonLD = getJsonLd(recipeDom);
		console.log(`  Found ${jsonLD.length} JSON LD items`);

		if (!jsonLD.length || jsonLD.length === 0) {
			console.log(`No JSON data`);
		}

		const apiResponse = await fetch(`${apiBase}/api/recipes/imports/scrapes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.REZEPT_API_KEY}`,
			},
			body: JSON.stringify({ url, jsonld: jsonLD }),
		});
		const result = await apiResponse.json();
		console.log(JSON.stringify(result, null, 2));
	} catch (err) {
		console.log(err);
	}

	await new Promise(r => setTimeout(r, 10000));
}

async function fetchAndParse(url: string): Promise<JSDOM> {
	const response = await fetch(url);
	try {
		const text = await response.text();

		return new JSDOM(text);
	} catch (err) {
		console.log(err);
		console.log(response.text());
		throw err;
	}
}

function getJsonLd(dom: JSDOM): unknown[] {
	const scripts = [...dom.window.document.querySelectorAll('script[type="application/ld+json"]')];
	return scripts
		.map(s => {
			try {
				return JSON.parse(s.innerHTML);
			} catch (e) {
				console.error(`Error parsing HTML: ${e}`);
				return null;
			}
		})
		.filter(Boolean);
}
