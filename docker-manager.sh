#!/bin/bash

# Docker deployment helper script for local testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_menu() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}Healthcare Docker Manager${NC}"
    echo -e "${BLUE}================================${NC}"
    echo "1) Start all containers"
    echo "2) Stop all containers"
    echo "3) Restart containers"
    echo "4) View logs"
    echo "5) Build images"
    echo "6) Rebuild and restart all"
    echo "7) Database migration"
    echo "8) View container status"
    echo "9) Clean up (remove containers and images)"
    echo "0) Exit"
    echo -e "${BLUE}================================${NC}"
}

start_containers() {
    echo -e "${YELLOW}Starting containers...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✓ Containers started${NC}"
    docker-compose ps
}

stop_containers() {
    echo -e "${YELLOW}Stopping containers...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Containers stopped${NC}"
}

restart_containers() {
    echo -e "${YELLOW}Restarting containers...${NC}"
    docker-compose restart
    echo -e "${GREEN}✓ Containers restarted${NC}"
    docker-compose ps
}

view_logs() {
    echo -e "${YELLOW}Select service to view logs (Ctrl+C to exit):${NC}"
    echo "1) All services"
    echo "2) Backend"
    echo "3) Frontend"
    echo "4) MySQL"
    read -p "Enter choice: " log_choice
    
    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f backend ;;
        3) docker-compose logs -f frontend ;;
        4) docker-compose logs -f mysql ;;
        *) echo -e "${RED}Invalid choice${NC}" ;;
    esac
}

build_images() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✓ Images built successfully${NC}"
}

rebuild_and_restart() {
    echo -e "${YELLOW}Rebuilding and restarting all containers...${NC}"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo -e "${GREEN}✓ All containers rebuilt and restarted${NC}"
    sleep 10
    docker-compose ps
}

run_migration() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    docker-compose exec -T backend npm run prisma:migrate -- --skip-generate
    echo -e "${GREEN}✓ Migrations completed${NC}"
}

view_status() {
    echo -e "${BLUE}Container Status:${NC}"
    docker-compose ps
    echo -e "\n${BLUE}Docker Disk Usage:${NC}"
    docker system df
}

cleanup() {
    read -p -e "${RED}This will remove all containers and images. Continue? (y/n)${NC} " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Cleaning up...${NC}"
        docker-compose down -v
        docker image rm healthcare-frontend healthcare-backend || true
        echo -e "${GREEN}✓ Cleanup completed${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled${NC}"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice: " choice
    
    case $choice in
        1) start_containers ;;
        2) stop_containers ;;
        3) restart_containers ;;
        4) view_logs ;;
        5) build_images ;;
        6) rebuild_and_restart ;;
        7) run_migration ;;
        8) view_status ;;
        9) cleanup ;;
        0) echo -e "${GREEN}Exiting...${NC}"; exit 0 ;;
        *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
    esac
done
