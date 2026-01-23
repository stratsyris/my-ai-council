---
id: example-echo
version: "1.0.0"
tier: 1  # Tool tier - Pydantic models required
---

# Echo Directive

A simple example directive demonstrating the standard structure.

## Goal & Scope

Echo a message back to the caller with a timestamp. This is a reference 
implementation for understanding the directive format.

## Inputs

| Field   | Type   | Required | Description           |
|---------|--------|----------|-----------------------|
| message | string | yes      | The message to echo   |

## Outputs

| Field     | Type   | Description                |
|-----------|--------|----------------------------|
| echoed    | string | The original message       |
| timestamp | string | ISO 8601 UTC timestamp     |

## Execution Tools

- `execution/harness.py` (as demo tool)

## Success Criteria (Machine-Checkable)

- [ ] Output JSON parses successfully
- [ ] Output contains `echoed` field matching input `message`
- [ ] Output contains valid ISO 8601 `timestamp`

## Failure Modes

| Mode              | Error Code | Recovery                     |
|-------------------|------------|------------------------------|
| Invalid JSON input| 2          | Fix input format             |
| Missing message   | 2          | Provide required field       |

## Policy Constraints

- None (no side effects, no API calls)

## Changelog

- v1.0.0 (2026-01-23): Initial version
