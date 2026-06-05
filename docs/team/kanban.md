# Rezept Kanban

While this is a casual project it's useful to have some level of organization I think.  Since we don't work on this all the time we can easily forget what's next and all that.  The setup described below is intended to keep things simple but intuitive.  The [Rezept Kanban](https://github.com/orgs/kad-products/projects/1) project tracks active work, bugs, and future ideas across the rezept-core repo. It has four views.

## Views

### Current Work

Table view of open **Feature** issues, including their sub-tasks. This is the primary view for anything actively being worked on — development, design, testing, discussion, etc. If it's getting attention right now, it should be here.

### Bugs

Board view of open **Bug** issues, grouped by status. Use this to see what's broken and where each bug is in the fix process.

### Roadmap

Table view of **Roadmap Item** issues, with a _Level of Desire_ field to signal rough priority. Use this to review what ideas are queued up and decide what to pull into active work next.

### Triage / No Type

Table view of issues that have no issue type assigned. Ideally this is always empty. If something shows up here it needs to be triaged — either typed and added to the right view, or closed.

## Issue types

| Type         | What it is                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| Feature      | Something we're actively working on. Includes scope, goals, and sub-tasks. |
| Bug          | Something that was working and isn't anymore.                              |
| Roadmap Item | A future idea or initiative, not yet active.                               |
| Task         | A discrete piece of work under a Feature (design, dev, test, etc.).        |

## Notes

- Issues must be manually added to the project — they don't appear automatically when created. Set up is a one-time thing per issue.
- The goal is just enough structure to track what's happening. If maintaining this becomes overhead, stop.
