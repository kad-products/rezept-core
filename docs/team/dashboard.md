# Project Dashboard

The [project dashboard](https://kad-products.github.io/rezept-core/) is the central hub for day-to-day links across environments, project tracking, test reports, and design.

Check out the [**video walkthrough**](../videos/project-dashboard.mp4.mp4) for some more details on it.


## Sections

### Kanban

Links to the GitHub project board views:

| View                                                                        | Purpose                                      |
| --------------------------------------------------------------------------- | -------------------------------------------- |
| [Current Work](https://github.com/orgs/kad-products/projects/1/views/3)     | Active sprint — what's in progress right now |
| [Bugs](https://github.com/orgs/kad-products/projects/1/views/2)             | Open bug reports                             |
| [Roadmap](https://github.com/orgs/kad-products/projects/1/views/1)          | Longer-horizon planning                      |
| [Triage / No Type](https://github.com/orgs/kad-products/projects/1/views/4) | Issues that haven't been categorised yet     |

### Environments

| Environment | URL                                              |
| ----------- | ------------------------------------------------ |
| Integration | https://rezept-integration.arsdehnel.workers.dev |
| Staging     | https://rezept-staging.arsdehnel.workers.dev     |
| Production  | https://rezept.arsdehnel.workers.dev             |

Integration receives every merge to `main`. Staging and production are promoted via releases. See [the deployment docs](../development/) for the full promotion flow.

### Test Reports

Published after each release. Use these to review coverage trends or investigate failures from a recent deployment.

| Report                                                                    | What it covers                                                          |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [Unit tests](https://kad-products.github.io/rezept-core/reports/unit/)    | Vitest coverage — schemas, repositories, actions, middleware            |
| [E2E tests](https://kad-products.github.io/rezept-core/reports/e2e/)      | Playwright full-browser flows against the running app                   |
| [Component tests](https://kad-products.github.io/rezept-core/reports/ct/) | Playwright CT — design-system component behavioral and screenshot tests |

For running tests locally see [testing.md](../development/testing.md), [playwright-e2e.md](../development/playwright-e2e.md), and [playwright-ct.md](../development/playwright-ct.md).

### Design

| Link                                                               | What it is                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [Storybook](https://kad-products.github.io/rezept-core/storybook/) | Interactive component library — browse and inspect design-system components |

See [storybook.md](../development/storybook.md) for how to run Storybook locally and contribute stories.

### Links

Quick links to the repository:

- [Issues](https://github.com/kad-products/rezept-core/issues)
- [Pull requests](https://github.com/kad-products/rezept-core/pulls)
- [Releases](https://github.com/kad-products/rezept-core/releases)
- [Changelog](https://github.com/kad-products/rezept-core/blob/main/CHANGELOG.md)

## How the dashboard is updated

The dashboard HTML lives in the `gh-pages` branch. It is updated manually when new sections or links are added. The reports and Storybook it links to are published automatically after each release via GitHub Actions.
