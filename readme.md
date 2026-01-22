# RedwoodSDK Minimal Starter

This is the starter project for RedwoodSDK. It's a template designed to get you up and running as quickly as possible.

Create your new project:

```shell
npx create-rwsdk my-project-name
cd my-project-name
npm install
```

## Running the dev server

```shell
npm run dev
```

Point your browser to the URL displayed in the terminal (e.g. `http://localhost:5173/`). You should see a "Hello World" message in your browser.

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)

## Project Structure

- `/src/layouts`: Highest level non-framework components that define the page layout.  Probably will just be one for the user-facing stuff and one for any administrative views.
- `/src/models`: Files in here are used by Drizzle to build the migrations and ORM tooling.  These should only be used by Drizzle or imported by Repositories, no other application runtime code should reference them.
- `/src/pages`: Page-level components organized by the URL they are responsible for.
- `/src/repositories`: Data access methods to be used throughout the rest of the application.
- `/src/styles`: CSS and LESS files for styling the application

## Database 

Using D1 for essentially everything but session objects.

### Schema Changes

1. Add/adjust schemas in the appropriate `/src/models` file(s)
2. Run `pnpm migrate:new` to create the SQL file(s) in `/drizzle`
3. Run `pnpm migrate:dev` to apply that to the dev D1 instance in `/.wrangler/state/v3/d1/*`
4. Run `pnpm dev` to operation with the new changes

### Drizzle Studio

1. Run `pnpm drizzle-kit studio` to fire up Drizzle Studio on `https://local.drizzle.studio`