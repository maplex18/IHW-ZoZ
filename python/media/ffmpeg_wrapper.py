"""
FFmpeg wrapper for video and audio processing
"""

import os
import subprocess
import json
import re
import shutil
from typing import Dict, Optional, Callable, Any
from loguru import logger

# Audio format configurations
AUDIO_FORMATS = {
    'mp3': {'codec': 'libmp3lame', 'extension': 'mp3'},
    'aac': {'codec': 'aac', 'extension': 'm4a'},
    'm4a': {'codec': 'aac', 'extension': 'm4a'},
    'wav': {'codec': 'pcm_s16le', 'extension': 'wav'},
    'flac': {'codec': 'flac', 'extension': 'flac'},
    'ogg': {'codec': 'libvorbis', 'extension': 'ogg'},
    'opus': {'codec': 'libopus', 'extension': 'opus'},
    'wma': {'codec': 'wmav2', 'extension': 'wma'},
    'aiff': {'codec': 'pcm_s16be', 'extension': 'aiff'},
    'alac': {'codec': 'alac', 'extension': 'm4a'},
    'ac3': {'codec': 'ac3', 'extension': 'ac3'},
    'webm': {'codec': 'libopus', 'extension': 'webm'},
}


def get_ffmpeg_path() -> str:
    """Get the path to FFmpeg executable."""
    # Check if FFmpeg is in PATH
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg:
        return ffmpeg

    # Check common locations
    common_paths = [
        "/usr/local/bin/ffmpeg",
        "/opt/homebrew/bin/ffmpeg",
        "C:\\ffmpeg\\bin\\ffmpeg.exe",
    ]

    for path in common_paths:
        if os.path.exists(path):
            return path

    raise FileNotFoundError("FFmpeg not found. Please install FFmpeg.")


def get_ffprobe_path() -> str:
    """Get the path to FFprobe executable."""
    ffprobe = shutil.which("ffprobe")
    if ffprobe:
        return ffprobe

    # Try same directory as ffmpeg
    ffmpeg_path = get_ffmpeg_path()
    ffprobe_path = ffmpeg_path.replace("ffmpeg", "ffprobe")
    if os.path.exists(ffprobe_path):
        return ffprobe_path

    raise FileNotFoundError("FFprobe not found. Please install FFmpeg.")


def get_media_info(file: str, **kwargs) -> Dict[str, Any]:
    """
    Get media file information using FFprobe.

    Args:
        file: Media file path

    Returns:
        Dictionary with media information
    """
    logger.info(f"Getting media info: {file}")

    ffprobe = get_ffprobe_path()
    cmd = [
        ffprobe,
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        file
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"FFprobe error: {result.stderr}")

    data = json.loads(result.stdout)
    format_info = data.get("format", {})
    streams = data.get("streams", [])

    info = {
        "duration": float(format_info.get("duration", 0)),
        "format": format_info.get("format_name", ""),
        "size": int(format_info.get("size", 0)),
        "bitrate": int(format_info.get("bit_rate", 0)) if format_info.get("bit_rate") else None,
    }

    # Extract video stream info
    for stream in streams:
        if stream.get("codec_type") == "video":
            info["width"] = stream.get("width")
            info["height"] = stream.get("height")
            info["videoCodec"] = stream.get("codec_name")
            # Calculate FPS from frame rate
            fps_str = stream.get("r_frame_rate", "0/1")
            if "/" in fps_str:
                num, den = fps_str.split("/")
                info["fps"] = round(int(num) / int(den), 2) if int(den) > 0 else 0
            break

    # Extract audio stream info
    for stream in streams:
        if stream.get("codec_type") == "audio":
            info["audioCodec"] = stream.get("codec_name")
            info["sampleRate"] = int(stream.get("sample_rate", 0))
            info["channels"] = stream.get("channels")
            break

    return info


