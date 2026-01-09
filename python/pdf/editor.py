"""
PDF Editing functionality using PyMuPDF
"""

import fitz  # PyMuPDF
from typing import List, Callable, Optional
from loguru import logger


def rotate_pdf(
    file: str,
    outputPath: str,
    angle: int,
    pages: Optional[List[int]] = None,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Rotate PDF pages.

    Args:
        file: Input PDF file path
        outputPath: Output PDF file path
        angle: Rotation angle (90, 180, 270)
        pages: List of page numbers to rotate (1-indexed), None for all pages
        _progress_callback: Optional progress callback

    Returns:
        Path to the rotated PDF file
    """
    logger.info(f"Rotating PDF: {file} by {angle} degrees")

    doc = fitz.open(file)
    total_pages = len(doc)

    try:
        if pages:
            # Convert to 0-indexed
            page_indices = [p - 1 for p in pages if 0 < p <= total_pages]
        else:
            page_indices = list(range(total_pages))

        for idx, page_num in enumerate(page_indices):
            page = doc[page_num]
            page.set_rotation(page.rotation + angle)

            if _progress_callback:
                progress = (idx + 1) / len(page_indices) * 100
                _progress_callback(progress)

        doc.save(outputPath)
        logger.info(f"Rotated PDF saved to {outputPath}")
        return outputPath

    finally:
        doc.close()


def add_watermark(
    file: str,
    outputPath: str,
    text: Optional[str] = None,
    image: Optional[str] = None,
    opacity: float = 0.3,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Add watermark to PDF.

    Args:
        file: Input PDF file path
        outputPath: Output PDF file path
        text: Watermark text
        image: Watermark image path
        opacity: Watermark opacity (0-1)
        _progress_callback: Optional progress callback

    Returns:
        Path to the watermarked PDF file
    """
    import math

    logger.info(f"Adding watermark to PDF: {file}")

    doc = fitz.open(file)
    total_pages = len(doc)

    try:
        for page_num in range(total_pages):
            page = doc[page_num]
            rect = page.rect

            if text:
                # Add diagonal text watermark using shapes
                fontsize = 60
                color = (0.5, 0.5, 0.5)  # Gray color

                # Calculate center position
                center_x = rect.width / 2
                center_y = rect.height / 2

                # Create shape for drawing
                shape = page.new_shape()

                # Calculate text position for diagonal watermark
                # Rotate 45 degrees around center
                angle = -45  # Diagonal angle

                # Insert text at center with rotation using morph
                text_point = fitz.Point(center_x, center_y)

                # Use insert_text with a transformation matrix for rotation
                # First insert normally, then we'll use a different approach

                # Simple diagonal text - insert multiple times for visibility
                text_length = fitz.get_text_length(text, fontsize=fontsize)

                # Create rotated text using TextWriter
                tw = fitz.TextWriter(page.rect, opacity=opacity, color=color)

                # Calculate position to center the text
                x = center_x - text_length / 2
                y = center_y

                # Add text with rotation using morph parameter
                tw.append(
                    (x, y),
                    text,
                    fontsize=fontsize,
                    font=fitz.Font("helv")
                )

                # Apply with rotation (45 degrees = pi/4 radians)
                # morph = (pivot_point, matrix)
                pivot = fitz.Point(center_x, center_y)
                matrix = fitz.Matrix(math.cos(math.radians(angle)), math.sin(math.radians(angle)),
                                    -math.sin(math.radians(angle)), math.cos(math.radians(angle)), 0, 0)

                tw.write_text(page, opacity=opacity, morph=(pivot, matrix))

            elif image:
                # Add image watermark
                img_rect = fitz.Rect(
                    rect.width / 4,
                    rect.height / 4,
                    rect.width * 3 / 4,
                    rect.height * 3 / 4
                )
                page.insert_image(
                    img_rect,
                    filename=image,
                    overlay=True
                )
                # Note: PyMuPDF insert_image doesn't directly support opacity
                # The image should be pre-processed with transparency if needed

            if _progress_callback:
                progress = (page_num + 1) / total_pages * 100
                _progress_callback(progress)

        doc.save(outputPath)
        logger.info(f"Watermarked PDF saved to {outputPath}")
        return outputPath

    finally:
        doc.close()


def add_page_numbers(
    file: str,
    outputPath: str,
    position: str = "bottom-center",
    startNumber: int = 1,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Add page numbers to PDF.

    Args:
        file: Input PDF file path
        outputPath: Output PDF file path
        position: Position of page numbers
        startNumber: Starting page number
        _progress_callback: Optional progress callback

    Returns:
        Path to the PDF with page numbers
    """
    logger.info(f"Adding page numbers to PDF: {file}")

    doc = fitz.open(file)
    total_pages = len(doc)

    try:
        for page_num in range(total_pages):
            page = doc[page_num]
            rect = page.rect

            # Calculate position
            page_number = startNumber + page_num
            text = str(page_number)

            if "bottom" in position:
                y = rect.height - 30
            else:
                y = 30

            if "center" in position:
                x = rect.width / 2
            elif "right" in position:
                x = rect.width - 50
            else:
                x = 50

            # Insert page number
            page.insert_text(
                (x, y),
                text,
                fontsize=12,
                fontname="helv",
                color=(0, 0, 0)
            )

            if _progress_callback:
                progress = (page_num + 1) / total_pages * 100
                _progress_callback(progress)

        doc.save(outputPath)
        logger.info(f"PDF with page numbers saved to {outputPath}")
        return outputPath

    finally:
        doc.close()
