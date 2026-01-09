"""
JSON-RPC Server for IPC communication with Electron
"""

import sys
import json
from typing import Any, Callable, Dict, Optional
from loguru import logger


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

    def register(self, name: str, func: Callable) -> None:
        """Register a method handler."""
        self.methods[name] = func

    def send_progress(self, task_id: str, progress: float, message: str = "") -> None:
        """Send progress update to the client."""
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

        if not method:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32600, "message": "Invalid Request: method is required"}
            }

        if method not in self.methods:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32601, "message": f"Method not found: {method}"}
            }

        try:
            # Call the method with params
            handler = self.methods[method]

            # Pass progress callback if the method accepts it
            if isinstance(params, dict):
                params["_progress_callback"] = lambda p, m="": self.send_progress(
                    str(request_id), p, m
                )

            result = handler(**params) if isinstance(params, dict) else handler(*params)

            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": result
            }

        except JsonRpcError as e:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": e.code, "message": e.message, "data": e.data}
            }
        except Exception as e:
            logger.exception(f"Error handling {method}")
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
