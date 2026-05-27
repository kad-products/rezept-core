# Jobs

Jobs are background processing units that run outside the request/response cycle via Cloudflare Queues. They handle work that is too slow, too parallel, or too asynchronous to do inline in an API handler or action.

## How it works

Jobs use a two-queue fan-out pattern:

1. A trigger API call (`POST /api/jobs/:job-name`) creates a `background_jobs` record and publishes an **orchestration message** to the orchestration queue.
2. The **orchestrator** receives that message, queries for all records that need processing, and publishes one **processing message** per record to the processing queue.
3. **Processors** receive individual messages and do the actual work for one record at a time.

This keeps individual queue messages small and allows CF Queues to scale and retry work at the record level rather than the job level.

## Directory structure

```
src/jobs/
  readme.md               — this file
  director.ts             — registered in defineApp; routes queue messages to the right orchestrator or processor
  orchestrators/
    <job-name>.ts         — one file per job; handles the fan-out
  processors/
    <job-name>.ts         — one file per job; handles one unit of work
```

## Job names

Job names are kebab-case strings defined in `src/models/background-jobs.ts` as the `backgroundJobName` const array. Adding a new job requires:

1. Adding the name to `backgroundJobName` in the model
2. Creating `src/jobs/orchestrators/<job-name>.ts`
3. Creating `src/jobs/processors/<job-name>.ts`
4. Adding a case for each in `src/jobs/director.ts`

The trigger API (`POST /api/jobs/:job-name`) returns 404 for any name not in the enum — unknown names never reach the queue.

## Conventions

- **Job names are kebab-case** — they appear in API paths and map directly to filenames in `orchestrators/` and `processors/`
- **Each job has exactly one orchestrator and one processor** — orchestrators fan out, processors do one unit of work
- **Processors must be idempotent** — CF Queues delivers at-least-once; check whether the work has already been done before doing it
- **Explicit `ack()` for unrecoverable failures** — if a message can't be processed and retrying won't help, `ack()` it and update the `background_jobs` record with `status: 'FAILED'` and diagnostic notes rather than letting it exhaust retries
- **No silent failures** — always update `background_jobs` status on completion or failure so the `GET /api/jobs/:job-name` endpoint has something useful to report

## Queues

Two queues are used, defined in `wrangler.jsonc`:

- **`rezept_jobs_orchestration`** — receives trigger messages; consumed by orchestrators
- **`rezept_jobs_processing`** — receives per-record messages; consumed by processors

Both queues have a dead-letter queue configured for messages that exhaust retries.

## Tracking

Every job run is tracked in the `background_jobs` D1 table. The trigger API creates a record with `status: 'PENDING'` before publishing to the queue. Status progresses to `RUNNING`, then `COMPLETED` or `FAILED`. The `notes` field holds diagnostic information on failure.
