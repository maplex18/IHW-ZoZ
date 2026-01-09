"""
Image processing functions for IHW-ZoZ
"""

import os
from typing import Any, Callable, Dict, List, Optional, Tuple
from PIL import Image, ImageDraw
from loguru import logger


def get_image_info(
    file: str,
    _progress_callback: Optional[Callable] = None
) -> Dict[str, Any]:
    """Get image information."""
    try:
        with Image.open(file) as img:
            return {
                "width": img.width,
                "height": img.height,
                "format": img.format,
                "mode": img.mode,
                "size": os.path.getsize(file)
            }
    except Exception as e:
        logger.error(f"Failed to get image info: {e}")
        raise


SUPPORTED_IMAGE_FORMATS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif'}


def create_gif(
    files: List[str],
    outputPath: str,
    frameDelay: int = 100,
    loop: int = 0,
    _progress_callback: Optional[Callable] = None
) -> str:
    """Create GIF animation from multiple images."""
    try:
        if not files:
            raise ValueError("No input files provided")

        # Filter out unsupported formats
        valid_files = []
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in SUPPORTED_IMAGE_FORMATS:
                valid_files.append(f)
            else:
                logger.warning(f"Skipping unsupported file format: {f}")

        if not valid_files:
            raise ValueError("No supported image files found. Supported formats: JPG, PNG, GIF, BMP, WEBP, TIFF")

        logger.info(f"Creating GIF from {len(valid_files)} images")

        images = []
        total = len(valid_files)

        for i, file_path in enumerate(valid_files):
            try:
                img = Image.open(file_path)
                # Convert to RGBA for consistency
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                images.append(img)
            except Exception as e:
                logger.warning(f"Failed to open image {file_path}: {e}")
                continue

            if _progress_callback:
                _progress_callback((i + 1) / total * 50, f"Loading image {i + 1}/{total}")

        if not images:
            raise ValueError("No valid images found")

        # Use the first image's size as reference
        base_size = images[0].size

        # Resize all images to match the first one
        resized_images = []
        for i, img in enumerate(images):
            if img.size != base_size:
                img = img.resize(base_size, Image.Resampling.LANCZOS)
            # Convert to palette mode for GIF
            img_p = img.convert('P', palette=Image.Palette.ADAPTIVE, colors=256)
            resized_images.append(img_p)

            if _progress_callback:
                _progress_callback(50 + (i + 1) / len(images) * 40, f"Processing image {i + 1}/{len(images)}")

        # Save as GIF
        resized_images[0].save(
            outputPath,
            save_all=True,
            append_images=resized_images[1:],
            duration=frameDelay,
            loop=loop,
            optimize=True
        )

        if _progress_callback:
            _progress_callback(100, "GIF created successfully")

        logger.info(f"GIF created: {outputPath}")
        return outputPath

    except Exception as e:
        logger.error(f"Failed to create GIF: {e}")
        raise


def resize_image(
    file: str,
    outputPath: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    keepAspectRatio: bool = True,
    quality: int = 95,
    _progress_callback: Optional[Callable] = None
) -> str:
    """Resize image to specified dimensions."""
    try:
        logger.info(f"Resizing image: {file}")

        if _progress_callback:
            _progress_callback(10, "Opening image")

        with Image.open(file) as img:
            original_width, original_height = img.size

            # Calculate new dimensions
            if width and height:
                if keepAspectRatio:
                    # Calculate aspect ratio preserving dimensions
                    ratio = min(width / original_width, height / original_height)
                    new_width = int(original_width * ratio)
                    new_height = int(original_height * ratio)
                else:
                    new_width = width
                    new_height = height
            elif width:
                ratio = width / original_width
                new_width = width
                new_height = int(original_height * ratio) if keepAspectRatio else original_height
            elif height:
                ratio = height / original_height
                new_height = height
                new_width = int(original_width * ratio) if keepAspectRatio else original_width
            else:
                raise ValueError("Either width or height must be specified")

            if _progress_callback:
                _progress_callback(50, "Resizing image")

            # Resize
            resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

            if _progress_callback:
                _progress_callback(80, "Saving image")

            # Determine format from output path
            output_format = os.path.splitext(outputPath)[1].lower().replace('.', '').upper()
            if output_format == 'JPG':
                output_format = 'JPEG'

            # Save with appropriate options
            if output_format == 'JPEG':
                if resized.mode == 'RGBA':
                    resized = resized.convert('RGB')
                resized.save(outputPath, format=output_format, quality=quality)
            elif output_format == 'PNG':
                resized.save(outputPath, format=output_format, optimize=True)
            else:
                resized.save(outputPath, quality=quality)

            if _progress_callback:
                _progress_callback(100, "Resize completed")

            logger.info(f"Image resized: {outputPath}")
            return outputPath

    except Exception as e:
        logger.error(f"Failed to resize image: {e}")
        raise


