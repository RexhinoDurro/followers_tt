#!/bin/bash

# Deploy script for VisionBoost Agency
# This script builds the client and deploys to production

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "client" ]; then
    print_error "Client directory not found. Make sure you're running this from the project root."
    exit 1
fi

# Step 1: Build the client
print_status "Building the client application..."
cd client

# Clean install dependencies to ensure consistency
print_status "Installing dependencies..."
npm ci

# Run the build
print_status "Running build process..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_success "Client build completed successfully"

# Step 2: Deploy to production directory
print_status "Deploying to production directory..."
cd ..

# Remove old files
print_status "Removing old files from /var/www/visionboost.agency/"
sudo rm -rf /var/www/visionboost.agency/*

# Copy new files
print_status "Copying new files to /var/www/visionboost.agency/"
sudo cp -r client/dist/* /var/www/visionboost.agency/

# Set proper permissions
print_status "Setting proper file permissions..."
sudo chown -R www-data:www-data /var/www/visionboost.agency/
sudo chmod -R 755 /var/www/visionboost.agency/

print_success "Files deployed successfully"

# Step 3: Reload nginx
print_status "Reloading nginx..."
if sudo systemctl reload nginx; then
    print_success "Nginx reloaded successfully"
else
    print_error "Failed to reload nginx"
    sudo systemctl status nginx
    exit 1
fi

# Step 4: Restart gunicorn (if it exists)
print_status "Restarting gunicorn..."
if sudo systemctl is-active --quiet gunicorn; then
    if sudo systemctl restart gunicorn; then
        print_success "Gunicorn restarted successfully"
    else
        print_error "Failed to restart gunicorn"
        sudo systemctl status gunicorn
        exit 1
    fi
else
    print_warning "Gunicorn service not found or not active, skipping restart"
fi

# Step 5: Verify deployment
print_status "Verifying deployment..."

# Check if nginx is running
if sudo systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
    exit 1
fi

# Check if gunicorn is running (if it should be)
if sudo systemctl is-enabled --quiet gunicorn 2>/dev/null; then
    if sudo systemctl is-active --quiet gunicorn; then
        print_success "Gunicorn is running"
    else
        print_warning "Gunicorn is enabled but not running"
    fi
fi

# Display deployment summary
echo ""
echo "🎉 Deployment completed successfully!"
echo "📊 Deployment Summary:"
echo "   • Client built and deployed to /var/www/visionboost.agency/"
echo "   • Nginx reloaded"
echo "   • Gunicorn restarted (if applicable)"
echo "   • File permissions set correctly"
echo ""
echo "🌐 Your application should now be live at: https://visionboost.agency"
echo ""
echo "📝 Deploy time: $(date)"
echo ""