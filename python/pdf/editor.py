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


def _calc_watermark_rect(
    page_rect: fitz.Rect,
    img_width: int,
    img_height: int,
    position: str,
    scale: float
) -> fitz.Rect:
    """計算浮水印的位置和大小"""
    img_aspect = img_width / img_height
    max_wm_width = page_rect.width * scale
    max_wm_height = page_rect.height * scale

    # 保持圖片比例
    if img_aspect > 1:
        wm_width = max_wm_width
        wm_height = max_wm_width / img_aspect
    else:
        wm_height = max_wm_height
        wm_width = max_wm_height * img_aspect

    margin = 20
    positions = {
        "center": ((page_rect.width - wm_width) / 2, (page_rect.height - wm_height) / 2),
        "top-left": (margin, margin),
        "top-right": (page_rect.width - wm_width - margin, margin),
        "bottom-left": (margin, page_rect.height - wm_height - margin),
        "bottom-right": (page_rect.width - wm_width - margin, page_rect.height - wm_height - margin),
        "top": ((page_rect.width - wm_width) / 2, margin),
        "bottom": ((page_rect.width - wm_width) / 2, page_rect.height - wm_height - margin),
        "left": (margin, (page_rect.height - wm_height) / 2),
        "right": (page_rect.width - wm_width - margin, (page_rect.height - wm_height) / 2),
    }

    x0, y0 = positions.get(position, positions["center"])
    return fitz.Rect(x0, y0, x0 + wm_width, y0 + wm_height)


def add_watermark(
    file: str,
    outputPath: str,
    text: Optional[str] = None,
    image: Optional[str] = None,
    opacity: float = 0.3,
    position: str = "center",
    scale: float = 0.3,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Add watermark to PDF.

    For image watermarks, blends the image with white background based on opacity.
    """
    import math
    import io
    from PIL import Image as PILImage

    logger.info(f"Adding watermark to PDF: {file}")
    logger.info(f"Parameters: text={text}, image={image}, opacity={opacity}, position={position}, scale={scale}")

    doc = fitz.open(file)
    total_pages = len(doc)

    # 預處理圖片和遮罩
    img_pixmap = None
    mask_pixmap = None
    img_width, img_height = 0, 0

    if image:
        # 載入原始圖片
        pil_img = PILImage.open(image)
        img_width, img_height = pil_img.width, pil_img.height

        # 轉換為 RGB（不帶 alpha）
        if pil_img.mode == 'RGBA':
            # 如果有 alpha，先合成到白色背景
            rgb_img = PILImage.new('RGB', pil_img.size, (255, 255, 255))
            rgb_img.paste(pil_img, mask=pil_img.split()[3])
        else:
            rgb_img = pil_img.convert('RGB')

        # 創建圖片的 Pixmap
        img_buffer = io.BytesIO()
        rgb_img.save(img_buffer, format='PNG')
        img_pixmap = fitz.Pixmap(img_buffer.getvalue())

        # 創建遮罩 Pixmap（灰度圖，值 = opacity * 255）
        # 遮罩中 255 = 完全不透明，0 = 完全透明
        mask_value = int(opacity * 255)
        mask_img = PILImage.new('L', (img_width, img_height), mask_value)
        mask_buffer = io.BytesIO()
        mask_img.save(mask_buffer, format='PNG')
        mask_pixmap = fitz.Pixmap(mask_buffer.getvalue())

        logger.info(f"Processed watermark image: {img_width}x{img_height}, opacity={opacity}, mask_value={mask_value}")

    try:
        for page_num in range(total_pages):
            page = doc[page_num]
            rect = page.rect

            if text:
                # 文字浮水印
                fontsize = 60
                color = (0.5, 0.5, 0.5)
                center_x = rect.width / 2
                center_y = rect.height / 2
                angle = -45

                text_length = fitz.get_text_length(text, fontsize=fontsize)
                tw = fitz.TextWriter(page.rect, opacity=opacity, color=color)
                x = center_x - text_length / 2
                y = center_y

                tw.append((x, y), text, fontsize=fontsize, font=fitz.Font("helv"))

                pivot = fitz.Point(center_x, center_y)
                rot = math.radians(angle)
                matrix = fitz.Matrix(math.cos(rot), math.sin(rot), -math.sin(rot), math.cos(rot), 0, 0)
                tw.write_text(page, opacity=opacity, morph=(pivot, matrix))

            elif image and img_pixmap:
                # 計算浮水印位置和大小
                img_rect = _calc_watermark_rect(rect, img_width, img_height, position, scale)

                # 使用 pixmap 和 mask 插入帶透明度的圖片
                page.insert_image(
                    img_rect,
                    pixmap=img_pixmap,
                    mask=mask_pixmap,
                    overlay=True,
                    keep_proportion=True
                )

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
