"""
Download module for YouTube and other media sources
"""

from .youtube import (
    check_network,
    get_video_info,
    download_video,
)

__all__ = [
    'check_network',
    'get_video_info',
    'download_video',
]
