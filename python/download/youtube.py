"""
YouTube downloader using yt-dlp
Lazy loading to improve startup time.
"""

import os
import socket
from typing import Dict, Optional, Callable, Any, List
from loguru import logger

# Lazy loading for yt-dlp
_yt_dlp = None


def _get_yt_dlp():
    """Lazy load yt-dlp module."""
    global _yt_dlp
    if _yt_dlp is None:
        try:
            import yt_dlp
            _yt_dlp = yt_dlp
        except ImportError:
            _yt_dlp = False
    return _yt_dlp if _yt_dlp else None


def get_ffmpeg_path() -> Optional[str]:
    """Get FFmpeg path from environment variable."""
    return os.environ.get('FFMPEG_PATH')


def check_network(timeout: int = 5, **kwargs) -> Dict[str, Any]:
    """
    Check network connectivity.

    Args:
        timeout: Connection timeout in seconds

    Returns:
        Dictionary with connection status
    """
    hosts_to_check = [
        ("www.youtube.com", 443),
        ("www.google.com", 443),
    ]

    for host, port in hosts_to_check:
        try:
            socket.create_connection((host, port), timeout=timeout)
            return {
                "connected": True,
                "host": host,
                "message": "Network connection available"
            }
        except (socket.timeout, socket.error):
            continue

    return {
        "connected": False,
        "host": None,
        "message": "No network connection"
    }


def get_video_info(url: str, **kwargs) -> Dict[str, Any]:
    """
    Get video information without downloading.

    Args:
        url: YouTube video URL

    Returns:
        Dictionary with video metadata and available formats
    """
    yt_dlp = _get_yt_dlp()
    if not yt_dlp:
        raise RuntimeError("yt-dlp is not installed")

    logger.info(f"Getting video info: {url}")

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            # Extract available formats
            formats = []
            seen_resolutions = set()

            for f in info.get('formats', []):
                # Video formats with video codec
                if f.get('vcodec') and f.get('vcodec') != 'none' and f.get('height'):
                    resolution = f"{f.get('height')}p"
                    if resolution not in seen_resolutions:
                        seen_resolutions.add(resolution)
                        formats.append({
                            'format_id': f.get('format_id'),
                            'type': 'video',
                            'resolution': resolution,
                            'height': f.get('height'),
                            'ext': f.get('ext'),
                            'filesize': f.get('filesize') or f.get('filesize_approx'),
                            'vcodec': f.get('vcodec'),
                            'acodec': f.get('acodec'),
                        })

            # Sort by resolution (descending)
            formats.sort(key=lambda x: x.get('height', 0), reverse=True)

            return {
                'title': info.get('title'),
                'description': (info.get('description') or '')[:500],  # Truncate
                'duration': info.get('duration'),
                'thumbnail': info.get('thumbnail'),
                'uploader': info.get('uploader'),
                'upload_date': info.get('upload_date'),
                'view_count': info.get('view_count'),
                'formats': formats,
                'url': url,
            }

    except Exception as e:
        logger.error(f"Failed to get video info: {e}")
        raise RuntimeError(f"Failed to get video info: {str(e)}")


