"""
JSON-RPC Server for IPC communication with Electron
"""

import sys
import json
import threading
from typing import Any, Callable, Dict, Optional, Set
from loguru import logger

from .cleanup import cleanup_task_files, cleanup_file


class JsonRpcError(Exception):
    """JSON-RPC error."""

    def __init__(self, code: int, message: str, data: Any = None):
        self.code = code
        self.message = message
        self.data = data
        super().__init__(message)


class JsonRpcServer:
    """Simple JSON-RPC 2.0 server over stdio."""

    def __init__(self):
        self.methods: Dict[str, Callable] = {}
        self._progress_callback: Optional[Callable] = None
        self._cancelled_tasks: Set[str] = set()
        self._active_tasks: Dict[str, str] = {}  # task_id -> output_path
        self._lock = threading.Lock()

    def register(self, name: str, func: Callable) -> None:
        """Register a method handler."""
        self.methods[name] = func

    def cancel_task(self, task_id: str) -> bool:
        """
        Cancel a running task and cleanup its output files.

        Args:
            task_id: The task ID to cancel

        Returns:
            True if cancelled successfully
        """
        with self._lock:
            self._cancelled_tasks.add(task_id)
            # Cleanup output file if registered
            if task_id in self._active_tasks:
                output_path = self._active_tasks.pop(task_id)
                cleanup_file(output_path)
        cleanup_task_files(task_id)
        logger.info(f"Task {task_id} cancelled and cleaned up")
        return True

    def is_task_cancelled(self, task_id: str) -> bool:
        """Check if a task has been cancelled."""
        with self._lock:
            return task_id in self._cancelled_tasks

    def register_task_output(self, task_id: str, output_path: str) -> None:
        """Register an output file for a task for cleanup on cancel/fail."""
        with self._lock:
            self._active_tasks[task_id] = output_path

    def complete_task(self, task_id: str) -> None:
        """Mark a task as completed, removing it from active tracking."""
        with self._lock:
            self._cancelled_tasks.discard(task_id)
            self._active_tasks.pop(task_id, None)

    def cleanup_failed_task(self, task_id: str) -> None:
        """Cleanup a failed task's output files."""
        with self._lock:
            if task_id in self._active_tasks:
                output_path = self._active_tasks.pop(task_id)
                cleanup_file(output_path)
        cleanup_task_files(task_id)

    def send_progress(self, task_id: str, progress: float, message: str = "") -> None:
        """Send progress update to the client."""
        # Check if task was cancelled before sending progress
        if self.is_task_cancelled(task_id):
            raise JsonRpcError(-32001, "Task cancelled")

        response = {
            "type": "progress",
            "taskId": task_id,
            "progress": progress,
            "message": message
        }
        self._send(response)

    def _send(self, data: Dict) -> None:
        """Send JSON data to stdout."""
        try:
            output = json.dumps(data, ensure_ascii=False)
            sys.stdout.write(output + "\n")
            sys.stdout.flush()
        except Exception as e:
            logger.error(f"Failed to send response: {e}")

    def _handle_request(self, request: Dict) -> Dict:
        """Handle a single JSON-RPC request."""
        request_id = request.get("id")
        method = request.get("method")
        params = request.get("params", {})
        task_id = str(request_id)

        if not method:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32600, "message": "Invalid Request: method is required"}
            }

        # Handle built-in task:cancel method
        if method == "task:cancel":
            task_to_cancel = params.get("taskId") if isinstance(params, dict) else None
            if task_to_cancel:
                self.cancel_task(task_to_cancel)
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {"cancelled": True, "taskId": task_to_cancel}
                }
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32602, "message": "taskId parameter required"}
            }

        # Handle built-in task:cleanup method
        if method == "task:cleanup":
            file_path = params.get("filePath") if isinstance(params, dict) else None
            if file_path:
                success = cleanup_file(file_path)
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {"cleaned": success, "filePath": file_path}
                }
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32602, "message": "filePath parameter required"}
            }

        if method not in self.methods:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32601, "message": f"Method not found: {method}"}
            }

        # Check if task was already cancelled
        if self.is_task_cancelled(task_id):
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32001, "message": "Task cancelled"}
            }

        # Extract output path for cleanup registration
        output_path = None
        if isinstance(params, dict):
            output_path = params.get("outputPath") or params.get("outputDir")

        try:
            # Register output file for cleanup on failure
            if output_path:
                self.register_task_output(task_id, output_path)

            # Call the method with params
            handler = self.methods[method]

            # Pass progress callback if the method accepts it
            if isinstance(params, dict):
                params["_progress_callback"] = lambda p, m="": self.send_progress(
                    task_id, p, m
                )

            result = handler(**params) if isinstance(params, dict) else handler(*params)

            # Task completed successfully, remove from tracking (keep files)
            self.complete_task(task_id)

            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": result
            }

        except JsonRpcError as e:
            # Cleanup on failure
            self.cleanup_failed_task(task_id)
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": e.code, "message": e.message, "data": e.data}
            }
        except Exception as e:
            logger.exception(f"Error handling {method}")
            # Cleanup on failure
            self.cleanup_failed_task(task_id)
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32000, "message": str(e)}
            }

    def run(self) -> None:
        """Run the server, reading from stdin."""
        logger.info("JSON-RPC server ready")

        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue

            try:
                request = json.loads(line)
                response = self._handle_request(request)
                self._send(response)
            except json.JSONDecodeError as e:
                self._send({
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {"code": -32700, "message": f"Parse error: {e}"}
                })
