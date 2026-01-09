"""
PDF Security functionality using PyMuPDF
"""

import fitz  # PyMuPDF
from typing import Callable, Optional
from loguru import logger


def encrypt_pdf(
    file: str,
    outputPath: str,
    password: str,
    ownerPassword: Optional[str] = None,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Encrypt a PDF file with password protection.

    Args:
        file: Input PDF file path
        outputPath: Output PDF file path
        password: User password (for opening)
        ownerPassword: Owner password (for permissions), defaults to user password
        _progress_callback: Optional progress callback

    Returns:
        Path to the encrypted PDF file
    """
    logger.info(f"Encrypting PDF: {file}")

    doc = fitz.open(file)

    try:
        if _progress_callback:
            _progress_callback(50, "Encrypting...")

        # Default owner password to user password if not provided
        owner_pwd = ownerPassword if ownerPassword else password

        # Set encryption
        # Permissions: printing, copying, etc. are controlled by owner password
        doc.save(
            outputPath,
            encryption=fitz.PDF_ENCRYPT_AES_256,
            user_pw=password,
            owner_pw=owner_pwd,
            permissions=(
                fitz.PDF_PERM_PRINT |
                fitz.PDF_PERM_COPY |
                fitz.PDF_PERM_ANNOTATE
            )
        )

        if _progress_callback:
            _progress_callback(100, "Done")

        logger.info(f"Encrypted PDF saved to {outputPath}")
        return outputPath

    finally:
        doc.close()


def decrypt_pdf(
    file: str,
    outputPath: str,
    password: str,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> str:
    """
    Decrypt a password-protected PDF file.

    Args:
        file: Input PDF file path (encrypted)
        outputPath: Output PDF file path (decrypted)
        password: Password to unlock the PDF
        _progress_callback: Optional progress callback

    Returns:
        Path to the decrypted PDF file
    """
    logger.info(f"Decrypting PDF: {file}")

    doc = fitz.open(file)

    try:
        if _progress_callback:
            _progress_callback(25, "Opening encrypted PDF...")

        # Try to authenticate with password
        if doc.is_encrypted:
            if not doc.authenticate(password):
                raise ValueError("Incorrect password")

        if _progress_callback:
            _progress_callback(50, "Decrypting...")

        # Save without encryption
        doc.save(outputPath, encryption=fitz.PDF_ENCRYPT_NONE)

        if _progress_callback:
            _progress_callback(100, "Done")

        logger.info(f"Decrypted PDF saved to {outputPath}")
        return outputPath

    finally:
        doc.close()


def get_pdf_info(file: str, password: Optional[str] = None, **kwargs) -> dict:
    """
    Get PDF information.

    Args:
        file: PDF file path
        password: Password if encrypted

    Returns:
        Dictionary with PDF metadata
    """
    doc = fitz.open(file)

    try:
        if doc.is_encrypted and password:
            doc.authenticate(password)

        metadata = doc.metadata
        return {
            "pageCount": len(doc),
            "title": metadata.get("title", ""),
            "author": metadata.get("author", ""),
            "subject": metadata.get("subject", ""),
            "creator": metadata.get("creator", ""),
            "producer": metadata.get("producer", ""),
            "creationDate": metadata.get("creationDate", ""),
            "modificationDate": metadata.get("modDate", ""),
            "encrypted": doc.is_encrypted
        }

    finally:
        doc.close()
