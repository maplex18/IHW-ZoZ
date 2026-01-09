"""
PDF Merge functionality using PyMuPDF
"""

import fitz  # PyMuPDF
from typing import List, Callable, Optional
from loguru import logger


def merge_pdfs(
    files: List[str],
    outputPath: str,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Merge multiple PDF files into one.

    Args:
        files: List of input PDF file paths
        outputPath: Output PDF file path
        _progress_callback: Optional progress callback

    Returns:
        Path to the merged PDF file
    """
    logger.info(f"Merging {len(files)} PDF files")

    output_doc = fitz.open()
    total_files = len(files)

    try:
        for idx, file_path in enumerate(files):
            logger.debug(f"Adding {file_path}")
            src_doc = fitz.open(file_path)
            output_doc.insert_pdf(src_doc)
            src_doc.close()

            if _progress_callback:
                progress = (idx + 1) / total_files * 100
                _progress_callback(progress, f"Processing {idx + 1}/{total_files}")

        output_doc.save(outputPath)
        logger.info(f"Merged PDF saved to {outputPath}")

        return outputPath

    finally:
        output_doc.close()
