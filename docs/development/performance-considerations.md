# Performance Considerations

## Current Scale

- Single developer
- Small dataset (hundreds of records, not millions)
- No need for premature optimization

## When to Optimize

- When tests get slow (currently fast enough)
- When pages load slowly (measure first)
- When users complain (feedback-driven)

## What NOT to Do

- Add caching without profiling
- Over-index on database queries
- Sacrifice code clarity for marginal gains

**Rule:** Make it work, make it right, make it fast (in that order).
