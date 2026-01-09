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


def ocr_pdf(
    file: str,
    outputPath: str,
    language: str = "eng",
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Perform OCR on a PDF file using Tesseract.

    Args:
        file: Input PDF file path
        outputPath: Output PDF file path (searchable PDF)
        language: OCR language code
        _progress_callback: Optional progress callback

    Returns:
        Path to the OCR'd PDF file
    """
    logger.info(f"Performing OCR on PDF: {file}")

    try:
        import pytesseract
        from PIL import Image
        import io
        import subprocess
    except ImportError as e:
        raise ImportError("pytesseract and Pillow are required for OCR") from e

    # Check if Tesseract is installed
    try:
        subprocess.run(["tesseract", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        raise RuntimeError(
            "Tesseract OCR is not installed. Please install it:\n"
            "  macOS: brew install tesseract\n"
            "  Ubuntu: sudo apt install tesseract-ocr\n"
            "  Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki"
        )

    # Check if the language data is available
    try:
        result = subprocess.run(["tesseract", "--list-langs"], capture_output=True, text=True)
        available_langs = result.stdout.strip().split('\n')[1:]  # Skip header line
        if language not in available_langs:
            lang_name = {
                'chi_tra': 'Traditional Chinese',
                'chi_sim': 'Simplified Chinese',
                'jpn': 'Japanese',
                'kor': 'Korean',
                'eng': 'English',
            }.get(language, language)
            raise RuntimeError(
                f"Tesseract language '{language}' ({lang_name}) is not installed.\n"
                f"Please install it:\n"
                f"  macOS: brew install tesseract-lang\n"
                f"  Ubuntu: sudo apt install tesseract-ocr-{language}\n"
                f"Available languages: {', '.join(available_langs[:10])}..."
            )
    except subprocess.CalledProcessError:
        pass  # Continue anyway, let Tesseract report the error

    doc = fitz.open(file)
    total_pages = len(doc)

    # Create output document
    output_doc = fitz.open()

    zoom = 2.0  # Higher resolution for better OCR
    matrix = fitz.Matrix(zoom, zoom)

    try:
        for page_num in range(total_pages):
            page = doc[page_num]

            # Render page to image
            pix = page.get_pixmap(matrix=matrix)
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))

            # Perform OCR
            try:
                ocr_data = pytesseract.image_to_pdf_or_hocr(
                    img,
                    lang=language,
                    extension="pdf"
                )
            except pytesseract.TesseractError as e:
                if "Failed loading language" in str(e):
                    raise RuntimeError(
                        f"OCR language '{language}' is not available.\n"
                        f"Please install the language pack:\n"
                        f"  macOS: brew install tesseract-lang\n"
                        f"  Ubuntu: sudo apt install tesseract-ocr-{language}"
                    ) from e
                raise

            # Insert OCR'd page
            ocr_doc = fitz.open("pdf", ocr_data)
            output_doc.insert_pdf(ocr_doc)
            ocr_doc.close()

            if _progress_callback:
                progress = (page_num + 1) / total_pages * 100
                _progress_callback(progress, f"OCR page {page_num + 1}/{total_pages}")

        output_doc.save(outputPath)
        logger.info(f"OCR'd PDF saved to {outputPath}")
        return outputPath

    finally:
        doc.close()
        output_doc.close()
