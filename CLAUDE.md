# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NestJS TypeScript application scaffolded to implement a LangGraph-based deep research agent. Currently in early development — the core LangGraph agent logic has not yet been added.

## Generating modules, services, controllers

Use `npm run gen` instead of `nest generate` — it runs `nest generate` and automatically moves generated spec files from `src/` to `test/unit/` with corrected import paths:

```bash
npm run gen -- module research
npm run gen -- service research
npm run gen -- controller research
```

## Commands

```bash
npm run start:dev        # Run in watch mode (development)
npm run build            # Compile TypeScript to dist/
npm run start:prod       # Run compiled output
npm run lint             # ESLint with auto-fix
npm run format           # Prettier format src/ and test/
npm run test             # Unit tests (test/unit/)
npm run test:watch       # Unit tests in watch mode
npm run test:e2e         # E2E tests (test/e2e/, jest config: test/jest-e2e.json)
npm run test:cov         # Unit tests with coverage report
```

To run a single test file:
```bash
npx jest test/unit/path/to/file.spec.ts
```

## Test structure

All tests live in `test/`, separate from `src/`. The folder structure mirrors `src/`:

```
test/
  unit/               # Unit tests — mirrors src/ structure
    app.controller.spec.ts
  e2e/                # End-to-end tests
    app.e2e-spec.ts
  jest-e2e.json       # Jest config for e2e tests
```

**Do not place test files inside `src/`.** When adding a unit test for `src/foo/bar.service.ts`, create it at `test/unit/foo/bar.service.spec.ts`. Import source files using relative paths like `../../src/foo/bar.service`.

## LangChain/LangGraph documentation

An MCP server with the official LangChain docs is connected: `docs-langchain` (tools: `search_docs_by_lang_chain`, `get_page_docs_by_lang_chain`).

**Always consult it before:**
- Writing any LangGraph code (graph, state, nodes, edges, checkpointing, streaming)
- Using any `@langchain/*` API — imports, class names, method signatures
- Answering questions about LangChain/LangGraph concepts

Do not rely on training knowledge alone for LangGraph — the API changes frequently.

## LangGraph API version

This project uses **LangGraph v1 (JS/TS)** — always use the current API:

- State: Zod schema (`z.object(...)`) passed to `StateGraph`, or `StateSchema` with `MessagesValue`
- Custom reducers: `ReducedValue` from `@langchain/langgraph`
- **Do not use `Annotation`** — it is deprecated in LangGraph v1

## Architecture

- **Framework**: NestJS 11 with Express platform
- **Language**: TypeScript 5.7, targeting ES2023, `nodenext` module resolution
- **Entry point**: `src/main.ts` — bootstraps `AppModule`, listens on `PORT` env var or 3000
- **Module structure**: NestJS standard — modules in `src/`, each feature area should have its own `*.module.ts`, `*.controller.ts`, `*.service.ts`
- **Build output**: `dist/` (cleaned on each build via `deleteOutDir: true`)

## TypeScript notes

- `strictNullChecks` is enabled; `noImplicitAny` and `strictBindCallApply` are disabled
- `emitDecoratorMetadata` and `experimentalDecorators` are enabled (required for NestJS DI)
- Use `moduleResolution: nodenext` — imports must include file extensions when referencing local `.js` files in compiled output
