"""
PDF Split functionality using PyMuPDF
"""

import os
import fitz  # PyMuPDF
from typing import List, Callable, Optional
from loguru import logger


def split_pdf(
    file: str,
    outputDir: str,
    ranges: Optional[str] = None,
    everyNPages: Optional[int] = None,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> List[str]:
    """
    Split a PDF file into multiple files.

    Args:
        file: Input PDF file path
        outputDir: Output directory for split files
        ranges: Page ranges (e.g., "1-3,5,7-9")
        everyNPages: Split every N pages
        _progress_callback: Optional progress callback

    Returns:
        List of output file paths
    """
    logger.info(f"Splitting PDF: {file}")

    doc = fitz.open(file)
    total_pages = len(doc)
    output_files = []
    base_name = os.path.splitext(os.path.basename(file))[0]

    os.makedirs(outputDir, exist_ok=True)

    try:
        if everyNPages:
            # Split every N pages
            for i in range(0, total_pages, everyNPages):
                start = i
                end = min(i + everyNPages - 1, total_pages - 1)

                output_doc = fitz.open()
                output_doc.insert_pdf(doc, from_page=start, to_page=end)

                output_path = os.path.join(outputDir, f"{base_name}_pages_{start + 1}-{end + 1}.pdf")
                output_doc.save(output_path)
                output_doc.close()
                output_files.append(output_path)

                if _progress_callback:
                    progress = (end + 1) / total_pages * 100
                    _progress_callback(progress)

        elif ranges:
            # Split by specified ranges
            range_list = parse_page_ranges(ranges, total_pages)

            for idx, (start, end) in enumerate(range_list):
                output_doc = fitz.open()
                output_doc.insert_pdf(doc, from_page=start, to_page=end)

                output_path = os.path.join(outputDir, f"{base_name}_pages_{start + 1}-{end + 1}.pdf")
                output_doc.save(output_path)
                output_doc.close()
                output_files.append(output_path)

                if _progress_callback:
                    progress = (idx + 1) / len(range_list) * 100
                    _progress_callback(progress)

        else:
            # Split into individual pages
            for i in range(total_pages):
                output_doc = fitz.open()
                output_doc.insert_pdf(doc, from_page=i, to_page=i)

                output_path = os.path.join(outputDir, f"{base_name}_page_{i + 1}.pdf")
                output_doc.save(output_path)
                output_doc.close()
                output_files.append(output_path)

                if _progress_callback:
                    progress = (i + 1) / total_pages * 100
                    _progress_callback(progress)

        logger.info(f"Split into {len(output_files)} files")
        return output_files

    finally:
        doc.close()


def parse_page_ranges(ranges: str, total_pages: int) -> List[tuple]:
    """Parse page range string like '1-3,5,7-9' into list of (start, end) tuples."""
    result = []
    parts = ranges.split(",")

    for part in parts:
        part = part.strip()
        if "-" in part:
            start, end = part.split("-")
            start = int(start) - 1  # Convert to 0-indexed
            end = int(end) - 1
            result.append((max(0, start), min(end, total_pages - 1)))
        else:
            page = int(part) - 1
            if 0 <= page < total_pages:
                result.append((page, page))

    return result
