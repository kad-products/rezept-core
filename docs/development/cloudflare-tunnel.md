# Local Development with Cloudflare Tunnel

Some features require testing from an external origin — most notably the bookmarklet, which makes cross-origin requests from third-party recipe sites to your local dev server. A Cloudflare Tunnel exposes your local server over a public HTTPS URL, allowing you to test these flows without deploying to integration.

## Setup

### 1. Install cloudflared

```bash
brew install cloudflared
```

### 2. Start the tunnel

In one terminal, start the tunnel pointing at Vite's default port:

```bash
cloudflared tunnel --url http://localhost:5173
```

Copy the hostname it gives you (e.g. `abc-123.trycloudflare.com`).

### 3. Create your env file

Create `.env.tunnel` in the project root (this file is gitignored):

```
VITE_BASE_URL=https://abc-123.trycloudflare.com
```

You can also use an ngrok hostname here if you prefer ngrok over Cloudflare Tunnel.

### 4. Start the dev server in tunnel mode

```bash
pnpm dev --mode tunnel
```

This loads `.env.tunnel` and applies the following changes to the Vite config driven by `VITE_BASE_URL`:

- `server.cors: false` — disables Vite's built-in CORS middleware, which would otherwise intercept OPTIONS requests before they reach your Worker. This is required for the bookmarklet's cross-origin preflight requests to work correctly.
- `server.allowedHosts` — adds the tunnel hostname so Vite accepts incoming requests from it.
- `server.hmr.host` and `server.hmr.protocol: 'wss'` — points HMR at the tunnel hostname over secure WebSockets so hot reloading works through the tunnel.

## WebAuthn / Passkeys

The passkey authentication flow requires HTTPS. When running in tunnel mode, the tunnel provides HTTPS automatically, so passkeys work without any additional configuration. In normal local dev (`pnpm dev`), passkeys will not work since localhost is HTTP-only.

## Notes

- Cloudflare Tunnel free tier hostnames are ephemeral — they change each time you start the tunnel. Update `VITE_BASE_URL` in `.env.tunnel` and restart the dev server.
- `server.cors: false` only applies in tunnel mode. Normal `pnpm dev` keeps Vite's default CORS handling.
- `VITE_BASE_URL` is used throughout the app for anything that needs the current environment's base URL, including the bookmarklet install page and WebAuthn origin configuration.