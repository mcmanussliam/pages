# Control Flow

## Prefer early returns (when reasonable)

- Minimize indentation and nested branches.
- Avoid “pyramid” control flow.

Prefer:

```ts
if (!value) {
  return null;
}

return doWork(value);
```

Over:

```ts
if (value) {
  return doWork(value);
} else {
  return null;
}
```

## No inline single-statement blocks

Always use braces for control flow statements.

Prefer:

```ts
if (ready) {
  start();
}
```

Over:

```ts
if (ready) start();
```

## Keep it simple

- Don’t introduce clever abstractions to save a few lines.
- Prefer readable, boring code over micro-optimizations.
