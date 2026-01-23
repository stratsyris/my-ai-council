"""
Antigravity Execution Harness
=============================

All execution scripts inherit from this shared base harness.
Provides standardized: argument parsing, structured logging, input validation,
schema printing, and exit code normalization.

Usage:
    class MyTool(ExecutionHarness):
        class Input(BaseModel):
            query: str

        class Output(BaseModel):
            result: str

        def execute(self, input_data: Input) -> Output:
            return self.Output(result=f"Processed: {input_data.query}")

    if __name__ == "__main__":
        MyTool().run()
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import sys
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from enum import IntEnum
from pathlib import Path
from typing import Any, ClassVar, Generic, TypeVar

from pydantic import BaseModel, ValidationError


# =============================================================================
# ERROR TAXONOMY (Section 6.1)
# =============================================================================

class ExitCode(IntEnum):
    """Standardized exit codes for orchestrator decision-making."""
    SUCCESS = 0           # Proceed
    UNKNOWN_ERROR = 1     # Stop - Human intervention required
    VALIDATION_ERROR = 2  # Stop - Fix inputs (Directive/User issue)
    AUTH_ERROR = 3        # Stop - Refresh credentials
    POLICY_VIOLATION = 4  # Stop - Request override
    RATE_LIMIT = 5        # Retry - Exponential backoff + jitter
    TRANSIENT_NET = 6     # Retry - Immediate retry (max 3x)
    TIMEOUT = 7           # Retry - Increase timeout + backoff
    DEPENDENCY_ERROR = 8  # Stop - Rebuild environment


# =============================================================================
# STRUCTURED LOGGING
# =============================================================================

class JsonFormatter(logging.Formatter):
    """Emit structured JSON logs to stderr."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "extra"):
            log_entry["extra"] = record.extra
        return json.dumps(log_entry)


def setup_logging(name: str, level: int = logging.INFO) -> logging.Logger:
    """Configure structured logging to stderr."""
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    
    return logger


# =============================================================================
# EXECUTION HARNESS
# =============================================================================

InputT = TypeVar("InputT", bound=BaseModel)
OutputT = TypeVar("OutputT", bound=BaseModel)


class ExecutionHarness(ABC, Generic[InputT, OutputT]):
    """
    Base harness for all execution scripts.
    
    Provides:
    - Argument parsing (--input, --input-file, --schema, --dry-run)
    - Structured JSON logging to stderr
    - Input validation via Pydantic
    - JSON output to stdout
    - Exit code normalization
    """
    
    # Subclasses must define these as class attributes
    Input: ClassVar[type[BaseModel]]
    Output: ClassVar[type[BaseModel]]
    
    # Optional: set to True for tools with side effects
    has_side_effects: ClassVar[bool] = False
    
    def __init__(self) -> None:
        self.logger = setup_logging(self.__class__.__name__)
        self._dry_run = False
    
    @property
    def dry_run(self) -> bool:
        """Check if running in dry-run mode."""
        return self._dry_run
    
    @abstractmethod
    def execute(self, input_data: InputT) -> OutputT:
        """
        Execute the tool logic.
        
        Args:
            input_data: Validated input conforming to Input schema.
        
        Returns:
            Output conforming to Output schema.
        
        Raises:
            Exception: Any exception will be caught and converted to exit code.
        """
        ...
    
    def _parse_args(self) -> argparse.Namespace:
        """Parse command-line arguments."""
        parser = argparse.ArgumentParser(
            description=self.__class__.__doc__ or "Execution tool",
            formatter_class=argparse.RawDescriptionHelpFormatter,
        )
        
        input_group = parser.add_mutually_exclusive_group(required=False)
        input_group.add_argument(
            "--input",
            type=str,
            help="JSON input as a string",
        )
        input_group.add_argument(
            "--input-file",
            type=Path,
            help="Path to JSON input file",
        )
        
        parser.add_argument(
            "--schema",
            action="store_true",
            help="Print input/output JSON schemas and exit",
        )
        
        if self.has_side_effects:
            parser.add_argument(
                "--dry-run",
                action="store_true",
                help="Validate inputs and log planned actions without executing",
            )
        
        return parser.parse_args()
    
    def _print_schemas(self) -> None:
        """Print JSON schemas for input and output models."""
        schemas = {
            "input_schema": self.Input.model_json_schema(),
            "output_schema": self.Output.model_json_schema(),
        }
        print(json.dumps(schemas, indent=2))
    
    def _load_input(self, args: argparse.Namespace) -> dict[str, Any]:
        """Load JSON input from args or stdin."""
        if args.input:
            return json.loads(args.input)
        elif args.input_file:
            return json.loads(args.input_file.read_text())
        else:
            # Read from stdin
            return json.loads(sys.stdin.read())
    
    def _compute_inputs_hash(self, input_dict: dict[str, Any]) -> str:
        """Compute deterministic hash of inputs for idempotency."""
        canonical = json.dumps(input_dict, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(canonical.encode()).hexdigest()[:16]
    
    def run(self) -> None:
        """Main entry point. Parses args, validates, executes, outputs."""
        try:
            args = self._parse_args()
            
            # Schema mode
            if args.schema:
                self._print_schemas()
                sys.exit(ExitCode.SUCCESS)
            
            # Set dry-run flag
            if self.has_side_effects and hasattr(args, "dry_run"):
                self._dry_run = args.dry_run
            
            # Load and validate input
            input_dict = self._load_input(args)
            inputs_hash = self._compute_inputs_hash(input_dict)
            
            self.logger.info(
                "Starting execution",
                extra={"inputs_hash": inputs_hash, "dry_run": self._dry_run},
            )
            
            try:
                input_data = self.Input.model_validate(input_dict)
            except ValidationError as e:
                self.logger.error(f"Input validation failed: {e}")
                sys.exit(ExitCode.VALIDATION_ERROR)
            
            # Execute
            output = self.execute(input_data)
            
            # Validate output
            if not isinstance(output, self.Output):
                self.logger.error("Output does not match expected schema")
                sys.exit(ExitCode.UNKNOWN_ERROR)
            
            # Emit output to stdout
            print(output.model_dump_json(indent=2))
            
            self.logger.info("Execution completed successfully")
            sys.exit(ExitCode.SUCCESS)
            
        except KeyboardInterrupt:
            self.logger.warning("Execution interrupted by user")
            sys.exit(ExitCode.UNKNOWN_ERROR)
        except json.JSONDecodeError as e:
            self.logger.error(f"Invalid JSON input: {e}")
            sys.exit(ExitCode.VALIDATION_ERROR)
        except FileNotFoundError as e:
            self.logger.error(f"File not found: {e}")
            sys.exit(ExitCode.VALIDATION_ERROR)
        except Exception as e:
            self.logger.exception(f"Unexpected error: {e}")
            sys.exit(ExitCode.UNKNOWN_ERROR)


# =============================================================================
# EXAMPLE TOOL (for reference - delete in production)
# =============================================================================

if __name__ == "__main__":
    # Example usage showing how to create a tool
    
    class EchoInput(BaseModel):
        message: str
    
    class EchoOutput(BaseModel):
        echoed: str
        timestamp: str
    
    class EchoTool(ExecutionHarness[EchoInput, EchoOutput]):
        """Simple echo tool for testing the harness."""
        
        Input = EchoInput
        Output = EchoOutput
        has_side_effects = False
        
        def execute(self, input_data: EchoInput) -> EchoOutput:
            return EchoOutput(
                echoed=input_data.message,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
    
    EchoTool().run()
