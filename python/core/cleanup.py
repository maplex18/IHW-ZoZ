"""
Cleanup utilities for task management.
Handles cleanup of temporary and output files when tasks fail or are cancelled.
"""

import os
import shutil
from typing import Optional, Set
from loguru import logger
from contextlib import contextmanager


# Track active tasks and their output files for cleanup
_active_tasks: dict[str, Set[str]] = {}


def register_output_file(task_id: str, file_path: str) -> None:
    """
    Register an output file for a task.
    This file will be cleaned up if the task fails or is cancelled.

    Args:
        task_id: The task ID
        file_path: The output file path to register
    """
    if task_id not in _active_tasks:
        _active_tasks[task_id] = set()
    _active_tasks[task_id].add(file_path)
    logger.debug(f"Registered output file for task {task_id}: {file_path}")


def cleanup_task_files(task_id: str) -> None:
    """
    Clean up all registered output files for a task.
    Called when a task fails or is cancelled.

    Args:
        task_id: The task ID to clean up
    """
    if task_id not in _active_tasks:
        logger.debug(f"No files registered for task {task_id}")
        return

    files = _active_tasks.pop(task_id)
    for file_path in files:
        cleanup_file(file_path)


def cleanup_file(file_path: str) -> bool:
    """
    Safely delete a file or directory.

    Args:
        file_path: The file or directory path to delete

    Returns:
        True if cleanup succeeded, False otherwise
    """
    if not file_path or not os.path.exists(file_path):
        return True

    try:
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)
            logger.info(f"Cleaned up directory: {file_path}")
        else:
            os.remove(file_path)
            logger.info(f"Cleaned up file: {file_path}")
        return True
    except Exception as e:
        logger.warning(f"Failed to cleanup {file_path}: {e}")
        return False


def complete_task(task_id: str) -> None:
    """
    Mark a task as completed successfully.
    Removes the task from tracking without deleting files.

    Args:
        task_id: The task ID
    """
    if task_id in _active_tasks:
        _active_tasks.pop(task_id)
        logger.debug(f"Task {task_id} completed, files kept")


@contextmanager
def task_cleanup_context(task_id: str, output_path: Optional[str] = None):
    """
    Context manager for automatic cleanup on task failure.

    Usage:
        with task_cleanup_context(task_id, output_path) as ctx:
            # Do work that might fail
            ctx.add_file(another_output_path)  # Register more files if needed

    On success, files are kept. On exception, all registered files are deleted.

    Args:
        task_id: The task ID
        output_path: Initial output file path to register
    """
    if output_path:
        register_output_file(task_id, output_path)

    class CleanupContext:
        def __init__(self, tid: str):
            self.task_id = tid

        def add_file(self, path: str) -> None:
            """Add another file to be cleaned up on failure."""
            register_output_file(self.task_id, path)

    ctx = CleanupContext(task_id)

    try:
        yield ctx
        # Success - keep the files
        complete_task(task_id)
    except Exception:
        # Failure - cleanup all registered files
        cleanup_task_files(task_id)
        raise


def cleanup_on_failure(output_path: str):
    """
    Decorator for functions that should cleanup output on failure.

    The decorated function must accept _progress_callback as a parameter,
    which contains the task_id as part of the closure.

    Usage:
        @cleanup_on_failure
        def my_processing_function(file, outputPath, _progress_callback=None):
            # Do processing
            return outputPath
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Get the output path from kwargs or positional args
            out_path = kwargs.get('outputPath') or (args[1] if len(args) > 1 else None)

            try:
                return func(*args, **kwargs)
            except Exception as e:
                # On failure, try to cleanup the output file
                if out_path:
                    cleanup_file(out_path)
                raise
        return wrapper
    return decorator
