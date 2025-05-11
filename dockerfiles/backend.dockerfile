FROM python:3.13-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    build-base gcc libffi-dev musl-dev


# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

CMD ["fastapi", "run", "main.py"]
