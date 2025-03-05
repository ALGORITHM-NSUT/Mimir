# Use a lightweight Python image
FROM python:3.12-slim as base

# Set the working directory inside the container
WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment for efficient dependency management
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy only requirements.txt first to leverage Docker layer caching
COPY requirements.txt .

# Install dependencies efficiently
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose FastAPI's default port
EXPOSE 8000

# Use a non-root user for security
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    UVICORN_WORKERS=1  

# Command to run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
