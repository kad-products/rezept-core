import { JSDOM } from 'jsdom';

let config: Record<string, string[]> = {
	urlDebugList: [],
	urlSkipList: [],
};

const rawArgs = process.argv.slice(2);

if (rawArgs.length !== 2) {
	console.log(`No config argument provided, using defaults`);
} else {
	config = {
		...config,
		...(await loadConfig(rawArgs[1])),
	};
}

type APIResponseSingle = {
	success: boolean;
	error?: string;
	data: Record<string, string>;
};

type APIResponseArray = {
	success: boolean;
	data: Record<string, string>[];
};

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
		.filter(url => config.urlDebugList.length === 0 || config.urlDebugList.includes(url))
		.filter(url => config.urlSkipList.length === 0 || !config.urlSkipList.includes(url))
		.filter(Boolean),
);

for (const url of inSiteUrls) {
	console.log(`👉 Parsing ${url}`);

	try {
		const alreadyExists = await checkForExisting(url);
		if (alreadyExists) {
			console.log(`  ✅  Existing check ${alreadyExists}, skipping`);
			continue;
		}
	} catch (err) {
		console.log(`  🚨 Error checking if recipe exists`, err);
		process.exit(1);
	}

	try {
		const recipeDom = await fetchAndParse(url);
		const jsonLD = getJsonLd(recipeDom);

		if (!jsonLD.length || jsonLD.length === 0) {
			console.log(`  Recipe DOM is ${recipeDom.serialize().length} characters long`);
			console.log(`  Found ${jsonLD.length} JSON LD items`);
			console.log(`  ⚠️ No JSON data, skipping`);
			await new Promise(r => setTimeout(r, 2000));
			continue;
		}

		const apiResponse = await fetch(`${apiBase}/api/recipes/imports/scrapes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.REZEPT_API_KEY}`,
			},
			body: JSON.stringify({ url, jsonld: jsonLD }),
		});
		const result: APIResponseSingle = await apiResponse.json();
		if (result.success) {
			console.log(`  ✅ Scrape call succeeded (id ${result.data.id}, status ${result.data.status}) `);
			await new Promise(r => setTimeout(r, 20000));
		} else if (result?.error === 'No recipe found in payload') {
			console.log(`  ⚠️ No recipe found in payload`);
			await new Promise(r => setTimeout(r, 2000));
		} else {
			console.log(`  🚨 Scrape failed:\n${console.log(JSON.stringify(result, null, 2))}`);
			process.exit(1);
		}
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
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

async function checkForExisting(url: string): Promise<boolean> {
	const parsedURL = new URL(url);
	const searchResponse = await fetch(`${apiBase}/api/recipes/search`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.REZEPT_API_KEY}`,
		},
		body: JSON.stringify({ source: `${parsedURL.hostname}${parsedURL.pathname.replace(/\/$/, '')}` }),
	});

	const result: APIResponseArray = await searchResponse.json();
	if (result.success) {
		const { data: recipes } = result;
		return recipes.length === 1;
	}
	console.log(`  🚨 Error checking for existing: ${JSON.stringify(result, null, 4)}`);

	return false;
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

async function loadConfig(configName: string) {
	try {
		const config = await import(`./crawl-config.${configName}`);
		return config;
	} catch {
		return undefined;
	}
}