def crop_image(
    file: str,
    outputPath: str,
    x: int,
    y: int,
    width: int,
    height: int,
    quality: int = 95,
    _progress_callback: Optional[Callable] = None
) -> str:
    """Crop image to specified region."""
    try:
        logger.info(f"Cropping image: {file}")

        if _progress_callback:
            _progress_callback(20, "Opening image")

        with Image.open(file) as img:
            # Define crop box (left, upper, right, lower)
            box = (x, y, x + width, y + height)

            if _progress_callback:
                _progress_callback(50, "Cropping image")

            cropped = img.crop(box)

            if _progress_callback:
                _progress_callback(80, "Saving image")

            # Determine format
            output_format = os.path.splitext(outputPath)[1].lower().replace('.', '').upper()
            if output_format == 'JPG':
                output_format = 'JPEG'

            if output_format == 'JPEG' and cropped.mode == 'RGBA':
                cropped = cropped.convert('RGB')

            cropped.save(outputPath, quality=quality)

            if _progress_callback:
                _progress_callback(100, "Crop completed")

            logger.info(f"Image cropped: {outputPath}")
            return outputPath

    except Exception as e:
        logger.error(f"Failed to crop image: {e}")
        raise


def get_image_colors(
    file: str,
    numColors: int = 10,
    _progress_callback: Optional[Callable] = None
) -> List[Dict[str, Any]]:
    """Extract dominant colors from image."""
    try:
        logger.info(f"Extracting colors from: {file}")

        if _progress_callback:
            _progress_callback(20, "Opening image")

        with Image.open(file) as img:
            # Resize for faster processing
            img_small = img.copy()
            img_small.thumbnail((150, 150))

            # Convert to RGB
            if img_small.mode != 'RGB':
                img_small = img_small.convert('RGB')

            if _progress_callback:
                _progress_callback(40, "Analyzing colors")

            # Get colors with count
            colors = img_small.getcolors(maxcolors=img_small.width * img_small.height)

            if colors is None:
                # Too many colors, use quantization
                img_quantized = img_small.quantize(colors=numColors)
                palette = img_quantized.getpalette()
                colors = []
                for i in range(numColors):
                    r = palette[i * 3]
                    g = palette[i * 3 + 1]
                    b = palette[i * 3 + 2]
                    colors.append((1, (r, g, b)))

            if _progress_callback:
                _progress_callback(70, "Sorting colors")

            # Sort by frequency
            colors.sort(reverse=True, key=lambda x: x[0])

            # Get top colors
            result = []
            for count, color in colors[:numColors]:
                r, g, b = color
                hex_color = f"#{r:02x}{g:02x}{b:02x}"
                result.append({
                    "rgb": {"r": r, "g": g, "b": b},
                    "hex": hex_color,
                    "count": count
                })

            if _progress_callback:
                _progress_callback(100, "Color extraction completed")

            logger.info(f"Extracted {len(result)} colors")
            return result

    except Exception as e:
        logger.error(f"Failed to extract colors: {e}")
        raise


