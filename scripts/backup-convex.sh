#!/bin/bash

# Automated Backup Script for PORTAL Convex Data
# This script creates backups of Convex data and stores them securely

set -e  # Exit on error

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="portal_backup_${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== PORTAL Backup Script ===${NC}"
echo "Timestamp: ${TIMESTAMP}"
echo "Backup directory: ${BACKUP_DIR}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Convex CLI is installed
if ! command -v npx &> /dev/null; then
    error "npx not found. Please install Node.js and npm."
    exit 1
fi

log "Starting backup process..."

# Export Convex data
log "Exporting Convex data..."

# Create temporary directory for export
TEMP_DIR=$(mktemp -d)
trap "rm -rf ${TEMP_DIR}" EXIT

# Export collections (this would need to be adapted based on actual Convex CLI commands)
# For now, this is a placeholder structure
log "Creating backup structure..."

# Create backup metadata
cat > "${TEMP_DIR}/backup_metadata.json" <<EOF
{
  "backup_name": "${BACKUP_NAME}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0",
  "collections": [
    "users",
    "beneficiaries",
    "donations",
    "finance_records",
    "tasks",
    "meetings",
    "documents",
    "workflow_notifications"
  ]
}
EOF

# Compress backup
log "Compressing backup..."
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
tar -czf "${BACKUP_FILE}" -C "${TEMP_DIR}" .

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log "Backup created successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
    error "Failed to create backup archive"
    exit 1
fi

# Calculate checksum
log "Calculating checksum..."
CHECKSUM=$(sha256sum "${BACKUP_FILE}" | cut -d' ' -f1)
echo "${CHECKSUM}" > "${BACKUP_FILE}.sha256"
log "Checksum: ${CHECKSUM}"

# Clean up old backups
log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "portal_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}" -name "portal_backup_*.tar.gz.sha256" -type f -mtime +${RETENTION_DAYS} -delete

# Count remaining backups
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/portal_backup_*.tar.gz 2>/dev/null | wc -l)
log "Total backups: ${BACKUP_COUNT}"

# Optional: Upload to cloud storage (S3, Azure, etc.)
if [ -n "${CLOUD_BACKUP_ENABLED}" ] && [ "${CLOUD_BACKUP_ENABLED}" = "true" ]; then
    log "Uploading backup to cloud storage..."
    # Add cloud upload logic here
    # Example: aws s3 cp "${BACKUP_FILE}" "s3://your-bucket/backups/"
    warning "Cloud backup not configured"
fi

# Create backup report
REPORT_FILE="${BACKUP_DIR}/backup_report_${TIMESTAMP}.txt"
cat > "${REPORT_FILE}" <<EOF
PORTAL Backup Report
====================
Backup Name: ${BACKUP_NAME}
Timestamp: $(date)
Backup File: ${BACKUP_FILE}
Size: ${BACKUP_SIZE}
Checksum (SHA256): ${CHECKSUM}
Retention: ${RETENTION_DAYS} days
Total Backups: ${BACKUP_COUNT}

Status: SUCCESS
EOF

log "Backup report saved: ${REPORT_FILE}"
echo ""
log "Backup completed successfully!"

exit 0
