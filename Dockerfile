FROM python:3.11-slim

WORKDIR /app

# Install Node.js for building frontend
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    apt-get clean

# Install backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Build frontend
COPY frontend ./frontend
WORKDIR /app/frontend
RUN yarn install && yarn build

# Copy backend
WORKDIR /app
COPY backend ./backend

# Copy built frontend into backend static folder
RUN cp -r /app/frontend/build /app/backend/static

WORKDIR /app/backend

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
