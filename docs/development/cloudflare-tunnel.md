# Local Development with Cloudflare Tunnel

Some features require testing from an external origin — most notably the bookmarklet, which makes cross-origin requests from third-party recipe sites to your local dev server. A Cloudflare Tunnel exposes your local server over a public HTTPS URL, allowing you to test these flows without deploying to integration.

## Setup (named tunnel — preferred)

The `arsdehnel-dev` tunnel is a persistent named tunnel with a fixed hostname (`rezept-local.arsdehnel.dev`). Use this in preference to the ephemeral free-tier approach below.

### 1. Ensure cloudflared is installed and authenticated

```bash
brew install cloudflared
cloudflared login  # only needed once — installs cert to ~/.cloudflared/cert.pem
```

### 2. Start the tunnel

```bash
cloudflared tunnel run --token $(cloudflared tunnel token 774c890e-af80-4220-9e5e-e8144e8fa165)
```

### 3. Start the dev server in tunnel mode

In a second terminal:

```bash
pnpm dev --mode tunnel.local
```

This loads `.env.tunnel.local` (which sets `VITE_BASE_URL=https://rezept-local.arsdehnel.dev`) and applies the following changes to the Vite config:

- `server.cors: false` — disables Vite's built-in CORS middleware so OPTIONS preflight requests from the bookmarklet reach your Worker
- `server.allowedHosts` — adds the tunnel hostname so Vite accepts incoming requests from it
- `server.hmr.host` and `server.hmr.protocol: 'wss'` — points HMR at the tunnel hostname over secure WebSockets so hot reloading works through the tunnel

Because the hostname is fixed, `.env.tunnel.local` never needs to be updated between sessions.

---

## Setup (free ephemeral tunnel)

Use this if the named tunnel is unavailable. The hostname changes every session.

### 1. Start the tunnel

```bash
cloudflared tunnel --url http://localhost:5173
```

Copy the hostname it prints (e.g. `abc-123.trycloudflare.com`).

### 2. Create your env file

Create `.env.tunnel` in the project root (gitignored):

```
VITE_BASE_URL=https://abc-123.trycloudflare.com
```

Update this each session when the hostname changes.

### 3. Start the dev server

```bash
pnpm dev --mode tunnel
```

---

## WebAuthn / Passkeys

The passkey authentication flow requires HTTPS. Both tunnel modes provide HTTPS automatically, so passkeys work without any additional configuration. Normal `pnpm dev` (no tunnel) runs over HTTP — passkeys will not work in that mode.

## Notes

- `server.cors: false` only applies in tunnel mode. Normal `pnpm dev` keeps Vite's default CORS handling.
- The tunnel provides the HTTPS origin that WebAuthn requires. The `origin` for passkey verification is derived from the incoming request URL, so no additional configuration is needed when switching between tunnel hostnames.
