'use client';

import { useEffect, useRef, useState } from 'react';
import { saveApiKey } from '@/actions/api-keys';
import type { ApiKey } from '@/types';

const SCRAPE_PERMISSION = 'recipes:scrape';

function buildBookmarklet(apiKey: string) {
	const baseUrl = import.meta.env.VITE_BASE_URL;
	const code = `(function(){
  const scripts=[...document.querySelectorAll('script[type="application/ld+json"]')];
  const data=scripts.map(s=>{try{return JSON.parse(s.innerHTML)}catch(e){return null}}).filter(Boolean);
  if(!data.length)return alert('No JSON-LD found on this page');
  fetch('${baseUrl}/api/recipes/imports/scrapes',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer ${apiKey}'},
    body:JSON.stringify({url:location.href,jsonld:data})
  }).then(r=>r.json()).then(d=>{
    if(d.success)alert('Recipe imported!');
    else alert('Import failed: '+JSON.stringify(d.errors));
  }).catch(()=>alert('Import failed'));
})();`;
	return `javascript:${encodeURIComponent(code)}`;
}

export default function BookmarkletInstall({ apiKeys, userId }: { apiKeys: ApiKey[]; userId: string | undefined }) {
	const scrapeKeys = apiKeys.filter(k => k.permissions.includes(SCRAPE_PERMISSION) && !k.deletedAt);

	const [selectedKey, setSelectedKey] = useState<ApiKey | null>(scrapeKeys.length === 1 ? scrapeKeys[0] : null);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const linkRef = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		if (linkRef.current && selectedKey) {
			linkRef.current.href = buildBookmarklet(selectedKey.apiKey);
		}
	}, [selectedKey]);

	if (!userId) {
		return <p>No user ID provided, this page expects you to be logged in.</p>;
	}

	async function handleAutoCreate() {
		setIsCreating(true);
		setError(null);
		try {
			const result = await saveApiKey({
				name: `recipe-scraper-auto-create-${Date.now()}`,
				userId: userId ?? '',
				permissions: [SCRAPE_PERMISSION],
			});
			if (result?.success && result.data) {
				setSelectedKey(result.data as unknown as ApiKey);
			} else {
				setError('Failed to create API key. Please try again.');
			}
		} catch {
			setError('Failed to create API key. Please try again.');
		} finally {
			setIsCreating(false);
		}
	}

	return (
		<div className="bookmarklet-install">
			{scrapeKeys.length === 0 && !selectedKey && (
				<div className="bookmarklet-install__no-key">
					<p>You don't have an API key with recipe scraping permission yet.</p>
					<button type="button" onClick={handleAutoCreate} disabled={isCreating}>
						{isCreating ? 'Creating...' : 'Create one automatically'}
					</button>
					{error && <p className="bookmarklet-install__error">{error}</p>}
				</div>
			)}

			{scrapeKeys.length > 1 && !selectedKey && (
				<div className="bookmarklet-install__picker">
					<p>You have multiple API keys with recipe scraping permission. Choose one to use:</p>
					<ul>
						{scrapeKeys.map(k => (
							<li key={k.id}>
								<button type="button" onClick={() => setSelectedKey(k)}>
									{k.name}
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{selectedKey && (
				<div className="bookmarklet-install__ready">
					{scrapeKeys.length === 1 && (
						<p>
							We'll use your API key <strong>{selectedKey.name}</strong> for the bookmarklet.
						</p>
					)}

					<div className="bookmarklet-install__instructions">
						<p>{import.meta.env.VITE_BASE_URL}</p>

						<h3>Desktop Installation</h3>
						<ol>
							<li>Make sure your bookmarks bar is visible (View → Show Bookmarks Bar)</li>
							<li>Drag the button below to your bookmarks bar</li>
							<li>Navigate to any recipe page and click the bookmark to import it</li>
						</ol>

						<a
							ref={linkRef}
							href="about:blank"
							className="bookmarklet-install__button"
							onClick={e => e.preventDefault()}
							draggable
						>
							Import to Rezept
						</a>

						<h3>Mobile Safari Installation</h3>
						<ol>
							<li>Bookmark any page in Safari</li>
							<li>Open your bookmarks and find the one you just saved</li>
							<li>Edit it and replace the URL with the code below</li>
						</ol>

						<div className="bookmarklet-install__code">
							<code>{buildBookmarklet(selectedKey.apiKey)}</code>
							<button type="button" onClick={() => navigator.clipboard.writeText(buildBookmarklet(selectedKey.apiKey))}>
								Copy
							</button>
						</div>
					</div>

					{scrapeKeys.length > 1 && (
						<button type="button" onClick={() => setSelectedKey(null)}>
							Use a different key
						</button>
					)}
				</div>
			)}
		</div>
	);
}
