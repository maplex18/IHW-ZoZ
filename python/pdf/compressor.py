"""
PDF Compression functionality using PyMuPDF
"""

import fitz  # PyMuPDF
from typing import Callable, Optional
from loguru import logger


def compress_pdf(
    file: str,
    outputPath: str,
    quality: int = 75,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Compress a PDF file by reducing image quality.

    Args:
        file: Input PDF file path
        outputPath: Output PDF file path
        quality: Image quality (1-100, lower = more compression)
        _progress_callback: Optional progress callback

    Returns:
        Path to the compressed PDF file
    """
    logger.info(f"Compressing PDF: {file} with quality {quality}")

    doc = fitz.open(file)
    total_pages = len(doc)

    try:
        for page_num in range(total_pages):
            page = doc[page_num]

            # Get images on this page
            image_list = page.get_images()

            for img_index, img in enumerate(image_list):
                xref = img[0]

                try:
                    # Extract image
                    base_image = doc.extract_image(xref)
                    if base_image:
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]

                        # Only compress JPEG/PNG images
                        if image_ext in ("jpeg", "jpg", "png"):
                            # Re-compress image with lower quality
                            from PIL import Image
                            import io

                            img_pil = Image.open(io.BytesIO(image_bytes))

                            # Convert to RGB if necessary
                            if img_pil.mode in ("RGBA", "P"):
                                img_pil = img_pil.convert("RGB")

                            # Save with compression
                            output_buffer = io.BytesIO()
                            img_pil.save(output_buffer, format="JPEG", quality=quality, optimize=True)

                            # Replace image in PDF
                            doc.update_image(xref, output_buffer.getvalue())

                except Exception as e:
                    logger.warning(f"Could not compress image {xref}: {e}")

            if _progress_callback:
                progress = (page_num + 1) / total_pages * 100
                _progress_callback(progress, f"Processing page {page_num + 1}/{total_pages}")

        # Save with garbage collection and compression
        doc.save(
            outputPath,
            garbage=4,
            deflate=True,
            deflate_images=True,
            deflate_fonts=True,
            clean=True
        )

        logger.info(f"Compressed PDF saved to {outputPath}")
        return outputPath

    finally:
        doc.close()
