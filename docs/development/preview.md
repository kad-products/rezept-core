# Preview

To do a "preview" of the site you can run a couple commands and have `vite` serve it up as just a webserver:

```
pnpm build
pnpm preview
```

This is extra useful for debugging deploy-time failures (because CF makes sure the app works before accepting it for the worker).