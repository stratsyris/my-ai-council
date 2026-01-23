"""
Run Ledger - Idempotency & Resumability
========================================

SQLite-based run ledger for tracking directive executions.
Implements Section 6: identical inputs_hash + success → skip execution.
"""

from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Generator
from uuid import uuid4


class RunStatus(str, Enum):
    """Execution status for a run."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"  # Idempotent skip


@dataclass
class RunRecord:
    """A single execution record in the ledger."""
    run_id: str
    directive_id: str
    directive_version: str
    inputs_hash: str
    status: RunStatus
    retries: int
    error_code: int | None
    artifacts: dict[str, Any]
    metrics: dict[str, Any]
    created_at: str
    updated_at: str
    
    def to_dict(self) -> dict[str, Any]:
        return {
            "run_id": self.run_id,
            "directive_id": self.directive_id,
            "directive_version": self.directive_version,
            "inputs_hash": self.inputs_hash,
            "status": self.status.value,
            "retries": self.retries,
            "error_code": self.error_code,
            "artifacts": self.artifacts,
            "metrics": self.metrics,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class RunLedger:
    """
    SQLite-backed run ledger for idempotency and resumability.
    
    Usage:
        ledger = RunLedger("runs.db")
        ledger.init_db()
        
        # Check for existing successful run
        if ledger.should_skip("dir-001", "1.0.0", inputs_hash):
            print("Skipping - already completed")
        else:
            run_id = ledger.create_run("dir-001", "1.0.0", inputs_hash)
            # ... execute ...
            ledger.complete_run(run_id, artifacts={"output": "data.json"})
    """
    
    SCHEMA = """
    CREATE TABLE IF NOT EXISTS runs (
        run_id TEXT PRIMARY KEY,
        directive_id TEXT NOT NULL,
        directive_version TEXT NOT NULL,
        inputs_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        retries INTEGER NOT NULL DEFAULT 0,
        error_code INTEGER,
        artifacts TEXT DEFAULT '{}',
        metrics TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_runs_idempotency 
        ON runs(directive_id, directive_version, inputs_hash, status);
    
    CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
    """
    
    def __init__(self, db_path: str | Path = "runs.db") -> None:
        self.db_path = Path(db_path)
    
    @contextmanager
    def _connection(self) -> Generator[sqlite3.Connection, None, None]:
        """Context manager for database connections."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()
    
    def init_db(self) -> None:
        """Initialize the database schema."""
        with self._connection() as conn:
            conn.executescript(self.SCHEMA)
    
    def _now(self) -> str:
        """Current UTC timestamp in ISO format."""
        return datetime.now(timezone.utc).isoformat()
    
    def should_skip(
        self, 
        directive_id: str, 
        directive_version: str, 
        inputs_hash: str
    ) -> bool:
        """
        Check if execution should be skipped (idempotency).
        
        Returns True if a successful run exists with the same
        directive_id, directive_version, and inputs_hash.
        """
        with self._connection() as conn:
            cursor = conn.execute(
                """
                SELECT 1 FROM runs 
                WHERE directive_id = ? 
                  AND directive_version = ? 
                  AND inputs_hash = ? 
                  AND status = 'success'
                LIMIT 1
                """,
                (directive_id, directive_version, inputs_hash),
            )
            return cursor.fetchone() is not None
    
    def get_last_failed_run(
        self, 
        directive_id: str, 
        directive_version: str, 
        inputs_hash: str
    ) -> RunRecord | None:
        """Get the last failed run for resumability."""
        with self._connection() as conn:
            cursor = conn.execute(
                """
                SELECT * FROM runs 
                WHERE directive_id = ? 
                  AND directive_version = ? 
                  AND inputs_hash = ? 
                  AND status = 'failed'
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (directive_id, directive_version, inputs_hash),
            )
            row = cursor.fetchone()
            if row:
                return self._row_to_record(row)
            return None
    
    def create_run(
        self, 
        directive_id: str, 
        directive_version: str, 
        inputs_hash: str
    ) -> str:
        """Create a new run record. Returns run_id."""
        run_id = str(uuid4())
        now = self._now()
        
        with self._connection() as conn:
            conn.execute(
                """
                INSERT INTO runs (
                    run_id, directive_id, directive_version, inputs_hash,
                    status, retries, artifacts, metrics, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 'running', 0, '{}', '{}', ?, ?)
                """,
                (run_id, directive_id, directive_version, inputs_hash, now, now),
            )
        return run_id
    
    def update_status(
        self, 
        run_id: str, 
        status: RunStatus,
        error_code: int | None = None,
        increment_retries: bool = False,
    ) -> None:
        """Update run status."""
        with self._connection() as conn:
            if increment_retries:
                conn.execute(
                    """
                    UPDATE runs SET 
                        status = ?, error_code = ?, retries = retries + 1, updated_at = ?
                    WHERE run_id = ?
                    """,
                    (status.value, error_code, self._now(), run_id),
                )
            else:
                conn.execute(
                    """
                    UPDATE runs SET status = ?, error_code = ?, updated_at = ?
                    WHERE run_id = ?
                    """,
                    (status.value, error_code, self._now(), run_id),
                )
    
    def complete_run(
        self, 
        run_id: str,
        artifacts: dict[str, Any] | None = None,
        metrics: dict[str, Any] | None = None,
    ) -> None:
        """Mark a run as successfully completed."""
        with self._connection() as conn:
            conn.execute(
                """
                UPDATE runs SET 
                    status = 'success', 
                    error_code = 0,
                    artifacts = ?,
                    metrics = ?,
                    updated_at = ?
                WHERE run_id = ?
                """,
                (
                    json.dumps(artifacts or {}),
                    json.dumps(metrics or {}),
                    self._now(),
                    run_id,
                ),
            )
    
    def fail_run(
        self, 
        run_id: str, 
        error_code: int,
        metrics: dict[str, Any] | None = None,
    ) -> None:
        """Mark a run as failed."""
        with self._connection() as conn:
            conn.execute(
                """
                UPDATE runs SET 
                    status = 'failed', 
                    error_code = ?,
                    metrics = ?,
                    updated_at = ?
                WHERE run_id = ?
                """,
                (error_code, json.dumps(metrics or {}), self._now(), run_id),
            )
    
    def get_run(self, run_id: str) -> RunRecord | None:
        """Get a run record by ID."""
        with self._connection() as conn:
            cursor = conn.execute("SELECT * FROM runs WHERE run_id = ?", (run_id,))
            row = cursor.fetchone()
            if row:
                return self._row_to_record(row)
            return None
    
    def _row_to_record(self, row: sqlite3.Row) -> RunRecord:
        """Convert a database row to a RunRecord."""
        return RunRecord(
            run_id=row["run_id"],
            directive_id=row["directive_id"],
            directive_version=row["directive_version"],
            inputs_hash=row["inputs_hash"],
            status=RunStatus(row["status"]),
            retries=row["retries"],
            error_code=row["error_code"],
            artifacts=json.loads(row["artifacts"]),
            metrics=json.loads(row["metrics"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )


# Initialize default ledger location
DEFAULT_LEDGER_PATH = Path(__file__).parent.parent / "runs.db"
