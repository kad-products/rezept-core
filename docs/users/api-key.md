 # API Keys

API keys let you access Rezept from scripts and other tools without logging in through the browser.

## Creating an API key

1. Go to **Profile → API Keys** and click **New API Key**.
2. Give the key a **name** so you can identify it later (e.g. "Import script").
3. Set a **revoke date** — the key will stop working after this date.
4. Select the **permissions** the key should have. Only grant what the script actually needs:
   - `recipes:upload` — upload a recipe file
   - `recipes:scrape` — import a recipe from a URL
5. Click **Create API Key** and copy the key shown. It will not be displayed again.

## Using an API key

Include the key as a Bearer token in the `Authorization` header of every request.

```bash
curl -X POST https://your-rezept-instance.com/api/recipes/imports/scrapes \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/some-recipe"}'
```

## Available endpoints

| Method | Path                           | Permission required |
| ------ | ------------------------------ | ------------------- |
| `POST` | `/api/recipes/imports/scrapes` | `recipes:scrape`    |
| `POST` | `/api/recipes/imports/uploads` | `recipes:upload`    |

## Revoking an API key

Go to **Profile → API Keys**, open the key, and either delete it or set its revoke date to today. Any request made with a revoked key will receive a `403` error.