def compress_video(
    file: str,
    outputPath: str,
    quality: int = 23,
    preset: str = "medium",
    resolution: Optional[str] = None,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Compress a video file.

    Args:
        file: Input video file path
        outputPath: Output video file path
        quality: CRF value (0-51, lower = better quality)
        preset: Encoding preset
        resolution: Target resolution (e.g., "1920x1080")
        _progress_callback: Optional progress callback

    Returns:
        Path to the compressed video file
    """
    logger.info(f"Compressing video: {file}")

    ffmpeg = get_ffmpeg_path()
    duration = get_media_info(file).get("duration", 0)

    cmd = [
        ffmpeg,
        "-i", file,
        "-c:v", "libx264",
        "-crf", str(quality),
        "-preset", preset,
        "-c:a", "aac",
        "-b:a", "128k",
        "-y"
    ]

    if resolution:
        cmd.extend(["-vf", f"scale={resolution}"])

    cmd.append(outputPath)

    _run_ffmpeg_with_progress(cmd, duration, _progress_callback)

    logger.info(f"Compressed video saved to {outputPath}")
    return outputPath


def convert_video(
    file: str,
    outputPath: str,
    format: str,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Convert video to different format.

    Args:
        file: Input video file path
        outputPath: Output video file path
        format: Target format
        _progress_callback: Optional progress callback

    Returns:
        Path to the converted video file
    """
    logger.info(f"Converting video: {file} to {format}")

    ffmpeg = get_ffmpeg_path()
    duration = get_media_info(file).get("duration", 0)

    cmd = [
        ffmpeg,
        "-i", file,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-y",
        outputPath
    ]

    _run_ffmpeg_with_progress(cmd, duration, _progress_callback)

    logger.info(f"Converted video saved to {outputPath}")
    return outputPath


def convert_audio(
    file: str,
    outputPath: str,
    format: str,
    bitrate: str = "192k",
    sampleRate: Optional[int] = None,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Convert audio to different format.

    Args:
        file: Input audio file path
        outputPath: Output audio file path
        format: Target format (mp3, aac, wav, flac, ogg, opus, etc.)
        bitrate: Target bitrate
        sampleRate: Target sample rate
        _progress_callback: Optional progress callback

    Returns:
        Path to the converted audio file
    """
    logger.info(f"Converting audio: {file} to {format}")

    ffmpeg = get_ffmpeg_path()
    duration = get_media_info(file).get("duration", 0)

    # Get codec for format
    format_config = AUDIO_FORMATS.get(format.lower(), {'codec': 'libmp3lame', 'extension': 'mp3'})
    codec = format_config['codec']

    cmd = [
        ffmpeg,
        "-i", file,
        "-c:a", codec,
    ]

    # Add bitrate for lossy formats
    if codec not in ('pcm_s16le', 'pcm_s16be', 'flac', 'alac'):
        cmd.extend(["-b:a", bitrate])

    # Add sample rate if specified
    if sampleRate:
        cmd.extend(["-ar", str(sampleRate)])

    cmd.extend(["-y", outputPath])

    _run_ffmpeg_with_progress(cmd, duration, _progress_callback)

    logger.info(f"Converted audio saved to {outputPath}")
    return outputPath


def extract_audio(
    file: str,
    outputPath: str,
    format: str = "mp3",
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Extract audio from video file.

    Args:
        file: Input video file path
        outputPath: Output audio file path
        format: Output audio format
        _progress_callback: Optional progress callback

    Returns:
        Path to the extracted audio file
    """
    logger.info(f"Extracting audio from: {file}")

    ffmpeg = get_ffmpeg_path()
    duration = get_media_info(file).get("duration", 0)

    # Get codec for format
    format_config = AUDIO_FORMATS.get(format.lower(), {'codec': 'libmp3lame', 'extension': 'mp3'})
    codec = format_config['codec']

    cmd = [
        ffmpeg,
        "-i", file,
        "-vn",  # No video
        "-c:a", codec,
        "-b:a", "192k",
        "-y",
        outputPath
    ]

    _run_ffmpeg_with_progress(cmd, duration, _progress_callback)

    logger.info(f"Extracted audio saved to {outputPath}")
    return outputPath


def trim_media(
    file: str,
    outputPath: str,
    startTime: float,
    endTime: float,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Trim video or audio to specific time range.

    Args:
        file: Input media file path
        outputPath: Output media file path
        startTime: Start time in seconds
        endTime: End time in seconds
        _progress_callback: Optional progress callback

    Returns:
        Path to the trimmed media file
    """
    logger.info(f"Trimming media: {file} from {startTime}s to {endTime}s")

    ffmpeg = get_ffmpeg_path()
    duration = endTime - startTime

    cmd = [
        ffmpeg,
        "-i", file,
        "-ss", str(startTime),
        "-t", str(duration),
        "-c", "copy",  # Stream copy for speed
        "-y",
        outputPath
    ]

    _run_ffmpeg_with_progress(cmd, duration, _progress_callback)

    logger.info(f"Trimmed media saved to {outputPath}")
    return outputPath


def _run_ffmpeg_with_progress(
    cmd: list,
    duration: float,
    progress_callback: Optional[Callable]
) -> None:
    """Run FFmpeg command with progress monitoring."""
    process = subprocess.Popen(
        cmd,
        stderr=subprocess.PIPE,
        universal_newlines=True
    )

    time_pattern = re.compile(r"time=(\d{2}):(\d{2}):(\d{2})")

    for line in process.stderr:
        if progress_callback and duration > 0:
            match = time_pattern.search(line)
            if match:
                h, m, s = map(int, match.groups())
                current_time = h * 3600 + m * 60 + s
                progress = min(current_time / duration * 100, 100)
                progress_callback(progress)

    process.wait()

    if process.returncode != 0:
        raise RuntimeError(f"FFmpeg error (code {process.returncode})")
