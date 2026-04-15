FROM python:3.14-slim
WORKDIR /app

# Install required system dependencies for PostgreSQL (libpq-dev) and building packages (gcc)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache for pip install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY . .