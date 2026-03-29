#!/bin/bash
# Self-Signed SSL Certificate Generator for Healthcare System (Windows/PowerShell version)

$sslDir = "ssl/certs"
$certPath = "$sslDir/healthcare.crt"
$keyPath = "$sslDir/healthcare.key"

Write-Host "=========================================="
Write-Host "Healthcare System - SSL Certificate Setup" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host ""

# Create ssl directory if it doesn't exist
if (-not (Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir -Force | Out-Null
    Write-Host "Created directory: $sslDir"
}

# Check if certificate already exists
if ((Test-Path $certPath) -and (Test-Path $keyPath)) {
    Write-Host "✓ SSL certificates already exist" -ForegroundColor Green
    Write-Host "  - Certificate: $certPath"
    Write-Host "  - Key: $keyPath"
    Write-Host ""
    
    $response = Read-Host "Do you want to regenerate? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 0
    }
    
    Write-Host "Removing old certificates..."
    Remove-Item $certPath -Force
    Remove-Item $keyPath -Force
    Write-Host ""
}

Write-Host "Generating self-signed certificate..." -ForegroundColor Yellow
Write-Host ""

# Generate self-signed certificate (valid for 365 days)
$cert = New-SelfSignedCertificate `
    -CertStoreLocation "cert:\CurrentUser\My" `
    -DnsName "healthcare.local", "localhost", "103.135.253.215" `
    -FriendlyName "Healthcare Self-Signed" `
    -NotAfter (Get-Date).AddDays(365) `
    -KeyUsage KeyEncipherment, DataEncipherment, DigitalSignature `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1") `
    -ErrorAction SilentlyContinue

# Export certificate and key
Write-Host "Exporting certificate files..."

# Export certificate
$null = Export-Certificate -Cert $cert -FilePath $certPath -Force
Write-Host "✓ Certificate exported to: $certPath" -ForegroundColor Green

# Export private key
$password = ConvertTo-SecureString -String "temp" -AsPlainText -Force
$pfxPath = "$sslDir/temp.pfx"
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password -Force | Out-Null

# Extract private key using OpenSSL (requires OpenSSL to be installed)
# If OpenSSL is installed
if (Get-Command openssl -ErrorAction SilentlyContinue) {
    openssl pkcs12 -in $pfxPath -nocerts -nodes -password pass:temp | `
        openssl rsa -out $keyPath -passout pass:temp
    Write-Host "✓ Private key exported to: $keyPath" -ForegroundColor Green
    Remove-Item $pfxPath
} else {
    Write-Host "⚠ OpenSSL not found. Please copy the PFX file and extract manually:" -ForegroundColor Yellow
    Write-Host "  File: $pfxPath"
    Write-Host "  Password: temp"
}

Write-Host ""
Write-Host "=========================================="
Write-Host "✓ Certificate generated successfully!" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""
Write-Host "Certificate details:"
Write-Host "  - Location: $sslDir/"
Write-Host "  - Certificate: healthcare.crt"
Write-Host "  - Private Key: healthcare.key"
Write-Host "  - Validity: 365 days"
Write-Host "  - Subject CN: healthcare.local"
Write-Host ""
Write-Host "Browser warning:"
Write-Host "  When you access https://103.135.253.215, your browser will show"
Write-Host "  a security warning because the certificate is self-signed."
Write-Host "  This is NORMAL for development/testing."
Write-Host ""
Write-Host "=========================================="
