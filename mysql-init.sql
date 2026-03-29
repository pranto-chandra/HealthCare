-- MySQL initialization script

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS healthcare_db;
USE healthcare_db;

-- Set default charset and collation
ALTER DATABASE healthcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create basic indexes for frequently queried fields
-- These will be created when Prisma runs migrations, but this ensures basic setup
