#!/bin/bash

# Darch Frontend Docker Run Script
# This script provides easy commands to build and run the Darch Frontend container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="darch-frontend"
CONTAINER_NAME="darch-frontend-app"
PORT="3000"
DEFAULT_BACKEND_URL="http://localhost:5000"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Darch Frontend Docker Management Script"
    echo
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo
    echo "Commands:"
    echo "  build                   Build the Docker image"
    echo "  run [BACKEND_URL]       Run the container (default backend: $DEFAULT_BACKEND_URL)"
    echo "  dev                     Run in development mode with default backend"
    echo "  prod [BACKEND_URL]      Run in production mode"
    echo "  stop                    Stop the running container"
    echo "  restart [BACKEND_URL]   Restart the container"
    echo "  logs                    Show container logs"
    echo "  clean                   Remove container and image"
    echo "  help                    Show this help message"
    echo
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 run"
    echo "  $0 run http://192.168.1.100:5000"
    echo "  $0 prod https://api.example.com"
    echo "  $0 logs"
}

# Function to build Docker image
build_image() {
    print_info "Building Docker image: $IMAGE_NAME"
    docker build -t $IMAGE_NAME .
    print_success "Docker image built successfully"
}

# Function to run container
run_container() {
    local backend_url=${1:-$DEFAULT_BACKEND_URL}
    
    # Stop existing container if running
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_warning "Stopping existing container..."
        docker stop $CONTAINER_NAME >/dev/null 2>&1 || true
        docker rm $CONTAINER_NAME >/dev/null 2>&1 || true
    fi
    
    print_info "Starting container with backend URL: $backend_url"
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:3000 \
        -e NEXT_PUBLIC_BACKEND_URL="$backend_url" \
        $IMAGE_NAME
    
    print_success "Container started successfully"
    print_info "Frontend available at: http://localhost:$PORT"
    print_info "Backend URL configured: $backend_url"
}

# Function to stop container
stop_container() {
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_info "Stopping container: $CONTAINER_NAME"
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        print_success "Container stopped and removed"
    else
        print_warning "Container $CONTAINER_NAME is not running"
    fi
}

# Function to show logs
show_logs() {
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_info "Showing logs for container: $CONTAINER_NAME"
        docker logs -f $CONTAINER_NAME
    else
        print_error "Container $CONTAINER_NAME is not running"
        exit 1
    fi
}

# Function to clean up
clean_up() {
    print_info "Cleaning up Docker resources..."
    
    # Stop and remove container
    if docker ps -a -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME >/dev/null 2>&1 || true
        docker rm $CONTAINER_NAME >/dev/null 2>&1 || true
        print_info "Container removed"
    fi
    
    # Remove image
    if docker images -q $IMAGE_NAME | grep -q .; then
        docker rmi $IMAGE_NAME >/dev/null 2>&1 || true
        print_info "Image removed"
    fi
    
    print_success "Cleanup completed"
}

# Main script logic
case "${1:-help}" in
    build)
        build_image
        ;;
    run)
        run_container "$2"
        ;;
    dev)
        run_container "$DEFAULT_BACKEND_URL"
        ;;
    prod)
        if [ -z "$2" ]; then
            print_error "Production mode requires a backend URL"
            print_info "Usage: $0 prod https://api.example.com"
            exit 1
        fi
        run_container "$2"
        ;;
    stop)
        stop_container
        ;;
    restart)
        stop_container
        run_container "$2"
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_up
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo
        show_usage
        exit 1
        ;;
esac
