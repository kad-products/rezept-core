# Workflows

Code within this directory defines background processing workflows that run outside the request/response cycle via [Cloudflare Workflows](https://developers.cloudflare.com/workflows/). They handle work that is too slow, too parallel, or too asynchronous to do inline in an API handler or action.

## How it works

Each workflow is a class extending `WorkflowEntrypoint` from `cloudflare:workers`. A workflow is triggered by a `POST /api/workflows/:workflow-name` request, which calls `env.<workflow-name>.create(params)`. The CF Workflows runtime executes the `run()` method, automatically persisting state across steps so that failures mid-workflow don't restart from the beginning.

Workflows are passed a `step` object that can `.do()` something or `.sleep()` for an amount of time.  Those steps (not our `src/steps/*` data pipelines) are the unit of execution and retry. Each step runs in isolation — if a step fails, CF retries it independently without re-running steps that already succeeded.

For workflows that need to process many records in parallel, a parent workflow spawns child workflows — one per record. Each child gets its own CPU budget.

## Directory structure

```
src/workflows/
  readme.md                   — this file
  <workflow-name>.ts          — one file per workflow; exports the WorkflowEntrypoint class and standalone step functions
  index.ts                    — barrel export; re-exports all workflow classes for worker.tsx
```

## Adding a new workflow

1. Create `src/workflows/<workflow-name>.ts` with the `WorkflowEntrypoint` subclass
2. Add the wrangler binding in `wrangler.jsonc`:
   ```jsonc
   {
     "name": "workflow-name",
     "binding": "WORKFLOW_NAME",
     "class_name": "WorkflowNameWorkflow"
   }
   ```
3. Export the class from `src/workflows/index.ts` and ensure it is re-exported from `worker.tsx`
4. Add the workflow name to the known-names const in `src/models/workflows.ts`

The `class_name` in wrangler must exactly match the exported class name. CF's runtime resolves the binding to the exported class by name — the same mechanism used for Durable Objects.

## Wrangler configuration

Workflows are declared under a top-level `"workflows"` key, not per-environment (the same as `"migrations"`). The binding is what you use in code (`env.WORKFLOW_NAME`); the name is the CF-side queue identifier; the `class_name` is the export that wires them together.

```jsonc
"workflows": [
  {
    "name": "scrape-reprocess",
    "binding": "SCRAPE_REPROCESS_WORKFLOW",
    "class_name": "ScrapeReprocessWorkflow"
  }
]
```

## CPU limits and sub-workflows

CF Workflows allows 5 minutes of CPU time per instance. Time spent in `step.sleep()` or waiting on I/O does not count against this limit — only active CPU.

For workflows that process many records, spawn child workflows rather than looping inline:

```typescript
// Parent fans out — each child gets its own 5-minute CPU budget
for (const record of records) {
  await step.do(`spawn-${record.id}`, async () => {
    await env.CHILD_WORKFLOW.create({ params: { recordId: record.id } });
  });
}
```

The parent can fire-and-forget children or retain their instance IDs for status checking, depending on whether the parent needs to coordinate completion.

## Logging

Create the logger at the top of `run()` by passing the event to `createWorkflowLogger`. This automatically binds `instanceId`, `workflowName`, and `triggeredAt` to every log line, making it straightforward to find all logs for a specific workflow run in the CF log viewer.

```typescript
import { createWorkflowLogger } from '@/logger';

export class ScrapeReprocessWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const logger = createWorkflowLogger(event);
    // All log lines from this run will include instanceId, workflowName, triggeredAt
  }
}
```

Use `logger.child({ task: 'step-name' })` to scope logs to a specific step, or pass `logger` directly to steps and repositories as with request handlers.

## Development

Once the workflow API is wired up for a new workflow calling that API via curl works reasonably well:

```sh
curl -X POST http://rezept.localhost:5173/api/workflows/recipe-raw-ingredients-to-ingredients \
  -H "Authorization: Bearer rz_std_<redaced>" \
  -H "Content-Type: application/json"
```

## Testing

Step logic should be implemented as standalone exported async functions, keeping them independently unit-testable without involving the workflow runtime:

```typescript
// src/workflows/scrape-reprocess.ts

export async function fetchScrapesToReprocess(logger: RzLogger): Promise<Scrape[]> {
  // testable in isolation
}

export async function reprocessScrape(scrapeId: string, logger: RzLogger): Promise<void> {
  // testable in isolation
}

export class ScrapeReprocessWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const logger = createWorkflowLogger(event);
    const scrapes = await step.do('fetch-scrapes', () => fetchScrapesToReprocess(logger));
    for (const scrape of scrapes) {
      await step.do(`reprocess-${scrape.id}`, () => reprocessScrape(scrape.id, logger));
    }
  }
}
```

The `WorkflowEntrypoint` class itself is integration-tested using the Vitest setup described in the [CF Workflows testing docs](https://developers.cloudflare.com/workflows/testing/vitest/).

## Status tracking

CF Workflows provides native instance status via `env.MY_WORKFLOW.get(instanceId)`. The trigger API should return the instance ID to the caller so they can poll `GET /api/workflows/:workflow-name/:instance-id` for current status.

## Conventions

- **Workflow names are kebab-case** — they appear in API paths and map directly to filenames in `workflows/`
- **Step names must be stable** — CF uses step names to identify completed steps on replay; changing a step name causes it to re-run
- **Steps must be idempotent** — CF Workflows guarantees at-least-once step execution on failure; check whether work is already done before doing it
- **Fail fast in steps** — throw from a step to trigger CF's retry mechanism; don't silently swallow errors
- **Use `step.sleep()` for delays** — sleeping does not consume CPU time; never use polling loops for waiting
