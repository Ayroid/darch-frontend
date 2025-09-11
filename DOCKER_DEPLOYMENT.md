# Docker Deployment Guide

This guide covers how to build and run the Darch Frontend application using Docker with configurable backend URL.

## Environment Variables

The application uses the following environment variable for backend configuration:

- `NEXT_PUBLIC_BACKEND_URL`: URL of the backend server (default: `http://localhost:5000`)

## Building the Docker Image

### Build the image
```bash
docker build -t darch-frontend .
```

### Build with specific tag
```bash
docker build -t darch-frontend:latest .
```

## Running the Container

### Basic run (uses default backend URL)
```bash
docker run -p 3000:3000 darch-frontend
```

### Run with custom backend URL
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_BACKEND_URL="http://your-backend-server:5000" darch-frontend
```

### Run with environment file
Create a `.env` file:
```env
NEXT_PUBLIC_BACKEND_URL=http://your-backend-server:5000
```

Then run:
```bash
docker run -p 3000:3000 --env-file .env darch-frontend
```

### Run in detached mode
```bash
docker run -d -p 3000:3000 -e NEXT_PUBLIC_BACKEND_URL="http://your-backend-server:5000" --name darch-frontend-app darch-frontend
```

## Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:5000
    depends_on:
      - backend
    networks:
      - darch-network

  backend:
    # Add your backend service configuration here
    image: your-backend-image
    ports:
      - "5000:5000"
    networks:
      - darch-network

networks:
  darch-network:
    driver: bridge
```

Run with Docker Compose:
```bash
docker-compose up -d
```

## Environment Variable Examples

### Development
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_BACKEND_URL="http://localhost:5000" darch-frontend
```

### Production
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_BACKEND_URL="https://api.yourdomain.com" darch-frontend
```

### Local Network
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_BACKEND_URL="http://192.168.1.100:5000" darch-frontend
```

## Container Management

### Stop the container
```bash
docker stop darch-frontend-app
```

### Remove the container
```bash
docker rm darch-frontend-app
```

### View logs
```bash
docker logs darch-frontend-app
```

### View live logs
```bash
docker logs -f darch-frontend-app
```

## Troubleshooting

### Container won't start
- Check if port 3000 is already in use
- Verify the backend URL is accessible from the container
- Check container logs for errors

### Backend connection issues
- Ensure the backend URL is correct and accessible
- Check network connectivity between containers
- Verify CORS settings on the backend

### Environment variable not working
- Ensure the variable name is exactly `NEXT_PUBLIC_BACKEND_URL`
- Check that the variable is set during container runtime
- Verify the variable is accessible in the browser's developer tools

## Multi-stage Build Details

The Dockerfile uses a multi-stage build process:

1. **Dependencies stage**: Installs npm dependencies
2. **Builder stage**: Builds the Next.js application
3. **Runner stage**: Creates the final production image

This approach results in a smaller, more secure production image.

## Security Considerations

- The container runs as a non-root user (`nextjs`)
- Only necessary files are included in the final image
- Environment variables should be managed securely in production
- Use HTTPS URLs for production backend endpoints

## Performance Tips

- Use Docker layer caching for faster builds
- Consider using a reverse proxy (nginx) for production
- Monitor container resource usage
- Use health checks for container orchestration