def rotate_image(
    file: str,
    outputPath: str,
    angle: float,
    expand: bool = True,
    fillColor: Optional[str] = None,
    quality: int = 95,
    _progress_callback: Optional[Callable] = None
) -> str:
    """Rotate image by specified angle."""
    try:
        logger.info(f"Rotating image: {file} by {angle} degrees")

        if _progress_callback:
            _progress_callback(20, "Opening image")

        with Image.open(file) as img:
            if _progress_callback:
                _progress_callback(50, "Rotating image")

            # Parse fill color
            fill = None
            if fillColor:
                if fillColor.startswith('#'):
                    fill = tuple(int(fillColor[i:i+2], 16) for i in (1, 3, 5))
                else:
                    fill = fillColor

            rotated = img.rotate(angle, expand=expand, fillcolor=fill, resample=Image.Resampling.BICUBIC)

            if _progress_callback:
                _progress_callback(80, "Saving image")

            # Determine format
            output_format = os.path.splitext(outputPath)[1].lower().replace('.', '').upper()
            if output_format == 'JPG':
                output_format = 'JPEG'

            if output_format == 'JPEG' and rotated.mode == 'RGBA':
                rotated = rotated.convert('RGB')

            rotated.save(outputPath, quality=quality)

            if _progress_callback:
                _progress_callback(100, "Rotation completed")

            logger.info(f"Image rotated: {outputPath}")
            return outputPath

    except Exception as e:
        logger.error(f"Failed to rotate image: {e}")
        raise


def flip_image(
    file: str,
    outputPath: str,
    horizontal: bool = True,
    quality: int = 95,
    _progress_callback: Optional[Callable] = None
) -> str:
    """Flip image horizontally or vertically."""
    try:
        direction = "horizontally" if horizontal else "vertically"
        logger.info(f"Flipping image: {file} {direction}")

        if _progress_callback:
            _progress_callback(20, "Opening image")

        with Image.open(file) as img:
            if _progress_callback:
                _progress_callback(50, "Flipping image")

            if horizontal:
                flipped = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            else:
                flipped = img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)

            if _progress_callback:
                _progress_callback(80, "Saving image")

            # Determine format
            output_format = os.path.splitext(outputPath)[1].lower().replace('.', '').upper()
            if output_format == 'JPG':
                output_format = 'JPEG'

            if output_format == 'JPEG' and flipped.mode == 'RGBA':
                flipped = flipped.convert('RGB')

            flipped.save(outputPath, quality=quality)

            if _progress_callback:
                _progress_callback(100, "Flip completed")

            logger.info(f"Image flipped: {outputPath}")
            return outputPath

    except Exception as e:
        logger.error(f"Failed to flip image: {e}")
        raise


def enlarge_image(
    file: str,
    outputPath: str,
    scaleFactor: int = 2,
    quality: int = 95,
    _progress_callback: Optional[Callable] = None
) -> str:
    """Enlarge image using high-quality resampling.

    Note: This uses Lanczos resampling for best quality.
    For AI-based super-resolution, external models would be needed.
    """
    try:
        logger.info(f"Enlarging image: {file} by {scaleFactor}x")

        if _progress_callback:
            _progress_callback(10, "Opening image")

        with Image.open(file) as img:
            original_width, original_height = img.size
            new_width = original_width * scaleFactor
            new_height = original_height * scaleFactor

            if _progress_callback:
                _progress_callback(30, f"Upscaling to {new_width}x{new_height}")

            # Use LANCZOS for best quality upscaling
            enlarged = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

            if _progress_callback:
                _progress_callback(80, "Saving image")

            # Determine format
            output_format = os.path.splitext(outputPath)[1].lower().replace('.', '').upper()
            if output_format == 'JPG':
                output_format = 'JPEG'

            if output_format == 'JPEG' and enlarged.mode == 'RGBA':
                enlarged = enlarged.convert('RGB')

            enlarged.save(outputPath, quality=quality)

            if _progress_callback:
                _progress_callback(100, "Enlargement completed")

            logger.info(f"Image enlarged: {outputPath}")
            return outputPath

    except Exception as e:
        logger.error(f"Failed to enlarge image: {e}")
        raise
