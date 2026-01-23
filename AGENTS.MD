# ANTIGRAVITY — AGENT ARCHITECTURE & OPERATING MODEL

This document is the single canonical operating system for the Antigravity agent.
It reconciles probabilistic reasoning (LLMs) with deterministic execution (code).

If followed strictly, this system prevents:
- hallucinated success
- environment drift
- irreversible self-corruption
- silent partial failures

This is not a prompt.
This is an operating system.

---

## 1. CORE ARCHITECTURE (THREE LAYERS)

### 1.1 DIRECTIVE LAYER (WHAT TO DO)
Directives live in `directives/` and define intent.

Each directive specifies:
- goal and scope
- inputs and outputs
- execution tools
- success criteria (machine-checkable)
- failure modes and edge cases
- policy constraints
- version and changelog

Directives are treated as **versioned APIs**, not prose documentation.

### 1.2 ORCHESTRATION LAYER (DECISION-MAKING)
The orchestrator:
- reads directives
- validates inputs
- generates execution plans
- enforces policy gates
- invokes execution tools
- verifies outputs
- manages retries and resumability
- performs controlled self-annealing

The orchestrator never performs heavy work itself.

### 1.3 EXECUTION LAYER (DETERMINISTIC WORK)
Execution scripts live in `execution/`.

They:
- perform API calls, scraping, transformations, DB writes, file operations
- accept structured inputs (JSON / Pydantic models)
- emit structured JSON outputs
- log deterministically
- exit with categorized error codes

Execution code must be deterministic, testable, and reproducible.

---

## 2. OPERATING PRINCIPLES

### 2.1 TOOL-FIRST RULE
Before writing new code:
- search `execution/` for an existing tool
- only create a new tool if none exist

### 2.2 PLAN → EXECUTE → VERIFY (MANDATORY)
Every directive follows this loop.

**PLAN:**
- parse directive
- validate inputs
- identify tools, dependencies, and side effects
- generate an explicit plan

**EXECUTE:**
- run execution tools via the standard harness

**VERIFY (BLOCKING):**
- file exists and size > 0
- JSON parses and required keys exist
- HTTP status == 200 where applicable
- CSV headers match expected schema
- row count ≥ minimum threshold
- required fields are unique

Execution must not proceed unless verification passes.

### 2.3 SELF-ANNEALING (CONTROLLED)
When a failure occurs:
1. inspect logs and error codes
2. fix the directive or execution tool
3. rerun verification and tests
4. update documentation if needed
5. commit changes to Git

Self-annealing must always be deterministic, reversible, and auditable.

### 2.4 GIT SAFETY NET (MANDATORY)
Git is the undo button.

**Rules:**
- working tree must be clean before annealing
- commit a checkpoint if needed
- after changes:
  - run verification/tests
  - commit using Conventional Commits
- never squash or amend during annealing
- revert immediately if verification fails

### 2.5 DEPENDENCY MANAGEMENT (DETERMINISM)
Source of truth:
- `requirements.in`
- `requirements.txt` (fully pinned)
- `.python-version` (recommended)

**Rules:**
- new imports require dependency declaration
- dependencies must be installed in an isolated environment
- never rewrite logic to avoid installing a dependency unless policy forbids it

---

## 3. CONTRACTS & SCHEMAS

### 3.1 PYDANTIC-FIRST
- inputs and outputs are defined as Pydantic models
- JSON schemas are auto-generated
- raw JSON schemas are not hand-written

### 3.2 TIERED RIGOR MODEL
- **Tier 0 (Utility):** one-off scripts → verification only
- **Tier 1 (Tool):** reusable tools → Pydantic models required
- **Tier 2 (Critical):** side-effects or multi-step workflows → models + schemas + policy gates

This avoids bureaucracy while preserving safety.

---

## 4. EXECUTION HARNESS

All execution scripts inherit from a shared base harness located at:
`execution/harness.py`

The harness provides:
- argument parsing
- structured logging
- input validation
- schema printing (if models exist)
- exit code normalization

**Requirements:**
- JSON input (`--input` or `--input-file`)
- JSON output to stdout
- logs to stderr
- non-zero exit codes on failure

`--dry-run` is required only for scripts with side effects.

---

## 5. POLICY GATES

Before execution, enforce:
- paid API usage requires approval
- production writes require confirmation
- PII must be redacted or blocked
- side effects must be declared

Policy failure blocks execution.

---

## 6. RUN LEDGER & IDEMPOTENCY

Maintain a run ledger (SQLite or Supabase).

**Fields:**
- `run_id`
- `directive_id`
- `directive_version`
- `inputs_hash`
- `status`
- `retries`
- `error_code`
- `artifacts`
- `metrics`
- `timestamps`

**Rules:**
- identical `inputs_hash` + success → skip execution
- failed runs resume from last verified step

This converts the agent into a job runner.

### 6.1 ERROR TAXONOMY & RETRY LOGIC
Execution scripts must exit with standardized error codes. The Orchestrator uses these to decide next steps.

| Error Code | Taxonomy | Action | Strategy |
| :--- | :--- | :--- | :--- |
| `0` | SUCCESS | Proceed | None |
| `1` | UNKNOWN_ERROR | Stop | Human intervention required |
| `2` | VALIDATION_ERROR | Stop | Fix inputs (Directive/User issue) |
| `3` | AUTH_ERROR | Stop | Refresh credentials |
| `4` | POLICY_VIOLATION | Stop | Request override |
| `5` | RATE_LIMIT | **Retry** | Exponential backoff + jitter |
| `6` | TRANSIENT_NET | **Retry** | Immediate retry (max 3x) |
| `7` | TIMEOUT | **Retry** | Increase timeout + backoff |
| `8` | DEPENDENCY_ERROR | Stop | Rebuild environment |

**Orchestrator Logic:**
- Retry ONLY on codes 5, 6, 7.
- Never retry on 1, 2, 3, 4, 8.

---

## 7. TEMPORARY FILES (.tmp/) — CONTENT-ADDRESSED

All intermediates live in `.tmp/`.

```text
.tmp/
└── <directive_id>/
    └── <version>/
        └── <inputs_hash>/
            ├── inputs.json
            ├── plan.json
            ├── logs.jsonl
            ├── artifacts/
            ├── state.json
            └── verify.json
```