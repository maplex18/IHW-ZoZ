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


def crack_pdf(
    file: str,
    outputPath: str,
    method: str = "dictionary",
    maxLength: int = 4,
    charset: str = "digits",
    customPasswords: Optional[list] = None,
    _progress_callback: Optional[Callable] = None,
    **kwargs
) -> dict:
    """
    Attempt to crack PDF password protection.

    This function first tries to remove owner-password restrictions directly
    (100% success for PDFs with only owner password). If that fails, it falls
    back to brute-force cracking for user-password protected PDFs.

    Args:
        file: Input PDF file path (encrypted)
        outputPath: Output PDF file path (decrypted)
        method: Crack method - "dictionary", "bruteforce", or "custom"
        maxLength: Maximum password length for bruteforce (1-6)
        charset: Character set for bruteforce - "digits", "lowercase", "uppercase", "alphanumeric"
        customPasswords: List of custom passwords to try
        _progress_callback: Optional progress callback

    Returns:
        Dictionary with success status, found password, and output path
    """
    import itertools
    import string

    logger.info(f"Attempting to crack PDF: {file}")
    logger.info(f"Method: {method}, MaxLength: {maxLength}, Charset: {charset}")

    doc = fitz.open(file)

    try:
        # Check if PDF is actually encrypted
        if not doc.is_encrypted:
            # Not encrypted, just copy the file
            if _progress_callback:
                _progress_callback(100, "PDF is not encrypted")
            doc.save(outputPath, encryption=fitz.PDF_ENCRYPT_NONE)
            return {
                "success": True,
                "password": None,
                "message": "PDF was not encrypted",
                "outputPath": outputPath
            }

        # === STEP 1: Try to remove owner password restrictions directly ===
        # This works 100% for PDFs that only have owner password (restrictions)
        # but no user password (open password)
        if _progress_callback:
            _progress_callback(5, "Trying to remove restrictions directly...")

        # Try opening with empty password - this works for owner-password-only PDFs
        if doc.authenticate(""):
            logger.info("PDF only has owner password restrictions - removing directly")
            if _progress_callback:
                _progress_callback(90, "Removing restrictions...")
            doc.save(outputPath, encryption=fitz.PDF_ENCRYPT_NONE)
            if _progress_callback:
                _progress_callback(100, "Done")
            return {
                "success": True,
                "password": "[no user password - owner restrictions removed]",
                "message": "PDF only had owner password restrictions, removed successfully",
                "outputPath": outputPath
            }

        # === STEP 2: Fall back to brute-force for user-password protected PDFs ===
        logger.info("PDF has user password, starting brute-force attack...")

        # Build password list based on method
        passwords = []

        if method == "custom" and customPasswords:
            passwords = customPasswords
        elif method == "dictionary":
            # Common passwords list
            passwords = [
                "", "1234", "12345", "123456", "1234567", "12345678", "123456789",
                "password", "Password", "PASSWORD",
                "0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999",
                "admin", "Admin", "ADMIN",
                "root", "Root", "ROOT",
                "user", "User", "USER",
                "test", "Test", "TEST",
                "pass", "Pass", "PASS",
                "abc123", "ABC123", "Abc123",
                "qwerty", "QWERTY", "Qwerty",
                "111111", "000000", "666666", "888888",
                "123123", "321321", "654321",
                "welcome", "Welcome", "WELCOME",
                "master", "Master", "MASTER",
                "login", "Login", "LOGIN",
                "letmein", "Letmein", "LETMEIN",
                "monkey", "dragon", "shadow", "sunshine",
                "princess", "football", "baseball", "soccer",
                "iloveyou", "trustno1", "whatever",
                "secret", "Secret", "SECRET",
                # Common PIN patterns
                "0123", "9876", "1212", "2020", "2021", "2022", "2023", "2024", "2025",
                # Date patterns
                "0101", "0102", "0103", "0201", "0202", "0203",
                "1001", "1002", "1003", "1101", "1102", "1103", "1201", "1202", "1203",
            ]
        elif method == "bruteforce":
            # Build character set
            chars = ""
            if charset == "digits":
                chars = string.digits
            elif charset == "lowercase":
                chars = string.ascii_lowercase
            elif charset == "uppercase":
                chars = string.ascii_uppercase
            elif charset == "alphanumeric":
                chars = string.ascii_letters + string.digits
            else:
                chars = string.digits  # Default to digits

            # Generate all combinations up to maxLength
            max_len = min(maxLength, 6)  # Limit to 6 to prevent too long operations
            for length in range(1, max_len + 1):
                for combo in itertools.product(chars, repeat=length):
                    passwords.append("".join(combo))

        total = len(passwords)
        if total == 0:
            return {
                "success": False,
                "password": None,
                "message": "No passwords to try",
                "outputPath": None
            }

        logger.info(f"Total passwords to try: {total}")

        # Try each password
        for i, pwd in enumerate(passwords):
            # Update progress every 100 attempts or at meaningful intervals
            if _progress_callback and (i % max(1, total // 100) == 0 or i == total - 1):
                progress = int((i / total) * 95)  # Leave 5% for saving
                _progress_callback(progress, f"Trying password {i + 1}/{total}...")

            # Need to reopen doc for each attempt as authenticate modifies state
            doc.close()
            doc = fitz.open(file)

            if doc.authenticate(pwd):
                logger.info(f"Password found: {'[empty]' if pwd == '' else pwd}")

                if _progress_callback:
                    _progress_callback(98, "Password found! Saving decrypted PDF...")

                # Save decrypted PDF
                doc.save(outputPath, encryption=fitz.PDF_ENCRYPT_NONE)

                if _progress_callback:
                    _progress_callback(100, "Done")

                return {
                    "success": True,
                    "password": pwd if pwd else "[empty]",
                    "message": f"Password cracked successfully",
                    "outputPath": outputPath
                }

        # No password found
        if _progress_callback:
            _progress_callback(100, "Password not found")

        return {
            "success": False,
            "password": None,
            "message": f"Failed to crack password after trying {total} combinations",
            "outputPath": None
        }

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
