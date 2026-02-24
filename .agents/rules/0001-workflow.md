# Workflow

## Before you code

- Prefer the smallest possible change that solves the real problem (KISS).
- Avoid unrelated refactors.

## After you code

Run the full suite before considering work “done”:

```bash
pnpm check
```

If you’re iterating quickly:

```bash
pnpm lint
pnpm typecheck
pnpm test:run
```

## When linting blocks progress

- Fix the lint issue if it improves clarity or safety.
- If the rule is wrong for this codebase, adjust the rule (don’t fight it with local disables).
- If a rule cannot be expressed in ESLint, document it in these `.agents` rules.
