# Steps

The "step" name came from AWS Step Functions.  While those can technically do almost anything these steps are a bit more narrowly focused.  These are steps in data processing pipelines.  The original use case is sharing code between the recipe form processing and the recipe scrape processing.  They both have their entrypoints and they share repositoriy methods but these steps are the small streamline purpose-built pieces that come together in the full pipeline.

## Difference from middleware and interruptors

Things like `requirePermission()` might seem like a step rather than middleware/interruptor.  The difference is in the scope and specificity.  Just about every action and API will have a required permission so that should be middleware.  Only a couple things will need to take an array of recipe sections, try to save it, and handle the results. 

Also middleware always has to return a Response whereas steps return raw error and let the orchestrator determine the appropriate way to get back to the caller. 

That all being said if there is a way to streamline something like the CORS check or permissions check for other things having one central method for things is certainly favorable over these steps that are built for just one purpose. 

## Guidelines

- Throw the same typed error object so higher-level orchestrators (server actions, API handlers, etc) can easily deal with it as appropriate
- Expect the same or similar function signatures so it's easy to streamline the orchestrators