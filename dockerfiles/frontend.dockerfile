# ---------- Stage 1: Build ----------
FROM node:23-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the Vite app
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM node:23-alpine AS production

WORKDIR /app

# Install only the "serve" package to keep the image small
RUN npm install -g serve

# Copy built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Set the command to serve the app
CMD ["serve", "-s", "dist", "-l", "3000"]

EXPOSE 3000
        