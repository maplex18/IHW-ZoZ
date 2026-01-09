"""
PDF Conversion functionality using PyMuPDF
"""

import os
import fitz  # PyMuPDF
from typing import List, Callable, Optional
from loguru import logger


def pdf_to_images(
    file: str,
    outputDir: str,
    format: str = "png",
    dpi: int = 150,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> List[str]:
    """
    Convert PDF pages to images.

    Args:
        file: Input PDF file path
        outputDir: Output directory for images
        format: Output format (png, jpg)
        dpi: Resolution in DPI
        _progress_callback: Optional progress callback

    Returns:
        List of output image file paths
    """
    logger.info(f"Converting PDF to images: {file}")

    doc = fitz.open(file)
    total_pages = len(doc)
    output_files = []
    base_name = os.path.splitext(os.path.basename(file))[0]

    os.makedirs(outputDir, exist_ok=True)

    # Calculate zoom factor for desired DPI (72 DPI is default)
    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)

    try:
        for page_num in range(total_pages):
            page = doc[page_num]
            pix = page.get_pixmap(matrix=matrix)

            output_path = os.path.join(outputDir, f"{base_name}_page_{page_num + 1}.{format}")

            if format.lower() == "jpg" or format.lower() == "jpeg":
                pix.save(output_path, "jpeg")
            else:
                pix.save(output_path, "png")

            output_files.append(output_path)

            if _progress_callback:
                progress = (page_num + 1) / total_pages * 100
                _progress_callback(progress, f"Converting page {page_num + 1}/{total_pages}")

        logger.info(f"Converted {len(output_files)} pages to images")
        return output_files

    finally:
        doc.close()
