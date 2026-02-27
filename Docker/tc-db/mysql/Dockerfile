# Use official MySQL 8.0 image
FROM mariadb:11.4

# Set maintainer info
LABEL maintainer="Time Caps Project"
LABEL description="MySQL/MariaDB database for Time Caps application"

# Set environment variables with defaults
ENV MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-rootpassword}
ENV MYSQL_DATABASE=${MYSQL_DATABASE:-timecaps}
ENV MYSQL_USER=${MYSQL_USER:-timecaps_user}
ENV MYSQL_PASSWORD=${MYSQL_PASSWORD:-timecaps_password}

# Set MySQL configuration
ENV MYSQL_CHARSET=utf8mb4
ENV MYSQL_COLLATION=utf8mb4_unicode_ci

# This is optional and can be used to override default MySQL settings.
# If you want a custom MySQL configuration file
# provide it and uncomment the line or mount it as a volume docker-compose.yml
# COPY ./config/mysql.cnf /etc/mysql/conf.d/custom.cnf

# If you have custom SQL scripts to initialize the database,
# place them in the scripts/init directory
# and uncomment the line below to copy them into the container.
# or mount as a volume in docker-compose.yml 
# mount only in dev or staging environments
# to avoid running initialization scripts in production
COPY ./scripts/init/ /docker-entrypoint-initdb.d/

# Set proper permissions for scripts
RUN chmod +x /docker-entrypoint-initdb.d/*.sh

# Expose MySQL port  
EXPOSE 3306

# Set data directory
VOLUME ["/var/lib/mysql-data"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD ${DB_HEALTH_CHECK:-mariadb-admin} ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} || exit 1