#!/bin/bash

# Darch Docker Development Script
# Usage: ./dev.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Commands
case "$1" in
    "dev")
        print_status "Starting development environment..."
        docker-compose --profile dev up --build
        ;;
    "prod")
        print_status "Starting production environment..."
        docker-compose up --build -d
        print_success "Production environment started!"
        print_status "Frontend: http://localhost:3000"
        ;;
    "full")
        print_status "Starting full-stack environment..."
        docker-compose -f docker-compose.full.yml --profile full-stack up --build
        ;;
    "build")
        print_status "Building Docker images..."
        docker-compose build
        print_success "Build completed!"
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose down
        docker-compose -f docker-compose.full.yml down
        print_success "All services stopped!"
        ;;
    "clean")
        print_status "Cleaning up Docker resources..."
        docker-compose down --volumes --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
        ;;
    "logs")
        if [ -n "$2" ]; then
            print_status "Showing logs for $2..."
            docker-compose logs -f "$2"
        else
            print_status "Showing all logs..."
            docker-compose logs -f
        fi
        ;;
    "shell")
        if [ -n "$2" ]; then
            print_status "Opening shell in $2..."
            docker-compose exec "$2" /bin/sh
        else
            print_status "Opening shell in frontend..."
            docker-compose exec frontend /bin/sh
        fi
        ;;
    "health")
        print_status "Checking service health..."
        docker-compose ps
        ;;
    "update")
        print_status "Updating dependencies..."
        docker-compose build --no-cache
        print_success "Update completed!"
        ;;
    *)
        echo "Darch Docker Development Script"
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  dev      - Start development environment with hot reload"
        echo "  prod     - Start production environment"
        echo "  full     - Start full-stack environment (frontend + backend)"
        echo "  build    - Build Docker images"
        echo "  stop     - Stop all services"
        echo "  clean    - Clean up Docker resources"
        echo "  logs     - Show logs (optionally for specific service)"
        echo "  shell    - Open shell in container (default: frontend)"
        echo "  health   - Check service health status"
        echo "  update   - Update and rebuild all images"
        echo ""
        echo "Examples:"
        echo "  $0 dev                 # Start development mode"
        echo "  $0 logs frontend       # Show frontend logs"
        echo "  $0 shell backend       # Open shell in backend container"
        ;;
esac
