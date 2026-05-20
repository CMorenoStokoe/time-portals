# Time Portals Backend

TypeScript backend implementing a LangGraph generator-critic loop for historically accurate landmark image generation.

## What it does

- Runs a cyclic generator -> critic pipeline.
- Uses structured critic output via Zod.
- Prevents infinite loops via `MAX_REVISIONS` hard stop.
- Returns the most recent state even if not approved by the final revision.
- Uses `test/output` fixture media as an offline fallback for both generator and critic validation.

## Setup

1. Install dependencies:

    ```bash
    npm install
    ```

2. Configure environment variables:

    ```bash
    copy .env.example .env
    ```

    Set these secrets in `.env`:
    - `GOOGLE_API_KEY`
    - `LANGSMITH_API_KEY`
    - `LANGSMITH_TRACING` (recommended: `true`)
    - `LANGCHAIN_CALLBACKS_BACKGROUND` (set to `false` for reliable CLI trace delivery)
    - `LANGSMITH_PROJECT` (default: `time-portals-backend`)
    - `LANGSMITH_ENDPOINT` (EU: `https://eu.api.smith.langchain.com`, US: `https://api.smith.langchain.com`)

### LangSmith tracing

Tracing is configured from environment variables. If these are not provided, the backend defaults to:

```bash
LANGSMITH_TRACING=true
LANGCHAIN_CALLBACKS_BACKGROUND=false
LANGSMITH_PROJECT=time-portals-backend
LANGSMITH_ENDPOINT=https://eu.api.smith.langchain.com
```

Set `LANGSMITH_ENDPOINT` to the region where your LangSmith project lives (US or EU).

When tracing is enabled, each graph invocation is tagged and named in `src/index.ts`.

## Run

Development mode:

```bash
npm run dev
```

With a custom request:

```bash
npm run dev -- "View of London Bridge in 1300 with timber structures and period boats"
```

With explicit system inputs:

```bash
npm run dev -- --location "London Bridge" --perspective "https://maps.google.com/..."
```

Require live mode (disables all fixture fallbacks and fails if live providers are unavailable):

```bash
npm run dev -- --live-required --location "London Bridge" --perspective "https://maps.google.com/..."
```

Build and run compiled output:

```bash
npm run build
npm run start
```

## Files

- `src/index.ts`: CLI entrypoint.
- `src/pipeline.ts`: Graph orchestration and wiring.
- `src/schemas/graph-state.ts`: Shared LangGraph state schema.
- `src/schemas/critic-schema.ts`: Structured critic output schema.
- `src/nodes/generator-node.ts`: Prompt generation node logic.
- `src/nodes/critic-node.ts`: Critic evaluation node logic.
- `src/nodes/evaluate-quality.ts`: Revision loop routing logic.
- `src/tools/image-tool.ts`: Image generation utility with fixture fallback.

## Offline fixture mode

If `GOOGLE_API_KEY` is not set (or quota is exceeded), the pipeline still runs end-to-end:

- Generator returns deterministic fixture images from `test/output`.
- Critic validates fixture metadata and returns structured QA feedback.
- The graph loops until the fixture output is approved or max revisions are reached.

## Output contract

The CLI prints a JSON object containing:

- `finalImage`: historically validated image URL/data URL after all feature injections.
- `qaMatrix`: Perspective/Geography/Cohesion pass/fail booleans plus feedback.
- `metadata` (also mirrored as `jsonDocument`): media-ready metadata with `highlights` entries (`x`, `y`, `title`, `text`) for exactly three features.
- `executionMode`: `live`, `hybrid`, or `offline_fallback`.
- `executionProof`: per-phase attempt traces showing image/QA sources used in base and feature loops.
