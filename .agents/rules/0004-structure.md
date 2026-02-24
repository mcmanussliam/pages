# Structure

## Split large files

- If a file grows beyond ~400 lines, split it.
- Prefer moving cohesive logic into a dedicated module, not “utils dumping grounds”.

## Group related logic

If a file contains many related standalone functions, consider grouping:

- Prefer a small class when it clarifies ownership/state and reduces parameter threading.
- Otherwise use a module with a tight exported surface area.

## Next.js conventions

- Keep server-only logic out of client components.
- Prefer pure functions and data transforms in `src/lib/`.
