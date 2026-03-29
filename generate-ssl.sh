#!/bin/bash

# Self-Signed SSL Certificate Generator for Healthcare System
# This script generates a self-signed certificate for HTTPS setup

echo "=========================================="
echo "Healthcare System - SSL Certificate Setup"
echo "=========================================="
echo ""

# Create ssl directory
mkdir -p ssl/certs

# Check if certificate already exists
if [ -f ssl/certs/healthcare.crt ] && [ -f ssl/certs/healthcare.key ]; then
    echo "✓ SSL certificates already exist"
    echo "  - Certificate: ssl/certs/healthcare.crt"
    echo "  - Key: ssl/certs/healthcare.key"
    echo ""
    read -p "Do you want to regenerate? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
    echo "Removing old certificates..."
    rm -f ssl/certs/healthcare.crt ssl/certs/healthcare.key
    echo ""
fi

# Generate self-signed certificate (valid for 365 days)
echo "Generating self-signed certificate..."
echo ""

openssl req -x509 -newkey rsa:4096 \
    -keyout ssl/certs/healthcare.key \
    -out ssl/certs/healthcare.crt \
    -days 365 \
    -nodes \
    -subj "/C=US/ST=State/L=City/O=Healthcare/OU=IT/CN=healthcare.local"

# Set proper permissions
chmod 600 ssl/certs/healthcare.key
chmod 644 ssl/certs/healthcare.crt

echo "✓ Certificate generated successfully!"
echo ""
echo "Certificate details:"
echo "  - Location: ssl/certs/"
echo "  - Certificate: healthcare.crt"
echo "  - Private Key: healthcare.key"
echo "  - Validity: 365 days"
echo "  - Subject CN: healthcare.local"
echo ""
echo "=========================================="
echo ""
echo "Browser warning:"
echo "  When you access https://103.135.253.215, your browser will show"
echo "  a security warning because the certificate is self-signed."
echo "  This is NORMAL for development/testing."
echo ""
echo "  Click 'Advanced' → 'Proceed' to continue."
echo ""
echo "=========================================="
