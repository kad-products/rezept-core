# CF Scrape 

While I don't love scraping other peoples' sites we're trying to build a web of connecting cooks to recipes and we can't realistically wait til we have manually entered enough recipes for our site to be useful.  We're going to try to start building out a decent library of recipes and plan to give full attribution, encourage linking to the source, and even work on ways to pay the authors via our app.  

To start a scrape:

```sh
export REZEPT_CRAWL_URL="<the url to scrape>"

curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/browser-rendering/crawl" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H 'Content-Type: application/json' \
  -d "{
    \"url\": \"${REZEPT_CRAWL_URL}\"
  }" | jq
```

Then grab the job ID from the response and plug it in here to see the results:

```sh
curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/browser-rendering/crawl/<job id>" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq
```

Once it is complete it will return the content, too, so perhaps push it into a JSON file:

```sh
curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/browser-rendering/crawl/<job id>" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq > results.json
```
