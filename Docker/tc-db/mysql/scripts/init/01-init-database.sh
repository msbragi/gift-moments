#!/bin/bash
DB_CLIENT=$(command -v mysql || command -v mariadb)

if [ -z "$DB_CLIENT" ]; then
    echo "No MySQL/MariaDB client found. Exiting."
    exit 1
fi

until $DB_CLIENT -h localhost -u root -p${MYSQL_ROOT_PASSWORD} -e "SELECT 1;" > /dev/null 2>&1; do
    echo "Waiting for database to be ready..."
    sleep 2
done
echo "MySQL is ready. Creating database and user..."

# Create database if it doesn't exist
$DB_CLIENT -u root -p${MYSQL_ROOT_PASSWORD} <<EOF
CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE} 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;

USE ${MYSQL_DATABASE};

-- Create basic tables structure if needed
-- (You can add your initial schema here)

EOF

echo "Database initialization completed!"