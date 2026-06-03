import pytesseract
from PIL import Image
import pdf2image
import os
from backend.core.config import settings

pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

def extract_text(file_path: str, content_type: str) -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File {file_path} not found.")
        
    text = ""
    try:
        if content_type == "application/pdf":
            pages = pdf2image.convert_from_path(file_path)
            for page in pages:
                text += pytesseract.image_to_string(page) + "\n"
        elif content_type.startswith("image/"):
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
        else:
            raise ValueError(f"Unsupported content type for OCR: {content_type}")
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""
    
    return text.strip()
