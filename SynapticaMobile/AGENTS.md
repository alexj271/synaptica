# Agent Guide (SynapticaMobile)

React Native (0.83.x) + TypeScript app with Redux Toolkit state, an AI pipeline (intent -> router -> context -> LLM -> Zod -> policy), and SQLite chat persistence.

Repo rules discovered:

- Cursor: no `.cursor/rules/` and no `.cursorrules` found.
- Copilot: no `.github/copilot-instructions.md` found.

## Commands

Install (Node `>= 20`):

- `npm ci` (preferred)
- `npm install` (when updating deps)

Run:

- `npm start` (Metro)
- `npm run android`
- `bundle install && bundle exec pod install --project-directory=ios && npm run ios`

Quality:

- `npm run lint`
- `npm test`
- `npx prettier -c .` / `npx prettier -w .`

Single test ergonomics (Jest):

- One file: `npm test -- __tests__/modules/healthSlice.test.ts`
- One test name: `npm test -- -t "updates a single metric"`
- File + name: `npm test -- __tests__/modules/aiMiddleware.test.ts -t "executes pipeline"`
- Debug serial: `npm test -- --runInBand`

Notes:

- Jest preset: `react-native` in `jest.config.js`.
- Most tests live under `__tests__/modules/`.

## Structure

- App entry: `src/app/` (`App.tsx`, `Providers.tsx`, `bootstrap.ts`).
- Navigation: `src/navigation/`.
- Screens (thin): `src/screens/<ScreenName>/`.
- UI kit / design system: `src/ui/` (theme + primitives/components).
- Domain features (pure logic): `src/features/`.
- External services: `src/services/` (API, AI, storage, analytics).
- Redux Toolkit state + middleware: `src/modules/`.
- Shared utils: `src/utils/`.
- Shared types: `src/types/`.

Reference docs:

- `docs/STRUCTURE.md`, `docs/UIKIT.md`, `docs/REDUCERS.md`, `docs/MODEL_ROUTER.md`, `__tests__/modules/INTENT.md`

## Code Style

### Imports / Module Boundaries

- Prefer `@/…` for anything under `src/` (configured in `tsconfig.json` + `babel.config.js`).
- Use relative imports (`./`, `../`) only locally (same folder / adjacent).
- Use `import type { ... }` for type-only imports.

Suggested import ordering (keep it consistent per file):

1. React / React Native
2. Third-party libraries
3. Internal absolute imports (`@/…`)
4. Internal relative imports (`./…`, `../…`)
5. Type-only imports (inline with their group using `import type`)

### Formatting

Prettier is configured in `.prettierrc.js`:

- `singleQuote: true`, `trailingComma: 'all'`, `arrowParens: 'avoid'`
- Follow existing file style (some files currently include semicolons; Prettier will normalize).
- Keep `StyleSheet.create` blocks stable (avoid noisy key reordering).

### Types / Naming

- Components: `PascalCase` in `src/screens/**` and `src/ui/**`.
- Hooks: `useSomething`.
- Types: `PascalCase`; prefer union literals for constrained strings (e.g. `ChatRole`).
- Avoid `any`; if needed, isolate it at the boundary and validate (Zod) or narrow ASAP.

Redux Toolkit conventions:

- Slice name: domain noun (`chat`, `health`, `plan`, ...).
- Action names read like domain events (`messageSent`, `strategyUpdated`).
- Reducers: deterministic + sync, JSON-serializable state, no side effects.

Where logic goes:

- Reducers: write facts to state.
- Middleware/services: IO (SQLite, network, AI calls) + dispatch events.
- Selectors/context builders: derive bounded snapshots from `RootState`.

### AI Pipeline

Main flow: `src/modules/middlwares/aiMiddleware.ts`

- Trigger: whitelisted domain events (e.g. `chat/messageSent`).
- Intent first: `src/ai/intent/` (prefer rule-based fast path).
- Route model: `src/ai/router/` (complexity/cost).
- Build context: `src/ai/context/` (bounded snapshot).
- Call LLM: `src/ai/llm/callAI.ts` must return JSON only.
- Validate output: `src/ai/schemas/*.ts` (Zod).
- Policy gate: `src/ai/policy/` approves/rejects/requires confirmation.

When changing AI behavior:

- Update/add Zod schemas first; keep runtime validation strict.
- Keep `AllowedDomainActions` tight (no arbitrary Redux action types).
- Prefer new domain event + policy entry over overloading payloads.
- Avoid logging secrets; don’t dump full context in production logs.

AI env vars: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `GPT_MODEL` (see `src/config/ai.ts`).

### Error Handling

- Services: fail fast on non-OK responses; include status + response body in thrown error.
- Middleware: call `next(action)` first unless intentionally blocking; wrap IO in `try/catch` and dispatch failure events.
- Serialize unknown errors at boundaries with `String(err)`; avoid silent catches.

### UI

- Screens are composition-only: wire selectors/dispatch + compose `src/ui/primitives`.
- Put reusable UI in `src/ui/` (don’t duplicate styles across screens).
- Prefer theme tokens (`colors`, `spacing`, `typography`) over hard-coded values.
- Keep UI components free of domain logic; domain logic lives in `src/features/` and `src/modules/`.

### SQLite Chat Persistence

- DB layer: `src/db/chatDb.ts` (idempotent open, schema, paging).
- Persistence middleware: `src/modules/middlwares/chatPersistenceMiddleware.ts`.

Rules:

- Keep DB operations synchronous and simple (QuickSQLite).
- Use stable message IDs (user: `user_<timestamp>`; assistant: `ai_<timestamp>`).
- Paging uses `PAGE_SIZE` and timestamp ordering; preserve chronological order in UI.

## Before You Submit

- `npm run lint` and `npm test`
- If you touched many files: `npx prettier -w .`
