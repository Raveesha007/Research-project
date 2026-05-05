FROM python:3.10-slim

# Install ffmpeg (needed by librosa/pydub for WebM/Opus audio)
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=10000
CMD python server.py
