# Git Workflow

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add season creation`
- `fix: correct date validation`
- `refactor: simplify season repository`
- `test: add season integration tests`
- `docs: update testing guide`
- `chore: update dependencies`

**Why?** Enables semantic-release to automatically version and generate changelogs.

## Branch Protection

Main branch requires:
- Passing tests
- Passing commitlint (conventional commits)
- Pull request (even if you're the only dev - good practice)