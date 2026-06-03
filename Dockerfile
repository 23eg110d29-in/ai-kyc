FROM python:3.11-slim

# Install system dependencies for Tesseract OCR and PDF processing
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first (better layer caching)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application
COPY backend/ ./backend/

# Create uploads directory
RUN mkdir -p uploads chroma_db

# Setup environment variables for Tesseract (Linux path)
ENV TESSERACT_CMD="/usr/bin/tesseract"
ENV PYTHONPATH="/app"

# Expose port (Render sets the PORT environment variable)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/')" || exit 1

# Command to run the application
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
