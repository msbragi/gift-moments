FROM nginx:alpine

# Install unzip for extracting pre-built files
RUN apk add --no-cache unzip wget

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy pre-built Angular application ZIP
COPY fe-dist.zip /tmp/

# Extract Angular build - Angular 19 uses 'browser' directory
RUN unzip /tmp/fe-dist.zip -d /tmp/ && \
    mv /tmp/browser/* /usr/share/nginx/html/ && \
    mv /tmp/3rdpartylicenses.txt /usr/share/nginx/html/ && \
    rm -rf /tmp/fe-dist.zip /tmp/browser

# Create assets/config directory if it doesn't exist (for volume mounts)
RUN mkdir -p /usr/share/nginx/html/assets/config

# Copy custom nginx configuration if it exists, otherwise use default
RUN if [ -f "./nginx.conf" ]; then \
        cp ./nginx.conf /etc/nginx/nginx.conf; \
    else \
        echo "Using default nginx configuration"; \
    fi

# Create directory for logs
RUN mkdir -p /var/log/nginx

# Set proper permissions for nginx
RUN chown -R nginx:nginx /usr/share/nginx/html /var/log/nginx

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]