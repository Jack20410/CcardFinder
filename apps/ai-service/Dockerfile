FROM python:3.11-slim
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (venv is excluded via .dockerignore)
COPY app ./app

# Run the FastAPI app (main.py is in app/ directory)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]