# ---- Builder Stage ----
# Use a specific Node.js version for reproducibility.
FROM node:18-alpine as builder

# Define a build-time argument for the API URL.
# This will be passed in from docker-compose.yml.
ARG VITE_API_BASE_URL

# Set the environment variable for the build process.
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker layer caching.
COPY package*.json ./

# Install dependencies using 'ci' for reproducible builds.
RUN npm ci

# Copy the rest of the application source code.
COPY . .

# Build the application for production. This creates the /dist folder.
RUN npm run build

# ---- Final Stage ----
# Use a lean Nginx image to serve the static files.
FROM nginx:1.25-alpine

# Copy the built assets from the builder stage to Nginx's web root.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration to handle routing.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx server.
EXPOSE 80

# The default Nginx command runs the server.
CMD ["nginx", "-g", "daemon off;"] 