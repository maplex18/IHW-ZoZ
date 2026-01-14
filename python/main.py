#!/usr/bin/env python3
"""
IHW-ZoZ - Python Backend Service
JSON-RPC server for PDF and media processing
"""

import sys
import json
from typing import Any, Dict, Optional
from loguru import logger

from core.server import JsonRpcServer
from pdf import merger, splitter, compressor, converter, editor, security
from media import ffmpeg_wrapper
from image import processor as image_processor
from download import youtube as youtube_downloader

# Configure logging
logger.remove()
logger.add(sys.stderr, level="INFO", format="{time} | {level} | {message}")


def create_server() -> JsonRpcServer:
    """Create and configure the JSON-RPC server."""
    server = JsonRpcServer()

    # Register PDF methods
    server.register("pdf.merge", merger.merge_pdfs)
    server.register("pdf.split", splitter.split_pdf)
    server.register("pdf.compress", compressor.compress_pdf)
    server.register("pdf.toImages", converter.pdf_to_images)
    server.register("pdf.rotate", editor.rotate_pdf)
    server.register("pdf.addWatermark", editor.add_watermark)
    server.register("pdf.encrypt", security.encrypt_pdf)
    server.register("pdf.decrypt", security.decrypt_pdf)
    server.register("pdf.crack", security.crack_pdf)

    # Register media methods
    server.register("media.info", ffmpeg_wrapper.get_media_info)
    server.register("media.videoCompress", ffmpeg_wrapper.compress_video)
    server.register("media.videoConvert", ffmpeg_wrapper.convert_video)
    server.register("media.audioConvert", ffmpeg_wrapper.convert_audio)
    server.register("media.audioExtract", ffmpeg_wrapper.extract_audio)
    server.register("media.trim", ffmpeg_wrapper.trim_media)
    server.register("media.videoToGif", ffmpeg_wrapper.video_to_gif)

    # Register image methods
    server.register("image.info", image_processor.get_image_info)
    server.register("image.createGif", image_processor.create_gif)
    server.register("image.resize", image_processor.resize_image)
    server.register("image.crop", image_processor.crop_image)
    server.register("image.getColors", image_processor.get_image_colors)
    server.register("image.rotate", image_processor.rotate_image)
    server.register("image.flip", image_processor.flip_image)
    server.register("image.enlarge", image_processor.enlarge_image)

    # Register download methods
    server.register("download.checkNetwork", youtube_downloader.check_network)
    server.register("download.getVideoInfo", youtube_downloader.get_video_info)
    server.register("download.video", youtube_downloader.download_video)

    return server


def main():
    """Main entry point."""
    logger.info("Starting IHW-ZoZ Python backend...")
    server = create_server()

    try:
        server.run()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
