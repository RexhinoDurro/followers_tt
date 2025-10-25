#!/bin/bash

# Deploy script for Montrose Agency
# Builds the client and deploys to production

set -e  # Exit on any error

echo "🚀 Starting deployment process for Montrose Agency..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
print_status()   { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success()  { echo -e "${GREEN}✅ $1${NC}"; }
print_warning()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error()    { echo -e "${RED}❌ $1${NC}"; }

# Check if client directory exists
if [ ! -d "client" ]; then
    print_error "Client directory not found. Run this from the project root."
    exit 1
fi

# Step 1: Build client
print_status "Building the client application..."
cd client

print_status "Installing dependencies..."
npm ci

print_status "Running build..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Build failed — dist directory not found."
    exit 1
fi

print_success "Client build completed successfully"

# Step 2: Deploy to production directory
print_status "Deploying to production directory..."
cd ..

DEPLOY_DIR="/var/www/montrose.agency"

# Remove old files
print_status "Removing old files from ${DEPLOY_DIR}/"
sudo rm -rf ${DEPLOY_DIR:?}/*

# Copy new build
print_status "Copying new files to ${DEPLOY_DIR}/"
sudo cp -r client/dist/* ${DEPLOY_DIR}/

# Set proper permissions
print_status "Setting correct permissions..."
sudo chown -R www-data:www-data ${DEPLOY_DIR}/
sudo chmod -R 755 ${DEPLOY_DIR}/

print_success "Files deployed successfully"

# Step 3: Reload nginx
print_status "Reloading Nginx..."
if sudo systemctl reload nginx; then
    print_success "Nginx reloaded successfully"
else
    print_error "Failed to reload Nginx"
    sudo systemctl status nginx
    exit 1
fi

# Step 4: Restart Gunicorn (if it exists)
print_status "Restarting Gunicorn..."
if sudo systemctl is-active --quiet gunicorn; then
    if sudo systemctl restart gunicorn; then
        print_success "Gunicorn restarted successfully"
    else
        print_error "Failed to restart Gunicorn"
        sudo systemctl status gunicorn
        exit 1
    fi
else
    print_warning "Gunicorn service not active — skipping restart"
fi

# Step 5: Verify services
print_status "Verifying deployment..."

if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
    exit 1
fi

if sudo systemctl is-enabled --quiet gunicorn 2>/dev/null; then
    if sudo systemctl is-active --quiet gunicorn; then
        print_success "Gunicorn is running"
    else
        print_warning "Gunicorn is enabled but not running"
    fi
fi

# Summary
echo ""
echo "🎉 Deployment completed successfully!"
echo "📊 Summary:"
echo "   • Client built and deployed to ${DEPLOY_DIR}/"
echo "   • Nginx reloaded"
echo "   • Gunicorn restarted (if active)"
echo "   • File permissions set correctly"
echo ""
echo "🌐 Site live at: https://montrose.agency"
echo "🕓 Deploy time: $(date)"
echo ""
