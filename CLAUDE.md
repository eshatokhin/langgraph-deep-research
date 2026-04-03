# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NestJS TypeScript application scaffolded to implement a LangGraph-based deep research agent. Currently in early development — the core LangGraph agent logic has not yet been added.

## Commands

```bash
npm run start:dev        # Run in watch mode (development)
npm run build            # Compile TypeScript to dist/
npm run start:prod       # Run compiled output
npm run lint             # ESLint with auto-fix
npm run format           # Prettier format src/ and test/
npm run test             # Unit tests (jest, matches *.spec.ts in src/)
npm run test:watch       # Unit tests in watch mode
npm run test:e2e         # E2E tests (jest config: test/jest-e2e.json)
npm run test:cov         # Unit tests with coverage report
```

To run a single test file:
```bash
npx jest src/path/to/file.spec.ts
```

## Architecture

- **Framework**: NestJS 11 with Express platform
- **Language**: TypeScript 5.7, targeting ES2023, `nodenext` module resolution
- **Entry point**: `src/main.ts` — bootstraps `AppModule`, listens on `PORT` env var or 3000
- **Module structure**: NestJS standard — modules in `src/`, each feature area should have its own `*.module.ts`, `*.controller.ts`, `*.service.ts`, and `*.spec.ts`
- **Build output**: `dist/` (cleaned on each build via `deleteOutDir: true`)

## TypeScript notes

- `strictNullChecks` is enabled; `noImplicitAny` and `strictBindCallApply` are disabled
- `emitDecoratorMetadata` and `experimentalDecorators` are enabled (required for NestJS DI)
- Use `moduleResolution: nodenext` — imports must include file extensions when referencing local `.js` files in compiled output
