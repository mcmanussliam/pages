# TypeScript

## Be explicit with types

- Prefer explicit types for public / exported APIs.
- If inference is obvious and local, it’s okay to rely on inference.

## Avoid `any`

- Use `unknown` and narrow when needed.
- Prefer typed helpers over casting.

## Classes

- All class members must have explicit visibility (`public`/`protected`/`private`), including constructors.
- Keep constructors small; prefer dependency injection over global imports when it improves testability.

## Interfaces

- Prefer documenting interface members with short comments when they are non-obvious.
- Keep interface shapes minimal; don’t leak internal details.

## Formatting expectations

- Keep member declarations readable (don’t cram multiple concerns on one line).
- Keep spacing consistent; separate unrelated interface/class members with a blank line when it improves scanability.