def download_video(
    url: str,
    outputPath: str,
    resolution: str = "1080p",
    format: str = "mp4",
    audioOnly: bool = False,
    audioFormat: str = "mp3",
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Download YouTube video.

    Args:
        url: YouTube video URL
        outputPath: Output directory path
        resolution: Target resolution (e.g., "720p", "1080p")
        format: Video format (mp4, webm, mkv)
        audioOnly: Download audio only
        audioFormat: Audio format when audioOnly=True (mp3, m4a, wav)
        _progress_callback: Progress callback function

    Returns:
        Dictionary with download result
    """
    yt_dlp = _get_yt_dlp()
    if not yt_dlp:
        raise RuntimeError("yt-dlp is not installed")

    logger.info(f"Downloading: {url}")
    logger.info(f"Options: resolution={resolution}, format={format}, audioOnly={audioOnly}")

    # Ensure output directory exists
    if not os.path.exists(outputPath):
        os.makedirs(outputPath)

    # Output template
    output_template = os.path.join(outputPath, '%(title)s.%(ext)s')

    # Track download state for progress reporting
    download_state = {'started': False, 'last_progress': 0}

    # Progress hook
    def progress_hook(d):
        if d['status'] == 'downloading':
            if _progress_callback:
                # Send initial progress on first callback
                if not download_state['started']:
                    download_state['started'] = True
                    _progress_callback(1, "Starting download...")

                total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
                downloaded = d.get('downloaded_bytes', 0)

                if total > 0:
                    progress = int((downloaded / total) * 85)  # Reserve 15% for post-processing
                    # Only update if progress changed significantly
                    if progress > download_state['last_progress']:
                        download_state['last_progress'] = progress
                        speed = d.get('speed', 0)
                        speed_str = f"{speed / 1024 / 1024:.1f} MB/s" if speed else ""
                        _progress_callback(progress, f"Downloading: {progress}% {speed_str}".strip())
                else:
                    # No total size available, show downloaded amount
                    downloaded_mb = downloaded / 1024 / 1024
                    _progress_callback(50, f"Downloading: {downloaded_mb:.1f} MB")

        elif d['status'] == 'finished':
            if _progress_callback:
                _progress_callback(85, "Processing...")

        elif d['status'] == 'error':
            if _progress_callback:
                _progress_callback(0, "Download error")

    # Build format selector
    if audioOnly:
        format_selector = 'bestaudio/best'
    else:
        # Parse resolution number
        height = int(resolution.replace('p', ''))
        # Prefer h264/avc1 codec (compatible with QuickTime) over av01/vp9
        # Priority: h264 mp4 > h264 any > any mp4 > best
        format_selector = (
            f'bestvideo[height<={height}][vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/'
            f'bestvideo[height<={height}][vcodec^=avc1]+bestaudio/'
            f'bestvideo[height<={height}][ext=mp4]+bestaudio[ext=m4a]/'
            f'bestvideo[height<={height}]+bestaudio/'
            f'best[height<={height}]/best'
        )

    ffmpeg_path = get_ffmpeg_path()
    logger.info(f"FFmpeg path from env: {ffmpeg_path}")

    # Postprocessor hook for FFmpeg progress
    def postprocessor_hook(d):
        if _progress_callback:
            if d['status'] == 'started':
                _progress_callback(88, f"Processing: {d.get('postprocessor', 'FFmpeg')}...")
            elif d['status'] == 'finished':
                _progress_callback(95, "Finalizing...")

    ydl_opts = {
        'format': format_selector,
        'outtmpl': output_template,
        'progress_hooks': [progress_hook],
        'postprocessor_hooks': [postprocessor_hook],
        'quiet': True,  # Suppress yt-dlp output to prevent mixing with JSON
        'no_warnings': True,
        'noprogress': True,  # Disable yt-dlp's progress bar
        'merge_output_format': format if not audioOnly else None,  # Always set merge format
        'overwrites': True,  # Force overwrite if file already exists
    }

    # Set FFmpeg location if available
    if ffmpeg_path and os.path.exists(ffmpeg_path):
        ffmpeg_dir = os.path.dirname(ffmpeg_path)
        ydl_opts['ffmpeg_location'] = ffmpeg_dir
        logger.info(f"FFmpeg location set to: {ffmpeg_dir}")
    else:
        logger.warning(f"FFmpeg not found at path: {ffmpeg_path}")

    # Post-processing for format conversion
    if audioOnly:
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': audioFormat,
            'preferredquality': '192',
        }]
    else:
        # For video, use FFmpegVideoRemuxer to ensure proper container
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegVideoRemuxer',
            'preferedformat': format,
        }]

    try:
        # Send initial progress
        if _progress_callback:
            _progress_callback(0, "Preparing download...")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)

            # Determine actual output filename
            if audioOnly:
                ext = audioFormat
            else:
                ext = format

            # Get the actual downloaded file path
            filename = ydl.prepare_filename(info)
            base, _ = os.path.splitext(filename)
            output_file = f"{base}.{ext}"

            # If file doesn't exist with expected extension, try to find it
            if not os.path.exists(output_file):
                # Look for any file with the same base name
                dir_path = os.path.dirname(filename)
                base_name = os.path.basename(base)
                for f in os.listdir(dir_path):
                    if f.startswith(base_name):
                        output_file = os.path.join(dir_path, f)
                        break

            if _progress_callback:
                _progress_callback(100, "Download complete!")

            logger.info(f"Download complete: {output_file}")

            return {
                'success': True,
                'outputPath': output_file,
                'title': info.get('title'),
                'duration': info.get('duration'),
                'message': 'Download completed successfully'
            }

    except Exception as e:
        logger.error(f"Download failed: {e}")
        raise RuntimeError(f"Download failed: {str(e)}")
