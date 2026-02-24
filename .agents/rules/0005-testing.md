# Testing

## Location

- Tests must live separately from runtime code.
- Prefer a root `tests/` directory mirroring `src/` (same path shape).

## Style

- Test behavior, not implementation details.
- Keep test setups small and explicit.
- Prefer table-driven tests when there are many similar cases.
