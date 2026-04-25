Review recent changes to this project and sync any new learnings into Claude's persistent memory and CLAUDE.md so future sessions have an accurate picture.

## Steps

1. **Scan for what's changed** — run `git log --oneline -20` and `git diff HEAD~5..HEAD --stat` to get a sense of recent activity. Also check `git log --oneline -- docs/ dev-guidelines.md CLAUDE.md` for doc-specific changes.

2. **Read relevant changed files** — for any new or updated files in `docs/decisions/`, `dev-guidelines.md`, `docs/testing.md`, or architectural areas of `src/`, read the current content.

3. **Identify what's new or different** — focus on:
   - New ADRs in `docs/decisions/`
   - Changes to architecture patterns (new layers, new conventions)
   - Changes to testing approach
   - New dependencies or tech stack additions
   - Anything in `dev-guidelines.md` that wasn't there before
   - Changes to `CLAUDE.md` itself made by the team

4. **Update CLAUDE.md** — if `CLAUDE.md` at the project root is missing or out of date relative to what you've found, update it to reflect current reality. Focus on things derivable from docs and code, not ephemeral state.

5. **Update persistent memory** — write or update files in the memory directory at:
   `~/.claude/projects/-Users-adamdehnel-Projects-kad-products-rezept-core/memory/`

   For each meaningful learning:
   - Check `MEMORY.md` in that directory to see what's already captured
   - Add new memory files or update existing ones for anything that's changed
   - Update `MEMORY.md` index to reflect any new or changed memory files
   - Focus on non-obvious things: architectural decisions, patterns the team has validated or rejected, project context that isn't derivable from reading the code

6. **Report what changed** — summarise what you updated and why, so the user can verify the sync was accurate.

## What to capture in memory vs CLAUDE.md

- **CLAUDE.md**: Commands, structure, architecture patterns, code style, docs pointers — things any new Claude session needs to get oriented fast
- **Memory (project type)**: Ongoing work, active initiatives, decisions with non-obvious motivations, bugs/incidents
- **Memory (feedback type)**: Patterns the user has confirmed or corrected during past sessions
- **Memory (reference type)**: Where to find things in external systems

Do not duplicate content between CLAUDE.md and memory — if it's in CLAUDE.md, a pointer or brief note in memory is enough.
